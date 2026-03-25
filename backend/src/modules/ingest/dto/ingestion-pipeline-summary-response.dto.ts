export interface IngestionPipelineSummaryResponseDto {
  ingestionRunId: string;
  raw: {
    total: number;
    outcomeCounters: Record<string, number>;
  };
  normalized: {
    total: number;
    statusCounters: Record<string, number>;
    outcomeCounters: Record<string, number>;
  };
  matching: {
    total: number;
    statusCounters: Record<string, number>;
    outcomeCounters: Record<string, number>;
  };
}
