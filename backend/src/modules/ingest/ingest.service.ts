import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IngestionRunResponseDto } from './dto/ingestion-run-response.dto';
import { StartIngestionRunResponseDto } from './dto/start-ingestion-run-response.dto';

const INGESTION_RUNS: IngestionRunResponseDto[] = [
  {
    id: '51111111-1111-1111-1111-111111111111',
    connectorName: 'connector-nas-catasto',
    sourceSystem: 'nas-catasto',
    status: 'completed',
    startedAt: '2026-03-20T08:10:00.000Z',
    endedAt: '2026-03-20T08:12:00.000Z',
    recordsTotal: 12,
    recordsSuccess: 12,
    recordsError: 0,
    logExcerpt: 'Bootstrap inventory run',
  },
];

@Injectable()
export class IngestService {
  getPipelineStages() {
    return ['acquisition', 'raw_ingest', 'normalization', 'matching', 'master_update', 'audit'];
  }

  listRuns() {
    return {
      items: INGESTION_RUNS,
      total: INGESTION_RUNS.length,
    };
  }

  getRunById(id: string) {
    return INGESTION_RUNS.find((run) => run.id === id) ?? null;
  }

  startManualRun(connectorName: string): StartIngestionRunResponseDto {
    const run: IngestionRunResponseDto = {
      id: randomUUID(),
      connectorName,
      sourceSystem: this.resolveSourceSystem(connectorName),
      status: 'queued',
      startedAt: new Date().toISOString(),
      endedAt: null,
      recordsTotal: 0,
      recordsSuccess: 0,
      recordsError: 0,
      logExcerpt: 'Manual bootstrap run requested',
    };

    INGESTION_RUNS.unshift(run);

    return {
      id: run.id,
      connectorName: run.connectorName,
      sourceSystem: run.sourceSystem,
      status: run.status,
      startedAt: run.startedAt,
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
}
