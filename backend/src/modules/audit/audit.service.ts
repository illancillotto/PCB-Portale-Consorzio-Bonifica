import { Injectable } from '@nestjs/common';

const AUDIT_EVENTS = [
  {
    id: '61111111-1111-1111-1111-111111111111',
    eventType: 'bootstrap_initialized',
    actorType: 'system',
    actorId: 'pcb-bootstrap',
    sourceModule: 'core',
    entityType: 'repository',
    entityId: 'pcb',
    createdAt: '2026-03-20T08:00:00.000Z',
  },
];

@Injectable()
export class AuditService {
  getTrackedEventFamilies() {
    return ['auth', 'sensitive_read', 'master_update', 'connector_run', 'matching_review', 'gis_update'];
  }

  listEvents() {
    return {
      items: AUDIT_EVENTS,
      total: AUDIT_EVENTS.length,
    };
  }
}
