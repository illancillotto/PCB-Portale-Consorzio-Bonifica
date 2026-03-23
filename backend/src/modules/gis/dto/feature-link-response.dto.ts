export interface GisFeatureLinkResponseDto {
  id: string;
  layerCode: string;
  featureExternalId: string;
  subjectId: string | null;
  parcelId: string | null;
  validFrom: string | null;
  validTo: string | null;
}
