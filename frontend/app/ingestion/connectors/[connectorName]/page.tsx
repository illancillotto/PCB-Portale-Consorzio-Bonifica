import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IngestionRunTrigger } from '../../../../components/ingestion-run-trigger';
import { PageShell } from '../../../../components/page-shell';
import { SectionCard } from '../../../../components/section-card';
import { StatusChip } from '../../../../components/status-chip';
import { requireOperatorSession } from '../../../../lib/auth';
import {
  getIngestionConnectorDetail,
  getIngestionConnectorIssues,
  getIngestionConnectorRuns,
} from '../../../../lib/api';

interface ConnectorDetailPageProps {
  params: Promise<{
    connectorName: string;
  }>;
  searchParams?: Promise<{
    status?: string;
    issueSeverity?: 'warning' | 'critical';
  }>;
}

function buildConnectorRunsFilterHref(
  connectorName: string,
  filters: {
    status?: string;
    issueSeverity?: 'warning' | 'critical';
  },
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.issueSeverity) {
    params.set('issueSeverity', filters.issueSeverity);
  }

  const queryString = params.toString();

  return queryString
    ? `/ingestion/connectors/${encodeURIComponent(connectorName)}?${queryString}`
    : `/ingestion/connectors/${encodeURIComponent(connectorName)}`;
}

export default async function ConnectorDetailPage({
  params,
  searchParams,
}: ConnectorDetailPageProps) {
  const session = await requireOperatorSession();
  const { connectorName } = await params;
  const filters = (await searchParams) ?? {};

  let connector;

  try {
    connector = await getIngestionConnectorDetail(connectorName, session.accessToken);
  } catch {
    notFound();
  }

  const runs = await getIngestionConnectorRuns(connector.connectorName, session.accessToken, {
    status: filters.status,
  });
  const connectorIssues = await getIngestionConnectorIssues(session.accessToken, {
    connectorName: connector.connectorName,
    severity: filters.issueSeverity,
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
          <StatusChip label={connector.latestRun?.status ?? 'idle'} />
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
        </div>
      </SectionCard>

      <SectionCard title="Contatori run" eyebrow="Runs">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Totali</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Queued</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.queued}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.completed}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Failed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connector.runCounters.failed}</p>
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
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">Nessun fallimento registrato.</p>
            )}
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Issue operative" eyebrow="Attention">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildConnectorRunsFilterHref(connector.connectorName, { status: filters.status })}
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
        {connectorIssues.total === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessuna issue aperta per il connector corrente.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {connectorIssues.items.map((issue, index) => (
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
