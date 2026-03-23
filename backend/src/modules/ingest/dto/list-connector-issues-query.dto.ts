export interface ListConnectorIssuesQueryDto {
  severity?: 'warning' | 'critical';
  issueType?: string;
}
