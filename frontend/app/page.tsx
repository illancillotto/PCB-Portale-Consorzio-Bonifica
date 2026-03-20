const moduleCards = [
  {
    title: 'Anagrafiche CUUA',
    description: 'Dominio master per soggetti, identificativi e storico anagrafico.',
  },
  {
    title: 'Ingestione',
    description: 'Pipeline separata tra acquisizione raw, normalizzazione e matching.',
  },
  {
    title: 'Catasto e GIS',
    description: 'Collegamento tra particelle, layer territoriali e schede soggetto.',
  },
  {
    title: 'Audit e Search',
    description: 'Tracciabilità operativa e ricerca unificata su soggetti e riferimenti.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <section className="rounded-[32px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)]/95 p-8 shadow-[0_24px_80px_rgba(31,41,51,0.08)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pcb-accent)]">
              PCB · Portale Consorzio Bonifica
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--pcb-ink)]">
              Piattaforma interna per governo del dato, anagrafe CUUA e dominio territoriale.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--pcb-muted)]">
              Il bootstrap iniziale prepara una base unica tra frontend, backend e connector layer,
              senza compromettere la separazione tra raw ingest, normalized data e master data.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-[var(--pcb-line)] bg-[#f8f6f0] p-4 text-sm text-[var(--pcb-muted)]">
            <span>Backend: NestJS modular monolith</span>
            <span>Frontend: Next.js</span>
            <span>Data: PostgreSQL + PostGIS</span>
            <span>Security: Keycloak placeholder</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {moduleCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)] p-6"
          >
            <h2 className="text-xl font-semibold text-[var(--pcb-ink)]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--pcb-muted)]">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[24px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)] p-6">
          <h2 className="text-xl font-semibold text-[var(--pcb-ink)]">Milestone corrente</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--pcb-muted)]">
            <li>Repository strutturato per domini e package separati.</li>
            <li>Compose locale con PostGIS, Redis, Keycloak e QGIS Server.</li>
            <li>Moduli backend iniziali pronti per evoluzione incrementale.</li>
            <li>Shell frontend istituzionale pronta per dashboard, ricerca e scheda soggetto.</li>
          </ul>
        </article>

        <article className="rounded-[24px] border border-[var(--pcb-line)] bg-[#23313a] p-6 text-white">
          <h2 className="text-xl font-semibold">Vincoli attivi</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/78">
            <li>Niente microservizi.</li>
            <li>Connettori separati e mai scrittura diretta su master.</li>
            <li>CUUA come chiave di business centrale.</li>
            <li>GIS trattato come dominio core.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
