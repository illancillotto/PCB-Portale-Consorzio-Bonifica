import Link from 'next/link';
import { PageShell } from '../../components/page-shell';
import { SearchForm } from '../../components/search-form';
import { SectionCard } from '../../components/section-card';
import { getAuditEntitySummaries, getParcels } from '../../lib/api';
import { getOptionalSession } from '../../lib/auth';

export default async function ParcelsPage() {
  const session = await getOptionalSession();
  const response = await getParcels();
  const auditSummaries = session
    ? await getAuditEntitySummaries(session.accessToken, {
        entityType: 'parcel',
        entityIds: response.items.map((parcel) => parcel.id),
      })
    : { items: [], total: 0 };
  const auditSummaryMap = new Map(auditSummaries.items.map((item) => [item.entityId, item]));

  return (
    <PageShell
      title="Particelle"
      description="Vista iniziale del dominio catasto con relazioni ai soggetti master già riconciliate nel database."
      actions={<SearchForm />}
    >
      <SectionCard title="Elenco particelle" eyebrow="Catasto">
        <div className="grid gap-4">
          {response.items.map((parcel) => (
            <article
              key={parcel.id}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">
                    {parcel.comune} · foglio {parcel.foglio} · particella {parcel.particella}
                    {parcel.subalterno ? ` · sub ${parcel.subalterno}` : ''}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--pcb-muted)]">Sorgente {parcel.sourceSystem}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                  {parcel.subjects.length} relazioni
                </span>
              </div>
              {session ? (
                <div className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-3">
                  <div>
                    <span className="font-medium text-[var(--pcb-ink)]">Eventi audit</span>
                    <p>{auditSummaryMap.get(parcel.id)?.total ?? 0}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--pcb-ink)]">System operator</span>
                    <p>{auditSummaryMap.get(parcel.id)?.systemOperatorEvents ?? 0}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--pcb-ink)]">Ultimo evento</span>
                    <p>
                      {auditSummaryMap.get(parcel.id)?.latestCreatedAt
                        ? new Date(auditSummaryMap.get(parcel.id)!.latestCreatedAt!).toLocaleString('it-IT')
                        : 'n/d'}
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/parcels/${parcel.id}`}
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                >
                  Apri scheda
                </Link>
                <Link
                  href={`/gis?parcelId=${parcel.id}&preset=catasto&layers=pcb_subject_parcel_links,pcb_parcels`}
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                >
                  Apri GIS
                </Link>
                <Link
                  href={`/audit?entityType=parcel&entityId=${parcel.id}`}
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                >
                  Audit particella
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
