import Link from 'next/link';
import { PageShell } from '../components/page-shell';
import { SearchForm } from '../components/search-form';
import { SectionCard } from '../components/section-card';
import { getParcels, getSubjects } from '../lib/api';

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
];

export default async function HomePage() {
  const [subjects, parcels] = await Promise.all([getSubjects(), getParcels()]);

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
    </PageShell>
  );
}
