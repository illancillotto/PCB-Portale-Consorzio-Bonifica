export interface SubjectIdentifierDto {
  type: string;
  value: string;
  sourceSystem: string;
}

export interface SubjectNameHistoryDto {
  displayName: string;
  sourceSystem: string;
  validFrom: string;
  validTo: string | null;
}

export interface SubjectResponseDto {
  id: string;
  cuua: string;
  status: string;
  confidenceScore: number;
  currentDisplayName: string;
  identifiers: SubjectIdentifierDto[];
  nameHistory: SubjectNameHistoryDto[];
}
