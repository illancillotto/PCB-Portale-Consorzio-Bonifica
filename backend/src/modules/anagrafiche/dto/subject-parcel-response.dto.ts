export interface SubjectParcelResponseDto {
  parcelId: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  relationType: string;
  title: string | null;
  quota: number | null;
}
