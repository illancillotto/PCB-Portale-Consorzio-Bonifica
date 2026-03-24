export interface AuditSummaryResponseDto {
  total: number;
  systemEvents: number;
  systemOperatorEvents: number;
  latestCreatedAt: string | null;
  bySourceModule: Array<{
    sourceModule: string;
    total: number;
  }>;
  byActorType: Array<{
    actorType: string;
    total: number;
  }>;
}
