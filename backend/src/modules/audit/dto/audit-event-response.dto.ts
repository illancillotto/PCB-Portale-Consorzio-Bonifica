export interface AuditEventResponseDto {
  id: string;
  eventType: string;
  actorType: string;
  actorId: string | null;
  sourceModule: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}
