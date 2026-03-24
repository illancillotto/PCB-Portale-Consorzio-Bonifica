import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IngestionRunTrigger } from '../../../../components/ingestion-run-trigger';
import { PageShell } from '../../../../components/page-shell';
import { SectionCard } from '../../../../components/section-card';
import { StatusChip } from '../../../../components/status-chip';
import { requireOperatorSession } from '../../../../lib/auth';
import {
  getAuditSummary,
  getIngestionConnectorDetail,
  getIngestionConnectorRuns,
} from '../../../../lib/api';

interface ConnectorDetailPageProps {
  params: Promise<{
    connectorName: string;
  }>;
  searchParams?: Promise<{
    status?: string;
    issueSeverity?: 'warning' | 'critical';
    issueType?: string;
  }>;
}

function buildConnectorRunsFilterHref(
  connectorName: string,
  filters: {
    status?: string;
    issueSeverity?: 'warning' | 'critical';
    issueType?: string;
  },
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.issueSeverity) {
    params.set('issueSeverity', filters.issueSeverity);
  }

  if (filters.issueType) {
    params.set('issueType', filters.issueType);
  }

  const queryString = params.toString();

  return queryString
    ? `/ingestion/connectors/${encodeURIComponent(connectorName)}?${queryString}`
    : `/ingestion/connectors/${encodeURIComponent(connectorName)}`;
}

