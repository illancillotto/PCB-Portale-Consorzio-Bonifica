import { Injectable } from '@nestjs/common';

@Injectable()
export class GisService {
  getFoundation() {
    return {
      databaseExtension: 'postgis',
      publicationTarget: 'qgis-server',
    };
  }
}
