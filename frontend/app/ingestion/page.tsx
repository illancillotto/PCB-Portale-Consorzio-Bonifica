import Link from 'next/link';
import { IngestionRunTrigger } from '../../components/ingestion-run-trigger';
import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import { getIngestionRuns } from '../../lib/api';

interface IngestionPageProps {
  searchParams?: Promise<{
    status?: string;
    connector?: string;
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

export default async function IngestionPage({ searchParams }: IngestionPageProps) {
  const session = await requireOperatorSession();
  const filters = (await searchParams) ?? {};
  const runs = await getIngestionRuns(session.accessToken);
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

  return (
    <PageShell
      title="Ingestion monitor"
      description="Monitor iniziale delle run di acquisizione. La pagina usa il backend reale e permette il trigger manuale del connector NAS placeholder."
      actions={<IngestionRunTrigger connectorName="connector-nas-catasto" />}
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
