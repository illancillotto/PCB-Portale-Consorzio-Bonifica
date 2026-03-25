import { Injectable } from '@nestjs/common';
import { KeycloakService } from '../../auth/services/keycloak.service';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { IntegrationStatusResponseDto } from '../dto/integration-status-response.dto';

@Injectable()
export class SystemMetadataService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly keycloakService: KeycloakService,
  ) {}

  async getBootstrapMetadata() {
    const redis = await this.redisService.ping();

    return {
      project: 'PCB - Portale Consorzio Bonifica',
      architecture: 'modular monolith',
      businessKey: 'CUUA',
      dataFlow: ['source', 'raw_ingest', 'normalized_data', 'master_data'],
      runtime: {
        redis,
      },
      modules: [
        'auth',
        'anagrafiche',
        'ingest',
        'audit',
        'catasto',
        'gis',
        'search',
      ],
    };
  }

  async getIntegrationStatuses(): Promise<IntegrationStatusResponseDto> {
    const [postgres, redis, keycloak, qgis] = await Promise.all([
      this.getPostgresStatus(),
      this.getRedisStatus(),
      this.getKeycloakStatus(),
      this.getQgisStatus(),
    ]);

    return {
      checkedAt: new Date().toISOString(),
      items: [postgres, redis, keycloak, qgis],
    };
  }

  private async getPostgresStatus(): Promise<IntegrationStatusResponseDto['items'][number]> {
    try {
      await this.databaseService.query('SELECT 1');

      return {
        key: 'postgres',
        label: 'PostgreSQL/PostGIS',
        configured: true,
        available: true,
        statusLabel: 'ok',
        statusCode: 200,
        failureCode: null,
        target: 'postgresql:SELECT 1',
        detail: 'Connessione SQL verificata',
      };
    } catch (error) {
      return {
        key: 'postgres',
        label: 'PostgreSQL/PostGIS',
        configured: true,
        available: false,
        statusLabel: 'unavailable',
        statusCode: null,
        failureCode: 'system.postgres_unavailable',
        target: 'postgresql:SELECT 1',
        detail: error instanceof Error ? error.message : 'Connessione SQL non disponibile',
      };
    }
  }

  private async getRedisStatus(): Promise<IntegrationStatusResponseDto['items'][number]> {
    const redis = await this.redisService.ping();

    return {
      key: 'redis',
      label: 'Redis',
      configured: true,
      available: redis.available,
      statusLabel: redis.available ? 'ok' : 'unavailable',
      statusCode: redis.available ? 200 : null,
      failureCode: redis.available ? null : 'system.redis_unavailable',
      target:
        process.env.PCB_REDIS_URL ??
        `redis://${process.env.PCB_REDIS_HOST ?? 'localhost'}:${process.env.PCB_REDIS_PORT ?? '6379'}`,
      detail: redis.status,
    };
  }

  private async getKeycloakStatus(): Promise<IntegrationStatusResponseDto['items'][number]> {
    const discovery = await this.keycloakService.getDiscoveryStatus();
    const configured = discovery.configured;
    const available = Boolean(discovery.discoveryAvailable);

    return {
      key: 'keycloak',
      label: 'Keycloak',
      configured,
      available,
      statusCode: available ? 200 : null,
      failureCode: !configured
        ? 'system.keycloak_not_configured'
        : available
          ? null
          : 'system.keycloak_unavailable',
      target:
        discovery.discoveryUrl ??
        ('issuer' in discovery && typeof discovery.issuer === 'string' ? discovery.issuer : null),
      statusLabel: !configured ? 'not_configured' : available ? 'ok' : 'unavailable',
      detail:
        discovery.discoveryUrl ??
        ('issuer' in discovery && typeof discovery.issuer === 'string' ? discovery.issuer : null),
    };
  }

  private async getQgisStatus(): Promise<IntegrationStatusResponseDto['items'][number]> {
    const serviceUrl = process.env.PCB_QGIS_SERVER_URL ?? '';
    const projectFile = process.env.PCB_QGIS_PROJECT_FILE ?? '';

    if (!serviceUrl || !projectFile) {
      return {
        key: 'qgis',
        label: 'QGIS Server',
        configured: false,
        available: false,
        statusCode: null,
        failureCode: 'system.qgis_not_configured',
        target: serviceUrl || null,
        statusLabel: 'not_configured',
        detail: !serviceUrl ? 'PCB_QGIS_SERVER_URL non configurato' : 'PCB_QGIS_PROJECT_FILE non configurato',
      };
    }

    const requestUrl = new URL(serviceUrl);
    requestUrl.searchParams.set('SERVICE', 'WMS');
    requestUrl.searchParams.set('REQUEST', 'GetCapabilities');
    requestUrl.searchParams.set('MAP', projectFile);

    try {
      const response = await fetch(requestUrl, {
        headers: {
          Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
        },
      });

      return {
        key: 'qgis',
        label: 'QGIS Server',
        configured: true,
        available: response.ok,
        statusCode: response.status,
        failureCode: response.ok ? null : 'system.qgis_unavailable',
        target: requestUrl.toString(),
        statusLabel: response.ok ? 'ok' : 'unavailable',
        detail: requestUrl.toString(),
      };
    } catch (error) {
      return {
        key: 'qgis',
        label: 'QGIS Server',
        configured: true,
        available: false,
        statusCode: null,
        failureCode: 'system.qgis_unreachable',
        target: requestUrl.toString(),
        statusLabel: 'unavailable',
        detail: error instanceof Error ? error.message : 'QGIS Server non disponibile',
      };
    }
  }
}
