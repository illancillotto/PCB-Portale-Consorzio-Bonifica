import { Controller, Get } from '@nestjs/common';
import { KeycloakPlaceholderService } from '../services/keycloak-placeholder.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly keycloakPlaceholderService: KeycloakPlaceholderService) {}

  @Get('keycloak')
  getKeycloakStatus() {
    return this.keycloakPlaceholderService.getConfigurationStatus();
  }
}
