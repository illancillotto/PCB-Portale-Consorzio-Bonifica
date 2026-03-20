import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../core/database/database.service';
import { IngestionRunResponseDto } from './dto/ingestion-run-response.dto';
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

@Injectable()
export class IngestService {
  constructor(private readonly databaseService: DatabaseService) {}

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

    return {
      id: runId,
      connectorName,
      sourceSystem,
      status: 'queued',
      startedAt: startedAt.toISOString(),
      executionMode: 'manual',
    };
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
}
