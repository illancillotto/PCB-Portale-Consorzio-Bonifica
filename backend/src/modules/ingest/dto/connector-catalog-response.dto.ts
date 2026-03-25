export interface IngestionConnectorCatalogResponseDto {
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
  issueCounters: {
    total: number;
    critical: number;
    warning: number;
  };
}
