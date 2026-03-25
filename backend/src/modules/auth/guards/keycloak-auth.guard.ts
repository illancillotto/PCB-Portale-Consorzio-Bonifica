import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PcbDomainException } from '../../core/errors/pcb-domain.exception';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private readonly keycloakService: KeycloakService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw PcbDomainException.badRequest(
        'auth.authorization_header_missing',
        'Missing Authorization header',
      );
    }

    const principal = await this.keycloakService.verifyAccessToken(authorizationHeader);
    request.user = principal;

    return true;
  }
}
