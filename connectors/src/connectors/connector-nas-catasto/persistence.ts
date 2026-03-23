import { createHash, randomUUID } from 'crypto';
import type { PoolClient } from 'pg';
import { createConnectorPool } from '../../shared/database';
import type { NasCatastoRunReport } from './types';

interface PersistedRunResult {
  ingestionRunId: string;
  recordsPersisted: number;
}

interface PersistNasCatastoRunOptions {
  ingestionRunId?: string;
}

export async function persistNasCatastoRun(
  report: NasCatastoRunReport,
  options: PersistNasCatastoRunOptions = {},
): Promise<PersistedRunResult> {
  const pool = createConnectorPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ingestionRunId =
      options.ingestionRunId ?? process.env.PCB_INGESTION_RUN_ID ?? randomUUID();

    if (options.ingestionRunId ?? process.env.PCB_INGESTION_RUN_ID) {
      const updateResult = await client.query(
        `
          UPDATE ingest.ingestion_run
          SET
            connector_name = $2,
            source_system = $3,
            started_at = $4,
            ended_at = $5,
            status = $6,
            records_total = $7,
            records_success = $8,
            records_error = $9,
            log_excerpt = $10
          WHERE id = $1
        `,
        [
          ingestionRunId,
          report.connectorName,
          report.sourceSystem,
          report.startedAt,
          report.endedAt,
          report.status,
          report.items.length,
          report.items.length,
          0,
          `NAS scan ${report.filesScanned} files / ${report.directoriesScanned} directories`,
        ],
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`Ingestion run ${ingestionRunId} not found for connector persistence`);
      }
    } else {
      await client.query(
        `
          INSERT INTO ingest.ingestion_run (
            id,
            connector_name,
            source_system,
            started_at,
            ended_at,
            status,
            records_total,
            records_success,
            records_error,
            log_excerpt
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          ingestionRunId,
          report.connectorName,
          report.sourceSystem,
          report.startedAt,
          report.endedAt,
          report.status,
          report.items.length,
          report.items.length,
          0,
          `NAS scan ${report.filesScanned} files / ${report.directoriesScanned} directories`,
        ],
      );
    }

    for (const item of report.items) {
      await insertRawRecord(client, ingestionRunId, item);
    }

    await client.query('COMMIT');

    return {
      ingestionRunId,
      recordsPersisted: report.items.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function insertRawRecord(
  client: PoolClient,
  ingestionRunId: string,
  item: NasCatastoRunReport['items'][number],
) {
  const payload = {
    path: item.path,
    relativePath: item.relativePath,
    kind: item.kind,
    depth: item.depth,
    sizeBytes: item.sizeBytes,
    modifiedAt: item.modifiedAt,
    fileHash: item.fileHash,
    bucketLetter: item.bucketLetter,
    potentialSubjectKey: item.potentialSubjectKey,
  };

  const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

  await client.query(
    `
      INSERT INTO ingest.ingestion_record_raw (
        id,
        ingestion_run_id,
        source_record_id,
        payload_jsonb,
        payload_hash,
        captured_at
      )
      VALUES ($1, $2, $3, $4::jsonb, $5, $6)
    `,
    [
      randomUUID(),
      ingestionRunId,
      item.relativePath,
      JSON.stringify(payload),
      payloadHash,
      item.modifiedAt ?? new Date().toISOString(),
    ],
  );
}
