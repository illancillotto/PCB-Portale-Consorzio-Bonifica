import { resolve } from 'path';

export interface NasCatastoConnectorConfig {
  rootPath: string;
  maxDepth: number;
  hashFiles: boolean;
  includeHidden: boolean;
  sampleBytes: number;
  persistIngest: boolean;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === '1' || value.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadNasCatastoConfig(): NasCatastoConnectorConfig {
  const rootPath = process.env.PCB_NAS_CATASTO_ROOT;

  if (!rootPath) {
    throw new Error('PCB_NAS_CATASTO_ROOT is required for connector-nas-catasto');
  }

  return {
    rootPath: resolve(rootPath),
    maxDepth: parseNumber(process.env.PCB_NAS_CATASTO_MAX_DEPTH, 12),
    hashFiles: parseBoolean(process.env.PCB_NAS_CATASTO_HASH_FILES, true),
    includeHidden: parseBoolean(process.env.PCB_NAS_CATASTO_INCLUDE_HIDDEN, false),
    sampleBytes: parseNumber(process.env.PCB_NAS_CATASTO_SAMPLE_BYTES, 65536),
    persistIngest: parseBoolean(process.env.PCB_NAS_CATASTO_PERSIST_INGEST, false),
  };
}
