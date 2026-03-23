export interface IngestionConnectorCatalogResponseDto {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
  latestRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
  } | null;
}
