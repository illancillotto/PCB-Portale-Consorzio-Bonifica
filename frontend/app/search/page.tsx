import Link from 'next/link';
import { PageShell } from '../../components/page-shell';
import { SearchForm } from '../../components/search-form';
import { SectionCard } from '../../components/section-card';
import { getAuditEntitySummaries, searchAll } from '../../lib/api';
import { getOptionalSession } from '../../lib/auth';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
    type?: 'subject' | 'parcel';
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await getOptionalSession();
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? '';
  const requestedType = params.type;
  const results = query ? await searchAll(query) : { items: [], total: 0 };
  const subjectAuditSummaries = session
    ? await getAuditEntitySummaries(session.accessToken, {
        entityType: 'subject',
        entityIds: results.items.filter((item) => item.type === 'subject').map((item) => item.id),
      })
    : { items: [], total: 0 };
  const parcelAuditSummaries = session
    ? await getAuditEntitySummaries(session.accessToken, {
        entityType: 'parcel',
        entityIds: results.items.filter((item) => item.type === 'parcel').map((item) => item.id),
      })
    : { items: [], total: 0 };
  const subjectAuditSummaryMap = new Map(subjectAuditSummaries.items.map((item) => [item.entityId, item]));
  const parcelAuditSummaryMap = new Map(parcelAuditSummaries.items.map((item) => [item.entityId, item]));
  const subjectCount = results.items.filter((item) => item.type === 'subject').length;
  const parcelCount = results.items.filter((item) => item.type === 'parcel').length;
  const filteredItems = requestedType
    ? results.items.filter((item) => item.type === requestedType)
    : results.items;

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
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-wash)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                  Risultati totali
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--pcb-ink)]">{results.total}</p>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-wash)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                  Soggetti
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--pcb-ink)]">{subjectCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-wash)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                  Particelle
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--pcb-ink)]">{parcelCount}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
              >
                Tutti
              </Link>
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=subject`}
                className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
              >
                Solo soggetti
              </Link>
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=parcel`}
                className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
              >
                Solo particelle
              </Link>
            </div>

            {filteredItems.length === 0 ? (
              <p className="text-sm text-[var(--pcb-muted)]">
                Nessun risultato per il filtro selezionato.
              </p>
            ) : null}

            {filteredItems.map((item) => (
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
                {session ? (
                  <div className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-3">
                    <div>
                      <span className="font-medium text-[var(--pcb-ink)]">Eventi audit</span>
                      <p>
                        {(item.type === 'subject'
                          ? subjectAuditSummaryMap.get(item.id)?.total
                          : parcelAuditSummaryMap.get(item.id)?.total) ?? 0}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--pcb-ink)]">System operator</span>
                      <p>
                        {(item.type === 'subject'
                          ? subjectAuditSummaryMap.get(item.id)?.systemOperatorEvents
                          : parcelAuditSummaryMap.get(item.id)?.systemOperatorEvents) ?? 0}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--pcb-ink)]">Ultimo evento</span>
                      <p>
                        {(() => {
                          const latestCreatedAt =
                            item.type === 'subject'
                              ? subjectAuditSummaryMap.get(item.id)?.latestCreatedAt
                              : parcelAuditSummaryMap.get(item.id)?.latestCreatedAt;

                          return latestCreatedAt
                            ? new Date(latestCreatedAt).toLocaleString('it-IT')
                            : 'n/d';
                        })()}
                      </p>
                    </div>
                  </div>
                ) : null}
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
                    href={
                      item.type === 'subject'
                        ? `/audit?entityType=subject&entityId=${item.id}`
                        : `/audit?entityType=parcel&entityId=${item.id}`
                    }
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Audit contestuale
                  </Link>
                  {item.type === 'parcel' ? (
                    <Link
                      href="/operations"
                      className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                    >
                      Apri operations
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
