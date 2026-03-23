import { Controller, Get } from '@nestjs/common';
import { GisService } from '../gis.service';
import { GisFeatureLinkResponseDto } from '../dto/feature-link-response.dto';
import { GisLayerResponseDto } from '../dto/layer-response.dto';

@Controller({
  path: 'gis',
  version: '1',
})
export class GisController {
  constructor(private readonly gisService: GisService) {}

  @Get('layers')
  async listLayers(): Promise<{ items: GisLayerResponseDto[]; total: number }> {
    return this.gisService.listLayers();
  }

  @Get('feature-links')
  async listFeatureLinks(): Promise<{ items: GisFeatureLinkResponseDto[]; total: number }> {
    return this.gisService.listFeatureLinks();
  }
}
