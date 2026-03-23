export interface GisPublicationStatusResponseDto {
  publicationTarget: 'qgis-server';
  serviceUrl: string;
  capabilitiesUrl: string | null;
  projectFile: string | null;
  configured: boolean;
  available: boolean;
  statusCode: number | null;
  statusLabel: 'ok' | 'unavailable' | 'not_configured';
  statusDetail: string | null;
  checkedAt: string;
}
