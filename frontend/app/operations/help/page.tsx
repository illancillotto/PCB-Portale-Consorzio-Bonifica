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

const firstResponseItems = [
  {
    title: 'Login non disponibile',
    checks: [
      'Apri la discovery di Keycloak e verifica che risponda correttamente.',
      'Controlla `docker compose ps` e conferma che `pcb-keycloak` sia attivo.',
      'Se la login page risponde ma il login fallisce, riesegui `npm run dev:smoke`.',
    ],
    actions: [
      {
        label: 'Discovery Keycloak',
        href: 'http://localhost:8180/realms/pcb/.well-known/openid-configuration',
      },
      {
        label: 'Frontend login',
        href: '/login',
      },
    ],
  },
  {
    title: 'Ingestion bloccata o non avviabile',
    checks: [
      'Apri `Ingestion` e verifica issue connector e stato dell’ultima run.',
      'Controlla che `PCB_NAS_CATASTO_ROOT` punti a un path accessibile nel runtime locale.',
      'Riesegui `npm run dev:smoke:ingestion` per validare trigger, acquisition e post-processing.',
    ],
    actions: [
      {
        label: 'Apri ingestion',
        href: '/ingestion',
      },
      {
        label: 'Apri operations',
        href: '/operations',
      },
    ],
  },
  {
    title: 'GIS non disponibile o GetFeatureInfo fallisce',
    checks: [
      'Verifica `publication status` in `GIS` e controlla che QGIS risponda al `GetCapabilities`.',
      'Controlla che `pcb-qgis-server` sia attivo nello stack Docker.',
      'Riesegui `npm run dev:smoke:gis` per validare publication target, map-features e proxy frontend.',
    ],
    actions: [
      {
        label: 'Apri GIS',
        href: '/gis',
      },
      {
        label: 'QGIS GetCapabilities',
        href: 'http://localhost:8090/ows/?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs',
      },
    ],
  },
  {
    title: 'Connector NAS non eseguibile',
    checks: [
      'Verifica in `Operations` o `Ingestion` se il connector ha issue `not_runnable` o `not_configured`.',
      'Controlla che il sample NAS locale esista oppure riesegui `npm run dev:prepare-runtime`.',
      'Se il problema resta, controlla lo stato stack con `docker compose ps` e rilancia `npm run dev:up`.',
    ],
    actions: [
      {
        label: 'Apri dettaglio ingestion',
        href: '/ingestion',
      },
      {
        label: 'Help center operations',
        href: '/operations/help',
      },
    ],
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

      <SectionCard title="First response" eyebrow="Checklist">
        <div className="grid gap-4 lg:grid-cols-2">
          {firstResponseItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{item.title}</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                    Prime verifiche
                  </p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--pcb-muted)]">
                    {item.checks.map((check) => (
                      <li key={check}>- {check}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                    Shortcut utili
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {item.actions.map((action) => {
                      const isExternal = action.href.startsWith('http');

                      return isExternal ? (
                        <a
                          key={action.label}
                          href={action.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-[var(--pcb-accent)]"
                        >
                          {action.label}
                        </a>
                      ) : (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="text-sm font-semibold text-[var(--pcb-accent)]"
                        >
                          {action.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
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
