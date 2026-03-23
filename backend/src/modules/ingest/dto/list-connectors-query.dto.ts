export interface ListConnectorsQueryDto {
  operationalStatus?: 'healthy' | 'warning' | 'critical';
  triggerMode?: 'manual' | 'scheduled';
}
