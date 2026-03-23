export interface AuditEventResponseDto {
  id: string;
  eventType: string;
  actorType: string;
  actorId: string | null;
  sourceModule: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
