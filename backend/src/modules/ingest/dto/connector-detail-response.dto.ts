export interface IngestionConnectorDetailResponseDto {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
  executionReadiness: {
    configured: boolean;
    runnable: boolean;
    persistenceEnabled: boolean;
    rootPath: string | null;
    detail: string;
  };
  latestRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
  } | null;
  lastCompletedRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    recordsTotal: number;
    recordsSuccess: number;
    recordsError: number;
  } | null;
  lastFailedRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    recordsTotal: number;
    recordsSuccess: number;
    recordsError: number;
    logExcerpt: string;
  } | null;
  runCounters: {
    total: number;
    queued: number;
    completed: number;
    failed: number;
  };
  executionStats: {
    recordsObservedTotal: number;
    recordsSucceededTotal: number;
    recordsErroredTotal: number;
  };
  issueCounters: {
    total: number;
    critical: number;
    warning: number;
  };
  issues: Array<{
    connectorName: string;
    sourceSystem: string;
    displayName: string;
    severity: 'warning' | 'critical';
    issueType:
      | 'not_configured'
      | 'not_runnable'
      | 'dry_run_only'
      | 'latest_run_failed'
      | 'no_completed_runs';
    detail: string;
    latestRunId: string | null;
    latestRunStatus: string | null;
  }>;
}
