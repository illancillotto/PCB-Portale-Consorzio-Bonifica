import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '../../../components/page-shell';
import { SectionCard } from '../../../components/section-card';
import { getParcel } from '../../../lib/api';

interface ParcelDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ParcelDetailPage({ params }: ParcelDetailPageProps) {
  const { id } = await params;

  let parcel;

  try {
    parcel = await getParcel(id);
  } catch {
    notFound();
  }

  return (
    <PageShell
      title={`${parcel.comune} · foglio ${parcel.foglio} · particella ${parcel.particella}`}
      description="Vista particella con relazioni soggetto-particella provenienti dal dominio catasto."
      actions={
        <div className="rounded-[24px] border border-[var(--pcb-line)] bg-[#f8f6f0] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-accent)]">
            Sorgente
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--pcb-ink)]">{parcel.sourceSystem}</p>
          <Link
            href={`/gis?parcelId=${parcel.id}`}
            className="mt-4 inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
          >
            Apri focus GIS
          </Link>
          <div className="mt-4 grid gap-2">
            <Link
              href={`/gis?parcelId=${parcel.id}&preset=catasto&layers=pcb_subject_parcel_links,pcb_parcels`}
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Preset catasto
            </Link>
            <Link
              href={`/gis?parcelId=${parcel.id}&preset=relazioni&layers=pcb_subject_parcel_links`}
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Preset relazioni
            </Link>
            <Link
              href={`/audit?entityType=parcel&entityId=${parcel.id}`}
              className="inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
            >
              Audit particella
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
      <SectionCard title="Dati catastali" eyebrow="Parcel">
        <dl className="grid gap-4 text-sm text-[var(--pcb-muted)] md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em]">Comune</dt>
            <dd className="mt-2 text-base font-semibold text-[var(--pcb-ink)]">{parcel.comune}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em]">Foglio</dt>
            <dd className="mt-2 text-base font-semibold text-[var(--pcb-ink)]">{parcel.foglio}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em]">Particella</dt>
            <dd className="mt-2 text-base font-semibold text-[var(--pcb-ink)]">{parcel.particella}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em]">Subalterno</dt>
            <dd className="mt-2 text-base font-semibold text-[var(--pcb-ink)]">
              {parcel.subalterno ?? 'Non presente'}
            </dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Soggetti collegati" eyebrow="Relations">
        {parcel.subjects.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessun soggetto collegato alla particella corrente.</p>
        ) : (
          <div className="grid gap-4">
            {parcel.subjects.map((subject) => (
              <Link
                key={subject.subjectId}
                href={`/subjects/${subject.subjectId}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{subject.displayName}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                    {subject.relationType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--pcb-muted)]">CUUA {subject.cuua}</p>
                <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                  {subject.title ?? 'Titolo non specificato'}
                  {subject.quota !== null ? ` · quota ${subject.quota}` : ''}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                  Apri scheda soggetto
                </p>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
