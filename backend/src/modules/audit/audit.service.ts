import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../core/database/database.service';
import { AuditEventResponseDto } from './dto/audit-event-response.dto';
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

@Injectable()
export class AuditService {
  constructor(private readonly databaseService: DatabaseService) {}

  getTrackedEventFamilies() {
    return ['auth', 'sensitive_read', 'master_update', 'connector_run', 'matching_review', 'gis_update'];
  }

  async listEvents(filters: ListAuditEventsQueryDto = {}) {
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

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

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
