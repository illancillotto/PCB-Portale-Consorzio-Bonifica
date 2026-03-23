export interface GisMapFeatureGeometryDto {
  type: string;
  coordinates: unknown;
}

export interface GisMapFeatureResponseDto {
  id: string;
  type: 'Feature';
  geometry: GisMapFeatureGeometryDto;
  properties: {
    layerCode: string;
    layerName: string;
    featureExternalId: string;
    subjectId: string | null;
    parcelId: string | null;
    validFrom: string | null;
    validTo: string | null;
  };
}
