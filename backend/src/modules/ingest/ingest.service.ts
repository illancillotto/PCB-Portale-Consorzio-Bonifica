import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { AuditService } from '../audit/audit.service';
import { DatabaseService } from '../core/database/database.service';
import { PcbDomainException } from '../core/errors/pcb-domain.exception';
import { RedisService } from '../core/redis/redis.service';
import { IngestionRunResponseDto } from './dto/ingestion-run-response.dto';
import { IngestionConnectorCatalogResponseDto } from './dto/connector-catalog-response.dto';
import { IngestionConnectorDetailResponseDto } from './dto/connector-detail-response.dto';
import { IngestionConnectorIssueResponseDto } from './dto/connector-issue-response.dto';
import { IngestionPipelineSummaryResponseDto } from './dto/ingestion-pipeline-summary-response.dto';
import { MatchingResultResponseDto } from './dto/matching-result-response.dto';
import { NormalizeRunResponseDto } from './dto/normalize-run-response.dto';
import { NormalizedRecordResponseDto } from './dto/normalized-record-response.dto';
import { IngestionOrchestrationSummaryResponseDto } from './dto/orchestration-summary-response.dto';
import { RawRecordResponseDto } from './dto/raw-record-response.dto';
import { RunMatchingResponseDto } from './dto/run-matching-response.dto';
import { StartIngestionRunResponseDto } from './dto/start-ingestion-run-response.dto';

interface IngestionRunRow {
  id: string;
  connector_name: string;
  source_system: string;
  status: string;
  started_at: Date | string;
  ended_at: Date | string | null;
  records_total: number;
  records_success: number;
  records_error: number;
  log_excerpt: string | null;
}

interface RawIngestionRecordRow {
  id: string;
  ingestion_run_id: string;
  source_record_id: string;
  payload_jsonb: Record<string, unknown>;
  captured_at: Date | string;
}

interface NormalizedIngestionRecordRow {
  id: string;
  ingestion_run_id: string;
  source_record_id: string;
  normalization_status: string;
  normalized_jsonb: Record<string, unknown>;
  created_at: Date | string;
}

interface MatchingResultRow {
  id: string;
  ingestion_run_id: string;
  source_record_id: string;
  matched_subject_id: string | null;
  matching_score: string | number;
  decision_type: string;
  decision_status: string;
  notes: string | null;
  created_at: Date | string;
}

interface SubjectLookupRow {
  id: string;
}

interface MatchingCandidateRow {
  subject_id: string;
  cuua: string;
  identifier_value: string | null;
  display_name: string | null;
  source_record_id: string | null;
  source_url: string | null;
}

interface ConnectorCatalogEntry {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
}

interface ConnectorExecutionReadiness {
  configured: boolean;
  runnable: boolean;
  persistenceEnabled: boolean;
  rootPath: string | null;
  detail: string;
}

interface NumericCountRow {
  total: string | number;
}

interface RawSummaryRow {
  total_records: string | number;
  directory_records: string | number;
  file_records: string | number;
  subject_hint_records: string | number;
  bucket_records: string | number;
  directory_subject_bucket_records: string | number;
  directory_bucket_only_records: string | number;
  directory_structure_only_records: string | number;
  file_subject_hint_records: string | number;
  file_without_subject_hint_records: string | number;
  record_captured_records: string | number;
}

interface TimestampRow {
  latest_run_at: Date | string | null;
}

interface ConnectorExecutionResult {
  status: string;
  startedAt?: string;
  endedAt?: string;
  filesScanned?: number;
  directoriesScanned?: number;
  items?: unknown[];
  persistence?: {
    mode: string;
    ingestionRunId: string | null;
    recordsPersisted: number;
  };
}

interface PostProcessingConfig {
  autoNormalize: boolean;
  autoMatch: boolean;
}

interface PostProcessingRuntimeState {
  status: 'running' | 'completed' | 'failed';
  autoNormalize: boolean;
  autoMatch: boolean;
}

interface NormalizationRuntimeState {
  normalizationStatus?: 'completed' | 'failed' | 'running';
  normalizedRecordsWritten?: number;
}

interface MatchingRuntimeState {
  matchingStatus?: 'completed' | 'failed' | 'running';
  normalizedRecordsRead?: number;
}

type IngestionFailureStage = 'acquisition' | 'post_processing' | 'normalization' | 'matching';

const connectorCatalog: ConnectorCatalogEntry[] = [
  {
    connectorName: 'connector-nas-catasto',
    sourceSystem: 'nas-catasto',
    displayName: 'NAS Catasto',
    domain: 'catasto-documentale',
    triggerMode: 'manual',
    capabilities: ['acquisition', 'raw_ingest', 'normalization', 'matching'],
  },
];

