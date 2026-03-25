import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PcbDomainException } from '../../core/errors/pcb-domain.exception';
import { KEYCLOAK_ROLES_KEY } from '../decorators/roles.decorator';

type AuthenticatedRequest = {
  user?: {
    realmRoles: string[];
  };
};

@Injectable()
export class KeycloakRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(KEYCLOAK_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const principalRoles = request.user?.realmRoles ?? [];
    const hasAllRequiredRoles = requiredRoles.every((role) => principalRoles.includes(role));

    if (!hasAllRequiredRoles) {
      throw PcbDomainException.conflict(
        'auth.insufficient_realm_roles',
        'Insufficient realm roles',
        { requiredRoles, principalRoles },
      );
    }

    return true;
  }
}
