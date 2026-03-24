import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { SystemMetadataService } from '../services/system-metadata.service';
import { IntegrationStatusResponseDto } from '../dto/integration-status-response.dto';
import { UseGuards } from '@nestjs/common';

@Controller({
  path: 'system',
  version: '1',
})
export class SystemController {
  constructor(private readonly systemMetadataService: SystemMetadataService) {}

  @Get('modules')
  @UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
  @Roles('pcb-operator')
  async getModules() {
    return this.systemMetadataService.getBootstrapMetadata();
  }

  @Get('integrations')
  @UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
  @Roles('pcb-operator')
  async getIntegrations(): Promise<IntegrationStatusResponseDto> {
    return this.systemMetadataService.getIntegrationStatuses();
  }
}
