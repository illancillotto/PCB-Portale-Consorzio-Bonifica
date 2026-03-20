export type ConnectorExecutionMode = 'scheduled' | 'manual';

export interface ConnectorRunContext {
  connectorName: string;
  sourceSystem: string;
  executionMode: ConnectorExecutionMode;
  startedAt: string;
}

export interface RawIngestionEnvelope {
  sourceRecordId: string;
  payload: unknown;
  capturedAt: string;
}
