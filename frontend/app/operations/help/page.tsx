import Link from 'next/link';
import { PageShell } from '../../../components/page-shell';
import { SectionCard } from '../../../components/section-card';
import { requireOperatorSession } from '../../../lib/auth';

const helpReferences = [
  {
    title: 'Operations Runbook',
    description:
      'Flussi operativi minimi per login, ingestion manuale, audit, GIS, issue connector e prima diagnosi.',
    path: 'docs/OPERATIONS_RUNBOOK.md',
  },
  {
    title: 'Smoke Tests',
    description:
      'Uso corretto di dev:smoke, dev:smoke:ingestion, dev:smoke:gis e dev:verify con prerequisiti e output atteso.',
    path: 'docs/SMOKE_TESTS.md',
  },
  {
    title: 'Known Issues',
    description:
      'Problemi reali gia` incontrati nel progetto, con sintomi, causa e contromisura applicata.',
    path: 'docs/KNOWN_ISSUES.md',
  },
  {
    title: 'API Surface',
    description:
      'Endpoint pubblici, endpoint protetti, filtri query principali e route piu` utili per smoke e troubleshooting.',
    path: 'docs/API_SURFACE.md',
  },
];

export default async function OperationsHelpPage() {
  await requireOperatorSession('/operations/help');

  return (
    <PageShell
      title="Operations Help"
      description="Guida sintetica ai riferimenti operativi e tecnici gia` consolidati nel progetto PCB."
    >
      <SectionCard title="Guide disponibili" eyebrow="Help Center">
        <div className="grid gap-4 lg:grid-cols-2">
          {helpReferences.map((reference) => (
            <article
              key={reference.path}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{reference.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--pcb-muted)]">{reference.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                File di riferimento
              </p>
              <code className="mt-2 block rounded-xl bg-[var(--pcb-surface)] px-3 py-2 text-sm text-[var(--pcb-ink)]">
                {reference.path}
              </code>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Ingressi rapidi" eyebrow="Operations">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/operations"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Operations</strong>
            Torna al quadro operativo centrale.
          </Link>
          <Link
            href="/ingestion"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Ingestion</strong>
            Apri il monitor run e i connector.
          </Link>
          <Link
            href="/audit"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Audit</strong>
            Vai al trail eventi filtrabile.
          </Link>
          <Link
            href="/gis"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">GIS</strong>
            Apri viewer, publication status e GetFeatureInfo.
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
