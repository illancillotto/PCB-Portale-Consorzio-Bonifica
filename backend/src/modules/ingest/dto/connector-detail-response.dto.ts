export interface IngestionConnectorDetailResponseDto {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
  operationalStatus: 'healthy' | 'warning' | 'critical';
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
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
    failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
    failureCode: string | null;
  } | null;
  lastCompletedRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    recordsTotal: number;
    recordsSuccess: number;
    recordsError: number;
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
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
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
    failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
    failureCode: string | null;
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
  issueTypeCounters: {
    notConfigured: number;
    notRunnable: number;
    dryRunOnly: number;
    latestRunFailed: number;
    noCompletedRuns: number;
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
    failureCode: string;
    detail: string;
    latestRunId: string | null;
    latestRunStatus: string | null;
  }>;
}
