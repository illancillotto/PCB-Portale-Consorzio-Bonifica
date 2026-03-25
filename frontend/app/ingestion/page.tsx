import Link from 'next/link';
import { EmptyState } from '../../components/empty-state';
import { IngestionAutoRefresh } from '../../components/ingestion-auto-refresh';
import { IngestionRunTrigger } from '../../components/ingestion-run-trigger';
import { PageShell } from '../../components/page-shell';
import { ServerApiErrorState } from '../../components/server-api-error-state';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import {
  getIngestionConnectors,
  getIngestionConnectorIssues,
  getIngestionOrchestrationSummary,
  getIngestionRuns,
  isApiError,
} from '../../lib/api';

interface IngestionPageProps {
  searchParams?: Promise<{
    status?: string;
    connector?: string;
    rawOutcomeCode?: string;
    normalizedOutcomeCode?: string;
    matchingOutcomeCode?: string;
    acquisitionStage?: 'queued' | 'running' | 'completed' | 'failed';
    postProcessingStage?: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
    normalizationStage?: 'not_started' | 'running' | 'completed' | 'failed';
    matchingStage?: 'not_started' | 'running' | 'completed' | 'failed';
    connectorOperationalStatus?: 'healthy' | 'warning' | 'critical';
    connectorTriggerMode?: 'manual' | 'scheduled';
    issueConnector?: string;
    issueSeverity?: 'warning' | 'critical';
    issueType?: string;
  }>;
}

interface ActiveRunFilter {
  key: string;
  label: string;
  clearHref: string;
}

function resolveRawOutcomeCounterKey(outcomeCode?: string) {
  if (outcomeCode === 'raw.directory_subject_bucket') {
    return 'directorySubjectBucket';
  }

  if (outcomeCode === 'raw.directory_bucket_only') {
    return 'directoryBucketOnly';
  }

  if (outcomeCode === 'raw.directory_structure_only') {
    return 'directoryStructureOnly';
  }

  if (outcomeCode === 'raw.file_subject_hint') {
    return 'fileSubjectHint';
  }

  if (outcomeCode === 'raw.file_without_subject_hint') {
    return 'fileWithoutSubjectHint';
  }

  if (outcomeCode === 'raw.record_captured') {
    return 'recordCaptured';
  }

  return null;
}

function buildRunsFilterHref(filters: {
  status?: string;
  connector?: string;
  rawOutcomeCode?: string;
  normalizedOutcomeCode?: string;
  matchingOutcomeCode?: string;
  acquisitionStage?: 'queued' | 'running' | 'completed' | 'failed';
  postProcessingStage?: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
  normalizationStage?: 'not_started' | 'running' | 'completed' | 'failed';
  matchingStage?: 'not_started' | 'running' | 'completed' | 'failed';
}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.connector) {
    params.set('connector', filters.connector);
  }

  if (filters.rawOutcomeCode) {
    params.set('rawOutcomeCode', filters.rawOutcomeCode);
  }

  if (filters.normalizedOutcomeCode) {
    params.set('normalizedOutcomeCode', filters.normalizedOutcomeCode);
  }

  if (filters.matchingOutcomeCode) {
    params.set('matchingOutcomeCode', filters.matchingOutcomeCode);
  }

  if (filters.acquisitionStage) {
    params.set('acquisitionStage', filters.acquisitionStage);
  }

  if (filters.postProcessingStage) {
    params.set('postProcessingStage', filters.postProcessingStage);
  }

  if (filters.normalizationStage) {
    params.set('normalizationStage', filters.normalizationStage);
  }

  if (filters.matchingStage) {
    params.set('matchingStage', filters.matchingStage);
  }

  const queryString = params.toString();

  return queryString ? `/ingestion?${queryString}` : '/ingestion';
}

function buildRunFilterLabel(label: string, value: string) {
  return `${label}: ${value}`;
}

