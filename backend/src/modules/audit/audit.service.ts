import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { AuditEventResponseDto } from './dto/audit-event-response.dto';

interface AuditEventRow {
  id: string;
  event_type: string;
  actor_type: string;
  actor_id: string | null;
  source_module: string;
  entity_type: string;
  entity_id: string;
  created_at: Date | string;
}

@Injectable()
export class AuditService {
  constructor(private readonly databaseService: DatabaseService) {}

  getTrackedEventFamilies() {
    return ['auth', 'sensitive_read', 'master_update', 'connector_run', 'matching_review', 'gis_update'];
  }

  async listEvents() {
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
          created_at
        FROM audit.audit_event
        ORDER BY created_at DESC
      `,
    );

    return {
      items: result.rows.map((row) => this.mapEvent(row)),
      total: result.rows.length,
    };
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
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}