@Injectable()
export class IngestService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly auditService: AuditService,
    private readonly redisService: RedisService,
  ) {}

  getPipelineStages() {
    return ['acquisition', 'raw_ingest', 'normalization', 'matching', 'master_update', 'audit'];
  }

  async listRuns() {
    const result = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        ORDER BY started_at DESC
      `,
    );

    return {
      items: await Promise.all(result.rows.map((row) => this.mapRun(row))),
      total: result.rows.length,
    };
  }

  async listRunsByConnectorName(connectorName: string, status?: string) {
    if (!this.isSupportedConnector(connectorName)) {
      return null;
    }

    const normalizedStatus = status?.trim();

    const result = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        WHERE connector_name = $1
          AND ($2::text IS NULL OR status = $2)
        ORDER BY started_at DESC
      `,
      [connectorName, normalizedStatus || null],
    );

    return {
      items: await Promise.all(result.rows.map((row) => this.mapRun(row))),
      total: result.rows.length,
    };
  }

  async listConnectorCatalog(filters?: {
    operationalStatus?: 'healthy' | 'warning' | 'critical';
    triggerMode?: 'manual' | 'scheduled';
  }): Promise<{
    items: IngestionConnectorCatalogResponseDto[];
    total: number;
  }> {
    const connectorIssues = await this.listConnectorOperationalIssues();
    const latestRunsResult = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT DISTINCT ON (connector_name)
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        ORDER BY connector_name ASC, started_at DESC
      `,
    );

    const latestRunByConnector = new Map(
      await Promise.all(
        latestRunsResult.rows.map(async (row) => [row.connector_name, await this.mapRun(row)] as const),
      ),
    );
    const issueCountsByConnector = new Map<string, { total: number; critical: number; warning: number }>();

    for (const issue of connectorIssues.items) {
      const current = issueCountsByConnector.get(issue.connectorName) ?? {
        total: 0,
        critical: 0,
        warning: 0,
      };

      current.total += 1;
      current[issue.severity] += 1;
      issueCountsByConnector.set(issue.connectorName, current);
    }

    const items: IngestionConnectorCatalogResponseDto[] = connectorCatalog.map((connector) => {
        const latestRun = latestRunByConnector.get(connector.connectorName);
        const executionReadiness = this.getConnectorExecutionReadiness(connector.connectorName);
        const issueCounters = issueCountsByConnector.get(connector.connectorName) ?? {
          total: 0,
          critical: 0,
          warning: 0,
        };
        const operationalStatus = this.resolveConnectorOperationalStatus(issueCounters);

        return {
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          domain: connector.domain,
          triggerMode: connector.triggerMode,
          capabilities: connector.capabilities,
          writesToMasterData: false,
          operationalStatus,
          executionReadiness,
          latestRun: latestRun
            ? {
                id: latestRun.id,
                status: latestRun.status,
                startedAt: latestRun.startedAt,
                endedAt: latestRun.endedAt,
                rawSummary: latestRun.rawSummary,
                failureStage: latestRun.failureStage,
                failureCode: latestRun.failureCode,
              }
            : null,
          issueCounters,
        };
      });

    items.sort((left, right) => {
      const statusWeight = (status: 'healthy' | 'warning' | 'critical') =>
        status === 'critical' ? 0 : status === 'warning' ? 1 : 2;

      const statusDiff =
        statusWeight(left.operationalStatus) - statusWeight(right.operationalStatus);

      if (statusDiff !== 0) {
        return statusDiff;
      }

      const issueDiff = right.issueCounters.total - left.issueCounters.total;

      if (issueDiff !== 0) {
        return issueDiff;
      }

      return left.displayName.localeCompare(right.displayName, 'it');
    });

    const filteredItems = items.filter((item) => {
      if (filters?.operationalStatus && item.operationalStatus !== filters.operationalStatus) {
        return false;
      }

      if (filters?.triggerMode && item.triggerMode !== filters.triggerMode) {
        return false;
      }

      return true;
    });

    return {
      items: filteredItems,
      total: filteredItems.length,
    };
  }

  async listConnectorOperationalIssues(): Promise<{
    items: IngestionConnectorIssueResponseDto[];
    total: number;
  }> {
    const latestRunsResult = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT DISTINCT ON (connector_name)
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        ORDER BY connector_name ASC, started_at DESC
      `,
    );

    const latestRunByConnector = new Map(
      await Promise.all(
        latestRunsResult.rows.map(async (row) => [row.connector_name, await this.mapRun(row)] as const),
      ),
    );

    const items: IngestionConnectorIssueResponseDto[] = [];

    for (const connector of connectorCatalog) {
      const readiness = this.getConnectorExecutionReadiness(connector.connectorName);
      const latestRun = latestRunByConnector.get(connector.connectorName) ?? null;

      if (!readiness.configured) {
        items.push({
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          severity: 'critical',
          issueType: 'not_configured',
          failureCode: this.resolveConnectorIssueFailureCode('not_configured'),
          detail: readiness.detail,
          latestRunId: latestRun?.id ?? null,
          latestRunStatus: latestRun?.status ?? null,
        });
        continue;
      }

      if (!readiness.runnable) {
        items.push({
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          severity: 'critical',
          issueType: 'not_runnable',
          failureCode: this.resolveConnectorIssueFailureCode('not_runnable'),
          detail: readiness.detail,
          latestRunId: latestRun?.id ?? null,
          latestRunStatus: latestRun?.status ?? null,
        });
      }

      if (readiness.runnable && !readiness.persistenceEnabled) {
        items.push({
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          severity: 'warning',
          issueType: 'dry_run_only',
          failureCode: this.resolveConnectorIssueFailureCode('dry_run_only'),
          detail: 'Connector eseguibile ma in sola modalita` dry-run.',
          latestRunId: latestRun?.id ?? null,
          latestRunStatus: latestRun?.status ?? null,
        });
      }

      if (latestRun?.status === 'failed') {
        items.push({
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          severity: 'critical',
          issueType: 'latest_run_failed',
          failureCode:
            latestRun.failureCode ?? this.resolveConnectorIssueFailureCode('latest_run_failed'),
          detail: latestRun.logExcerpt || 'Ultima run terminata con stato failed.',
          latestRunId: latestRun.id,
          latestRunStatus: latestRun.status,
        });
      }

      if (!latestRun || latestRun.status !== 'completed') {
        items.push({
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          severity: 'warning',
          issueType: 'no_completed_runs',
          failureCode: this.resolveConnectorIssueFailureCode('no_completed_runs'),
          detail: 'Nessuna run completata disponibile per il connector corrente.',
          latestRunId: latestRun?.id ?? null,
          latestRunStatus: latestRun?.status ?? null,
        });
      }
    }

    items.sort((left, right) => {
      const severityWeight = (severity: 'warning' | 'critical') =>
        severity === 'critical' ? 0 : 1;

      const severityDiff =
        severityWeight(left.severity) - severityWeight(right.severity);

      if (severityDiff !== 0) {
        return severityDiff;
      }

      const connectorDiff = left.displayName.localeCompare(right.displayName, 'it');

      if (connectorDiff !== 0) {
        return connectorDiff;
      }

      return left.issueType.localeCompare(right.issueType, 'it');
    });

    return {
      items,
      total: items.length,
    };
  }

  async listConnectorOperationalIssuesFiltered(filters?: {
    connectorName?: string;
    severity?: 'warning' | 'critical';
    issueType?: string;
  }): Promise<{
    items: IngestionConnectorIssueResponseDto[];
    total: number;
  }> {
    const issues = await this.listConnectorOperationalIssues();
    const connectorName = filters?.connectorName?.trim();
    const severity = filters?.severity?.trim();
    const issueType = filters?.issueType?.trim();

    const items = issues.items.filter((item) => {
      if (connectorName && item.connectorName !== connectorName) {
        return false;
      }

      if (severity && item.severity !== severity) {
        return false;
      }

      if (issueType && item.issueType !== issueType) {
        return false;
      }

      return true;
    });

    return {
      items,
      total: items.length,
    };
  }

  async getConnectorDetail(
    connectorName: string,
  ): Promise<IngestionConnectorDetailResponseDto | null> {
    const connector = connectorCatalog.find((item) => item.connectorName === connectorName);

    if (!connector) {
      return null;
    }

    const connectorIssues = await this.listConnectorOperationalIssuesFiltered({ connectorName });
    const runsResult = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        WHERE connector_name = $1
        ORDER BY started_at DESC
      `,
      [connectorName],
    );

    const latestRun = runsResult.rows[0] ?? null;
    const lastCompletedRun = runsResult.rows.find((row) => row.status === 'completed') ?? null;
    const lastFailedRun = runsResult.rows.find((row) => row.status === 'failed') ?? null;
    const latestRunMapped = latestRun ? await this.mapRun(latestRun) : null;
    const lastCompletedRunMapped = lastCompletedRun ? await this.mapRun(lastCompletedRun) : null;
    const lastFailedRunMapped = lastFailedRun ? await this.mapRun(lastFailedRun) : null;
    const executionReadiness = this.getConnectorExecutionReadiness(connectorName);
    const issueCounters = connectorIssues.items.reduce(
      (accumulator, item) => {
        accumulator.total += 1;
        accumulator[item.severity] += 1;
        return accumulator;
      },
      { total: 0, critical: 0, warning: 0 },
    );
    const issueTypeCounters = connectorIssues.items.reduce(
      (accumulator, item) => {
        if (item.issueType === 'not_configured') {
          accumulator.notConfigured += 1;
        }

        if (item.issueType === 'not_runnable') {
          accumulator.notRunnable += 1;
        }

        if (item.issueType === 'dry_run_only') {
          accumulator.dryRunOnly += 1;
        }

        if (item.issueType === 'latest_run_failed') {
          accumulator.latestRunFailed += 1;
        }

        if (item.issueType === 'no_completed_runs') {
          accumulator.noCompletedRuns += 1;
        }

        return accumulator;
      },
      {
        notConfigured: 0,
        notRunnable: 0,
        dryRunOnly: 0,
        latestRunFailed: 0,
        noCompletedRuns: 0,
      },
    );
    const operationalStatus = this.resolveConnectorOperationalStatus(issueCounters);

    return {
      connectorName: connector.connectorName,
      sourceSystem: connector.sourceSystem,
      displayName: connector.displayName,
      domain: connector.domain,
      triggerMode: connector.triggerMode,
      capabilities: connector.capabilities,
      writesToMasterData: false,
      operationalStatus,
      executionReadiness,
      latestRun: latestRun
        ? {
            id: latestRun.id,
            status: latestRun.status,
            startedAt: new Date(latestRun.started_at).toISOString(),
            endedAt: latestRun.ended_at ? new Date(latestRun.ended_at).toISOString() : null,
            rawSummary: latestRunMapped?.rawSummary ?? this.emptyRawSummary(),
            failureStage: latestRunMapped?.failureStage ?? null,
            failureCode: latestRunMapped?.failureCode ?? null,
          }
        : null,
      lastCompletedRun: lastCompletedRun
        ? {
            id: lastCompletedRun.id,
            status: lastCompletedRun.status,
            startedAt: new Date(lastCompletedRun.started_at).toISOString(),
            endedAt: lastCompletedRun.ended_at
              ? new Date(lastCompletedRun.ended_at).toISOString()
              : null,
            recordsTotal: lastCompletedRun.records_total,
            recordsSuccess: lastCompletedRun.records_success,
            recordsError: lastCompletedRun.records_error,
            rawSummary: lastCompletedRunMapped?.rawSummary ?? this.emptyRawSummary(),
          }
        : null,
      lastFailedRun: lastFailedRun
        ? {
            id: lastFailedRun.id,
            status: lastFailedRun.status,
            startedAt: new Date(lastFailedRun.started_at).toISOString(),
            endedAt: lastFailedRun.ended_at ? new Date(lastFailedRun.ended_at).toISOString() : null,
            recordsTotal: lastFailedRun.records_total,
            recordsSuccess: lastFailedRun.records_success,
            recordsError: lastFailedRun.records_error,
            logExcerpt: lastFailedRun.log_excerpt ?? '',
            rawSummary: lastFailedRunMapped?.rawSummary ?? this.emptyRawSummary(),
            failureStage: lastFailedRunMapped?.failureStage ?? null,
            failureCode: lastFailedRunMapped?.failureCode ?? null,
          }
        : null,
      runCounters: {
        total: runsResult.rows.length,
        queued: runsResult.rows.filter((row) => row.status === 'queued').length,
        completed: runsResult.rows.filter((row) => row.status === 'completed').length,
        failed: runsResult.rows.filter((row) => row.status === 'failed').length,
      },
      executionStats: {
        recordsObservedTotal: runsResult.rows.reduce((total, row) => total + row.records_total, 0),
        recordsSucceededTotal: runsResult.rows.reduce((total, row) => total + row.records_success, 0),
        recordsErroredTotal: runsResult.rows.reduce((total, row) => total + row.records_error, 0),
      },
      issueCounters,
      issueTypeCounters,
      issues: connectorIssues.items,
    };
  }

  private resolveConnectorOperationalStatus(issueCounters: {
    total: number;
    critical: number;
    warning: number;
  }): 'healthy' | 'warning' | 'critical' {
    if (issueCounters.critical > 0) {
      return 'critical';
    }

    if (issueCounters.warning > 0) {
      return 'warning';
    }

    return 'healthy';
  }

  async getOrchestrationSummary(): Promise<IngestionOrchestrationSummaryResponseDto> {
    const readinessByConnector = connectorCatalog.map((connector) =>
      this.getConnectorExecutionReadiness(connector.connectorName),
    );
    const connectorIssues = await this.listConnectorOperationalIssues();
    const runs = await this.listRuns();
    const healthyConnectors =
      connectorCatalog.length -
      new Set(connectorIssues.items.map((item) => item.connectorName)).size;
    const [queuedRunsResult, runningRunsResult, failedRunsResult, normalizedRecordsResult, reviewQueueResult, latestRunResult] =
      await Promise.all([
        this.databaseService.query<NumericCountRow>(
          `SELECT COUNT(*)::text AS total FROM ingest.ingestion_run WHERE status = 'queued'`,
        ),
        this.databaseService.query<NumericCountRow>(
          `SELECT COUNT(*)::text AS total FROM ingest.ingestion_run WHERE status = 'running'`,
        ),
        this.databaseService.query<NumericCountRow>(
          `SELECT COUNT(*)::text AS total FROM ingest.ingestion_run WHERE status = 'failed'`,
        ),
        this.databaseService.query<NumericCountRow>(
          `SELECT COUNT(*)::text AS total FROM ingest.ingestion_record_normalized`,
        ),
        this.databaseService.query<NumericCountRow>(
          `SELECT COUNT(*)::text AS total FROM ingest.matching_result WHERE decision_status = 'review'`,
        ),
        this.databaseService.query<TimestampRow>(
          `SELECT MAX(started_at) AS latest_run_at FROM ingest.ingestion_run`,
        ),
      ]);

    return {
      registeredConnectors: connectorCatalog.length,
      manualConnectors: connectorCatalog.filter((connector) => connector.triggerMode === 'manual').length,
      configuredConnectors: readinessByConnector.filter((item) => item.configured).length,
      runnableConnectors: readinessByConnector.filter((item) => item.runnable).length,
      persistentConnectors: readinessByConnector.filter(
        (item) => item.runnable && item.persistenceEnabled,
      ).length,
      healthyConnectors,
      criticalConnectorIssues: connectorIssues.items.filter((item) => item.severity === 'critical').length,
      warningConnectorIssues: connectorIssues.items.filter((item) => item.severity === 'warning').length,
      blockedConnectors: readinessByConnector.filter((item) => !item.runnable).length,
      dryRunConnectors: readinessByConnector.filter(
        (item) => item.runnable && !item.persistenceEnabled,
      ).length,
      queuedRuns: Number(queuedRunsResult.rows[0]?.total ?? 0),
      runningRuns: Number(runningRunsResult.rows[0]?.total ?? 0),
      failedRuns: Number(failedRunsResult.rows[0]?.total ?? 0),
      postProcessingQueuedRuns: runs.items.filter(
        (run) => run.stages.postProcessing.status === 'queued',
      ).length,
      postProcessingRunningRuns: runs.items.filter(
        (run) => run.stages.postProcessing.status === 'running',
      ).length,
      normalizationCompletedRuns: runs.items.filter(
        (run) => run.stages.normalization.status === 'completed',
      ).length,
      matchingCompletedRuns: runs.items.filter(
        (run) => run.stages.matching.status === 'completed',
      ).length,
      normalizedRecords: Number(normalizedRecordsResult.rows[0]?.total ?? 0),
      reviewQueue: Number(reviewQueueResult.rows[0]?.total ?? 0),
      latestRunAt: latestRunResult.rows[0]?.latest_run_at
        ? new Date(latestRunResult.rows[0].latest_run_at).toISOString()
        : null,
    };
  }

  async getRunById(id: string) {
    const result = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        WHERE id = $1
      `,
      [id],
    );

    const run = result.rows[0];

    return run ? this.mapRun(run) : null;
  }

  async startManualRun(connectorName: string): Promise<StartIngestionRunResponseDto> {
    if (!this.isSupportedConnector(connectorName)) {
      throw PcbDomainException.badRequest(
        'ingest.connector_unsupported',
        `Unsupported connector ${connectorName}`,
        { connectorName },
      );
    }

    const readiness = this.getConnectorExecutionReadiness(connectorName);

    if (!readiness.runnable) {
      throw PcbDomainException.badRequest(
        'ingest.connector_not_runnable',
        `Connector ${connectorName} is not runnable: ${readiness.detail}`,
        {
          connectorName,
          detail: readiness.detail,
        },
      );
    }

    const runId = randomUUID();
    const sourceSystem = this.resolveSourceSystem(connectorName);
    const startedAt = new Date();

    await this.databaseService.query(
      `
        INSERT INTO ingest.ingestion_run (
          id,
          connector_name,
          source_system,
          started_at,
          status,
          records_total,
          records_success,
          records_error,
          log_excerpt
        )
        VALUES ($1, $2, $3, $4, $5, 0, 0, 0, $6)
      `,
      [runId, connectorName, sourceSystem, startedAt.toISOString(), 'queued', 'Manual bootstrap run requested'],
    );

    await this.auditService.recordEvent({
      eventType: 'connector_run_requested',
      actorType: 'system_operator',
      actorId: 'manual-trigger',
      sourceModule: 'ingest',
      entityType: 'ingestion_run',
      entityId: runId,
      payload: {
        connectorName,
        sourceSystem,
        executionMode: 'manual',
        status: 'queued',
      },
    });

    await this.redisService.setJson(
      `pcb:ingest:runs:${runId}`,
      {
        connectorName,
        sourceSystem,
        status: 'queued',
        executionMode: 'manual',
        startedAt: startedAt.toISOString(),
      },
      86400,
    );
    await this.redisService.setString('pcb:ingest:last-manual-run-id', runId, 86400);

    await this.launchConnectorProcess(runId, connectorName, sourceSystem);

    return {
      id: runId,
      connectorName,
      sourceSystem,
      status: 'running',
      startedAt: startedAt.toISOString(),
      executionMode: 'manual',
      postProcessing: this.getPostProcessingConfig(),
    };
  }

  async normalizeRun(id: string): Promise<NormalizeRunResponseDto | null> {
    const run = await this.getRunRowById(id);

    if (!run) {
      return null;
    }

    const rawRecordsResult = await this.databaseService.query<RawIngestionRecordRow>(
      `
        SELECT
          source_record_id,
          payload_jsonb
        FROM ingest.ingestion_record_raw
        WHERE ingestion_run_id = $1
        ORDER BY captured_at ASC, source_record_id ASC
      `,
      [id],
    );

    await this.databaseService.query(
      `
        DELETE FROM ingest.ingestion_record_normalized
        WHERE ingestion_run_id = $1
      `,
      [id],
    );

    for (const rawRecord of rawRecordsResult.rows) {
      const normalized = this.normalizeRawRecord(rawRecord.payload_jsonb, run);

      await this.databaseService.query(
        `
          INSERT INTO ingest.ingestion_record_normalized (
            id,
            ingestion_run_id,
            source_record_id,
            normalized_jsonb,
            normalization_status
          )
          VALUES ($1, $2, $3, $4::jsonb, $5)
        `,
        [
          randomUUID(),
          id,
          rawRecord.source_record_id,
          JSON.stringify(normalized),
          'normalized',
        ],
      );
    }

    const summary = `Normalization completed: ${rawRecordsResult.rows.length} normalized record(s)`;

    await this.databaseService.query(
      `
        UPDATE ingest.ingestion_run
        SET log_excerpt = $2
        WHERE id = $1
      `,
      [id, summary],
    );

    await this.auditService.recordEvent({
      eventType: 'ingestion_normalized',
      actorType: 'system',
      actorId: 'pipeline',
      sourceModule: 'ingest',
      entityType: 'ingestion_run',
      entityId: id,
      payload: {
        connectorName: run.connector_name,
        sourceSystem: run.source_system,
        rawRecordsRead: rawRecordsResult.rows.length,
        normalizedRecordsWritten: rawRecordsResult.rows.length,
      },
    });

    await this.redisService.setJson(
      `pcb:ingest:runs:${id}:normalization`,
      {
        connectorName: run.connector_name,
        sourceSystem: run.source_system,
        rawRecordsRead: rawRecordsResult.rows.length,
        normalizedRecordsWritten: rawRecordsResult.rows.length,
        normalizationStatus: 'completed',
      },
      86400,
    );

    return {
      ingestionRunId: id,
      connectorName: run.connector_name,
      sourceSystem: run.source_system,
      rawRecordsRead: rawRecordsResult.rows.length,
      normalizedRecordsWritten: rawRecordsResult.rows.length,
      normalizationStatus: 'completed',
    };
  }

  async listNormalizedRecordsByRunId(
    id: string,
    filters?: { normalizationStatus?: string; outcomeCode?: string },
  ) {
    const run = await this.getRunRowById(id);

    if (!run) {
      return null;
    }

    const result = await this.databaseService.query<NormalizedIngestionRecordRow>(
      `
        SELECT
          id,
          ingestion_run_id,
          source_record_id,
          normalization_status,
          normalized_jsonb,
          created_at
        FROM ingest.ingestion_record_normalized
        WHERE ingestion_run_id = $1
        ORDER BY created_at ASC, source_record_id ASC
      `,
      [id],
    );

    const items = result.rows
      .map((row) => this.mapNormalizedRecord(row))
      .filter((item) => !filters?.normalizationStatus || item.normalizationStatus === filters.normalizationStatus)
      .filter((item) => !filters?.outcomeCode || item.outcomeCode === filters.outcomeCode);

    return {
      items,
      total: items.length,
    };
  }

  async listRawRecordsByRunId(id: string, outcomeCode?: string) {
    const run = await this.getRunRowById(id);

    if (!run) {
      return null;
    }

    const result = await this.databaseService.query<RawIngestionRecordRow>(
      `
        SELECT
          id,
          ingestion_run_id,
          source_record_id,
          payload_jsonb,
          captured_at
        FROM ingest.ingestion_record_raw
        WHERE ingestion_run_id = $1
        ORDER BY captured_at ASC, source_record_id ASC
      `,
      [id],
    );

    const items = result.rows
      .map((row) => this.mapRawRecord(row))
      .filter((item) => !outcomeCode || item.outcomeCode === outcomeCode);

    return {
      items,
      total: items.length,
    };
  }

  async runMatching(id: string): Promise<RunMatchingResponseDto | null> {
    const run = await this.getRunRowById(id);

    if (!run) {
      return null;
    }

    const normalizedRecordsResult = await this.databaseService.query<NormalizedIngestionRecordRow>(
      `
        SELECT
          id,
          ingestion_run_id,
          source_record_id,
          normalization_status,
          normalized_jsonb,
          created_at
        FROM ingest.ingestion_record_normalized
        WHERE ingestion_run_id = $1
        ORDER BY created_at ASC, source_record_id ASC
      `,
      [id],
    );

    const candidatesResult = await this.databaseService.query<MatchingCandidateRow>(
      `
        SELECT
          ms.id AS subject_id,
          ms.cuua,
          si.identifier_value,
          ssl.source_record_id,
          ssl.source_url,
          (
            SELECT snh.display_name
            FROM anagrafe.subject_name_history snh
            WHERE snh.subject_id = ms.id
            ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
            LIMIT 1
          ) AS display_name
        FROM anagrafe.master_subject ms
        LEFT JOIN anagrafe.subject_identifier si
          ON si.subject_id = ms.id
        LEFT JOIN anagrafe.subject_source_link ssl
          ON ssl.subject_id = ms.id
      `,
    );

    await this.databaseService.query(
      `
        DELETE FROM ingest.matching_result
        WHERE ingestion_run_id = $1
      `,
      [id],
    );

    let directMatches = 0;
    let reviewQueue = 0;
    let unmatched = 0;

    for (const row of normalizedRecordsResult.rows) {
      const decision = this.matchNormalizedRecord(row, candidatesResult.rows);

      await this.databaseService.query(
        `
          INSERT INTO ingest.matching_result (
            id,
            ingestion_run_id,
            source_record_id,
            matched_subject_id,
            matching_score,
            decision_type,
            decision_status,
            notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          randomUUID(),
          id,
          row.source_record_id,
          decision.matchedSubjectId,
          decision.matchingScore,
          decision.decisionType,
          decision.decisionStatus,
          decision.notes,
        ],
      );

      if (decision.decisionStatus === 'matched') {
        directMatches += 1;
      } else if (decision.decisionStatus === 'review') {
        reviewQueue += 1;
      } else {
        unmatched += 1;
      }
    }

    const summary = `Matching completed: ${directMatches} matched, ${reviewQueue} review, ${unmatched} unmatched`;

    await this.databaseService.query(
      `
        UPDATE ingest.ingestion_run
        SET log_excerpt = $2
        WHERE id = $1
      `,
      [id, summary],
    );

    await this.auditService.recordEvent({
      eventType: 'ingestion_matched',
      actorType: 'system',
      actorId: 'pipeline',
      sourceModule: 'ingest',
      entityType: 'ingestion_run',
      entityId: id,
      payload: {
        connectorName: run.connector_name,
        sourceSystem: run.source_system,
        normalizedRecordsRead: normalizedRecordsResult.rows.length,
        directMatches,
        reviewQueue,
        unmatched,
      },
    });

    await this.redisService.setJson(
      `pcb:ingest:runs:${id}:matching`,
      {
        connectorName: run.connector_name,
        sourceSystem: run.source_system,
        normalizedRecordsRead: normalizedRecordsResult.rows.length,
        directMatches,
        reviewQueue,
        unmatched,
        matchingStatus: 'completed',
      },
      86400,
    );

    return {
      ingestionRunId: id,
      normalizedRecordsRead: normalizedRecordsResult.rows.length,
      matchingResultsWritten: normalizedRecordsResult.rows.length,
      directMatches,
      reviewQueue,
      unmatched,
      matchingStatus: 'completed',
    };
  }

  async listMatchingResultsByRunId(
    id: string,
    filters?: { decisionStatus?: string; outcomeCode?: string },
  ) {
    const run = await this.getRunRowById(id);

    if (!run) {
      return null;
    }

    const result = await this.databaseService.query<MatchingResultRow>(
      `
        SELECT
          id,
          ingestion_run_id,
          source_record_id,
          matched_subject_id,
          matching_score,
          decision_type,
          decision_status,
          notes,
          created_at
        FROM ingest.matching_result
        WHERE ingestion_run_id = $1
        ORDER BY created_at ASC, source_record_id ASC
      `,
      [id],
    );

    const items = result.rows
      .map((row) => this.mapMatchingResult(row))
      .filter((item) => !filters?.decisionStatus || item.decisionStatus === filters.decisionStatus)
      .filter((item) => !filters?.outcomeCode || item.outcomeCode === filters.outcomeCode);

    return {
      items,
      total: items.length,
    };
  }

  async getPipelineSummaryByRunId(id: string): Promise<IngestionPipelineSummaryResponseDto | null> {
    const [rawRecords, normalizedRecords, matchingResults] = await Promise.all([
      this.listRawRecordsByRunId(id),
      this.listNormalizedRecordsByRunId(id),
      this.listMatchingResultsByRunId(id),
    ]);

    if (!rawRecords || !normalizedRecords || !matchingResults) {
      return null;
    }

    return {
      ingestionRunId: id,
      raw: {
        total: rawRecords.total,
        outcomeCounters: this.countBy(rawRecords.items, (item) => item.outcomeCode),
      },
      normalized: {
        total: normalizedRecords.total,
        statusCounters: this.countBy(normalizedRecords.items, (item) => item.normalizationStatus),
        outcomeCounters: this.countBy(normalizedRecords.items, (item) => item.outcomeCode),
      },
      matching: {
        total: matchingResults.total,
        statusCounters: this.countBy(matchingResults.items, (item) => item.decisionStatus),
        outcomeCounters: this.countBy(matchingResults.items, (item) => item.outcomeCode),
      },
    };
  }

  async confirmMatchingResult(
    runId: string,
    resultId: string,
    action: 'confirm-match' | 'confirm-no-match',
  ) {
    const run = await this.getRunRowById(runId);

    if (!run) {
      return null;
    }

    const currentResult = await this.getMatchingResultRow(runId, resultId);

    if (!currentResult) {
      return undefined;
    }

    if (action === 'confirm-match' && !currentResult.matched_subject_id) {
      throw PcbDomainException.badRequest(
        'ingest.matching_result_missing_subject',
        'Cannot confirm match without matched_subject_id',
        { runId, resultId, action },
      );
    }

    const nextStatus = action === 'confirm-match' ? 'accepted' : 'rejected';
    const nextNotes =
      action === 'confirm-match'
        ? this.appendDecisionNote(currentResult.notes, 'Manual confirmation of existing match')
        : this.appendDecisionNote(currentResult.notes, 'Manual confirmation of no-match');

    await this.databaseService.query(
      `
        UPDATE ingest.matching_result
        SET
          decision_status = $3,
          notes = $4
        WHERE ingestion_run_id = $1
          AND id = $2
      `,
      [runId, resultId, nextStatus, nextNotes],
    );

    await this.auditService.recordEvent({
      eventType: 'matching_review_decision',
      actorType: 'system_operator',
      actorId: 'manual-review',
      sourceModule: 'ingest',
      entityType: 'matching_result',
      entityId: resultId,
      payload: {
        ingestionRunId: runId,
        action,
        decisionStatus: nextStatus,
        matchedSubjectId: currentResult.matched_subject_id,
      },
    });

    const updated = await this.getMatchingResultRow(runId, resultId);

    return updated ? this.mapMatchingResult(updated) : undefined;
  }

  async assignSubjectToMatchingResult(
    runId: string,
    resultId: string,
    subjectId: string,
  ) {
    const run = await this.getRunRowById(runId);

    if (!run) {
      return null;
    }

    const currentResult = await this.getMatchingResultRow(runId, resultId);

    if (!currentResult) {
      return undefined;
    }

    const subjectExists = await this.subjectExists(subjectId);

    if (!subjectExists) {
      throw PcbDomainException.notFound(
        'ingest.assignment_subject_not_found',
        `Subject not found for id ${subjectId}`,
        { runId, resultId, subjectId },
      );
    }

    const nextNotes = this.appendDecisionNote(
      currentResult.notes,
      `Manual subject assignment to ${subjectId}`,
    );

    await this.databaseService.query(
      `
        UPDATE ingest.matching_result
        SET
          matched_subject_id = $3,
          matching_score = $4,
          decision_type = $5,
          decision_status = $6,
          notes = $7
        WHERE ingestion_run_id = $1
          AND id = $2
      `,
      [
        runId,
        resultId,
        subjectId,
        100,
        'manual_subject_assignment',
        'accepted',
        nextNotes,
      ],
    );

    await this.auditService.recordEvent({
      eventType: 'matching_manual_subject_assignment',
      actorType: 'system_operator',
      actorId: 'manual-review',
      sourceModule: 'ingest',
      entityType: 'matching_result',
      entityId: resultId,
      payload: {
        ingestionRunId: runId,
        assignedSubjectId: subjectId,
        decisionStatus: 'accepted',
      },
    });

    const updated = await this.getMatchingResultRow(runId, resultId);

    return updated ? this.mapMatchingResult(updated) : undefined;
  }

  private resolveSourceSystem(connectorName: string) {
    if (connectorName === 'connector-nas-catasto') {
      return 'nas-catasto';
    }

    if (connectorName.startsWith('connector-capacitas-')) {
      return connectorName.replace('connector-', '');
    }

    return 'external-system';
  }

  private isSupportedConnector(connectorName: string) {
    return connectorCatalog.some((connector) => connector.connectorName === connectorName);
  }

  private getPostProcessingConfig(): PostProcessingConfig {
    const autoNormalize =
      process.env.PCB_INGEST_AUTO_NORMALIZE === '1' ||
      process.env.PCB_INGEST_AUTO_NORMALIZE?.toLowerCase() === 'true';
    const autoMatch =
      (process.env.PCB_INGEST_AUTO_MATCH === '1' ||
        process.env.PCB_INGEST_AUTO_MATCH?.toLowerCase() === 'true') &&
      autoNormalize;

    return {
      autoNormalize,
      autoMatch,
    };
  }

  private getConnectorExecutionReadiness(connectorName: string): ConnectorExecutionReadiness {
    if (connectorName === 'connector-nas-catasto') {
      const rootPath = process.env.PCB_NAS_CATASTO_ROOT ?? null;
      const persistenceEnabled =
        process.env.PCB_NAS_CATASTO_PERSIST_INGEST === '1' ||
        process.env.PCB_NAS_CATASTO_PERSIST_INGEST?.toLowerCase() === 'true';
      const cliPath = this.resolveConnectorCliPath(connectorName);

      if (!rootPath) {
        return {
          configured: false,
          runnable: false,
          persistenceEnabled,
          rootPath: null,
          detail: 'PCB_NAS_CATASTO_ROOT non configurato',
        };
      }

      const pathExists = existsSync(rootPath);
      const cliExists = existsSync(cliPath);

      if (!pathExists) {
        return {
          configured: true,
          runnable: false,
          persistenceEnabled,
          rootPath,
          detail: 'root path configurato ma non accessibile nel runtime corrente',
        };
      }

      if (!cliExists) {
        return {
          configured: true,
          runnable: false,
          persistenceEnabled,
          rootPath,
          detail: 'connector configurato ma CLI buildato non disponibile in connectors/dist',
        };
      }

      return {
        configured: true,
        runnable: true,
        persistenceEnabled,
        rootPath,
        detail: persistenceEnabled
          ? 'connector eseguibile con persistenza raw ingest attiva'
          : 'connector eseguibile in modalita` dry-run',
      };
    }

    return {
      configured: false,
      runnable: false,
      persistenceEnabled: false,
      rootPath: null,
      detail: 'connector registrato senza profilo runtime locale',
    };
  }

  private resolveConnectorCliPath(connectorName: string) {
    const connectorsDistRoot =
      process.env.PCB_CONNECTORS_DIST_ROOT ?? resolve(process.cwd(), 'connectors', 'dist');

    if (connectorName === 'connector-nas-catasto') {
      return resolve(connectorsDistRoot, 'connectors', 'connector-nas-catasto', 'cli.js');
    }

    return resolve(connectorsDistRoot, connectorName, 'cli.js');
  }

  private async launchConnectorProcess(runId: string, connectorName: string, sourceSystem: string) {
    const cliPath = this.resolveConnectorCliPath(connectorName);

    if (!existsSync(cliPath)) {
      await this.failRun(
        runId,
        connectorName,
        sourceSystem,
        `Connector CLI non trovato: ${cliPath}`,
      );
      throw PcbDomainException.serviceUnavailable(
        'ingest.connector_cli_missing',
        `Connector CLI not found for ${connectorName}`,
        { connectorName, cliPath },
      );
    }

    const child = spawn(process.execPath, [cliPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PCB_NAS_CATASTO_PERSIST_INGEST: 'true',
        PCB_INGESTION_RUN_ID: runId,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.once('spawn', async () => {
      await this.databaseService.query(
        `
          UPDATE ingest.ingestion_run
          SET status = 'running', log_excerpt = $2
          WHERE id = $1
        `,
        [runId, 'Connector process started'],
      );

      await this.redisService.setJson(
        `pcb:ingest:runs:${runId}`,
        {
          connectorName,
          sourceSystem,
          status: 'running',
          executionMode: 'manual',
          startedAt: new Date().toISOString(),
        },
        86400,
      );
    });

    child.once('error', async (error) => {
      if (settled) {
        return;
      }

      settled = true;
      await this.failRun(runId, connectorName, sourceSystem, error.message);
    });

    child.once('close', async (code) => {
      if (settled) {
        return;
      }

      settled = true;

      if (code === 0) {
        await this.completeRun(runId, connectorName, sourceSystem, stdout, stderr);
        return;
      }

      const excerpt = stderr.trim() || `Connector process exited with code ${code ?? 'unknown'}`;
      await this.failRun(runId, connectorName, sourceSystem, excerpt);
    });
  }

  private async completeRun(
    runId: string,
    connectorName: string,
    sourceSystem: string,
    stdout: string,
    stderr: string,
  ) {
    const report = this.parseConnectorExecutionResult(stdout);
    const endedAt = report?.endedAt ?? new Date().toISOString();

    await this.redisService.setJson(
      `pcb:ingest:runs:${runId}`,
      {
        connectorName,
        sourceSystem,
        status: 'completed',
        executionMode: 'manual',
        endedAt,
        persistence: report?.persistence ?? null,
      },
      86400,
    );

    await this.auditService.recordEvent({
      eventType: 'connector_run_completed',
      actorType: 'system',
      actorId: connectorName,
      sourceModule: 'ingest',
      entityType: 'ingestion_run',
      entityId: runId,
      payload: {
        connectorName,
        sourceSystem,
        status: report?.status ?? 'completed',
        filesScanned: report?.filesScanned ?? null,
        directoriesScanned: report?.directoriesScanned ?? null,
        recordsPersisted: report?.persistence?.recordsPersisted ?? null,
        stderr: stderr.trim() || null,
      },
    });

    await this.runConfiguredPostProcessing(runId, connectorName, sourceSystem);
  }

  private async failRun(
    runId: string,
    connectorName: string,
    sourceSystem: string,
    reason: string,
  ) {
    const endedAt = new Date().toISOString();
    const excerpt = reason.trim().slice(0, 1000) || 'Connector execution failed';

    await this.databaseService.query(
      `
        UPDATE ingest.ingestion_run
        SET
          status = 'failed',
          ended_at = $2,
          log_excerpt = $3
        WHERE id = $1
      `,
      [runId, endedAt, excerpt],
    );

    await this.redisService.setJson(
      `pcb:ingest:runs:${runId}`,
      {
        connectorName,
        sourceSystem,
        status: 'failed',
        executionMode: 'manual',
        endedAt,
        error: excerpt,
      },
      86400,
    );

    await this.auditService.recordEvent({
      eventType: 'connector_run_failed',
      actorType: 'system',
      actorId: connectorName,
      sourceModule: 'ingest',
      entityType: 'ingestion_run',
      entityId: runId,
      payload: {
        connectorName,
        sourceSystem,
        status: 'failed',
        error: excerpt,
      },
    });
  }

  private parseConnectorExecutionResult(stdout: string): ConnectorExecutionResult | null {
    const normalized = stdout.trim();

    if (!normalized) {
      return null;
    }

    try {
      return JSON.parse(normalized) as ConnectorExecutionResult;
    } catch {
      return null;
    }
  }

  private async runConfiguredPostProcessing(
    runId: string,
    connectorName: string,
    sourceSystem: string,
  ) {
    const config = this.getPostProcessingConfig();

    if (!config.autoNormalize) {
      return;
    }

    await this.redisService.setJson(
      `pcb:ingest:runs:${runId}:post-processing`,
      {
        connectorName,
        sourceSystem,
        autoNormalize: config.autoNormalize,
        autoMatch: config.autoMatch,
        status: 'running',
        startedAt: new Date().toISOString(),
      },
      86400,
    );

    try {
      const normalization = await this.normalizeRun(runId);

      if (!normalization) {
        throw PcbDomainException.conflict(
          'ingest.post_processing_normalization_failed_to_start',
          `Normalization could not start for run ${runId}`,
          { runId, connectorName },
        );
      }

      let matchingStatus: 'skipped' | 'completed' = 'skipped';

      if (config.autoMatch) {
        const matching = await this.runMatching(runId);

        if (!matching) {
          throw PcbDomainException.conflict(
            'ingest.post_processing_matching_failed_to_start',
            `Matching could not start for run ${runId}`,
            { runId, connectorName },
          );
        }

        matchingStatus = 'completed';
      }

      await this.auditService.recordEvent({
        eventType: 'connector_post_processing_completed',
        actorType: 'system',
        actorId: connectorName,
        sourceModule: 'ingest',
        entityType: 'ingestion_run',
        entityId: runId,
        payload: {
          connectorName,
          sourceSystem,
          autoNormalize: config.autoNormalize,
          autoMatch: config.autoMatch,
          matchingStatus,
        },
      });

      await this.redisService.setJson(
        `pcb:ingest:runs:${runId}:post-processing`,
        {
          connectorName,
          sourceSystem,
          autoNormalize: config.autoNormalize,
          autoMatch: config.autoMatch,
          status: 'completed',
          matchingStatus,
          completedAt: new Date().toISOString(),
        },
        86400,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown post-processing orchestration error';

      await this.auditService.recordEvent({
        eventType: 'connector_post_processing_failed',
        actorType: 'system',
        actorId: connectorName,
        sourceModule: 'ingest',
        entityType: 'ingestion_run',
        entityId: runId,
        payload: {
          connectorName,
          sourceSystem,
          autoNormalize: config.autoNormalize,
          autoMatch: config.autoMatch,
          error: message,
        },
      });

      await this.redisService.setJson(
        `pcb:ingest:runs:${runId}:post-processing`,
        {
          connectorName,
          sourceSystem,
          autoNormalize: config.autoNormalize,
          autoMatch: config.autoMatch,
          status: 'failed',
          error: message,
          failedAt: new Date().toISOString(),
        },
        86400,
      );
    }
  }

  private async mapRun(row: IngestionRunRow): Promise<IngestionRunResponseDto> {
    const postProcessingConfig = this.getPostProcessingConfig();
    const [postProcessingState, normalizationState, matchingState, rawSummary, normalizedCount, matchingCount] =
      await Promise.all([
        this.redisService.getJson<PostProcessingRuntimeState>(
          `pcb:ingest:runs:${row.id}:post-processing`,
        ),
        this.redisService.getJson<NormalizationRuntimeState>(
          `pcb:ingest:runs:${row.id}:normalization`,
        ),
        this.redisService.getJson<MatchingRuntimeState>(`pcb:ingest:runs:${row.id}:matching`),
        this.getRawSummaryByRunId(row.id),
        this.countNormalizedRecords(row.id),
        this.countMatchingResults(row.id),
      ]);

    const acquisitionStatus =
      row.status === 'failed'
        ? 'failed'
        : row.status === 'queued'
          ? 'queued'
          : row.status === 'running'
            ? 'running'
            : 'completed';

    const postProcessingStatus = postProcessingConfig.autoNormalize
      ? postProcessingState?.status ?? (row.status === 'completed' ? 'queued' : 'not_configured')
      : 'not_configured';

    const normalizationStatus =
      normalizationState?.normalizationStatus ??
      (normalizedCount > 0 ? 'completed' : postProcessingStatus === 'running' ? 'running' : 'not_started');

    const matchingStatus =
      matchingState?.matchingStatus ??
      (matchingCount > 0 ? 'completed' : normalizationStatus === 'completed' && postProcessingConfig.autoMatch
        ? postProcessingStatus === 'running'
          ? 'running'
          : 'not_started'
        : 'not_started');
    const failure = this.resolveRunFailure({
      acquisitionStatus,
      postProcessingStatus,
      normalizationStatus,
      matchingStatus,
    });

    return {
      id: row.id,
      connectorName: row.connector_name,
      sourceSystem: row.source_system,
      status: row.status,
      startedAt: new Date(row.started_at).toISOString(),
      endedAt: row.ended_at ? new Date(row.ended_at).toISOString() : null,
      recordsTotal: row.records_total,
      recordsSuccess: row.records_success,
      recordsError: row.records_error,
      logExcerpt: row.log_excerpt ?? '',
      rawSummary,
      failureStage: failure?.stage ?? null,
      failureCode: failure?.code ?? null,
      stages: {
        acquisition: {
          status: acquisitionStatus,
        },
        postProcessing: {
          status: postProcessingStatus,
          autoNormalize: postProcessingConfig.autoNormalize,
          autoMatch: postProcessingConfig.autoMatch,
        },
        normalization: {
          status: normalizationStatus,
          recordsWritten: normalizedCount,
        },
        matching: {
          status: matchingStatus,
          resultsWritten: matchingCount,
        },
      },
    };
  }

  private resolveRunFailure(input: {
    acquisitionStatus: 'queued' | 'running' | 'completed' | 'failed';
    postProcessingStatus: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
    normalizationStatus: 'not_started' | 'running' | 'completed' | 'failed';
    matchingStatus: 'not_started' | 'running' | 'completed' | 'failed';
  }): { stage: IngestionFailureStage; code: string } | null {
    if (input.matchingStatus === 'failed') {
      return {
        stage: 'matching',
        code: this.resolveRunFailureCode('matching'),
      };
    }

    if (input.normalizationStatus === 'failed') {
      return {
        stage: 'normalization',
        code: this.resolveRunFailureCode('normalization'),
      };
    }

    if (input.postProcessingStatus === 'failed') {
      return {
        stage: 'post_processing',
        code: this.resolveRunFailureCode('post_processing'),
      };
    }

    if (input.acquisitionStatus === 'failed') {
      return {
        stage: 'acquisition',
        code: this.resolveRunFailureCode('acquisition'),
      };
    }

    return null;
  }

  private resolveRunFailureCode(stage: IngestionFailureStage) {
    if (stage === 'matching') {
      return 'ingest.matching_failed';
    }

    if (stage === 'normalization') {
      return 'ingest.normalization_failed';
    }

    if (stage === 'post_processing') {
      return 'ingest.post_processing_failed';
    }

    return 'ingest.acquisition_failed';
  }

  private async getRawSummaryByRunId(runId: string) {
    const result = await this.databaseService.query<RawSummaryRow>(
      `
        SELECT
          COUNT(*)::text AS total_records,
          COUNT(*) FILTER (WHERE payload_jsonb ->> 'kind' = 'directory')::text AS directory_records,
          COUNT(*) FILTER (WHERE payload_jsonb ->> 'kind' = 'file')::text AS file_records,
          COUNT(*) FILTER (
            WHERE COALESCE(NULLIF(payload_jsonb ->> 'potentialSubjectKey', ''), '') <> ''
          )::text AS subject_hint_records,
          COUNT(*) FILTER (
            WHERE COALESCE(NULLIF(payload_jsonb ->> 'bucketLetter', ''), '') <> ''
          )::text AS bucket_records,
          COUNT(*) FILTER (
            WHERE payload_jsonb ->> 'kind' = 'directory'
              AND COALESCE(NULLIF(payload_jsonb ->> 'potentialSubjectKey', ''), '') <> ''
          )::text AS directory_subject_bucket_records,
          COUNT(*) FILTER (
            WHERE payload_jsonb ->> 'kind' = 'directory'
              AND COALESCE(NULLIF(payload_jsonb ->> 'potentialSubjectKey', ''), '') = ''
              AND COALESCE(NULLIF(payload_jsonb ->> 'bucketLetter', ''), '') <> ''
          )::text AS directory_bucket_only_records,
          COUNT(*) FILTER (
            WHERE payload_jsonb ->> 'kind' = 'directory'
              AND COALESCE(NULLIF(payload_jsonb ->> 'potentialSubjectKey', ''), '') = ''
              AND COALESCE(NULLIF(payload_jsonb ->> 'bucketLetter', ''), '') = ''
          )::text AS directory_structure_only_records,
          COUNT(*) FILTER (
            WHERE payload_jsonb ->> 'kind' = 'file'
              AND COALESCE(NULLIF(payload_jsonb ->> 'potentialSubjectKey', ''), '') <> ''
          )::text AS file_subject_hint_records,
          COUNT(*) FILTER (
            WHERE payload_jsonb ->> 'kind' = 'file'
              AND COALESCE(NULLIF(payload_jsonb ->> 'potentialSubjectKey', ''), '') = ''
          )::text AS file_without_subject_hint_records,
          COUNT(*) FILTER (
            WHERE COALESCE(NULLIF(payload_jsonb ->> 'kind', ''), '') NOT IN ('directory', 'file')
          )::text AS record_captured_records
        FROM ingest.ingestion_record_raw
        WHERE ingestion_run_id = $1
      `,
      [runId],
    );

    return this.mapRawSummary(result.rows[0]);
  }

  private mapRawSummary(row?: RawSummaryRow) {
    if (!row) {
      return this.emptyRawSummary();
    }

    return {
      totalRecords: Number(row.total_records ?? 0),
      directoryRecords: Number(row.directory_records ?? 0),
      fileRecords: Number(row.file_records ?? 0),
      subjectHintRecords: Number(row.subject_hint_records ?? 0),
      bucketRecords: Number(row.bucket_records ?? 0),
      outcomeCounters: {
        directorySubjectBucket: Number(row.directory_subject_bucket_records ?? 0),
        directoryBucketOnly: Number(row.directory_bucket_only_records ?? 0),
        directoryStructureOnly: Number(row.directory_structure_only_records ?? 0),
        fileSubjectHint: Number(row.file_subject_hint_records ?? 0),
        fileWithoutSubjectHint: Number(row.file_without_subject_hint_records ?? 0),
        recordCaptured: Number(row.record_captured_records ?? 0),
      },
    };
  }

  private emptyRawSummary() {
    return {
      totalRecords: 0,
      directoryRecords: 0,
      fileRecords: 0,
      subjectHintRecords: 0,
      bucketRecords: 0,
      outcomeCounters: {
        directorySubjectBucket: 0,
        directoryBucketOnly: 0,
        directoryStructureOnly: 0,
        fileSubjectHint: 0,
        fileWithoutSubjectHint: 0,
        recordCaptured: 0,
      },
    };
  }

  private resolveConnectorIssueFailureCode(
    issueType: IngestionConnectorIssueResponseDto['issueType'],
  ) {
    if (issueType === 'not_configured') {
      return 'ingest.connector_not_configured';
    }

    if (issueType === 'not_runnable') {
      return 'ingest.connector_not_runnable';
    }

    if (issueType === 'dry_run_only') {
      return 'ingest.connector_dry_run_only';
    }

    if (issueType === 'latest_run_failed') {
      return 'ingest.connector_latest_run_failed';
    }

    return 'ingest.connector_no_completed_runs';
  }

  private countBy<T>(items: T[], selector: (item: T) => string) {
    return items.reduce<Record<string, number>>((accumulator, item) => {
      const key = selector(item);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});
  }

  private async countNormalizedRecords(runId: string) {
    const result = await this.databaseService.query<NumericCountRow>(
      `SELECT COUNT(*) AS total FROM ingest.ingestion_record_normalized WHERE ingestion_run_id = $1`,
      [runId],
    );

    return Number(result.rows[0]?.total ?? 0);
  }

  private async countMatchingResults(runId: string) {
    const result = await this.databaseService.query<NumericCountRow>(
      `SELECT COUNT(*) AS total FROM ingest.matching_result WHERE ingestion_run_id = $1`,
      [runId],
    );

    return Number(result.rows[0]?.total ?? 0);
  }

  private async getRunRowById(id: string) {
    const result = await this.databaseService.query<IngestionRunRow>(
      `
        SELECT
          id,
          connector_name,
          source_system,
          status,
          started_at,
          ended_at,
          records_total,
          records_success,
          records_error,
          log_excerpt
        FROM ingest.ingestion_run
        WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  private normalizeRawRecord(
    payload: Record<string, unknown>,
    run: IngestionRunRow,
  ): Record<string, unknown> {
    const relativePath = this.readString(payload.relativePath);
    const segments = relativePath ? relativePath.split('/').filter(Boolean) : [];
    const kind = this.readString(payload.kind) ?? 'file';
    const fileName = segments.length > 0 ? segments[segments.length - 1] : null;
    const extension =
      kind === 'file' && fileName && fileName.includes('.')
        ? fileName.split('.').pop()?.toLowerCase() ?? null
        : null;
    const normalizedSubjectKey = this.normalizeSubjectKey(this.readString(payload.potentialSubjectKey));

    return {
      connectorName: run.connector_name,
      sourceSystem: run.source_system,
      recordType: kind,
      filesystem: {
        relativePath,
        pathSegments: segments,
        depth: this.readNumber(payload.depth),
        bucketLetter: this.readString(payload.bucketLetter),
        fileName,
        fileExtension: extension,
        sizeBytes: this.readNullableNumber(payload.sizeBytes),
        modifiedAt: this.readString(payload.modifiedAt),
        fileHash: this.readString(payload.fileHash),
      },
      subjectHints: {
        potentialSubjectKey: this.readString(payload.potentialSubjectKey),
        normalizedSubjectKey,
      },
      documentHints: {
        documentFamily: this.classifyDocumentFamily(fileName),
      },
    };
  }

  private mapNormalizedRecord(
    row: NormalizedIngestionRecordRow,
  ): NormalizedRecordResponseDto {
    return {
      id: row.id,
      ingestionRunId: row.ingestion_run_id,
      sourceRecordId: row.source_record_id,
      normalizationStatus: row.normalization_status,
      outcomeCode: this.resolveNormalizedOutcomeCode(row.normalized_jsonb),
      normalized: row.normalized_jsonb,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  private mapRawRecord(row: RawIngestionRecordRow): RawRecordResponseDto {
    return {
      id: row.id,
      ingestionRunId: row.ingestion_run_id,
      sourceRecordId: row.source_record_id,
      outcomeCode: this.resolveRawOutcomeCode(row.payload_jsonb),
      payload: row.payload_jsonb,
      capturedAt: new Date(row.captured_at).toISOString(),
    };
  }

  private mapMatchingResult(row: MatchingResultRow): MatchingResultResponseDto {
    const outcomeCode = this.resolveMatchingOutcomeCode(row.decision_status, row.decision_type);

    return {
      id: row.id,
      ingestionRunId: row.ingestion_run_id,
      sourceRecordId: row.source_record_id,
      matchedSubjectId: row.matched_subject_id,
      matchingScore: Number(row.matching_score),
      decisionType: row.decision_type,
      decisionStatus: row.decision_status,
      outcomeCode,
      requiresManualReview: row.decision_status === 'review',
      resolutionMode:
        row.decision_status === 'accepted' || row.decision_status === 'rejected'
          ? 'manual'
          : 'automatic',
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  private resolveNormalizedOutcomeCode(normalized: Record<string, unknown>) {
    const recordType = this.readString(normalized.recordType);
    const filesystem =
      typeof normalized.filesystem === 'object' && normalized.filesystem !== null
        ? (normalized.filesystem as Record<string, unknown>)
        : {};
    const subjectHints =
      typeof normalized.subjectHints === 'object' && normalized.subjectHints !== null
        ? (normalized.subjectHints as Record<string, unknown>)
        : {};

    const normalizedSubjectKey = this.readString(subjectHints.normalizedSubjectKey);
    const bucketLetter = this.readString(filesystem.bucketLetter);

    if (recordType === 'directory' && normalizedSubjectKey) {
      return 'normalize.directory_subject_bucket';
    }

    if (recordType === 'directory') {
      return bucketLetter
        ? 'normalize.directory_bucket_only'
        : 'normalize.directory_structure_only';
    }

    if (recordType === 'file' && normalizedSubjectKey) {
      return 'normalize.document_subject_hint';
    }

    if (recordType === 'file') {
      return 'normalize.document_without_subject_hint';
    }

    return 'normalize.record_normalized';
  }

  private resolveRawOutcomeCode(payload: Record<string, unknown>) {
    const kind = this.readString(payload.kind);
    const potentialSubjectKey = this.readString(payload.potentialSubjectKey);
    const bucketLetter = this.readString(payload.bucketLetter);

    if (kind === 'directory' && potentialSubjectKey) {
      return 'raw.directory_subject_bucket';
    }

    if (kind === 'directory' && bucketLetter) {
      return 'raw.directory_bucket_only';
    }

    if (kind === 'directory') {
      return 'raw.directory_structure_only';
    }

    if (kind === 'file' && potentialSubjectKey) {
      return 'raw.file_subject_hint';
    }

    if (kind === 'file') {
      return 'raw.file_without_subject_hint';
    }

    return 'raw.record_captured';
  }

  private resolveMatchingOutcomeCode(decisionStatus: string, decisionType: string) {
    if (decisionStatus === 'accepted') {
      return 'match.manually_accepted';
    }

    if (decisionStatus === 'rejected') {
      return 'match.manually_rejected';
    }

    if (decisionStatus === 'review') {
      return 'match.review_required';
    }

    if (decisionStatus === 'ignored') {
      return 'match.ignored';
    }

    if (decisionStatus === 'unmatched') {
      return decisionType === 'no_candidate' ? 'match.unmatched_no_candidate' : 'match.unmatched';
    }

    if (decisionStatus === 'matched') {
      return `match.${decisionType}`;
    }

    return 'match.unknown';
  }

  private async getMatchingResultRow(runId: string, resultId: string) {
    const result = await this.databaseService.query<MatchingResultRow>(
      `
        SELECT
          id,
          ingestion_run_id,
          source_record_id,
          matched_subject_id,
          matching_score,
          decision_type,
          decision_status,
          notes,
          created_at
        FROM ingest.matching_result
        WHERE ingestion_run_id = $1
          AND id = $2
      `,
      [runId, resultId],
    );

    return result.rows[0] ?? null;
  }

  private async subjectExists(subjectId: string) {
    const result = await this.databaseService.query<SubjectLookupRow>(
      `
        SELECT id
        FROM anagrafe.master_subject
        WHERE id = $1
      `,
      [subjectId],
    );

    return result.rows.length > 0;
  }

  private matchNormalizedRecord(
    row: NormalizedIngestionRecordRow,
    candidates: MatchingCandidateRow[],
  ) {
    const normalized = row.normalized_jsonb;
    const subjectHints =
      typeof normalized.subjectHints === 'object' && normalized.subjectHints !== null
        ? (normalized.subjectHints as Record<string, unknown>)
        : {};
    const filesystem =
      typeof normalized.filesystem === 'object' && normalized.filesystem !== null
        ? (normalized.filesystem as Record<string, unknown>)
        : {};

    const normalizedSubjectKey = this.readString(subjectHints.normalizedSubjectKey);
    const fileName = this.readString(filesystem.fileName);
    const recordType = this.readString(normalized.recordType);

    if (recordType === 'directory' && !normalizedSubjectKey) {
      return {
        matchedSubjectId: null,
        matchingScore: 0,
        decisionType: 'structure_only',
        decisionStatus: 'ignored',
        notes: 'Structural directory without subject hint',
      };
    }

    const identifierCandidate = candidates.find((candidate) => {
      const candidateCuuaKey = this.normalizeSubjectKey(candidate.cuua);
      const candidateIdentifierKey = this.normalizeSubjectKey(candidate.identifier_value);

      return (
        normalizedSubjectKey !== null &&
        (candidateCuuaKey === normalizedSubjectKey || candidateIdentifierKey === normalizedSubjectKey)
      );
    });

    if (identifierCandidate) {
      return {
        matchedSubjectId: identifierCandidate.subject_id,
        matchingScore: 99,
        decisionType: 'cuua_or_identifier_exact',
        decisionStatus: 'matched',
        notes: `Matched by CUUA/identifier exact key ${normalizedSubjectKey}`,
      };
    }

    const sourceLinkCandidate = candidates.find((candidate) => {
      const sourceLinkKeys = this.buildSourceLinkKeys(candidate);

      return normalizedSubjectKey !== null && sourceLinkKeys.includes(normalizedSubjectKey);
    });

    if (sourceLinkCandidate) {
      return {
        matchedSubjectId: sourceLinkCandidate.subject_id,
        matchingScore: 97,
        decisionType: 'source_link_exact',
        decisionStatus: 'matched',
        notes: `Matched by source-link key ${normalizedSubjectKey}`,
      };
    }

    const canonicalNameCandidate = candidates.find((candidate) => {
      const candidateCanonicalName = this.normalizeCanonicalSubjectKey(candidate.display_name);

      return normalizedSubjectKey !== null && candidateCanonicalName === normalizedSubjectKey;
    });

    if (canonicalNameCandidate) {
      return {
        matchedSubjectId: canonicalNameCandidate.subject_id,
        matchingScore: 95,
        decisionType: 'canonical_display_name_exact',
        decisionStatus: 'matched',
        notes: `Matched by canonical display name ${normalizedSubjectKey}`,
      };
    }

    if (recordType === 'file' && normalizedSubjectKey) {
      return {
        matchedSubjectId: null,
        matchingScore: 45,
        decisionType: 'document_subject_hint_review',
        decisionStatus: 'review',
        notes: `Document ${fileName ?? row.source_record_id} has subject hint ${normalizedSubjectKey} without exact subject match`,
      };
    }

    return {
      matchedSubjectId: null,
      matchingScore: 0,
      decisionType: 'no_candidate',
      decisionStatus: 'unmatched',
      notes: 'No deterministic matching candidate found',
    };
  }

  private classifyDocumentFamily(fileName: string | null) {
    if (!fileName) {
      return 'unknown';
    }

    const normalizedFileName = fileName.toLowerCase();

    if (normalizedFileName.includes('voltura')) {
      return 'voltura';
    }

    if (normalizedFileName.includes('istanza')) {
      return 'istanza';
    }

    if (normalizedFileName.includes('visura')) {
      return 'visura';
    }

    return 'generic';
  }

  private normalizeSubjectKey(value: string | null) {
    if (!value) {
      return null;
    }

    return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private normalizeCanonicalSubjectKey(value: string | null) {
    if (!value) {
      return null;
    }

    const withoutPunctuation = value
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!withoutPunctuation) {
      return null;
    }

    const stopWords = new Set([
      'AGRICOLA',
      'AGRICOLO',
      'SOCIETA',
      'SOC',
      'SRL',
      'SPA',
      'SAS',
      'SNC',
      'SS',
      'COOP',
      'COOPERATIVA',
    ]);

    const collapsed = withoutPunctuation
      .split(' ')
      .filter((token) => token.length > 0 && !stopWords.has(token))
      .join('');

    return collapsed || this.normalizeSubjectKey(value);
  }

  private readString(value: unknown) {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private readNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  private readNullableNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private appendDecisionNote(currentNotes: string | null, appended: string) {
    if (!currentNotes) {
      return appended;
    }

    return `${currentNotes} | ${appended}`;
  }

  private buildSourceLinkKeys(candidate: MatchingCandidateRow) {
    const keys = new Set<string>();

    const directKey = this.normalizeSubjectKey(candidate.source_record_id);

    if (directKey) {
      keys.add(directKey);
    }

    const url = this.readString(candidate.source_url);

    if (!url) {
      return [...keys];
    }

    for (const segment of url.split('/')) {
      const key = this.normalizeSubjectKey(segment);

      if (key) {
        keys.add(key);
      }
    }

    return [...keys];
  }
}
