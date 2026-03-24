import Link from 'next/link';
import { PageShell } from '../components/page-shell';
import { SearchForm } from '../components/search-form';
import { SectionCard } from '../components/section-card';
import {
  getAuditSummary,
  getGisLayers,
  getGisPublicationStatus,
  getGisSubjectParcelLinks,
  getIngestionOrchestrationSummary,
  getIngestionRuns,
  getParcels,
  getSubjects,
} from '../lib/api';
import { getOptionalSession } from '../lib/auth';

const moduleCards = [
  {
    title: 'Anagrafiche CUUA',
    description: 'Soggetti master, identificativi e storico nominativi già letti da PostgreSQL reale.',
    href: '/subjects',
  },
  {
    title: 'Catasto',
    description: 'Particelle e relazioni soggetto-particella esposte da API verificate sul DB.',
    href: '/parcels',
  },
  {
    title: 'Ricerca unificata',
    description: 'Ricerca trasversale su soggetti e particelle, pronta per diventare il punto di accesso principale.',
    href: '/search?q=oristano',
  },
  {
    title: 'Ingestione',
    description: 'Run di ingestione e trigger manuale già disponibili a livello backend.',
    href: '/ingestion',
  },
  {
    title: 'Audit operativo',
    description: 'Eventi di pipeline e decisioni manuali, tracciati e consultabili in sicurezza.',
    href: '/audit',
  },
  {
    title: 'Operations',
    description: 'Stato centralizzato di Postgres, Redis, Keycloak e QGIS per la verifica runtime.',
    href: '/operations',
  },
  {
    title: 'GIS completo',
    description: 'Viewer operativo con tutti i layer QGIS e preset completo condivisibile.',
    href: '/gis?preset=completo',
  },
  {
    title: 'GIS relazioni',
    description: 'Accesso rapido alla vista relazionale soggetto-particella per controllo operativo.',
    href: '/gis?preset=relazioni&layers=pcb_subject_parcel_links',
  },
];

