import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import {
  getAuditEvents,
  getGisPublicationStatus,
  getGisSubjectParcelLinks,
  getIngestionRuns,
  getSystemIntegrations,
} from '../../lib/api';
import Link from 'next/link';

export default async function OperationsPage() {
  const session = await requireOperatorSession();
  const [integrations, ingestionRuns, auditEvents, publicationStatus, subjectParcelLinks] =
    await Promise.all([
      getSystemIntegrations(session.accessToken),
      getIngestionRuns(session.accessToken),
      getAuditEvents(session.accessToken),
      getGisPublicationStatus(session.accessToken),
      getGisSubjectParcelLinks(session.accessToken),
    ]);
  const queuedRuns = ingestionRuns.items.filter((run) => run.status === 'queued').length;
  const failedRuns = ingestionRuns.items.filter((run) => run.status === 'failed').length;
  const systemOperatorAuditEvents = auditEvents.items.filter(
    (event) => event.actorType === 'system_operator',
  ).length;

  return (
    <PageShell
      title="Operations"
      description="Stato operativo centralizzato delle integrazioni core del Portale Consorzio Bonifica."
    >
      <SectionCard title="Riepilogo operativo" eyebrow="Overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Integrazioni OK</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {integrations.items.filter((item) => item.statusLabel === 'ok').length}/
              {integrations.items.length}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Run ingestione in coda</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{queuedRuns}</p>
            {failedRuns > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3d2e]">
                {failedRuns} run fallite
              </p>
            ) : null}
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Audit system operator</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {systemOperatorAuditEvents}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Relazioni GIS</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {subjectParcelLinks.total}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
              QGIS {publicationStatus.statusLabel}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Preset GIS" eyebrow="Shortcuts">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/gis?preset=completo"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
          >
            Vista completa
          </Link>
          <Link
            href="/gis?preset=relazioni&layers=pcb_subject_parcel_links"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
          >
            Solo relazioni
          </Link>
          <Link
            href="/gis?preset=catasto&layers=pcb_subject_parcel_links,pcb_parcels"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
          >
            Preset catasto
          </Link>
          <Link
            href="/gis?preset=soggetti&layers=pcb_subjects"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 text-sm font-semibold text-[var(--pcb-ink)] transition hover:-translate-y-0.5"
          >
            Focus soggetti
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Integrazioni runtime" eyebrow="System">
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.items.map((item) => (
            <article key={item.key} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--pcb-ink)]">{item.label}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                    {item.key}
                  </p>
                </div>
                <StatusChip label={item.statusLabel} />
              </div>
              <p className="mt-4 text-sm text-[var(--pcb-muted)]">
                {item.configured ? 'Configurazione presente' : 'Configurazione assente'}
              </p>
              {item.detail ? (
                <p className="mt-2 break-all text-xs text-[var(--pcb-muted)]">{item.detail}</p>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--pcb-muted)]">
          Ultimo controllo {new Date(integrations.checkedAt).toLocaleString('it-IT')}
        </p>
      </SectionCard>
    </PageShell>
  );
}
