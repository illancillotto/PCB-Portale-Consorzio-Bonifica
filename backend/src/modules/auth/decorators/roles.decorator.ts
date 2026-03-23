import { SetMetadata } from '@nestjs/common';

export const KEYCLOAK_ROLES_KEY = 'keycloak_roles';

export const Roles = (...roles: string[]) => SetMetadata(KEYCLOAK_ROLES_KEY, roles);
