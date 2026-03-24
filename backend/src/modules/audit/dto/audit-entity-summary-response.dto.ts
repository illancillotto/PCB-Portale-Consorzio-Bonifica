export interface AuditEntitySummaryResponseDto {
  entityType: string;
  entityId: string;
  total: number;
  systemEvents: number;
  systemOperatorEvents: number;
  latestCreatedAt: string | null;
}
