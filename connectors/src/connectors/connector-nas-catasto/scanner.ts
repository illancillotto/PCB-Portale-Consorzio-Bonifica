import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { readdir, stat } from 'fs/promises';
import { basename, join, relative, sep } from 'path';
import type { NasCatastoConnectorConfig } from './config';
import type { NasCatastoInventoryItem, NasCatastoRunReport } from './types';

interface ScanState {
  directoriesScanned: number;
  filesScanned: number;
  maxDepthReached: number;
  items: NasCatastoInventoryItem[];
}

export async function runNasCatastoScan(
  config: NasCatastoConnectorConfig,
): Promise<NasCatastoRunReport> {
  const startedAt = new Date().toISOString();
  const state: ScanState = {
    directoriesScanned: 0,
    filesScanned: 0,
    maxDepthReached: 0,
    items: [],
  };

  await scanPath(config.rootPath, 0, config, state, config.rootPath);

  return {
    connectorName: 'connector-nas-catasto',
    sourceSystem: 'nas-catasto',
    startedAt,
    endedAt: new Date().toISOString(),
    status: 'completed',
    rootPath: config.rootPath,
    directoriesScanned: state.directoriesScanned,
    filesScanned: state.filesScanned,
    maxDepthReached: state.maxDepthReached,
    items: state.items,
  };
}

async function scanPath(
  currentPath: string,
  depth: number,
  config: NasCatastoConnectorConfig,
  state: ScanState,
  rootPath: string,
) {
  if (depth > config.maxDepth) {
    return;
  }

  state.maxDepthReached = Math.max(state.maxDepthReached, depth);

  const stats = await stat(currentPath);
  const relativePath = normalizeRelativePath(relative(rootPath, currentPath));
  const bucketLetter = deriveBucketLetter(relativePath);
  const potentialSubjectKey = derivePotentialSubjectKey(relativePath);

  if (stats.isDirectory()) {
    state.directoriesScanned += 1;
    state.items.push({
      path: currentPath,
      relativePath,
      kind: 'directory',
      depth,
      sizeBytes: null,
      modifiedAt: stats.mtime.toISOString(),
      fileHash: null,
      bucketLetter,
      potentialSubjectKey,
    });

    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!config.includeHidden && entry.name.startsWith('.')) {
        continue;
      }

      await scanPath(join(currentPath, entry.name), depth + 1, config, state, rootPath);
    }

    return;
  }

  state.filesScanned += 1;
  state.items.push({
    path: currentPath,
    relativePath,
    kind: 'file',
    depth,
    sizeBytes: stats.size,
    modifiedAt: stats.mtime.toISOString(),
    fileHash: config.hashFiles ? await hashFile(currentPath, config.sampleBytes) : null,
    bucketLetter,
    potentialSubjectKey,
  });
}

async function hashFile(filePath: string, sampleBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    let consumed = 0;
    const stream = createReadStream(filePath, { highWaterMark: 16 * 1024 });

    stream.on('data', (chunk: string | Buffer) => {
      if (consumed >= sampleBytes) {
        stream.destroy();
        return;
      }

      const bufferChunk = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      const remaining = sampleBytes - consumed;
      const slice = bufferChunk.subarray(0, remaining);
      hash.update(slice);
      consumed += slice.length;

      if (consumed >= sampleBytes) {
        stream.destroy();
      }
    });

    stream.on('close', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function normalizeRelativePath(value: string) {
  if (!value) {
    return '.';
  }

  return value.split(sep).join('/');
}

function deriveBucketLetter(relativePath: string) {
  if (relativePath === '.') {
    return null;
  }

  const [firstSegment] = relativePath.split('/');

  return /^[A-Z]$/i.test(firstSegment) ? firstSegment.toUpperCase() : null;
}

function derivePotentialSubjectKey(relativePath: string) {
  if (relativePath === '.') {
    return null;
  }

  const segments = relativePath.split('/');

  if (segments.length < 2) {
    return null;
  }

  return basename(segments[1]).trim() || null;
}
