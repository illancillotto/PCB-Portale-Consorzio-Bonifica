export interface ListConnectorIssuesQueryDto {
  connectorName?: string;
  severity?: 'warning' | 'critical';
  issueType?: string;
}
