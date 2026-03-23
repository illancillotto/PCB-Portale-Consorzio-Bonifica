import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { requireOperatorSession } from '../../lib/auth';
import { getAuditEvents } from '../../lib/api';
import Link from 'next/link';

function readPayloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === 'string' && value.length > 0 ? value : null;
}

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

function resolveAuditLinks(event: {
  sourceModule: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
}) {
  const links: Array<{ href: string; label: string }> = [];
  const ingestionRunId =
    readPayloadString(event.payload, 'ingestionRunId') ||
    (event.entityType === 'ingestion_run' ? event.entityId : null);
  const matchedSubjectId = readPayloadString(event.payload, 'matchedSubjectId');
  const assignedSubjectId = readPayloadString(event.payload, 'assignedSubjectId');
  const subjectId =
    assignedSubjectId ||
    matchedSubjectId ||
    (event.entityType === 'subject' || event.entityType === 'master_subject' ? event.entityId : null);

  if (ingestionRunId) {
    links.push({
      href: `/ingestion/${ingestionRunId}`,
      label: 'Apri run',
    });
  }

  if (subjectId) {
    links.push({
      href: `/subjects/${subjectId}`,
      label: 'Apri soggetto',
    });
  }

  if (event.sourceModule === 'ingest') {
    links.push({
      href: '/ingestion',
      label: 'Modulo ingestion',
    });
  }

  if (event.sourceModule === 'audit') {
    links.push({
      href: '/operations',
      label: 'Operations',
    });
  }

  return links;
}

interface AuditPageProps {
  searchParams?: Promise<{
    eventType?: string;
    actorType?: string;
  }>;
}

function buildAuditFilterHref(filters: { eventType?: string; actorType?: string }) {
  const params = new URLSearchParams();

  if (filters.eventType) {
    params.set('eventType', filters.eventType);
  }

  if (filters.actorType) {
    params.set('actorType', filters.actorType);
  }

  const queryString = params.toString();

  return queryString ? `/audit?${queryString}` : '/audit';
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const session = await requireOperatorSession();
  const filters = (await searchParams) ?? {};
  const events = await getAuditEvents(session.accessToken);
  const filteredEvents = events.items.filter((event) => {
    if (filters.eventType && event.eventType !== filters.eventType) {
      return false;
    }

    if (filters.actorType && event.actorType !== filters.actorType) {
      return false;
    }

    return true;
  });
  const uniqueEventTypes = Array.from(new Set(events.items.map((event) => event.eventType))).sort();
  const uniqueActorTypes = Array.from(new Set(events.items.map((event) => event.actorType))).sort();
  const systemEvents = events.items.filter((event) => event.actorType === 'system').length;
  const operatorEvents = events.items.filter((event) => event.actorType === 'system_operator').length;

  return (
    <PageShell
      title="Audit trail"
      description="Eventi operativi e decisioni manuali tracciati dal backend PCB. Vista riservata a operatori autenticati."
    >
      <SectionCard title="Riepilogo audit" eyebrow="Summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Eventi totali</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{events.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">System</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{systemEvents}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">System operator</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{operatorEvents}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultimo evento</p>
            <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
              {events.items[0] ? new Date(events.items[0].createdAt).toLocaleString('it-IT') : 'n/d'}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Eventi recenti" eyebrow="Audit">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildAuditFilterHref({ actorType: filters.actorType })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.eventType
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti gli eventi
          </Link>
          {uniqueEventTypes.map((eventType) => (
            <Link
              key={eventType}
              href={buildAuditFilterHref({ eventType, actorType: filters.actorType })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.eventType === eventType
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {eventType}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildAuditFilterHref({ eventType: filters.eventType })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.actorType
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti gli attori
          </Link>
          {uniqueActorTypes.map((actorType) => (
            <Link
              key={actorType}
              href={buildAuditFilterHref({ eventType: filters.eventType, actorType })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.actorType === actorType
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {actorType}
            </Link>
          ))}
        </div>
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessun evento disponibile.</p>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => {
              const resolvedLinks = resolveAuditLinks(event);

              return (
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
                {resolvedLinks.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {resolvedLinks.map((link) => (
                      <Link
                        key={`${event.id}-${link.href}-${link.label}`}
                        href={link.href}
                        className="font-semibold text-[var(--pcb-accent)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
