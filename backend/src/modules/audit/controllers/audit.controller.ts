import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { AuditService } from '../audit.service';
import { AuditEventResponseDto } from '../dto/audit-event-response.dto';
import { AuditEntitySummaryResponseDto } from '../dto/audit-entity-summary-response.dto';
import { AuditSummaryResponseDto } from '../dto/audit-summary-response.dto';
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

  @Get('summary')
  async getSummary(@Query() query: ListAuditEventsQueryDto): Promise<AuditSummaryResponseDto> {
    return this.auditService.getSummary(query);
  }

  @Get('entity-summaries')
  async getEntitySummaries(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityIds?: string | string[],
  ): Promise<{ items: AuditEntitySummaryResponseDto[]; total: number }> {
    const normalizedEntityIds =
      typeof entityIds === 'string' ? [entityIds] : Array.isArray(entityIds) ? entityIds : [];

    return this.auditService.getEntitySummaries(entityType, normalizedEntityIds);
  }
}
