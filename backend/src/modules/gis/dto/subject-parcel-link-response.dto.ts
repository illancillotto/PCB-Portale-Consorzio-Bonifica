export interface GisSubjectParcelLinkResponseDto {
  id: string;
  subjectId: string;
  cuua: string;
  subjectDisplayName: string | null;
  parcelId: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  relationType: string;
  title: string | null;
  quota: number | null;
  validFrom: string | null;
  validTo: string | null;
}