function buildIngestionStageHref(filters: {
  connector?: string;
  status?: string;
  acquisitionStage?: 'queued' | 'running' | 'completed' | 'failed';
  postProcessingStage?: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
  normalizationStage?: 'not_started' | 'running' | 'completed' | 'failed';
  matchingStage?: 'not_started' | 'running' | 'completed' | 'failed';
}) {
  const params = new URLSearchParams();

  if (filters.connector) {
    params.set('connector', filters.connector);
  }

  if (filters.status) {
    params.set('status', filters.status);
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

export default async function ConnectorDetailPage({
  params,
  searchParams,
}: ConnectorDetailPageProps) {
  const { connectorName } = await params;
  const session = await requireOperatorSession(`/ingestion/connectors/${connectorName}`);
  const filters = (await searchParams) ?? {};

  let connector;

  try {
    connector = await getIngestionConnectorDetail(connectorName, session.accessToken);
  } catch {
    notFound();
  }

  const [runs, ingestAuditSummary, lastCompletedRunAuditSummary, lastFailedRunAuditSummary] = await Promise.all([
    getIngestionConnectorRuns(connector.connectorName, session.accessToken, {
      status: filters.status,
    }),
    getAuditSummary(session.accessToken, {
      sourceModule: 'ingest',
    }),
    connector.lastCompletedRun
      ? getAuditSummary(session.accessToken, {
          entityType: 'ingestion_run',
          entityId: connector.lastCompletedRun.id,
        })
      : Promise.resolve(null),
    connector.lastFailedRun
      ? getAuditSummary(session.accessToken, {
          entityType: 'ingestion_run',
          entityId: connector.lastFailedRun.id,
        })
      : Promise.resolve(null),
  ]);
  const connectorIssues = connector.issues.filter((issue) => {
    if (filters.issueSeverity && issue.severity !== filters.issueSeverity) {
      return false;
    }

    if (filters.issueType && issue.issueType !== filters.issueType) {
      return false;
    }

    return true;
  });
  const connectorRuns = runs.items;

  return (
    <PageShell
      title={connector.displayName}
      description="Dettaglio operativo del connector registrato nel dominio ingestion."
      actions={
        connector.triggerMode === 'manual' ? (
          <IngestionRunTrigger
            connectorName={connector.connectorName}
            disabled={!connector.executionReadiness.runnable}
            disabledReason={connector.executionReadiness.detail}
          />
        ) : null
      }
    >
      <SectionCard title="Profilo connector" eyebrow="Connector">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--pcb-ink)]">{connector.displayName}</h2>
            <p className="mt-1 text-sm text-[var(--pcb-muted)]">
              {connector.connectorName} · {connector.sourceSystem}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusChip label={connector.operationalStatus} />
            <StatusChip label={connector.latestRun?.status ?? 'idle'} />
          </div>
        </div>
        <dl className="mt-5 grid gap-4 text-sm text-[var(--pcb-muted)] md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Dominio</dt>
            <dd>{connector.domain}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Trigger</dt>
            <dd>{connector.triggerMode}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Master data</dt>
            <dd>{connector.writesToMasterData ? 'scrittura diretta' : 'mai scrittura diretta'}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Capacità</dt>
            <dd>{connector.capabilities.join(', ')}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]">
          <p>
            <strong className="text-[var(--pcb-ink)]">Eseguibile:</strong>{' '}
            {connector.executionReadiness.runnable ? 'si' : 'no'}
          </p>
          <p>
            <strong className="text-[var(--pcb-ink)]">Runtime:</strong> {connector.executionReadiness.detail}
          </p>
          <p className="mt-2">
            <strong className="text-[var(--pcb-ink)]">Persistenza raw ingest:</strong>{' '}
            {connector.executionReadiness.persistenceEnabled ? 'attiva' : 'dry-run'}
          </p>
          {connector.executionReadiness.rootPath ? (
            <p className="mt-2 break-all">
              <strong className="text-[var(--pcb-ink)]">Root path:</strong> {connector.executionReadiness.rootPath}
            </p>
          ) : null}
          <p className="mt-2">
            <strong className="text-[var(--pcb-ink)]">Issue aperte:</strong> {connector.issueCounters.total}
            {' · '}critiche {connector.issueCounters.critical} · warning {connector.issueCounters.warning}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/audit?sourceModule=ingest"
              className="text-sm font-semibold text-[var(--pcb-accent)]"
            >
              Audit ingestion
            </Link>
            <Link
              href="/operations"
              className="text-sm font-semibold text-[var(--pcb-accent)]"
            >
              Operations
            </Link>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contatori run" eyebrow="Runs">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href={buildIngestionStageHref({ connector: connector.connectorName })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Totali</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.total}</p>
          </Link>
          <Link
            href={buildIngestionStageHref({
              connector: connector.connectorName,
              status: 'queued',
              acquisitionStage: 'queued',
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Queued</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.queued}</p>
          </Link>
          <Link
            href={buildIngestionStageHref({
              connector: connector.connectorName,
              normalizationStage: 'completed',
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.completed}</p>
          </Link>
          <Link
            href={buildIngestionStageHref({
              connector: connector.connectorName,
              status: 'failed',
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Failed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.failed}</p>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Contesto audit" eyebrow="Audit">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Eventi modulo ingest</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{ingestAuditSummary.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">System operator modulo</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {ingestAuditSummary.systemOperatorEvents}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Audit ultima completata</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {lastCompletedRunAuditSummary?.total ?? 0}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Audit ultima fallita</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {lastFailedRunAuditSummary?.total ?? 0}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Storico operativo" eyebrow="Execution">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Record osservati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {connector.executionStats.recordsObservedTotal}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              successi {connector.executionStats.recordsSucceededTotal} · errori{' '}
              {connector.executionStats.recordsErroredTotal}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultimo completamento</p>
            {connector.lastCompletedRun ? (
              <>
                <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
                  {new Date(connector.lastCompletedRun.startedAt).toLocaleString('it-IT')}
                </p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  {connector.lastCompletedRun.recordsSuccess}/{connector.lastCompletedRun.recordsTotal} successi
                </p>
                <Link
                  href={buildIngestionStageHref({
                    connector: connector.connectorName,
                    normalizationStage: 'completed',
                  })}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--pcb-accent)]"
                >
                  Apri run completate
                </Link>
                <Link
                  href={`/audit?entityType=ingestion_run&entityId=${connector.lastCompletedRun.id}`}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--pcb-accent)]"
                >
                  Audit ultima run completata
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">Nessuna run completata.</p>
            )}
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultimo fallimento</p>
            {connector.lastFailedRun ? (
              <>
                <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
                  {new Date(connector.lastFailedRun.startedAt).toLocaleString('it-IT')}
                </p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  {connector.lastFailedRun.recordsError} errori · {connector.lastFailedRun.logExcerpt || 'senza log'}
                </p>
                <Link
                  href={buildIngestionStageHref({
                    connector: connector.connectorName,
                    status: 'failed',
                  })}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--pcb-accent)]"
                >
                  Apri run fallite
                </Link>
                <Link
                  href={`/audit?entityType=ingestion_run&entityId=${connector.lastFailedRun.id}`}
                  className="mt-3 inline-flex text-sm font-semibold text-[var(--pcb-accent)]"
                >
                  Audit ultima run fallita
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">Nessun fallimento registrato.</p>
            )}
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Issue operative" eyebrow="Attention">
        <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Not configured</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {connector.issueTypeCounters.notConfigured}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Not runnable</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {connector.issueTypeCounters.notRunnable}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Dry-run only</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {connector.issueTypeCounters.dryRunOnly}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Latest run failed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {connector.issueTypeCounters.latestRunFailed}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">No completed runs</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {connector.issueTypeCounters.noCompletedRuns}
            </p>
          </article>
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildConnectorRunsFilterHref(connector.connectorName, {
              status: filters.status,
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
              href={buildConnectorRunsFilterHref(connector.connectorName, {
                status: filters.status,
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
            href={buildConnectorRunsFilterHref(connector.connectorName, {
              status: filters.status,
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
                href={buildConnectorRunsFilterHref(connector.connectorName, {
                  status: filters.status,
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
        {connectorIssues.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessuna issue aperta per il connector corrente.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {connectorIssues.map((issue, index) => (
              <article
                key={`${issue.issueType}-${index}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{issue.issueType}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                      {issue.connectorName}
                    </p>
                  </div>
                  <StatusChip label={issue.severity} />
                </div>
                <p className="mt-4 text-sm text-[var(--pcb-muted)]">{issue.detail}</p>
                {issue.latestRunId ? (
                  <div className="mt-4">
                    <Link
                      href={`/ingestion/${issue.latestRunId}`}
                      className="text-sm font-semibold text-[var(--pcb-accent)]"
                    >
                      Apri run correlata
                    </Link>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {issue.issueType === 'not_runnable' || issue.issueType === 'not_configured' ? (
                    <Link
                      href={buildIngestionStageHref({
                        connector: connector.connectorName,
                        acquisitionStage: 'failed',
                      })}
                      className="font-semibold text-[var(--pcb-accent)]"
                    >
                      Vedi run bloccate
                    </Link>
                  ) : null}
                  {issue.issueType === 'dry_run_only' ? (
                    <Link
                      href={buildIngestionStageHref({
                        connector: connector.connectorName,
                        postProcessingStage: 'not_configured',
                      })}
                      className="font-semibold text-[var(--pcb-accent)]"
                    >
                      Vedi post-processing assente
                    </Link>
                  ) : null}
                  {issue.issueType === 'latest_run_failed' ? (
                    <Link
                      href={buildIngestionStageHref({
                        connector: connector.connectorName,
                        status: 'failed',
                      })}
                      className="font-semibold text-[var(--pcb-accent)]"
                    >
                      Vedi fallimenti
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Run recenti" eyebrow="History">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildConnectorRunsFilterHref(connector.connectorName, {
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
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
              href={buildConnectorRunsFilterHref(connector.connectorName, {
                status,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
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
        {connectorRuns.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessuna run disponibile per il connector corrente.</p>
        ) : (
          <div className="grid gap-4">
            {connectorRuns.map((run) => (
              <article key={run.id} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{run.connectorName}</h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">Sorgente {run.sourceSystem}</p>
                  </div>
                  <StatusChip label={run.status} />
                </div>
                <p className="mt-3 text-sm text-[var(--pcb-muted)]">
                  {new Date(run.startedAt).toLocaleString('it-IT')} · {run.recordsSuccess}/{run.recordsTotal} successi
                </p>
                <div className="mt-4">
                  <Link href={`/ingestion/${run.id}`} className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Apri dettaglio run
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
