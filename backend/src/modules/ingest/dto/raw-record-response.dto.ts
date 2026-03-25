export interface RawRecordResponseDto {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  outcomeCode: string;
  payload: Record<string, unknown>;
  capturedAt: string;
}