function buildIssueFilterHref(filters: {
  status?: string;
  connector?: string;
  connectorOperationalStatus?: 'healthy' | 'warning' | 'critical';
  connectorTriggerMode?: 'manual' | 'scheduled';
  issueConnector?: string;
  issueSeverity?: 'warning' | 'critical';
  issueType?: string;
}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.connector) {
    params.set('connector', filters.connector);
  }

  if (filters.connectorOperationalStatus) {
    params.set('connectorOperationalStatus', filters.connectorOperationalStatus);
  }

  if (filters.connectorTriggerMode) {
    params.set('connectorTriggerMode', filters.connectorTriggerMode);
  }

  if (filters.issueConnector) {
    params.set('issueConnector', filters.issueConnector);
  }

  if (filters.issueSeverity) {
    params.set('issueSeverity', filters.issueSeverity);
  }

  if (filters.issueType) {
    params.set('issueType', filters.issueType);
  }

  const queryString = params.toString();

  return queryString ? `/ingestion?${queryString}` : '/ingestion';
}

export default async function IngestionPage({ searchParams }: IngestionPageProps) {
  const session = await requireOperatorSession('/ingestion');
  const filters = (await searchParams) ?? {};
  let runs;
  let connectors;
  let connectorIssues;
  let orchestrationSummary;

  try {
    [runs, connectors, connectorIssues, orchestrationSummary] = await Promise.all([
      getIngestionRuns(session.accessToken),
      getIngestionConnectors(session.accessToken, {
        operationalStatus: filters.connectorOperationalStatus,
        triggerMode: filters.connectorTriggerMode,
      }),
      getIngestionConnectorIssues(session.accessToken, {
        connectorName: filters.issueConnector,
        severity: filters.issueSeverity,
        issueType: filters.issueType,
      }),
      getIngestionOrchestrationSummary(session.accessToken),
    ]);
  } catch (error) {
    if (isApiError(error)) {
      return (
        <PageShell
          title="Ingestion monitor"
          description="Monitor iniziale delle run di acquisizione. La pagina usa il backend reale e permette il trigger manuale del connector NAS placeholder."
        >
          <ServerApiErrorState
            error={error}
            primaryAction={{ href: '/ingestion', label: 'Ricarica monitor' }}
            secondaryAction={{ href: '/operations', label: 'Apri operations' }}
          />
        </PageShell>
      );
    }

    throw error;
  }
  const availableConnectors = Array.from(new Set(runs.items.map((run) => run.connectorName))).sort();
  const runFilterState = {
    status: filters.status,
    connector: filters.connector,
    rawOutcomeCode: filters.rawOutcomeCode,
    normalizedOutcomeCode: filters.normalizedOutcomeCode,
    matchingOutcomeCode: filters.matchingOutcomeCode,
    acquisitionStage: filters.acquisitionStage,
    postProcessingStage: filters.postProcessingStage,
    normalizationStage: filters.normalizationStage,
    matchingStage: filters.matchingStage,
  } satisfies Parameters<typeof buildRunsFilterHref>[0];
  const filteredRuns = runs.items.filter((run) => {
    if (filters.status && run.status !== filters.status) {
      return false;
    }

    if (filters.connector && run.connectorName !== filters.connector) {
      return false;
    }

    const rawOutcomeCounterKey = resolveRawOutcomeCounterKey(filters.rawOutcomeCode);

    if (
      rawOutcomeCounterKey &&
      run.rawSummary.outcomeCounters[rawOutcomeCounterKey] === 0
    ) {
      return false;
    }

    if (
      filters.normalizedOutcomeCode &&
      (run.normalizedSummary.outcomeCounters[filters.normalizedOutcomeCode] ?? 0) === 0
    ) {
      return false;
    }

    if (
      filters.matchingOutcomeCode &&
      (run.matchingSummary.outcomeCounters[filters.matchingOutcomeCode] ?? 0) === 0
    ) {
      return false;
    }

    if (filters.acquisitionStage && run.stages.acquisition.status !== filters.acquisitionStage) {
      return false;
    }

    if (
      filters.postProcessingStage &&
      run.stages.postProcessing.status !== filters.postProcessingStage
    ) {
      return false;
    }

    if (
      filters.normalizationStage &&
      run.stages.normalization.status !== filters.normalizationStage
    ) {
      return false;
    }

    if (filters.matchingStage && run.stages.matching.status !== filters.matchingStage) {
      return false;
    }

    return true;
  });
  const queuedRuns = runs.items.filter((run) => run.status === 'queued').length;
  const runningRuns = runs.items.filter((run) => run.status === 'running').length;
  const completedRuns = runs.items.filter((run) => run.status === 'completed').length;
  const failedRuns = runs.items.filter((run) => run.status === 'failed').length;
  const postProcessingRunning = runs.items.filter(
    (run) => run.stages.postProcessing.status === 'running',
  ).length;
  const totalRecords = runs.items.reduce((total, run) => total + run.recordsTotal, 0);
  const totalRawRecords = runs.items.reduce((total, run) => total + run.rawSummary.totalRecords, 0);
  const totalRawSubjectHints = runs.items.reduce(
    (total, run) => total + run.rawSummary.subjectHintRecords,
    0,
  );
  const manualConnectors = connectors.items.filter((connector) => connector.triggerMode === 'manual');
  const activeRunFilters: ActiveRunFilter[] = [
    filters.status
      ? {
          key: 'status',
          label: buildRunFilterLabel('stato run', filters.status),
          clearHref: buildRunsFilterHref({ ...runFilterState, status: undefined }),
        }
      : null,
    filters.connector
      ? {
          key: 'connector',
          label: buildRunFilterLabel('connector', filters.connector),
          clearHref: buildRunsFilterHref({ ...runFilterState, connector: undefined }),
        }
      : null,
    filters.rawOutcomeCode
      ? {
          key: 'rawOutcomeCode',
          label: buildRunFilterLabel('raw outcome', filters.rawOutcomeCode),
          clearHref: buildRunsFilterHref({ ...runFilterState, rawOutcomeCode: undefined }),
        }
      : null,
    filters.normalizedOutcomeCode
      ? {
          key: 'normalizedOutcomeCode',
          label: buildRunFilterLabel('normalized outcome', filters.normalizedOutcomeCode),
          clearHref: buildRunsFilterHref({ ...runFilterState, normalizedOutcomeCode: undefined }),
        }
      : null,
    filters.matchingOutcomeCode
      ? {
          key: 'matchingOutcomeCode',
          label: buildRunFilterLabel('matching outcome', filters.matchingOutcomeCode),
          clearHref: buildRunsFilterHref({ ...runFilterState, matchingOutcomeCode: undefined }),
        }
      : null,
    filters.acquisitionStage
      ? {
          key: 'acquisitionStage',
          label: buildRunFilterLabel('acquisition', filters.acquisitionStage),
          clearHref: buildRunsFilterHref({ ...runFilterState, acquisitionStage: undefined }),
        }
      : null,
    filters.postProcessingStage
      ? {
          key: 'postProcessingStage',
          label: buildRunFilterLabel('post-processing', filters.postProcessingStage),
          clearHref: buildRunsFilterHref({ ...runFilterState, postProcessingStage: undefined }),
        }
      : null,
    filters.normalizationStage
      ? {
          key: 'normalizationStage',
          label: buildRunFilterLabel('normalization', filters.normalizationStage),
          clearHref: buildRunsFilterHref({ ...runFilterState, normalizationStage: undefined }),
        }
      : null,
    filters.matchingStage
      ? {
          key: 'matchingStage',
          label: buildRunFilterLabel('matching', filters.matchingStage),
          clearHref: buildRunsFilterHref({ ...runFilterState, matchingStage: undefined }),
        }
      : null,
  ].filter((item): item is ActiveRunFilter => item !== null);
  const hasRunFilters = activeRunFilters.length > 0;

  return (
    <PageShell
      title="Ingestion monitor"
      description="Monitor iniziale delle run di acquisizione. La pagina usa il backend reale e permette il trigger manuale del connector NAS placeholder."
      actions={
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          {manualConnectors.map((connector) => (
            <IngestionRunTrigger
              key={connector.connectorName}
              connectorName={connector.connectorName}
              disabled={!connector.executionReadiness.runnable}
              disabledReason={connector.executionReadiness.detail}
            />
          ))}
        </div>
      }
    >
      <IngestionAutoRefresh enabled={queuedRuns > 0 || runningRuns > 0} />

      <SectionCard title="Riepilogo operativo" eyebrow="Summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Run totali</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{runs.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Run completate</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{completedRuns}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Run in coda</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{queuedRuns}</p>
            {runningRuns > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                {runningRuns} run in esecuzione
              </p>
            ) : null}
            {postProcessingRunning > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                {postProcessingRunning} post-processing attivi
              </p>
            ) : null}
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Record osservati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{totalRecords}</p>
            {failedRuns > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3d2e]">
                {failedRuns} run con errori
              </p>
            ) : null}
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Raw ingest</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{totalRawRecords}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
              {totalRawSubjectHints} con subject hint
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Stato orchestration" eyebrow="Backend">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector registrati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.registeredConnectors}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Trigger manuali</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.manualConnectors}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector eseguibili</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.runnableConnectors}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              configurati {orchestrationSummary.configuredConnectors} · persistenti{' '}
              {orchestrationSummary.persistentConnectors}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Review queue</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.reviewQueue}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              Ultima run{' '}
              {orchestrationSummary.latestRunAt
                ? new Date(orchestrationSummary.latestRunAt).toLocaleString('it-IT')
                : 'n/d'}
            </p>
          </article>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Record normalizzati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.normalizedRecords}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector non eseguibili</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.blockedConnectors}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              da correggere prima del trigger manuale
            </p>
          </article>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector healthy</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.healthyConnectors}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Issue critiche connector</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.criticalConnectorIssues}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector dry-run</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.dryRunConnectors}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              warning aperti {orchestrationSummary.warningConnectorIssues}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Catalogo connector" eyebrow="Orchestration">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildIssueFilterHref({
              status: filters.status,
              connector: filters.connector,
              connectorTriggerMode: filters.connectorTriggerMode,
              issueConnector: filters.issueConnector,
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.connectorOperationalStatus
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti gli stati
          </Link>
          {(['critical', 'warning', 'healthy'] as const).map((operationalStatus) => (
            <Link
              key={operationalStatus}
              href={buildIssueFilterHref({
                status: filters.status,
                connector: filters.connector,
                connectorOperationalStatus: operationalStatus,
                connectorTriggerMode: filters.connectorTriggerMode,
                issueConnector: filters.issueConnector,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.connectorOperationalStatus === operationalStatus
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {operationalStatus}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildIssueFilterHref({
              status: filters.status,
              connector: filters.connector,
              connectorOperationalStatus: filters.connectorOperationalStatus,
              issueConnector: filters.issueConnector,
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.connectorTriggerMode
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i trigger
          </Link>
          {(['manual', 'scheduled'] as const).map((triggerMode) => (
            <Link
              key={triggerMode}
              href={buildIssueFilterHref({
                status: filters.status,
                connector: filters.connector,
                connectorOperationalStatus: filters.connectorOperationalStatus,
                connectorTriggerMode: triggerMode,
                issueConnector: filters.issueConnector,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.connectorTriggerMode === triggerMode
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {triggerMode}
            </Link>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {connectors.items.map((connector) => (
            <article
              key={connector.connectorName}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{connector.displayName}</h3>
                  <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                    {connector.connectorName} · {connector.sourceSystem}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusChip label={connector.operationalStatus} />
                  <StatusChip label={connector.latestRun?.status ?? 'idle'} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusChip
                  label={connector.executionReadiness.runnable ? 'runnable' : 'not-runnable'}
                />
                <StatusChip
                  label={
                    connector.executionReadiness.persistenceEnabled ? 'persist-enabled' : 'dry-run'
                  }
                />
                {connector.issueCounters.total > 0 ? (
                  <StatusChip label={`${connector.issueCounters.total}-issues`} />
                ) : null}
              </div>
              <p className="mt-3 text-sm text-[var(--pcb-muted)]">
                Dominio {connector.domain} · trigger {connector.triggerMode}
              </p>
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                Capacita`: {connector.capabilities.join(', ')}
              </p>
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                Master data: {connector.writesToMasterData ? 'scrittura diretta' : 'mai scrittura diretta'}
              </p>
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                Runtime: {connector.executionReadiness.detail}
              </p>
              {connector.latestRun?.failureCode ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3d2e]">
                  {connector.latestRun.failureCode}
                  {connector.latestRun.failureStage ? ` · ${connector.latestRun.failureStage}` : ''}
                </p>
              ) : null}
              {connector.issueCounters.total > 0 ? (
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                  Issue aperte: {connector.issueCounters.total} · critiche {connector.issueCounters.critical} · warning{' '}
                  {connector.issueCounters.warning}
                </p>
              ) : null}
              {connector.executionReadiness.rootPath ? (
                <p className="mt-1 break-all text-xs text-[var(--pcb-muted)]">
                  Root path {connector.executionReadiness.rootPath}
                </p>
              ) : null}
              {connector.latestRun ? (
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  raw dir+soggetto {connector.latestRun.rawSummary.outcomeCounters.directorySubjectBucket} ·
                  file+soggetto {connector.latestRun.rawSummary.outcomeCounters.fileSubjectHint} ·
                  file senza hint {connector.latestRun.rawSummary.outcomeCounters.fileWithoutSubjectHint}
                </p>
              ) : null}
              {connector.latestRun ? (
                <p className="mt-3 text-xs text-[var(--pcb-muted)]">
                  Ultima run {new Date(connector.latestRun.startedAt).toLocaleString('it-IT')} ·{' '}
                  <Link href={`/ingestion/${connector.latestRun.id}`} className="font-semibold text-[var(--pcb-accent)]">
                    apri dettaglio
                  </Link>
                </p>
              ) : null}
              <div className="mt-4">
                <Link
                  href={`/ingestion/connectors/${connector.connectorName}`}
                  className="text-sm font-semibold text-[var(--pcb-accent)]"
                >
                  Apri dettaglio connector
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Issue operative connector" eyebrow="Attention">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildIssueFilterHref({
              status: filters.status,
              connector: filters.connector,
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.issueConnector
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i connector
          </Link>
          {connectors.items.map((connector) => (
            <Link
              key={connector.connectorName}
              href={buildIssueFilterHref({
                status: filters.status,
                connector: filters.connector,
                issueConnector: connector.connectorName,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.issueConnector === connector.connectorName
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {connector.connectorName}
            </Link>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildIssueFilterHref({
              status: filters.status,
              connector: filters.connector,
              issueConnector: filters.issueConnector,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.issueSeverity
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutte le severity
          </Link>
          {(['critical', 'warning'] as const).map((severity) => (
            <Link
              key={severity}
              href={buildIssueFilterHref({
                status: filters.status,
                connector: filters.connector,
                issueConnector: filters.issueConnector,
                issueSeverity: severity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.issueSeverity === severity
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {severity}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildIssueFilterHref({
              status: filters.status,
              connector: filters.connector,
              issueConnector: filters.issueConnector,
              issueSeverity: filters.issueSeverity,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.issueType
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i tipi
          </Link>
          {['not_configured', 'not_runnable', 'dry_run_only', 'latest_run_failed', 'no_completed_runs'].map(
            (issueType) => (
              <Link
                key={issueType}
                href={buildIssueFilterHref({
                  status: filters.status,
                  connector: filters.connector,
                  issueConnector: filters.issueConnector,
                  issueSeverity: filters.issueSeverity,
                  issueType,
                })}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                  filters.issueType === issueType
                    ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                    : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
                }`}
              >
                {issueType}
              </Link>
            ),
          )}
        </div>
        {connectorIssues.total === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">
            Nessuna issue operativa rilevata sui connector registrati.
          </p>
        ) : (
          <div className="grid gap-4">
            {connectorIssues.items.map((issue, index) => (
              <article
                key={`${issue.connectorName}-${issue.issueType}-${index}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{issue.displayName}</h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                      {issue.connectorName} · {issue.sourceSystem}
                    </p>
                  </div>
                  <StatusChip label={issue.severity} />
                </div>
                <p className="mt-3 text-sm text-[var(--pcb-muted)]">{issue.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                  {issue.issueType}
                  {' · '}
                  {issue.failureCode}
                  {issue.latestRunStatus ? ` · latest ${issue.latestRunStatus}` : ''}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link
                    href={`/ingestion/connectors/${issue.connectorName}`}
                    className="font-semibold text-[var(--pcb-accent)]"
                  >
                    Apri connector
                  </Link>
                  {issue.latestRunId ? (
                    <Link
                      href={`/ingestion/${issue.latestRunId}`}
                      className="font-semibold text-[var(--pcb-accent)]"
                    >
                      Apri ultima run
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Run disponibili" eyebrow="Ingestion">
        {hasRunFilters ? (
          <div className="mb-6 rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-[var(--pcb-muted)]">Contesto filtri attivi</p>
                <p className="mt-2 text-lg font-semibold text-[var(--pcb-ink)]">
                  {filteredRuns.length} run visibili su {runs.total}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ingestion"
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                >
                  Azzera filtri run
                </Link>
                <Link
                  href="/operations"
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                >
                  Torna a operations
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {activeRunFilters.map((filter) => (
                <Link
                  key={filter.key}
                  href={filter.clearHref}
                  className="rounded-full border border-[var(--pcb-line)] bg-[var(--pcb-surface-2)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                >
                  {filter.label} ×
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({
              connector: filters.connector,
              acquisitionStage: filters.acquisitionStage,
              postProcessingStage: filters.postProcessingStage,
              normalizationStage: filters.normalizationStage,
              matchingStage: filters.matchingStage,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.status
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti gli stati
          </Link>
          {['queued', 'completed', 'failed'].map((status) => (
            <Link
              key={status}
              href={buildRunsFilterHref({
                status,
                connector: filters.connector,
                acquisitionStage: filters.acquisitionStage,
                postProcessingStage: filters.postProcessingStage,
                normalizationStage: filters.normalizationStage,
                matchingStage: filters.matchingStage,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.status === status
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({
              status: filters.status,
              acquisitionStage: filters.acquisitionStage,
              postProcessingStage: filters.postProcessingStage,
              normalizationStage: filters.normalizationStage,
              matchingStage: filters.matchingStage,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.connector
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i connector
          </Link>
          {availableConnectors.map((connectorName) => (
            <Link
              key={connectorName}
              href={buildRunsFilterHref({
                status: filters.status,
                connector: connectorName,
                acquisitionStage: filters.acquisitionStage,
                postProcessingStage: filters.postProcessingStage,
                normalizationStage: filters.normalizationStage,
                matchingStage: filters.matchingStage,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.connector === connectorName
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {connectorName}
            </Link>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({
              status: filters.status,
              connector: filters.connector,
              postProcessingStage: filters.postProcessingStage,
              normalizationStage: filters.normalizationStage,
              matchingStage: filters.matchingStage,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.acquisitionStage
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Acquisition tutti
          </Link>
          {(['queued', 'running', 'completed', 'failed'] as const).map((stage) => (
            <Link
              key={stage}
              href={buildRunsFilterHref({
                status: filters.status,
                connector: filters.connector,
                acquisitionStage: stage,
                postProcessingStage: filters.postProcessingStage,
                normalizationStage: filters.normalizationStage,
                matchingStage: filters.matchingStage,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.acquisitionStage === stage
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              acq {stage}
            </Link>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({
              status: filters.status,
              connector: filters.connector,
              acquisitionStage: filters.acquisitionStage,
              normalizationStage: filters.normalizationStage,
              matchingStage: filters.matchingStage,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.postProcessingStage
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Post tutti
          </Link>
          {(['not_configured', 'queued', 'running', 'completed', 'failed'] as const).map((stage) => (
            <Link
              key={stage}
              href={buildRunsFilterHref({
                status: filters.status,
                connector: filters.connector,
                acquisitionStage: filters.acquisitionStage,
                postProcessingStage: stage,
                normalizationStage: filters.normalizationStage,
                matchingStage: filters.matchingStage,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.postProcessingStage === stage
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              post {stage}
            </Link>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({
              status: filters.status,
              connector: filters.connector,
              acquisitionStage: filters.acquisitionStage,
              postProcessingStage: filters.postProcessingStage,
              matchingStage: filters.matchingStage,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.normalizationStage
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Norm tutti
          </Link>
          {(['not_started', 'running', 'completed', 'failed'] as const).map((stage) => (
            <Link
              key={stage}
              href={buildRunsFilterHref({
                status: filters.status,
                connector: filters.connector,
                acquisitionStage: filters.acquisitionStage,
                postProcessingStage: filters.postProcessingStage,
                normalizationStage: stage,
                matchingStage: filters.matchingStage,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.normalizationStage === stage
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              norm {stage}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({
              status: filters.status,
              connector: filters.connector,
              acquisitionStage: filters.acquisitionStage,
              postProcessingStage: filters.postProcessingStage,
              normalizationStage: filters.normalizationStage,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.matchingStage
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Match tutti
          </Link>
          {(['not_started', 'running', 'completed', 'failed'] as const).map((stage) => (
            <Link
              key={stage}
              href={buildRunsFilterHref({
                status: filters.status,
                connector: filters.connector,
                acquisitionStage: filters.acquisitionStage,
                postProcessingStage: filters.postProcessingStage,
                normalizationStage: filters.normalizationStage,
                matchingStage: stage,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.matchingStage === stage
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              match {stage}
            </Link>
          ))}
        </div>
        {filteredRuns.length === 0 ? (
          <EmptyState
            title="Nessuna run disponibile"
            description="Non esistono run coerenti con i filtri correnti nel monitor ingestion."
            actionHref="/ingestion"
            actionLabel="Azzera filtri"
          />
        ) : (
          <div className="grid gap-4">
            {filteredRuns.map((run) => (
              <article
                key={run.id}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">
                      {run.connectorName}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                      Sorgente {run.sourceSystem}
                    </p>
                  </div>
                  <StatusChip label={run.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip label={`acq ${run.stages.acquisition.status}`} />
                  <StatusChip label={`post ${run.stages.postProcessing.status}`} />
                  <StatusChip label={`norm ${run.stages.normalization.status}`} />
                  <StatusChip label={`match ${run.stages.matching.status}`} />
                </div>
                <dl className="mt-4 grid gap-4 text-sm text-[var(--pcb-muted)] md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Avvio</dt>
                    <dd>{new Date(run.startedAt).toLocaleString('it-IT')}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Fine</dt>
                    <dd>{run.endedAt ? new Date(run.endedAt).toLocaleString('it-IT') : 'In corso / queued'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Record</dt>
                    <dd>
                  {run.recordsSuccess}/{run.recordsTotal} successi, {run.recordsError} errori
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Run ID</dt>
                    <dd className="break-all">{run.id}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-[var(--pcb-muted)]">
                  {run.logExcerpt || 'Nessun log excerpt disponibile.'}
                </p>
                {run.failureCode ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3d2e]">
                    {run.failureCode}
                    {run.failureStage ? ` · ${run.failureStage}` : ''}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                  raw {run.rawSummary.totalRecords} · dir {run.rawSummary.directoryRecords} · file{' '}
                  {run.rawSummary.fileRecords} · hint {run.rawSummary.subjectHintRecords}
                </p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  norm {run.normalizedSummary.totalRecords} · match {run.matchingSummary.totalResults}
                </p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  dir+soggetto {run.rawSummary.outcomeCounters.directorySubjectBucket} · dir bucket{' '}
                  {run.rawSummary.outcomeCounters.directoryBucketOnly} · file+soggetto{' '}
                  {run.rawSummary.outcomeCounters.fileSubjectHint} · file senza hint{' '}
                  {run.rawSummary.outcomeCounters.fileWithoutSubjectHint}
                </p>
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                  normalizzati {run.stages.normalization.recordsWritten} · matching{' '}
                  {run.stages.matching.resultsWritten}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/ingestion/${run.id}${filters.status || filters.connector ? `?fromStatus=${filters.status ?? ''}&fromConnector=${filters.connector ?? ''}` : ''}`}
                    className="text-sm font-semibold text-[var(--pcb-accent)]"
                  >
                    Apri dettaglio run
                  </Link>
                  <Link
                    href={`/audit?entityType=ingestion_run&entityId=${run.id}`}
                    className="text-sm font-semibold text-[var(--pcb-accent)]"
                  >
                    Audit run
                  </Link>
                  <Link
                    href={`/audit?sourceModule=ingest&entityType=ingestion_run&entityId=${run.id}`}
                    className="text-sm font-semibold text-[var(--pcb-accent)]"
                  >
                    Audit ingest
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
