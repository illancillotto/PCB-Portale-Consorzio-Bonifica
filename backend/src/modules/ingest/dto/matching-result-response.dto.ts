export interface MatchingResultResponseDto {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  matchedSubjectId: string | null;
  matchingScore: number;
  decisionType: string;
  decisionStatus: string;
  notes: string | null;
  createdAt: string;
}
