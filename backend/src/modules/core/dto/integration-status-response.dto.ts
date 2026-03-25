export interface IntegrationStatusItemResponseDto {
  key: 'postgres' | 'redis' | 'keycloak' | 'qgis';
  label: string;
  configured: boolean;
  available: boolean;
  statusLabel: 'ok' | 'unavailable' | 'not_configured';
  statusCode: number | null;
  failureCode: string | null;
  target: string | null;
  detail: string | null;
}

export interface IntegrationStatusResponseDto {
  checkedAt: string;
  items: IntegrationStatusItemResponseDto[];
}
