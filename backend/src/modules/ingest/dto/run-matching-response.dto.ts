export interface RunMatchingResponseDto {
  ingestionRunId: string;
  normalizedRecordsRead: number;
  matchingResultsWritten: number;
  directMatches: number;
  reviewQueue: number;
  unmatched: number;
  matchingStatus: 'completed';
}
