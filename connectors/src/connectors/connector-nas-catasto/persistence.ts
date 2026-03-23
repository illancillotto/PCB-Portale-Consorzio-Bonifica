import { createHash, randomUUID } from 'crypto';
import type { PoolClient } from 'pg';
import { createConnectorPool } from '../../shared/database';
import type { NasCatastoRunReport } from './types';

interface PersistedRunResult {
  ingestionRunId: string;
  recordsPersisted: number;
}

export async function persistNasCatastoRun(
  report: NasCatastoRunReport,
): Promise<PersistedRunResult> {
  const pool = createConnectorPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ingestionRunId = randomUUID();

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
