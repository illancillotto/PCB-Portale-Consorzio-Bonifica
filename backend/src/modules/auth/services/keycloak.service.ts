import { Injectable } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PcbDomainException } from '../../core/errors/pcb-domain.exception';

type KeycloakPrincipal = {
  subject: string;
  preferredUsername: string;
  email: string | null;
  realmRoles: string[];
  issuedAt: number | null;
  expiresAt: number | null;
};

@Injectable()
export class KeycloakService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  getConfigurationStatus() {
    return {
      provider: 'keycloak',
      configured: this.isConfigured(),
      issuerUrl: this.getIssuerUrl(),
      realm: process.env.PCB_KEYCLOAK_REALM ?? '',
      clientId: process.env.PCB_KEYCLOAK_CLIENT_ID ?? '',
      frontendClientId: process.env.PCB_KEYCLOAK_FRONTEND_CLIENT_ID ?? '',
      discoveryUrl: this.getDiscoveryUrl(),
      mode: 'jwt-verification',
    };
  }

  async getDiscoveryStatus() {
    if (!this.isConfigured()) {
      return {
        ...this.getConfigurationStatus(),
        discoveryAvailable: false,
      };
    }

    try {
      const response = await fetch(this.getDiscoveryUrl(), {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return {
          ...this.getConfigurationStatus(),
          discoveryAvailable: false,
          httpStatus: response.status,
        };
      }

      const discovery = (await response.json()) as {
        issuer?: string;
        authorization_endpoint?: string;
        token_endpoint?: string;
        jwks_uri?: string;
      };

      return {
        ...this.getConfigurationStatus(),
        discoveryAvailable: true,
        issuer: discovery.issuer ?? null,
        authorizationEndpoint: discovery.authorization_endpoint ?? null,
        tokenEndpoint: discovery.token_endpoint ?? null,
        jwksUri: discovery.jwks_uri ?? null,
      };
    } catch (error) {
      return {
        ...this.getConfigurationStatus(),
        discoveryAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown discovery error',
      };
    }
  }

  async verifyAccessToken(authorizationHeader: string): Promise<KeycloakPrincipal> {
    if (!this.isConfigured()) {
      throw PcbDomainException.serviceUnavailable(
        'auth.keycloak_not_configured',
        'Keycloak integration is not configured',
      );
    }

    const token = this.extractBearerToken(authorizationHeader);

    if (!this.jwks) {
      this.jwks = createRemoteJWKSet(new URL(this.getJwksUrl()));
    }

    try {
      const verification = await jwtVerify(token, this.jwks, {
        issuer: this.getIssuerUrl(),
      });

      const payload = verification.payload as {
        sub?: string;
        preferred_username?: string;
        email?: string;
        azp?: string;
        realm_access?: { roles?: string[] };
        iat?: number;
        exp?: number;
      };

      const configuredClientId = process.env.PCB_KEYCLOAK_CLIENT_ID;

      if (configuredClientId && payload.azp !== configuredClientId) {
        throw PcbDomainException.badRequest(
          'auth.token_wrong_client',
          'Token issued for a different client',
          { configuredClientId },
        );
      }

      return {
        subject: payload.sub ?? '',
        preferredUsername: payload.preferred_username ?? '',
        email: payload.email ?? null,
        realmRoles: payload.realm_access?.roles ?? [],
        issuedAt: payload.iat ?? null,
        expiresAt: payload.exp ?? null,
      };
    } catch (error) {
      if (error instanceof PcbDomainException) {
        throw error;
      }

      throw PcbDomainException.badRequest(
        'auth.invalid_access_token',
        'Invalid or expired access token',
      );
    }
  }

  private isConfigured() {
    return Boolean(
      process.env.PCB_KEYCLOAK_URL &&
        process.env.PCB_KEYCLOAK_REALM &&
        process.env.PCB_KEYCLOAK_CLIENT_ID,
    );
  }

  private extractBearerToken(authorizationHeader: string) {
    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw PcbDomainException.badRequest(
        'auth.invalid_authorization_header',
        'Authorization header must use Bearer token',
      );
    }

    return token;
  }

  private getIssuerUrl() {
    const baseUrl = process.env.PCB_KEYCLOAK_URL ?? '';
    const realm = process.env.PCB_KEYCLOAK_REALM ?? '';

    return `${baseUrl}/realms/${realm}`;
  }

  private getDiscoveryUrl() {
    return `${this.getIssuerUrl()}/.well-known/openid-configuration`;
  }

  private getJwksUrl() {
    return `${this.getIssuerUrl()}/protocol/openid-connect/certs`;
  }
}
