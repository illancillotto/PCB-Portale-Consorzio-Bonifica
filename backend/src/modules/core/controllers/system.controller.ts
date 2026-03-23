import { Controller, Get } from '@nestjs/common';
import { SystemMetadataService } from '../services/system-metadata.service';

@Controller({
  path: 'system',
  version: '1',
})
export class SystemController {
  constructor(private readonly systemMetadataService: SystemMetadataService) {}

  @Get('modules')
  async getModules() {
    return this.systemMetadataService.getBootstrapMetadata();
  }
}
