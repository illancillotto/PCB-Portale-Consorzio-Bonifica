import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { DatabaseService } from '../core/database/database.service';
import { RedisService } from '../core/redis/redis.service';
import { IngestionRunResponseDto } from './dto/ingestion-run-response.dto';
import { IngestionConnectorCatalogResponseDto } from './dto/connector-catalog-response.dto';
import { MatchingResultResponseDto } from './dto/matching-result-response.dto';
import { NormalizeRunResponseDto } from './dto/normalize-run-response.dto';
import { NormalizedRecordResponseDto } from './dto/normalized-record-response.dto';
import { IngestionOrchestrationSummaryResponseDto } from './dto/orchestration-summary-response.dto';
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
  source_record_id: string;
  payload_jsonb: Record<string, unknown>;
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

interface NumericCountRow {
  total: string | number;
}

interface TimestampRow {
  latest_run_at: Date | string | null;
}

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
      items: result.rows.map((row) => this.mapRun(row)),
      total: result.rows.length,
    };
  }

  async listConnectorCatalog(): Promise<{
    items: IngestionConnectorCatalogResponseDto[];
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
      latestRunsResult.rows.map((row) => [row.connector_name, row] as const),
    );

    return {
      items: connectorCatalog.map((connector) => {
        const latestRun = latestRunByConnector.get(connector.connectorName);

        return {
          connectorName: connector.connectorName,
          sourceSystem: connector.sourceSystem,
          displayName: connector.displayName,
          domain: connector.domain,
          triggerMode: connector.triggerMode,
          capabilities: connector.capabilities,
          writesToMasterData: false,
          latestRun: latestRun
            ? {
                id: latestRun.id,
                status: latestRun.status,
                startedAt: new Date(latestRun.started_at).toISOString(),
                endedAt: latestRun.ended_at ? new Date(latestRun.ended_at).toISOString() : null,
              }
            : null,
        };
      }),
      total: connectorCatalog.length,
    };
  }

  async getOrchestrationSummary(): Promise<IngestionOrchestrationSummaryResponseDto> {
    const [queuedRunsResult, failedRunsResult, normalizedRecordsResult, reviewQueueResult, latestRunResult] =
      await Promise.all([
        this.databaseService.query<NumericCountRow>(
          `SELECT COUNT(*)::text AS total FROM ingest.ingestion_run WHERE status = 'queued'`,
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
      queuedRuns: Number(queuedRunsResult.rows[0]?.total ?? 0),
      failedRuns: Number(failedRunsResult.rows[0]?.total ?? 0),
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
      throw new Error(`Unsupported connector ${connectorName}`);
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

    return {
      id: runId,
      connectorName,
      sourceSystem,
      status: 'queued',
      startedAt: startedAt.toISOString(),
      executionMode: 'manual',
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

  async listNormalizedRecordsByRunId(id: string) {
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

    return {
      items: result.rows.map((row) => this.mapNormalizedRecord(row)),
      total: result.rows.length,
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

  async listMatchingResultsByRunId(id: string) {
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

    return {
      items: result.rows.map((row) => this.mapMatchingResult(row)),
      total: result.rows.length,
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
      throw new Error('Cannot confirm match without matched_subject_id');
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
      throw new Error(`Subject not found for id ${subjectId}`);
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

  private mapRun(row: IngestionRunRow): IngestionRunResponseDto {
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
    };
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
      normalized: row.normalized_jsonb,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  private mapMatchingResult(row: MatchingResultRow): MatchingResultResponseDto {
    return {
      id: row.id,
      ingestionRunId: row.ingestion_run_id,
      sourceRecordId: row.source_record_id,
      matchedSubjectId: row.matched_subject_id,
      matchingScore: Number(row.matching_score),
      decisionType: row.decision_type,
      decisionStatus: row.decision_status,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
    };
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
