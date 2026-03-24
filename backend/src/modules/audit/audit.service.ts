import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../core/database/database.service';
import { AuditEventResponseDto } from './dto/audit-event-response.dto';
import { AuditEntitySummaryResponseDto } from './dto/audit-entity-summary-response.dto';
import { AuditSummaryResponseDto } from './dto/audit-summary-response.dto';
import { ListAuditEventsQueryDto } from './dto/list-audit-events-query.dto';

interface AuditEventRow {
  id: string;
  event_type: string;
  actor_type: string;
  actor_id: string | null;
  source_module: string;
  entity_type: string;
  entity_id: string;
  payload_jsonb: Record<string, unknown>;
  created_at: Date | string;
}

interface AuditCounterRow {
  key: string;
  total: string;
}

interface AuditEntitySummaryRow {
  entity_type: string;
  entity_id: string;
  total: string;
  system_events: string;
  system_operator_events: string;
  latest_created_at: Date | string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly databaseService: DatabaseService) {}

  getTrackedEventFamilies() {
    return ['auth', 'sensitive_read', 'master_update', 'connector_run', 'matching_review', 'gis_update'];
  }

  private buildFilterQuery(filters: ListAuditEventsQueryDto = {}) {
    const clauses: string[] = [];
    const params: string[] = [];

    if (filters.eventType) {
      params.push(filters.eventType);
      clauses.push(`event_type = $${params.length}`);
    }

    if (filters.actorType) {
      params.push(filters.actorType);
      clauses.push(`actor_type = $${params.length}`);
    }

    if (filters.sourceModule) {
      params.push(filters.sourceModule);
      clauses.push(`source_module = $${params.length}`);
    }

    if (filters.entityType) {
      params.push(filters.entityType);
      clauses.push(`entity_type = $${params.length}`);
    }

    if (filters.entityId) {
      params.push(filters.entityId);
      clauses.push(`entity_id = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    return { params, whereClause };
  }

  async listEvents(filters: ListAuditEventsQueryDto = {}) {
    const { params, whereClause } = this.buildFilterQuery(filters);

    const result = await this.databaseService.query<AuditEventRow>(
      `
        SELECT
          id,
          event_type,
          actor_type,
          actor_id,
          source_module,
          entity_type,
          entity_id,
          payload_jsonb,
          created_at
        FROM audit.audit_event
        ${whereClause}
        ORDER BY created_at DESC
      `,
      params,
    );

    return {
      items: result.rows.map((row) => this.mapEvent(row)),
      total: result.rows.length,
    };
  }

  async getSummary(filters: ListAuditEventsQueryDto = {}): Promise<AuditSummaryResponseDto> {
    const { params, whereClause } = this.buildFilterQuery(filters);
    const filteredCte = `
      WITH filtered_events AS (
        SELECT
          actor_type,
          source_module,
          created_at
        FROM audit.audit_event
        ${whereClause}
      )
    `;

    const [summaryResult, sourceModuleResult, actorTypeResult] = await Promise.all([
      this.databaseService.query<{
        total: string;
        system_events: string;
        system_operator_events: string;
        latest_created_at: Date | string | null;
      }>(
        `
          ${filteredCte}
          SELECT
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE actor_type = 'system')::text AS system_events,
            COUNT(*) FILTER (WHERE actor_type = 'system_operator')::text AS system_operator_events,
            MAX(created_at) AS latest_created_at
          FROM filtered_events
        `,
        params,
      ),
      this.databaseService.query<AuditCounterRow>(
        `
          ${filteredCte}
          SELECT source_module AS key, COUNT(*)::text AS total
          FROM filtered_events
          GROUP BY source_module
          ORDER BY COUNT(*) DESC, source_module ASC
        `,
        params,
      ),
      this.databaseService.query<AuditCounterRow>(
        `
          ${filteredCte}
          SELECT actor_type AS key, COUNT(*)::text AS total
          FROM filtered_events
          GROUP BY actor_type
          ORDER BY COUNT(*) DESC, actor_type ASC
        `,
        params,
      ),
    ]);

    const summary = summaryResult.rows[0];

    return {
      total: Number(summary?.total ?? 0),
      systemEvents: Number(summary?.system_events ?? 0),
      systemOperatorEvents: Number(summary?.system_operator_events ?? 0),
      latestCreatedAt: summary?.latest_created_at
        ? new Date(summary.latest_created_at).toISOString()
        : null,
      bySourceModule: sourceModuleResult.rows.map((row) => ({
        sourceModule: row.key,
        total: Number(row.total),
      })),
      byActorType: actorTypeResult.rows.map((row) => ({
        actorType: row.key,
        total: Number(row.total),
      })),
    };
  }

  async getEntitySummaries(
    entityType?: string,
    entityIds: string[] = [],
  ): Promise<{ items: AuditEntitySummaryResponseDto[]; total: number }> {
    if (!entityType || entityIds.length === 0) {
      return { items: [], total: 0 };
    }

    const result = await this.databaseService.query<AuditEntitySummaryRow>(
      `
        SELECT
          entity_type,
          entity_id,
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE actor_type = 'system')::text AS system_events,
          COUNT(*) FILTER (WHERE actor_type = 'system_operator')::text AS system_operator_events,
          MAX(created_at) AS latest_created_at
        FROM audit.audit_event
        WHERE entity_type = $1
          AND entity_id = ANY($2::text[])
        GROUP BY entity_type, entity_id
        ORDER BY entity_id
      `,
      [entityType, entityIds],
    );

    return {
      items: result.rows.map((row) => ({
        entityType: row.entity_type,
        entityId: row.entity_id,
        total: Number(row.total),
        systemEvents: Number(row.system_events),
        systemOperatorEvents: Number(row.system_operator_events),
        latestCreatedAt: row.latest_created_at ? new Date(row.latest_created_at).toISOString() : null,
      })),
      total: result.rows.length,
    };
  }

  async recordEvent(input: {
    eventType: string;
    actorType: string;
    actorId?: string | null;
    sourceModule: string;
    entityType: string;
    entityId: string;
    payload?: Record<string, unknown>;
  }) {
    await this.databaseService.query(
      `
        INSERT INTO audit.audit_event (
          id,
          event_type,
          actor_type,
          actor_id,
          source_module,
          entity_type,
          entity_id,
          payload_jsonb
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      `,
      [
        randomUUID(),
        input.eventType,
        input.actorType,
        input.actorId ?? null,
        input.sourceModule,
        input.entityType,
        input.entityId,
        JSON.stringify(input.payload ?? {}),
      ],
    );
  }

  private mapEvent(row: AuditEventRow): AuditEventResponseDto {
    return {
      id: row.id,
      eventType: row.event_type,
      actorType: row.actor_type,
      actorId: row.actor_id,
      sourceModule: row.source_module,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload_jsonb ?? {},
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}
