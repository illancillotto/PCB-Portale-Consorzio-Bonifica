export interface GisPublicationStatusResponseDto {
  publicationTarget: 'qgis-server';
  serviceUrl: string;
  configured: boolean;
  available: boolean;
  statusCode: number | null;
  statusLabel: 'ok' | 'unavailable' | 'not_configured';
  checkedAt: string;
}
