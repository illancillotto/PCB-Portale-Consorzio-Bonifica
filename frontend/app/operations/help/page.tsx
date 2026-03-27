import Link from 'next/link';
import { PageShell } from '../../../components/page-shell';
import { SectionCard } from '../../../components/section-card';
import { requireOperatorSession } from '../../../lib/auth';

type HelpTopic = 'general' | 'auth' | 'ingestion' | 'audit' | 'gis';

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
    topic: 'auth' as HelpTopic,
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
    topic: 'ingestion' as HelpTopic,
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
    topic: 'gis' as HelpTopic,
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
    topic: 'ingestion' as HelpTopic,
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

const escalationSignals = [
  {
    topic: 'audit' as HelpTopic,
    title: 'Passa ad Audit',
    signals: [
      'La run o il matching si sono completati ma l’esito non è coerente con quanto atteso.',
      'Serve capire se una decisione manuale o un post-processing è già stato eseguito.',
      'Hai bisogno di correlare `requestId`, `ingestionRunId` o modulo sorgente.',
    ],
    href: '/audit',
  },
  {
    topic: 'ingestion' as HelpTopic,
    title: 'Passa a Ingestion',
    signals: [
      'Vedi run `queued`, `running`, `failed` o `review` e serve il dettaglio di pipeline.',
      'Devi distinguere raw, normalized e matching outcome sulla stessa run.',
      'Il connector mostra issue operative o una run recente è fallita.',
    ],
    href: '/ingestion',
  },
  {
    topic: 'gis' as HelpTopic,
    title: 'Passa a GIS',
    signals: [
      'QGIS risponde al `GetCapabilities` ma il problema riguarda map features, viewer o `GetFeatureInfo`.',
      'Serve verificare `publication status`, layer attivi o una feature specifica.',
      'Il guasto sembra nel proxy GIS frontend e non solo nel publication target.',
    ],
    href: '/gis',
  },
  {
    topic: 'general' as HelpTopic,
    title: 'Passa ai log o alla verify suite',
    signals: [
      'Il problema attraversa più domini e non si chiude con un singolo controllo UI.',
      'Health, login o publication target sono intermittenti.',
      'Serve distinguere rapidamente problema di stack, runtime locale o regressione applicativa.',
    ],
    href: '/operations',
  },
];

const topicLabels: Record<HelpTopic, string> = {
  general: 'Generale',
  auth: 'Auth',
  ingestion: 'Ingestion',
  audit: 'Audit',
  gis: 'GIS',
};

function buildHelpHref(topic?: HelpTopic) {
  return topic && topic !== 'general' ? `/operations/help?topic=${topic}` : '/operations/help';
}

interface OperationsHelpPageProps {
  searchParams?: Promise<{
    topic?: string;
  }>;
}

export default async function OperationsHelpPage({ searchParams }: OperationsHelpPageProps) {
  const params = (await searchParams) ?? {};
  const topic = (params.topic && params.topic in topicLabels ? params.topic : 'general') as HelpTopic;
  await requireOperatorSession(buildHelpHref(topic));
  const filteredFirstResponseItems =
    topic === 'general'
      ? firstResponseItems
      : firstResponseItems.filter((item) => item.topic === topic);
  const filteredEscalationSignals =
    topic === 'general'
      ? escalationSignals
      : escalationSignals.filter((item) => item.topic === topic || item.topic === 'general');

  return (
    <PageShell
      title="Operations Help"
      description={`Guida sintetica ai riferimenti operativi e tecnici gia\` consolidati nel progetto PCB.${topic !== 'general' ? ` Focus attivo: ${topicLabels[topic]}.` : ''}`}
    >
      <SectionCard title="Contesto help" eyebrow="Topic">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(topicLabels) as HelpTopic[]).map((item) => (
            <Link
              key={item}
              href={buildHelpHref(item)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                item === topic
                  ? 'border-[var(--pcb-accent)] text-[var(--pcb-accent)]'
                  : 'border-[var(--pcb-line)] text-[var(--pcb-muted)]'
              }`}
            >
              {topicLabels[item]}
            </Link>
          ))}
        </div>
      </SectionCard>

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
          {filteredFirstResponseItems.map((item) => (
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

      <SectionCard title="Escalation signals" eyebrow="Next step">
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredEscalationSignals.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{item.title}</h3>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--pcb-muted)]">
                {item.signals.map((signal) => (
                  <li key={signal}>- {signal}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={item.href} className="text-sm font-semibold text-[var(--pcb-accent)]">
                  Apri modulo
                </Link>
              </div>
            </article>
          ))}
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">Comandi di escalation</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--pcb-muted)]">
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3">
                <strong className="block text-[var(--pcb-ink)]">Suite completa</strong>
                <code className="mt-2 block break-all text-xs text-[var(--pcb-muted)]">
                  npm run dev:verify
                </code>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3">
                <strong className="block text-[var(--pcb-ink)]">Stato servizi</strong>
                <code className="mt-2 block break-all text-xs text-[var(--pcb-muted)]">
                  docker compose ps
                </code>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3">
                <strong className="block text-[var(--pcb-ink)]">Log stack</strong>
                <code className="mt-2 block break-all text-xs text-[var(--pcb-muted)]">
                  docker compose logs --tail=200
                </code>
              </div>
            </div>
          </article>
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
