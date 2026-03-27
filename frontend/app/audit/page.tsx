import { PageShell } from '../../components/page-shell';
import { EmptyState } from '../../components/empty-state';
import { ServerApiErrorState } from '../../components/server-api-error-state';
import { SectionCard } from '../../components/section-card';
import { requireOperatorSession } from '../../lib/auth';
import { getAuditEvents, getAuditSummary, isApiError } from '../../lib/api';
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
    sourceModule?: string;
    entityType?: string;
    entityId?: string;
  }>;
}

function buildAuditFilterHref(filters: {
  eventType?: string;
  actorType?: string;
  sourceModule?: string;
  entityType?: string;
  entityId?: string;
}) {
  const params = new URLSearchParams();

  if (filters.eventType) {
    params.set('eventType', filters.eventType);
  }

  if (filters.actorType) {
    params.set('actorType', filters.actorType);
  }

  if (filters.sourceModule) {
    params.set('sourceModule', filters.sourceModule);
  }

  if (filters.entityType) {
    params.set('entityType', filters.entityType);
  }

  if (filters.entityId) {
    params.set('entityId', filters.entityId);
  }

  const queryString = params.toString();

  return queryString ? `/audit?${queryString}` : '/audit';
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const session = await requireOperatorSession('/audit');
  const filters = (await searchParams) ?? {};
  let events;
  let summary;

  try {
    [events, summary] = await Promise.all([
      getAuditEvents(session.accessToken, filters),
      getAuditSummary(session.accessToken, filters),
    ]);
  } catch (error) {
    if (isApiError(error)) {
      return (
        <PageShell
          title="Audit trail"
          description="Eventi operativi e decisioni manuali tracciati dal backend PCB. Vista riservata a operatori autenticati."
        >
          <ServerApiErrorState
            error={error}
            helpTopic="audit"
            primaryAction={{ href: '/audit', label: 'Ricarica audit' }}
            secondaryAction={{ href: '/operations', label: 'Apri operations' }}
          />
        </PageShell>
      );
    }

    throw error;
  }
  const filteredEvents = events.items;
  const uniqueEventTypes = Array.from(new Set(events.items.map((event) => event.eventType))).sort();
  const uniqueActorTypes = Array.from(new Set(events.items.map((event) => event.actorType))).sort();
  const activeFilters = [
    filters.eventType ? `evento: ${filters.eventType}` : null,
    filters.actorType ? `attore: ${filters.actorType}` : null,
    filters.sourceModule ? `modulo: ${filters.sourceModule}` : null,
    filters.entityType ? `entita': ${filters.entityType}` : null,
    filters.entityId ? `id: ${filters.entityId}` : null,
  ].filter(Boolean);

  return (
    <PageShell
      title="Audit trail"
      description="Eventi operativi e decisioni manuali tracciati dal backend PCB. Vista riservata a operatori autenticati."
    >
      <SectionCard title="Supporto operativo" eyebrow="Help">
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/operations/help?topic=audit"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Operations help</strong>
            Apri checklist, escalation e riferimenti documentali.
          </Link>
          <Link
            href="/operations/help?topic=audit"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Escalation verso audit</strong>
            Usa i segnali di escalation per correlare run, entita` e requestId.
          </Link>
          <Link
            href="/operations"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Torna a operations</strong>
            Riapri summary runtime e collegamenti cross-domain.
          </Link>
        </div>
      </SectionCard>

      {activeFilters.length > 0 ? (
        <SectionCard title="Contesto attivo" eyebrow="Filters">
          <div className="flex flex-wrap gap-3">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="rounded-full border border-[var(--pcb-line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
              >
                {filter}
              </span>
            ))}
            <Link
              href="/audit"
              className="rounded-full border border-[var(--pcb-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]"
            >
              Azzera filtri
            </Link>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Riepilogo audit" eyebrow="Summary">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href={buildAuditFilterHref({
              actorType: filters.actorType,
              eventType: filters.eventType,
              sourceModule: filters.sourceModule,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Eventi totali</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{summary.total}</p>
          </Link>
          <Link
            href={buildAuditFilterHref({
              actorType: 'system',
              eventType: filters.eventType,
              sourceModule: filters.sourceModule,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">System</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{summary.systemEvents}</p>
          </Link>
          <Link
            href={buildAuditFilterHref({
              actorType: 'system_operator',
              eventType: filters.eventType,
              sourceModule: filters.sourceModule,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">System operator</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{summary.systemOperatorEvents}</p>
          </Link>
          <Link
            href={buildAuditFilterHref({
              actorType: filters.actorType,
              eventType: filters.eventType,
              sourceModule: filters.sourceModule,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Ultimo evento</p>
            <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
              {summary.latestCreatedAt ? new Date(summary.latestCreatedAt).toLocaleString('it-IT') : 'n/d'}
            </p>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Moduli sorgente" eyebrow="Source modules">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.bySourceModule.map((item) => (
            <Link
              key={item.sourceModule}
              href={buildAuditFilterHref({
                eventType: filters.eventType,
                actorType: filters.actorType,
                sourceModule: item.sourceModule,
                entityType: filters.entityType,
                entityId: filters.entityId,
              })}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
            >
              <p className="text-sm text-[var(--pcb-muted)]">{item.sourceModule}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{item.total}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Eventi recenti" eyebrow="Audit">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildAuditFilterHref({
              actorType: filters.actorType,
              sourceModule: filters.sourceModule,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
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
              href={buildAuditFilterHref({
                eventType,
                actorType: filters.actorType,
                sourceModule: filters.sourceModule,
                entityType: filters.entityType,
                entityId: filters.entityId,
              })}
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
            href={buildAuditFilterHref({
              eventType: filters.eventType,
              sourceModule: filters.sourceModule,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
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
              href={buildAuditFilterHref({
                eventType: filters.eventType,
                actorType,
                sourceModule: filters.sourceModule,
                entityType: filters.entityType,
                entityId: filters.entityId,
              })}
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
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildAuditFilterHref({
              eventType: filters.eventType,
              actorType: filters.actorType,
              entityType: filters.entityType,
              entityId: filters.entityId,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.sourceModule
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i moduli
          </Link>
          {summary.bySourceModule.map((item) => (
            <Link
              key={item.sourceModule}
              href={buildAuditFilterHref({
                eventType: filters.eventType,
                actorType: filters.actorType,
                sourceModule: item.sourceModule,
                entityType: filters.entityType,
                entityId: filters.entityId,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.sourceModule === item.sourceModule
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {item.sourceModule}
            </Link>
          ))}
        </div>
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="Nessun evento audit disponibile"
            description="I filtri correnti non restituiscono eventi tracciati nel dominio audit."
            actionHref="/audit"
            actionLabel="Azzera filtri"
          />
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