export default async function HomePage() {
  const session = await getOptionalSession();
  const [subjects, parcels, gisMetrics, operationalMetrics] = await Promise.all([
    getSubjects(),
    getParcels(),
    session
      ? Promise.all([
          getGisLayers(session.accessToken),
          getGisPublicationStatus(session.accessToken),
          getGisSubjectParcelLinks(session.accessToken),
        ]).then(([layers, publicationStatus, subjectParcelLinks]) => ({
          layers,
          publicationStatus,
          subjectParcelLinks,
        }))
      : Promise.resolve(null),
    session
      ? Promise.all([
          getIngestionRuns(session.accessToken),
          getIngestionOrchestrationSummary(session.accessToken),
          getAuditSummary(session.accessToken),
        ]).then(([ingestionRuns, orchestrationSummary, auditSummary]) => ({
            ingestionRuns,
            orchestrationSummary,
            auditSummary,
          }),
        )
      : Promise.resolve(null),
  ]);
  const auditBySourceModule = operationalMetrics ? operationalMetrics.auditSummary.bySourceModule : [];
  const auditByActorType = operationalMetrics ? operationalMetrics.auditSummary.byActorType : [];

  return (
    <PageShell
      title="Portale interno PCB"
      description="La dashboard iniziale usa dati reali del backend NestJS e del database PostgreSQL/PostGIS per anagrafiche, catasto e ricerca."
      actions={<SearchForm />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moduleCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-[24px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)] p-6 transition hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold text-[var(--pcb-ink)]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pcb-muted)]">{card.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Baseline verificata" eyebrow="Runtime">
          <dl className="grid gap-4 text-sm text-[var(--pcb-muted)] md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em]">Soggetti attivi seed</dt>
              <dd className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{subjects.total}</dd>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em]">Particelle seed</dt>
              <dd className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{parcels.total}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Stato milestone" eyebrow="M3">
          <ul className="space-y-3 text-sm leading-6 text-[var(--pcb-muted)]">
            <li>Frontend collegato alle API reali di soggetti, particelle e ricerca.</li>
            <li>Prime viste navigabili per lista soggetti, scheda soggetto e vista particella.</li>
            <li>Il monitor ingestione resta il prossimo blocco subito utile.</li>
          </ul>
        </SectionCard>
      </section>

      <SectionCard title="Metriche GIS" eyebrow="Map Ops">
        {gisMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Layer pubblicati
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {gisMetrics.layers.total}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Relazioni GIS
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {gisMetrics.subjectParcelLinks.total}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Publication target
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {gisMetrics.publicationStatus.statusLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Preset operativi
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">4</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm text-[var(--pcb-muted)]">
            Le metriche GIS operative sono visibili con sessione operatore attiva. Il viewer e gli shortcut restano
            disponibili dai moduli GIS e Operations.
          </div>
        )}
      </SectionCard>

      <SectionCard title="Metriche ingestion e audit" eyebrow="Ops">
        {operationalMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/ingestion"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Run ingestione
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.ingestionRuns.total}
              </p>
            </Link>
            <Link
              href="/ingestion?status=queued"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Run in coda
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {
                  operationalMetrics.ingestionRuns.items.filter((run) => run.status === 'queued').length
                }
              </p>
            </Link>
            <Link
              href="/audit"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Eventi audit
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.auditSummary.total}
              </p>
            </Link>
            <Link
              href="/operations"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Ultimo evento
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.auditSummary.latestCreatedAt
                  ? new Date(operationalMetrics.auditSummary.latestCreatedAt).toLocaleString('it-IT')
                  : 'n/d'}
              </p>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm text-[var(--pcb-muted)]">
            Le metriche di ingestione e audit richiedono sessione operatore attiva. Le viste dettagliate restano
            disponibili nei moduli dedicati.
          </div>
        )}
      </SectionCard>

      <SectionCard title="Ingressi audit per modulo" eyebrow="Audit">
        {operationalMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/audit"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Tutti i moduli
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.auditSummary.total}
              </p>
            </Link>
            {auditBySourceModule.map((item) => (
              <Link
                key={item.sourceModule}
                href={`/audit?sourceModule=${encodeURIComponent(item.sourceModule)}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                  {item.sourceModule}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{item.total}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm text-[var(--pcb-muted)]">
            Gli ingressi audit per modulo richiedono sessione operatore attiva.
          </div>
        )}
      </SectionCard>

      <SectionCard title="Ingressi audit per attore" eyebrow="Actors">
        {operationalMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/audit"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Tutti gli attori
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.auditSummary.total}
              </p>
            </Link>
            {auditByActorType.map((item) => (
              <Link
                key={item.actorType}
                href={`/audit?actorType=${encodeURIComponent(item.actorType)}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                  {item.actorType}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{item.total}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm text-[var(--pcb-muted)]">
            Gli ingressi audit per attore richiedono sessione operatore attiva.
          </div>
        )}
      </SectionCard>

      <SectionCard title="Ingressi operativi ingestion" eyebrow="Pipeline">
        {operationalMetrics ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/ingestion?status=running&acquisitionStage=running"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Acquisition running
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.orchestrationSummary.runningRuns}
              </p>
            </Link>
            <Link
              href="/ingestion?postProcessingStage=running"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Post-processing running
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.orchestrationSummary.postProcessingRunningRuns}
              </p>
            </Link>
            <Link
              href="/ingestion?normalizationStage=completed"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Normalization completed
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.orchestrationSummary.normalizationCompletedRuns}
              </p>
            </Link>
            <Link
              href="/ingestion?matchingStage=completed"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                Matching completed
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
                {operationalMetrics.orchestrationSummary.matchingCompletedRuns}
              </p>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm text-[var(--pcb-muted)]">
            Gli ingressi operativi della pipeline ingestion richiedono sessione operatore attiva.
          </div>
        )}
      </SectionCard>

      <SectionCard title="Preset GIS rapidi" eyebrow="Map">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/gis?preset=completo"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">Vista completa</h3>
            <p className="mt-2 text-sm text-[var(--pcb-muted)]">
              Tutti i layer QGIS attivi per consultazione generale.
            </p>
          </Link>
          <Link
            href="/gis?preset=relazioni&layers=pcb_subject_parcel_links"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">Solo relazioni</h3>
            <p className="mt-2 text-sm text-[var(--pcb-muted)]">
              Evidenzia il layer relazionale soggetto-particella.
            </p>
          </Link>
          <Link
            href="/gis?preset=catasto&layers=pcb_subject_parcel_links,pcb_parcels"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">Preset catasto</h3>
            <p className="mt-2 text-sm text-[var(--pcb-muted)]">
              Relazioni e particelle per lettura operativa del dominio catastale.
            </p>
          </Link>
          <Link
            href="/gis?preset=soggetti&layers=pcb_subjects"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">Focus soggetti</h3>
            <p className="mt-2 text-sm text-[var(--pcb-muted)]">
              Marker soggetto georiferiti senza sovraccarico cartografico.
            </p>
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
