const apiBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

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

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: 'no-store',
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

export async function getIngestionRuns() {
  return apiFetch<PaginatedResponse<IngestionRun>>('/ingestion/runs');
}

export async function getIngestionRun(id: string) {
  return apiFetch<IngestionRun>(`/ingestion/runs/${id}`);
}

export async function getNormalizedRecords(id: string) {
  return apiFetch<PaginatedResponse<NormalizedRecord>>(
    `/ingestion/runs/${id}/normalized-records`,
  );
}

export async function getMatchingResults(id: string) {
  return apiFetch<PaginatedResponse<MatchingResult>>(
    `/ingestion/runs/${id}/matching-results`,
  );
}

export async function getGisLayers() {
  return apiFetch<PaginatedResponse<GisLayer>>('/gis/layers');
}

export async function getGisFeatureLinks() {
  return apiFetch<PaginatedResponse<GisFeatureLink>>('/gis/feature-links');
}
