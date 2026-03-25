export interface MatchingResultResponseDto {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  matchedSubjectId: string | null;
  matchingScore: number;
  decisionType: string;
  decisionStatus: string;
  outcomeCode: string;
  requiresManualReview: boolean;
  resolutionMode: 'automatic' | 'manual';
  notes: string | null;
  createdAt: string;
}
