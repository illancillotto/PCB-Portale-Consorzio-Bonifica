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
