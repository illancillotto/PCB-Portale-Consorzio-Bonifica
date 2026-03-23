import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { KeycloakAuthGuard } from './guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from './guards/keycloak-roles.guard';
import { KeycloakService } from './services/keycloak.service';

@Module({
  controllers: [AuthController],
  providers: [KeycloakService, KeycloakAuthGuard, KeycloakRolesGuard],
  exports: [KeycloakService, KeycloakAuthGuard, KeycloakRolesGuard],
})
export class AuthModule {}
