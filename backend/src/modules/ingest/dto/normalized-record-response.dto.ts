export interface NormalizedRecordResponseDto {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  normalizationStatus: string;
  normalized: Record<string, unknown>;
  createdAt: string;
}
