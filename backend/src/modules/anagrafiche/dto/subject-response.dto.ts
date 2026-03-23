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

export interface SubjectSourceLinkDto {
  sourceSystem: string;
  sourceRecordId: string;
  sourceUrl: string | null;
  isActive: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface SubjectDocumentDto {
  id: string;
  sourceSystem: string;
  fileName: string;
  filePath: string;
  mimeType: string | null;
  archiveBucket: string | null;
  discoveredAt: string;
}

export interface SubjectResponseDto {
  id: string;
  cuua: string;
  status: string;
  confidenceScore: number;
  currentDisplayName: string;
  identifiers: SubjectIdentifierDto[];
  nameHistory: SubjectNameHistoryDto[];
  sourceLinks: SubjectSourceLinkDto[];
  documents: SubjectDocumentDto[];
}
