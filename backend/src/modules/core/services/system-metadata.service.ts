import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SystemMetadataService {
  constructor(private readonly redisService: RedisService) {}

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
}
