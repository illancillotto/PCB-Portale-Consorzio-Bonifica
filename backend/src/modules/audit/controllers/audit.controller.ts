import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { AuditService } from '../audit.service';
import { AuditEventResponseDto } from '../dto/audit-event-response.dto';
import { ListAuditEventsQueryDto } from '../dto/list-audit-events-query.dto';

@Controller({
  path: 'audit',
  version: '1',
})
@UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
@Roles('pcb-operator')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  async listEvents(
    @Query() query: ListAuditEventsQueryDto,
  ): Promise<{ items: AuditEventResponseDto[]; total: number }> {
    return this.auditService.listEvents(query);
  }
}
