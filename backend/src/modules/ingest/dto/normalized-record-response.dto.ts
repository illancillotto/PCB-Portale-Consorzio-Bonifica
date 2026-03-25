export interface NormalizedRecordResponseDto {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  normalizationStatus: string;
  outcomeCode: string;
  normalized: Record<string, unknown>;
  createdAt: string;
}
