export interface IngestionConnectorIssueResponseDto {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  severity: 'warning' | 'critical';
  issueType:
    | 'not_configured'
    | 'not_runnable'
    | 'dry_run_only'
    | 'latest_run_failed'
    | 'no_completed_runs';
  failureCode: string;
  detail: string;
  latestRunId: string | null;
  latestRunStatus: string | null;
}
