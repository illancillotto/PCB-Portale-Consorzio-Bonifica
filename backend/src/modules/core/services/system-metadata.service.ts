import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemMetadataService {
  getBootstrapMetadata() {
    return {
      project: 'PCB - Portale Consorzio Bonifica',
      architecture: 'modular monolith',
      businessKey: 'CUUA',
      dataFlow: ['source', 'raw_ingest', 'normalized_data', 'master_data'],
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
