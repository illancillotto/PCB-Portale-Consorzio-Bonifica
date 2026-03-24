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
      {query ? (
        <SectionCard title="Ingressi operativi" eyebrow="Shortcuts">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/operations"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
            >
              Apri operations
            </Link>
            <Link
              href="/audit"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
            >
              Apri audit
            </Link>
            <Link
              href="/ingestion"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
            >
              Apri ingestion
            </Link>
            <Link
              href="/gis?preset=completo"
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
            >
              Apri GIS completo
            </Link>
          </div>
        </SectionCard>
      ) : null}

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
              <article
                key={`${item.type}-${item.id}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">{item.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={item.route}
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Apri scheda PCB
                  </Link>
                  <Link
                    href={
                      item.type === 'subject'
                        ? `/gis?subjectId=${item.id}&preset=relazioni&layers=pcb_subject_parcel_links`
                        : `/gis?parcelId=${item.id}&preset=catasto&layers=pcb_subject_parcel_links,pcb_parcels`
                    }
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Apri GIS contestuale
                  </Link>
                  <Link
                    href={
                      item.type === 'subject'
                        ? `/gis?subjectId=${item.id}&preset=soggetti&layers=pcb_subjects`
                        : `/gis?parcelId=${item.id}&preset=relazioni&layers=pcb_subject_parcel_links`
                    }
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Preset operativo
                  </Link>
                  <Link
                    href={item.type === 'subject' ? '/audit' : '/operations'}
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    {item.type === 'subject' ? 'Apri audit' : 'Apri operations'}
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
