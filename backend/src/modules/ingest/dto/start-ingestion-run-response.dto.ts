export interface StartIngestionRunResponseDto {
  id: string;
  connectorName: string;
  sourceSystem: string;
  status: string;
  startedAt: string;
  executionMode: 'manual';
  postProcessing: {
    autoNormalize: boolean;
    autoMatch: boolean;
  };
}
