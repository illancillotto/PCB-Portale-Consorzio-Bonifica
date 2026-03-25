const apiBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

interface ApiFetchOptions {
  accessToken?: string;
}

interface ApiErrorPayload {
  statusCode?: number;
  error?: {
    code?: string;
    type?: string;
    message?: string;
    details?: unknown;
    path?: string;
    timestamp?: string;
    requestId?: string;
  };
}

export interface SubjectIdentifier {
  type: string;
  value: string;
  sourceSystem: string;
}

export interface SubjectNameHistoryItem {
  displayName: string;
  sourceSystem: string;
  validFrom: string;
  validTo: string | null;
}

export interface SubjectSourceLink {
  sourceSystem: string;
  sourceRecordId: string;
  sourceUrl: string | null;
  isActive: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface SubjectDocument {
  id: string;
  sourceSystem: string;
  fileName: string;
  filePath: string;
  mimeType: string | null;
  archiveBucket: string | null;
  discoveredAt: string;
}

export interface Subject {
  id: string;
  cuua: string;
  status: string;
  confidenceScore: number;
  currentDisplayName: string;
  identifiers: SubjectIdentifier[];
  nameHistory: SubjectNameHistoryItem[];
  sourceLinks: SubjectSourceLink[];
  documents: SubjectDocument[];
}

export interface SubjectParcel {
  parcelId: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  relationType: string;
  title: string | null;
  quota: number | null;
}

export interface ParcelSubject {
  subjectId: string;
  cuua: string;
  displayName: string;
  relationType: string;
  title: string | null;
  quota: number | null;
}

export interface Parcel {
  id: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  sourceSystem: string;
  subjects: ParcelSubject[];
}

export interface SearchResult {
  type: 'subject' | 'parcel';
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

export interface IngestionRun {
  id: string;
  connectorName: string;
  sourceSystem: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  recordsTotal: number;
  recordsSuccess: number;
  recordsError: number;
  logExcerpt: string;
  rawSummary: {
    totalRecords: number;
    directoryRecords: number;
    fileRecords: number;
    subjectHintRecords: number;
    bucketRecords: number;
    outcomeCounters: {
      directorySubjectBucket: number;
      directoryBucketOnly: number;
      directoryStructureOnly: number;
      fileSubjectHint: number;
      fileWithoutSubjectHint: number;
      recordCaptured: number;
    };
  };
  normalizedSummary: {
    totalRecords: number;
    outcomeCounters: Record<string, number>;
  };
  matchingSummary: {
    totalResults: number;
    outcomeCounters: Record<string, number>;
  };
  failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
  failureCode: string | null;
  stages: {
    acquisition: {
      status: 'queued' | 'running' | 'completed' | 'failed';
    };
    postProcessing: {
      status: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
      autoNormalize: boolean;
      autoMatch: boolean;
    };
    normalization: {
      status: 'not_started' | 'running' | 'completed' | 'failed';
      recordsWritten: number;
    };
    matching: {
      status: 'not_started' | 'running' | 'completed' | 'failed';
      resultsWritten: number;
    };
  };
}

export interface RawRecord {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  outcomeCode: string;
  payload: {
    path?: string;
    relativePath?: string;
    kind?: 'directory' | 'file';
    depth?: number;
    sizeBytes?: number | null;
    modifiedAt?: string | null;
    fileHash?: string | null;
    bucketLetter?: string | null;
    potentialSubjectKey?: string | null;
  };
  capturedAt: string;
}

export interface IngestionPipelineSummary {
  ingestionRunId: string;
  raw: {
    total: number;
    outcomeCounters: Record<string, number>;
  };
  normalized: {
    total: number;
    statusCounters: Record<string, number>;
    outcomeCounters: Record<string, number>;
  };
  matching: {
    total: number;
    statusCounters: Record<string, number>;
    outcomeCounters: Record<string, number>;
  };
}

export interface IngestionConnectorCatalogItem {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
  operationalStatus: 'healthy' | 'warning' | 'critical';
  executionReadiness: {
    configured: boolean;
    runnable: boolean;
    persistenceEnabled: boolean;
    rootPath: string | null;
    detail: string;
  };
  latestRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
    failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
    failureCode: string | null;
  } | null;
  issueCounters: {
    total: number;
    critical: number;
    warning: number;
  };
}

export interface IngestionConnectorDetail {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
  operationalStatus: 'healthy' | 'warning' | 'critical';
  executionReadiness: {
    configured: boolean;
    runnable: boolean;
    persistenceEnabled: boolean;
    rootPath: string | null;
    detail: string;
  };
  latestRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
    failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
    failureCode: string | null;
  } | null;
  lastCompletedRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    recordsTotal: number;
    recordsSuccess: number;
    recordsError: number;
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
  } | null;
  lastFailedRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    recordsTotal: number;
    recordsSuccess: number;
    recordsError: number;
    logExcerpt: string;
    rawSummary: {
      totalRecords: number;
      directoryRecords: number;
      fileRecords: number;
      subjectHintRecords: number;
      bucketRecords: number;
      outcomeCounters: {
        directorySubjectBucket: number;
        directoryBucketOnly: number;
        directoryStructureOnly: number;
        fileSubjectHint: number;
        fileWithoutSubjectHint: number;
        recordCaptured: number;
      };
    };
    failureStage: 'acquisition' | 'post_processing' | 'normalization' | 'matching' | null;
    failureCode: string | null;
  } | null;
  runCounters: {
    total: number;
    queued: number;
    completed: number;
    failed: number;
  };
  executionStats: {
    recordsObservedTotal: number;
    recordsSucceededTotal: number;
    recordsErroredTotal: number;
  };
  issueCounters: {
    total: number;
    critical: number;
    warning: number;
  };
  issueTypeCounters: {
    notConfigured: number;
    notRunnable: number;
    dryRunOnly: number;
    latestRunFailed: number;
    noCompletedRuns: number;
  };
  issues: IngestionConnectorIssue[];
}

