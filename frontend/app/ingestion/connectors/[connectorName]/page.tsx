import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IngestionRunTrigger } from '../../../../components/ingestion-run-trigger';
import { PageShell } from '../../../../components/page-shell';
import { SectionCard } from '../../../../components/section-card';
import { StatusChip } from '../../../../components/status-chip';
import { requireOperatorSession } from '../../../../lib/auth';
import {
  getIngestionConnectorDetail,
  getIngestionRuns,
} from '../../../../lib/api';

interface ConnectorDetailPageProps {
  params: Promise<{
    connectorName: string;
  }>;
}

export default async function ConnectorDetailPage({ params }: ConnectorDetailPageProps) {
  const session = await requireOperatorSession();
  const { connectorName } = await params;

  let connector;

  try {
    connector = await getIngestionConnectorDetail(connectorName, session.accessToken);
  } catch {
    notFound();
  }

  const runs = await getIngestionRuns(session.accessToken);
  const connectorRuns = runs.items.filter((run) => run.connectorName === connector.connectorName);

  return (
    <PageShell
      title={connector.displayName}
      description="Dettaglio operativo del connector registrato nel dominio ingestion."
      actions={
        connector.triggerMode === 'manual' ? (
          <IngestionRunTrigger connectorName={connector.connectorName} />
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

      <SectionCard title="Run recenti" eyebrow="History">
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
