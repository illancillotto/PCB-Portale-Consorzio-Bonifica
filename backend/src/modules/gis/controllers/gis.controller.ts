import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { GisService } from '../gis.service';
import { GisFeatureLinkResponseDto } from '../dto/feature-link-response.dto';
import { GisLayerResponseDto } from '../dto/layer-response.dto';
import { ListGisMapFeaturesQueryDto } from '../dto/list-map-features-query.dto';
import { GisMapFeatureResponseDto } from '../dto/map-feature-response.dto';
import { ListGisSubjectParcelLinksQueryDto } from '../dto/list-subject-parcel-links-query.dto';
import { GisPublicationStatusResponseDto } from '../dto/publication-status-response.dto';
import { GisSubjectParcelLinkResponseDto } from '../dto/subject-parcel-link-response.dto';

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
  async listMapFeatures(
    @Query() query: ListGisMapFeaturesQueryDto,
  ): Promise<{ items: GisMapFeatureResponseDto[]; total: number }> {
    return this.gisService.listMapFeatures(query);
  }

  @Get('subject-parcel-links')
  async listSubjectParcelLinks(
    @Query() query: ListGisSubjectParcelLinksQueryDto,
  ): Promise<{ items: GisSubjectParcelLinkResponseDto[]; total: number }> {
    return this.gisService.listSubjectParcelLinks(query);
  }

  @Get('publication-status')
  async getPublicationStatus(): Promise<GisPublicationStatusResponseDto> {
    return this.gisService.getPublicationStatus();
  }
}