export interface IngestionConnectorIssue {
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

export interface IngestionOrchestrationSummary {
  registeredConnectors: number;
  manualConnectors: number;
  configuredConnectors: number;
  runnableConnectors: number;
  persistentConnectors: number;
  healthyConnectors: number;
  criticalConnectorIssues: number;
  warningConnectorIssues: number;
  blockedConnectors: number;
  dryRunConnectors: number;
  queuedRuns: number;
  runningRuns: number;
  failedRuns: number;
  postProcessingQueuedRuns: number;
  postProcessingRunningRuns: number;
  normalizationCompletedRuns: number;
  matchingCompletedRuns: number;
  normalizedRecords: number;
  reviewQueue: number;
  rawOutcomeCounters: Record<string, number>;
  normalizedOutcomeCounters: Record<string, number>;
  matchingOutcomeCounters: Record<string, number>;
  latestRunAt: string | null;
}

export interface NormalizedRecord {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  normalizationStatus: string;
  outcomeCode: string;
  normalized: {
    connectorName?: string;
    sourceSystem?: string;
    recordType?: string;
    filesystem?: {
      relativePath?: string;
      bucketLetter?: string | null;
      fileName?: string | null;
      fileExtension?: string | null;
      sizeBytes?: number | null;
    };
    subjectHints?: {
      potentialSubjectKey?: string | null;
      normalizedSubjectKey?: string | null;
    };
    documentHints?: {
      documentFamily?: string | null;
    };
  };
  createdAt: string;
}

export interface MatchingResult {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  matchedSubjectId: string | null;
  matchingScore: number;
  decisionType: string;
  decisionStatus: string;
  outcomeCode: string;
  requiresManualReview: boolean;
  resolutionMode: 'automatic' | 'manual';
  notes: string | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  eventType: string;
  actorType: string;
  actorId: string | null;
  sourceModule: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AuditSummary {
  total: number;
  systemEvents: number;
  systemOperatorEvents: number;
  latestCreatedAt: string | null;
  bySourceModule: Array<{
    sourceModule: string;
    total: number;
  }>;
  byActorType: Array<{
    actorType: string;
    total: number;
  }>;
}

export interface AuditEntitySummary {
  entityType: string;
  entityId: string;
  total: number;
  systemEvents: number;
  systemOperatorEvents: number;
  latestCreatedAt: string | null;
}

export interface GisLayer {
  id: string;
  name: string;
  code: string;
  ownerModule: string;
  publicationStatus: string;
  sourceSystem: string;
  geometryType: string;
  metadata: Record<string, unknown>;
  linkedSubjects: number;
  linkedParcels: number;
}

export interface GisFeatureLink {
  id: string;
  layerCode: string;
  featureExternalId: string;
  subjectId: string | null;
  parcelId: string | null;
  validFrom: string | null;
  validTo: string | null;
}

export interface GisMapFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties: {
    layerCode: string;
    layerName: string;
    featureExternalId: string;
    subjectId: string | null;
    parcelId: string | null;
    validFrom: string | null;
    validTo: string | null;
  };
}

export interface GisPublicationStatus {
  publicationTarget: 'qgis-server';
  serviceUrl: string;
  capabilitiesUrl: string | null;
  projectFile: string | null;
  configured: boolean;
  available: boolean;
  statusCode: number | null;
  statusLabel: 'ok' | 'unavailable' | 'not_configured';
  statusDetail: string | null;
  checkedAt: string;
}

export interface GisSubjectParcelLink {
  id: string;
  subjectId: string;
  cuua: string;
  subjectDisplayName: string | null;
  parcelId: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  relationType: string;
  title: string | null;
  quota: number | null;
  validFrom: string | null;
  validTo: string | null;
}

export interface IntegrationStatusItem {
  key: 'postgres' | 'redis' | 'keycloak' | 'qgis';
  label: string;
  configured: boolean;
  available: boolean;
  statusLabel: 'ok' | 'unavailable' | 'not_configured';
  statusCode: number | null;
  failureCode: string | null;
  target: string | null;
  detail: string | null;
}

export interface IntegrationStatus {
  checkedAt: string;
  items: IntegrationStatusItem[];
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export class ApiError extends Error {
  readonly statusCode: number | null;
  readonly code: string | null;
  readonly kind: 'authentication' | 'authorization' | 'domain' | 'runtime';
  readonly requestId: string | null;
  readonly details: unknown;

  constructor(options: {
    message: string;
    statusCode: number | null;
    code: string | null;
    requestId: string | null;
    details?: unknown;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details ?? null;
    this.kind =
      options.statusCode === 401
        ? 'authentication'
        : options.statusCode === 403
          ? 'authorization'
          : options.statusCode !== null && options.statusCode >= 500
            ? 'runtime'
            : 'domain';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: 'no-store',
    headers: options?.accessToken
      ? {
          Authorization: `Bearer ${options.accessToken}`,
        }
      : undefined,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

    throw new ApiError({
      message:
        payload?.error?.message ??
        `PCB API request failed: ${response.status} ${response.statusText}`,
      statusCode: payload?.statusCode ?? response.status,
      code: payload?.error?.code ?? null,
      requestId: payload?.error?.requestId ?? response.headers.get('x-request-id'),
      details: payload?.error?.details ?? null,
    });
  }

  return response.json() as Promise<T>;
}

export async function getSubjects(accessToken: string, query?: string) {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : '';

  return apiFetch<PaginatedResponse<Subject>>(`/subjects${suffix}`, {
    accessToken,
  });
}

export async function getSubject(id: string, accessToken: string) {
  return apiFetch<Subject>(`/subjects/${id}`, {
    accessToken,
  });
}

export async function getSubjectParcels(id: string, accessToken: string) {
  return apiFetch<{ subjectId: string; parcels: SubjectParcel[] }>(`/subjects/${id}/parcels`, {
    accessToken,
  });
}

export async function getParcels(accessToken: string) {
  return apiFetch<PaginatedResponse<Parcel>>('/parcels', {
    accessToken,
  });
}

export async function getParcel(id: string, accessToken: string) {
  return apiFetch<Parcel>(`/parcels/${id}`, {
    accessToken,
  });
}

export async function searchAll(query: string, accessToken: string) {
  return apiFetch<PaginatedResponse<SearchResult>>(`/search?q=${encodeURIComponent(query)}`, {
    accessToken,
  });
}

export async function getIngestionRuns(accessToken: string) {
  return apiFetch<PaginatedResponse<IngestionRun>>('/ingestion/runs', {
    accessToken,
  });
}

export async function getIngestionConnectors(
  accessToken: string,
  filters?: {
    operationalStatus?: 'healthy' | 'warning' | 'critical';
    triggerMode?: 'manual' | 'scheduled';
  },
) {
  const params = new URLSearchParams();

  if (filters?.operationalStatus) {
    params.set('operationalStatus', filters.operationalStatus);
  }

  if (filters?.triggerMode) {
    params.set('triggerMode', filters.triggerMode);
  }

  const queryString = params.toString();

  return apiFetch<PaginatedResponse<IngestionConnectorCatalogItem>>(
    `/ingestion/connectors${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
    },
  );
}

export async function getIngestionConnectorIssues(
  accessToken: string,
  filters?: {
    connectorName?: string;
    severity?: 'warning' | 'critical';
    issueType?: string;
  },
) {
  const params = new URLSearchParams();

  if (filters?.connectorName) {
    params.set('connectorName', filters.connectorName);
  }

  if (filters?.severity) {
    params.set('severity', filters.severity);
  }

  if (filters?.issueType) {
    params.set('issueType', filters.issueType);
  }

  const queryString = params.toString();

  return apiFetch<PaginatedResponse<IngestionConnectorIssue>>(
    `/ingestion/connectors/issues${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
    },
  );
}

export async function getIngestionConnectorDetail(connectorName: string, accessToken: string) {
  return apiFetch<IngestionConnectorDetail>(
    `/ingestion/connectors/${encodeURIComponent(connectorName)}`,
    {
      accessToken,
    },
  );
}

export async function getIngestionConnectorRuns(
  connectorName: string,
  accessToken: string,
  filters?: {
    status?: string;
  },
) {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set('status', filters.status);
  }

  const queryString = params.toString();

  return apiFetch<{ items: IngestionRun[]; total: number }>(
    `/ingestion/connectors/${encodeURIComponent(connectorName)}/runs${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
    },
  );
}

export async function getIngestionOrchestrationSummary(accessToken: string) {
  return apiFetch<IngestionOrchestrationSummary>('/ingestion/orchestration-summary', {
    accessToken,
  });
}

export async function getIngestionRun(id: string, accessToken: string) {
  return apiFetch<IngestionRun>(`/ingestion/runs/${id}`, {
    accessToken,
  });
}

export async function getIngestionPipelineSummary(id: string, accessToken: string) {
  return apiFetch<IngestionPipelineSummary>(`/ingestion/runs/${id}/pipeline-summary`, {
    accessToken,
  });
}

export async function getRawRecords(
  id: string,
  accessToken: string,
  filters?: {
    outcomeCode?: string;
  },
) {
  const params = new URLSearchParams();

  if (filters?.outcomeCode) {
    params.set('outcomeCode', filters.outcomeCode);
  }

  const queryString = params.toString();

  return apiFetch<PaginatedResponse<RawRecord>>(
    `/ingestion/runs/${id}/raw-records${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
    },
  );
}

export async function getNormalizedRecords(id: string, accessToken: string) {
  return apiFetch<PaginatedResponse<NormalizedRecord>>(
    `/ingestion/runs/${id}/normalized-records`,
    {
      accessToken,
    },
  );
}

export async function getFilteredNormalizedRecords(
  id: string,
  accessToken: string,
  filters?: { normalizationStatus?: string; outcomeCode?: string },
) {
  const params = new URLSearchParams();

  if (filters?.normalizationStatus) {
    params.set('normalizationStatus', filters.normalizationStatus);
  }

  if (filters?.outcomeCode) {
    params.set('outcomeCode', filters.outcomeCode);
  }

  const queryString = params.toString();

  return apiFetch<PaginatedResponse<NormalizedRecord>>(
    `/ingestion/runs/${id}/normalized-records${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
    },
  );
}

export async function getMatchingResults(id: string, accessToken: string) {
  return apiFetch<PaginatedResponse<MatchingResult>>(
    `/ingestion/runs/${id}/matching-results`,
    {
      accessToken,
    },
  );
}

export async function getFilteredMatchingResults(
  id: string,
  accessToken: string,
  filters?: { decisionStatus?: string; outcomeCode?: string },
) {
  const params = new URLSearchParams();

  if (filters?.decisionStatus) {
    params.set('decisionStatus', filters.decisionStatus);
  }

  if (filters?.outcomeCode) {
    params.set('outcomeCode', filters.outcomeCode);
  }

  const queryString = params.toString();

  return apiFetch<PaginatedResponse<MatchingResult>>(
    `/ingestion/runs/${id}/matching-results${queryString ? `?${queryString}` : ''}`,
    {
      accessToken,
    },
  );
}

export async function getGisLayers(accessToken: string) {
  return apiFetch<PaginatedResponse<GisLayer>>('/gis/layers', {
    accessToken,
  });
}

export async function getGisFeatureLinks(
  accessToken: string,
  filters?: { subjectId?: string; parcelId?: string },
) {
  const params = new URLSearchParams();

  if (filters?.subjectId) {
    params.set('subjectId', filters.subjectId);
  }

  if (filters?.parcelId) {
    params.set('parcelId', filters.parcelId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiFetch<PaginatedResponse<GisFeatureLink>>(`/gis/feature-links${suffix}`, {
    accessToken,
  });
}

export async function getGisMapFeatures(
  accessToken: string,
  filters?: { subjectId?: string; parcelId?: string },
) {
  const params = new URLSearchParams();

  if (filters?.subjectId) {
    params.set('subjectId', filters.subjectId);
  }

  if (filters?.parcelId) {
    params.set('parcelId', filters.parcelId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiFetch<PaginatedResponse<GisMapFeature>>(`/gis/map-features${suffix}`, {
    accessToken,
  });
}

export async function getGisPublicationStatus(accessToken: string) {
  return apiFetch<GisPublicationStatus>('/gis/publication-status', {
    accessToken,
  });
}

export async function getGisSubjectParcelLinks(accessToken: string) {
  return apiFetch<PaginatedResponse<GisSubjectParcelLink>>('/gis/subject-parcel-links', {
    accessToken,
  });
}

export async function getFilteredGisSubjectParcelLinks(
  accessToken: string,
  filters?: { subjectId?: string; parcelId?: string },
) {
  const params = new URLSearchParams();

  if (filters?.subjectId) {
    params.set('subjectId', filters.subjectId);
  }

  if (filters?.parcelId) {
    params.set('parcelId', filters.parcelId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiFetch<PaginatedResponse<GisSubjectParcelLink>>(`/gis/subject-parcel-links${suffix}`, {
    accessToken,
  });
}

export async function getSystemIntegrations(accessToken: string) {
  return apiFetch<IntegrationStatus>('/system/integrations', {
    accessToken,
  });
}

export async function getAuditEvents(
  accessToken: string,
  filters?: {
    eventType?: string;
    actorType?: string;
    sourceModule?: string;
    entityType?: string;
    entityId?: string;
  },
) {
  const params = new URLSearchParams();

  if (filters?.eventType) {
    params.set('eventType', filters.eventType);
  }

  if (filters?.actorType) {
    params.set('actorType', filters.actorType);
  }

  if (filters?.sourceModule) {
    params.set('sourceModule', filters.sourceModule);
  }

  if (filters?.entityType) {
    params.set('entityType', filters.entityType);
  }

  if (filters?.entityId) {
    params.set('entityId', filters.entityId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiFetch<PaginatedResponse<AuditEvent>>(`/audit/events${suffix}`, {
    accessToken,
  });
}

export async function getAuditSummary(
  accessToken: string,
  filters?: {
    eventType?: string;
    actorType?: string;
    sourceModule?: string;
    entityType?: string;
    entityId?: string;
  },
) {
  const params = new URLSearchParams();

  if (filters?.eventType) {
    params.set('eventType', filters.eventType);
  }

  if (filters?.actorType) {
    params.set('actorType', filters.actorType);
  }

  if (filters?.sourceModule) {
    params.set('sourceModule', filters.sourceModule);
  }

  if (filters?.entityType) {
    params.set('entityType', filters.entityType);
  }

  if (filters?.entityId) {
    params.set('entityId', filters.entityId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiFetch<AuditSummary>(`/audit/summary${suffix}`, {
    accessToken,
  });
}

export async function getAuditEntitySummaries(
  accessToken: string,
  input: {
    entityType: string;
    entityIds: string[];
  },
) {
  const params = new URLSearchParams();
  params.set('entityType', input.entityType);

  for (const entityId of input.entityIds) {
    params.append('entityId', entityId);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';

  return apiFetch<PaginatedResponse<AuditEntitySummary>>(`/audit/entity-summaries${suffix}`, {
    accessToken,
  });
}
