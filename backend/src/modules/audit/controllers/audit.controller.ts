import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { PcbDomainException } from '../../core/errors/pcb-domain.exception';
import {
  ensureUuidFilter,
  ensureUuidFilters,
} from '../../core/validation/uuid-filter.validation';
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
    this.validateEventFilters(query);
    return this.auditService.listEvents(query);
  }

  @Get('summary')
  async getSummary(@Query() query: ListAuditEventsQueryDto): Promise<AuditSummaryResponseDto> {
    this.validateEventFilters(query);
    return this.auditService.getSummary(query);
  }

  @Get('entity-summaries')
  async getEntitySummaries(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityIds?: string | string[],
  ): Promise<{ items: AuditEntitySummaryResponseDto[]; total: number }> {
    const normalizedEntityIds =
      typeof entityIds === 'string' ? [entityIds] : Array.isArray(entityIds) ? entityIds : [];

    if (!entityType) {
      throw PcbDomainException.badRequest(
        'audit.entity_type_required',
        'entityType is required for audit entity summaries',
      );
    }

    if (normalizedEntityIds.length === 0) {
      throw PcbDomainException.badRequest(
        'audit.entity_ids_required',
        'At least one entityId is required for audit entity summaries',
      );
    }

    this.validateUuidBasedEntityIds(entityType, normalizedEntityIds);

    return this.auditService.getEntitySummaries(entityType, normalizedEntityIds);
  }

  private validateEventFilters(query: ListAuditEventsQueryDto) {
    if (query.entityId && !query.entityType) {
      throw PcbDomainException.badRequest(
        'audit.entity_type_required',
        'entityType is required when entityId is provided',
        { entityId: query.entityId },
      );
    }

    if (query.entityType) {
      this.validateUuidBasedEntityIds(query.entityType, query.entityId ? [query.entityId] : []);
    }
  }

  private validateUuidBasedEntityIds(entityType: string, entityIds: string[]) {
    const uuidEntityTypes = new Set(['subject', 'parcel', 'ingestion_run', 'matching_result']);

    if (!uuidEntityTypes.has(entityType) || entityIds.length === 0) {
      return;
    }

    ensureUuidFilters(entityIds, {
      fieldName: 'entityId',
      errorCode: 'audit.invalid_entity_id_filter',
      message: `Invalid entityId filter for audit entity type ${entityType}`,
    });

    if (entityType === 'subject') {
      ensureUuidFilter(entityIds[0], {
        fieldName: 'entityId',
        errorCode: 'audit.invalid_subject_id_filter',
        message: 'Invalid subject entityId for audit query',
      });
    }

    if (entityType === 'parcel') {
      ensureUuidFilter(entityIds[0], {
        fieldName: 'entityId',
        errorCode: 'audit.invalid_parcel_id_filter',
        message: 'Invalid parcel entityId for audit query',
      });
    }
  }
}
