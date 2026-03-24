import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '../../../components/page-shell';
import { SectionCard } from '../../../components/section-card';
import { StatusChip } from '../../../components/status-chip';
import { getAuditSummary, getSubject, getSubjectParcels } from '../../../lib/api';
import { requireOperatorSession } from '../../../lib/auth';

interface SubjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = await params;
  const session = await requireOperatorSession(`/subjects/${id}`);

  let subject;
  let parcels;
  let auditSummary;

  try {
    [subject, parcels, auditSummary] = await Promise.all([
      getSubject(id),
      getSubjectParcels(id),
      getAuditSummary(session.accessToken, {
        entityType: 'subject',
        entityId: id,
      }),
    ]);
  } catch {
    notFound();
  }

  return (
    <PageShell
      title={subject.currentDisplayName}
      description={`Scheda soggetto master collegata al CUUA ${subject.cuua}. La pagina usa storico anagrafico e relazioni catastali reali.`}
      actions={
        <div className="rounded-[24px] border border-[var(--pcb-line)] bg-[#f8f6f0] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-accent)]">
            Chiave di business
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--pcb-ink)]">{subject.cuua}</p>
          <div className="mt-4">
            <StatusChip label={subject.status} />
          </div>
          <Link
            href={`/gis?subjectId=${subject.id}`}
            className="mt-4 inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
          >
            Apri focus GIS
          </Link>
          <div className="mt-4 grid gap-2">
            <Link
              href={`/gis?subjectId=${subject.id}&preset=relazioni&layers=pcb_subject_parcel_links`}
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Preset relazioni
            </Link>
            <Link
              href={`/gis?subjectId=${subject.id}&preset=soggetti&layers=pcb_subjects`}
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Preset soggetti
            </Link>
            <Link
              href={`/audit?entityType=subject&entityId=${subject.id}`}
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Audit soggetto
            </Link>
            <Link
              href="/operations"
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Operations
            </Link>
          </div>
        </div>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Identificativi" eyebrow="Anagrafe">
          <div className="grid gap-3">
            {subject.identifiers.map((identifier) => (
              <div key={`${identifier.type}-${identifier.value}`} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                  {identifier.type}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--pcb-ink)]">{identifier.value}</p>
                <p className="mt-1 text-xs text-[var(--pcb-muted)]">Sorgente {identifier.sourceSystem}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Storico nominativi" eyebrow="History">
          <div className="grid gap-3">
            {subject.nameHistory.map((item) => (
              <div key={`${item.displayName}-${item.validFrom}`} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--pcb-ink)]">{item.displayName}</p>
                <p className="mt-1 text-xs text-[var(--pcb-muted)]">Sorgente {item.sourceSystem}</p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  Dal {new Date(item.validFrom).toLocaleString('it-IT')}
                  {item.validTo ? ` al ${new Date(item.validTo).toLocaleString('it-IT')}` : ' · attuale'}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Contesto audit" eyebrow="Audit">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Eventi soggetto</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{auditSummary.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">System operator</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {auditSummary.systemOperatorEvents}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultimo evento</p>
            <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
              {auditSummary.latestCreatedAt
                ? new Date(auditSummary.latestCreatedAt).toLocaleString('it-IT')
                : 'n/d'}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Moduli coinvolti</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {auditSummary.bySourceModule.length}
            </p>
          </article>
        </div>
      </SectionCard>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Sorgenti collegate" eyebrow="Sources">
          {subject.sourceLinks.length === 0 ? (
            <p className="text-sm text-[var(--pcb-muted)]">Nessun source link disponibile per il soggetto corrente.</p>
          ) : (
            <div className="grid gap-3">
              {subject.sourceLinks.map((link) => (
                <div
                  key={`${link.sourceSystem}-${link.sourceRecordId}`}
                  className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm font-semibold text-[var(--pcb-ink)]">{link.sourceSystem}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                      {link.isActive ? 'active' : 'inactive'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--pcb-muted)]">Record {link.sourceRecordId}</p>
                  {link.sourceUrl ? (
                    <p className="mt-1 break-all text-xs text-[var(--pcb-muted)]">{link.sourceUrl}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                    Prima vista {new Date(link.firstSeenAt).toLocaleString('it-IT')} · ultima vista{' '}
                    {new Date(link.lastSeenAt).toLocaleString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Documenti collegati" eyebrow="Documentale">
          {subject.documents.length === 0 ? (
            <p className="text-sm text-[var(--pcb-muted)]">Nessun documento collegato per il soggetto corrente.</p>
          ) : (
            <div className="grid gap-3">
              {subject.documents.map((document) => (
                <div key={document.id} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
                  <p className="text-sm font-semibold text-[var(--pcb-ink)]">{document.fileName}</p>
                  <p className="mt-1 text-xs text-[var(--pcb-muted)]">Sorgente {document.sourceSystem}</p>
                  <p className="mt-2 break-all text-xs text-[var(--pcb-muted)]">{document.filePath}</p>
                  <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                    {document.archiveBucket ?? 'bucket non definito'}
                    {document.mimeType ? ` · ${document.mimeType}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-[var(--pcb-muted)]">
                    Rilevato {new Date(document.discoveredAt).toLocaleString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      <SectionCard title="Relazioni catastali" eyebrow="Catasto">
        {parcels.parcels.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessuna particella collegata per il soggetto corrente.</p>
        ) : (
          <div className="grid gap-4">
            {parcels.parcels.map((parcel) => (
              <Link
                key={parcel.parcelId}
                href={`/parcels/${parcel.parcelId}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">
                    {parcel.comune} · foglio {parcel.foglio} · particella {parcel.particella}
                    {parcel.subalterno ? ` · sub ${parcel.subalterno}` : ''}
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                    {parcel.relationType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                  {parcel.title ?? 'Titolo non specificato'}
                  {parcel.quota !== null ? ` · quota ${parcel.quota}` : ''}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                  Apri scheda particella
                </p>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
