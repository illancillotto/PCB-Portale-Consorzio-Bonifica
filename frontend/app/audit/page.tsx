import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { requireOperatorSession } from '../../lib/auth';
import { getAuditEvents } from '../../lib/api';

function formatPayload(payload: Record<string, unknown>) {
  const entries = Object.entries(payload);

  if (entries.length === 0) {
    return 'Nessun payload.';
  }

  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ');
}

export default async function AuditPage() {
  const session = await requireOperatorSession();
  const events = await getAuditEvents(session.accessToken);

  return (
    <PageShell
      title="Audit trail"
      description="Eventi operativi e decisioni manuali tracciati dal backend PCB. Vista riservata a operatori autenticati."
    >
      <SectionCard title="Eventi recenti" eyebrow="Audit">
        {events.items.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessun evento disponibile.</p>
        ) : (
          <div className="grid gap-4">
            {events.items.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--pcb-ink)]">
                      {event.eventType}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                      {event.entityType} · {event.entityId}
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                    {new Date(event.createdAt).toLocaleString('it-IT')}
                  </p>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Attore</dt>
                    <dd>
                      {event.actorType}
                      {event.actorId ? ` · ${event.actorId}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Event ID</dt>
                    <dd className="break-all">{event.id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Payload</dt>
                    <dd>{formatPayload(event.payload)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
