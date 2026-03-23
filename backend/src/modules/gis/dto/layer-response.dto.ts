export interface GisLayerResponseDto {
  id: string;
  name: string;
  code: string;
  ownerModule: string;
  publicationStatus: string;
  sourceSystem: string;
  geometryType: string;
  metadata: Record<string, unknown>;
  linkedSubjects: number;
  linkedParcels: number;
}
