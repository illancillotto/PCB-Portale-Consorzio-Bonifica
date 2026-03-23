import Link from 'next/link';
import { IngestionRunTrigger } from '../../components/ingestion-run-trigger';
import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import {
  getIngestionConnectors,
  getIngestionConnectorIssues,
  getIngestionOrchestrationSummary,
  getIngestionRuns,
} from '../../lib/api';

interface IngestionPageProps {
  searchParams?: Promise<{
    status?: string;
    connector?: string;
    issueSeverity?: 'warning' | 'critical';
    issueType?: string;
  }>;
}

function buildRunsFilterHref(filters: { status?: string; connector?: string }) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.connector) {
    params.set('connector', filters.connector);
  }

  const queryString = params.toString();

  return queryString ? `/ingestion?${queryString}` : '/ingestion';
}

function buildIssueFilterHref(filters: {
  status?: string;
  connector?: string;
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
  const session = await requireOperatorSession();
  const filters = (await searchParams) ?? {};
  const [runs, connectors, connectorIssues, orchestrationSummary] = await Promise.all([
    getIngestionRuns(session.accessToken),
    getIngestionConnectors(session.accessToken),
    getIngestionConnectorIssues(session.accessToken, {
      severity: filters.issueSeverity,
      issueType: filters.issueType,
    }),
    getIngestionOrchestrationSummary(session.accessToken),
  ]);
  const availableConnectors = Array.from(new Set(runs.items.map((run) => run.connectorName))).sort();
  const filteredRuns = runs.items.filter((run) => {
    if (filters.status && run.status !== filters.status) {
      return false;
    }

    if (filters.connector && run.connectorName !== filters.connector) {
      return false;
    }

    return true;
  });
  const queuedRuns = runs.items.filter((run) => run.status === 'queued').length;
  const completedRuns = runs.items.filter((run) => run.status === 'completed').length;
  const failedRuns = runs.items.filter((run) => run.status === 'failed').length;
  const totalRecords = runs.items.reduce((total, run) => total + run.recordsTotal, 0);
  const manualConnectors = connectors.items.filter((connector) => connector.triggerMode === 'manual');

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
      <SectionCard title="Riepilogo operativo" eyebrow="Summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                <StatusChip label={connector.latestRun?.status ?? 'idle'} />
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
              {connector.executionReadiness.rootPath ? (
                <p className="mt-1 break-all text-xs text-[var(--pcb-muted)]">
                  Root path {connector.executionReadiness.rootPath}
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
            href={buildIssueFilterHref({ status: filters.status, connector: filters.connector })}
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
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunsFilterHref({ connector: filters.connector })}
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
              href={buildRunsFilterHref({ status, connector: filters.connector })}
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
            href={buildRunsFilterHref({ status: filters.status })}
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
              href={buildRunsFilterHref({ status: filters.status, connector: connectorName })}
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
        {filteredRuns.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessuna run disponibile.</p>
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
                <div className="mt-4">
                  <Link
                    href={`/ingestion/${run.id}${filters.status || filters.connector ? `?fromStatus=${filters.status ?? ''}&fromConnector=${filters.connector ?? ''}` : ''}`}
                    className="text-sm font-semibold text-[var(--pcb-accent)]"
                  >
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
