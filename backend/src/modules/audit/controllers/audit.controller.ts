import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { AuditService } from '../audit.service';
import { AuditEventResponseDto } from '../dto/audit-event-response.dto';

@Controller({
  path: 'audit',
  version: '1',
})
@UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
@Roles('pcb-operator')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  async listEvents(): Promise<{ items: AuditEventResponseDto[]; total: number }> {
    return this.auditService.listEvents();
  }
}
