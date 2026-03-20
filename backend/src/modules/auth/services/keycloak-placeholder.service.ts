import { Injectable } from '@nestjs/common';

@Injectable()
export class KeycloakPlaceholderService {
  getConfigurationStatus() {
    const issuerUrl = process.env.PCB_KEYCLOAK_URL ?? '';
    const realm = process.env.PCB_KEYCLOAK_REALM ?? '';
    const clientId = process.env.PCB_KEYCLOAK_CLIENT_ID ?? '';

    return {
      provider: 'keycloak',
      configured: Boolean(issuerUrl && realm && clientId),
      issuerUrl,
      realm,
      clientId,
      mode: 'placeholder',
    };
  }
}
