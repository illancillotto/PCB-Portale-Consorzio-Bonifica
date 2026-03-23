export interface IngestionOrchestrationSummaryResponseDto {
  registeredConnectors: number;
  manualConnectors: number;
  queuedRuns: number;
  failedRuns: number;
  normalizedRecords: number;
  reviewQueue: number;
  latestRunAt: string | null;
}
