export interface IngestionRunResponseDto {
  id: string;
  connectorName: string;
  sourceSystem: string;
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
  normalizedSummary: {
    totalRecords: number;
    outcomeCounters: Record<string, number>;
  };
  matchingSummary: {
    totalResults: number;
    outcomeCounters: Record<string, number>;
  };
  failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
  failureCode: string | null;
  stages: {
    acquisition: {
      status: 'queued' | 'running' | 'completed' | 'failed';
    };
    postProcessing: {
      status: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
      autoNormalize: boolean;
      autoMatch: boolean;
    };
    normalization: {
      status: 'not_started' | 'running' | 'completed' | 'failed';
      recordsWritten: number;
    };
    matching: {
      status: 'not_started' | 'running' | 'completed' | 'failed';
      resultsWritten: number;
    };
  };
}
