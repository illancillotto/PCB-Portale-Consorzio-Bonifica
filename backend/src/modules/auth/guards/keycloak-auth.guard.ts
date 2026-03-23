import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private readonly keycloakService: KeycloakService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const principal = await this.keycloakService.verifyAccessToken(authorizationHeader);
    request.user = principal;

    return true;
  }
}
