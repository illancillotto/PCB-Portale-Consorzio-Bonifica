export interface NormalizeRunResponseDto {
  ingestionRunId: string;
  connectorName: string;
  sourceSystem: string;
  rawRecordsRead: number;
  normalizedRecordsWritten: number;
  normalizationStatus: 'completed';
}
