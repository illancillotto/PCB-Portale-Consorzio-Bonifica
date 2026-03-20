export interface ParcelSubjectLinkDto {
  subjectId: string;
  cuua: string;
  displayName: string;
  relationType: string;
  title: string | null;
  quota: number | null;
}

export interface ParcelResponseDto {
  id: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  sourceSystem: string;
  subjects: ParcelSubjectLinkDto[];
}
