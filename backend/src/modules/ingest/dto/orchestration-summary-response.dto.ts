export interface IngestionOrchestrationSummaryResponseDto {
  registeredConnectors: number;
  manualConnectors: number;
  configuredConnectors: number;
  runnableConnectors: number;
  persistentConnectors: number;
  healthyConnectors: number;
  criticalConnectorIssues: number;
  warningConnectorIssues: number;
  blockedConnectors: number;
  dryRunConnectors: number;
  queuedRuns: number;
  runningRuns: number;
  failedRuns: number;
  postProcessingQueuedRuns: number;
  postProcessingRunningRuns: number;
  normalizationCompletedRuns: number;
  matchingCompletedRuns: number;
  normalizedRecords: number;
  reviewQueue: number;
  rawOutcomeCounters: Record<string, number>;
  normalizedOutcomeCounters: Record<string, number>;
  matchingOutcomeCounters: Record<string, number>;
  latestRunAt: string | null;
}
