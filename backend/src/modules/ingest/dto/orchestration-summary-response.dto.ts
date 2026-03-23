export interface IngestionOrchestrationSummaryResponseDto {
  registeredConnectors: number;
  manualConnectors: number;
  configuredConnectors: number;
  runnableConnectors: number;
  persistentConnectors: number;
  queuedRuns: number;
  failedRuns: number;
  normalizedRecords: number;
  reviewQueue: number;
  latestRunAt: string | null;
}
