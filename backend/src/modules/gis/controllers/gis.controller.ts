import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { GisService } from '../gis.service';
import { GisFeatureLinkResponseDto } from '../dto/feature-link-response.dto';
import { GisLayerResponseDto } from '../dto/layer-response.dto';
import { GisMapFeatureResponseDto } from '../dto/map-feature-response.dto';

@Controller({
  path: 'gis',
  version: '1',
})
@UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
@Roles('pcb-operator')
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

  @Get('map-features')
  async listMapFeatures(): Promise<{ items: GisMapFeatureResponseDto[]; total: number }> {
    return this.gisService.listMapFeatures();
  }
}
