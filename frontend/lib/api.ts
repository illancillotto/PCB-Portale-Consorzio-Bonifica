const apiBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

interface ApiFetchOptions {
  accessToken?: string;
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
}

export interface IngestionConnectorCatalogItem {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
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
  } | null;
}

export interface IngestionConnectorDetail {
  connectorName: string;
  sourceSystem: string;
  displayName: string;
  domain: string;
  triggerMode: 'manual' | 'scheduled';
  capabilities: Array<'acquisition' | 'raw_ingest' | 'normalization' | 'matching'>;
  writesToMasterData: false;
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
  } | null;
  lastCompletedRun: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    recordsTotal: number;
    recordsSuccess: number;
    recordsError: number;
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
}

export interface IngestionOrchestrationSummary {
  registeredConnectors: number;
  manualConnectors: number;
  configuredConnectors: number;
  runnableConnectors: number;
  persistentConnectors: number;
  queuedRuns: number;
  failedRuns: number;
  normalizedRecords: number;
  reviewQueue: number;
  latestRunAt: string | null;
}

export interface NormalizedRecord {
  id: string;
  ingestionRunId: string;
  sourceRecordId: string;
  normalizationStatus: string;
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
  notes: string | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  eventType: string;
  actorType: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
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

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
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
    throw new ApiError(`PCB API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getSubjects(query?: string) {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : '';

  return apiFetch<PaginatedResponse<Subject>>(`/subjects${suffix}`);
}

export async function getSubject(id: string) {
  return apiFetch<Subject>(`/subjects/${id}`);
}

export async function getSubjectParcels(id: string) {
  return apiFetch<{ subjectId: string; parcels: SubjectParcel[] }>(`/subjects/${id}/parcels`);
}

export async function getParcels() {
  return apiFetch<PaginatedResponse<Parcel>>('/parcels');
}

export async function getParcel(id: string) {
  return apiFetch<Parcel>(`/parcels/${id}`);
}

export async function searchAll(query: string) {
  return apiFetch<PaginatedResponse<SearchResult>>(`/search?q=${encodeURIComponent(query)}`);
}

export async function getIngestionRuns(accessToken: string) {
  return apiFetch<PaginatedResponse<IngestionRun>>('/ingestion/runs', {
    accessToken,
  });
}

export async function getIngestionConnectors(accessToken: string) {
  return apiFetch<PaginatedResponse<IngestionConnectorCatalogItem>>('/ingestion/connectors', {
    accessToken,
  });
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

export async function getNormalizedRecords(id: string, accessToken: string) {
  return apiFetch<PaginatedResponse<NormalizedRecord>>(
    `/ingestion/runs/${id}/normalized-records`,
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

export async function getAuditEvents(accessToken: string) {
  return apiFetch<PaginatedResponse<AuditEvent>>('/audit/events', {
    accessToken,
  });
}
