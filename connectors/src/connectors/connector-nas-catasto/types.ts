export interface NasCatastoInventoryItem {
  path: string;
  relativePath: string;
  kind: 'directory' | 'file';
  depth: number;
  sizeBytes: number | null;
  modifiedAt: string | null;
  fileHash: string | null;
  bucketLetter: string | null;
  potentialSubjectKey: string | null;
}

export interface NasCatastoRunReport {
  connectorName: string;
  sourceSystem: string;
  startedAt: string;
  endedAt: string;
  status: 'completed';
  rootPath: string;
  directoriesScanned: number;
  filesScanned: number;
  maxDepthReached: number;
  items: NasCatastoInventoryItem[];
  persistence?: {
    mode: 'dry-run' | 'persisted';
    ingestionRunId: string | null;
    recordsPersisted: number;
  };
}
