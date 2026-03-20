import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { KeycloakPlaceholderService } from './services/keycloak-placeholder.service';

@Module({
  controllers: [AuthController],
  providers: [KeycloakPlaceholderService],
  exports: [KeycloakPlaceholderService],
})
export class AuthModule {}
