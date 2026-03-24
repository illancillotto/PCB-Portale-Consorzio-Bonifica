import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { KeycloakAuthGuard } from '../guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../guards/keycloak-roles.guard';
import { KeycloakService } from '../services/keycloak.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly keycloakService: KeycloakService) {}

  @Get('keycloak')
  @UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
  @Roles('pcb-operator')
  getKeycloakStatus() {
    return this.keycloakService.getConfigurationStatus();
  }

  @Get('keycloak/discovery')
  @UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
  @Roles('pcb-operator')
  async getKeycloakDiscoveryStatus() {
    return this.keycloakService.getDiscoveryStatus();
  }

  @UseGuards(KeycloakAuthGuard)
  @Get('session')
  getSession(@Req() request: { user: unknown }) {
    return {
      authenticated: true,
      principal: request.user,
    };
  }

  @UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
  @Roles('pcb-operator')
  @Get('operator-access')
  getOperatorAccess(@Req() request: { user: unknown }) {
    return {
      authorized: true,
      requiredRoles: ['pcb-operator'],
      principal: request.user,
    };
  }
}
