import Link from 'next/link';
import { PageShell } from '../../components/page-shell';
import { SearchForm } from '../../components/search-form';
import { SectionCard } from '../../components/section-card';
import { searchAll } from '../../lib/api';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? '';
  const results = query ? await searchAll(query) : { items: [], total: 0 };

  return (
    <PageShell
      title="Ricerca unificata"
      description="Accesso trasversale a soggetti e particelle. La ricerca usa gli endpoint reali del backend PCB."
      actions={<SearchForm defaultValue={query} />}
    >
      <SectionCard title={query ? `Risultati per "${query}"` : 'Inserisci un criterio di ricerca'} eyebrow="Search">
        {!query ? (
          <p className="text-sm text-[var(--pcb-muted)]">
            Prova CUUA, nominativo, comune, foglio o particella.
          </p>
        ) : results.items.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessun risultato trovato.</p>
        ) : (
          <div className="grid gap-4">
            {results.items.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.route}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">{item.subtitle}</p>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
