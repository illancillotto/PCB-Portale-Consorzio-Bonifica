import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import {
  getAuditEvents,
  getIngestionConnectors,
  getGisPublicationStatus,
  getGisSubjectParcelLinks,
  getIngestionConnectorIssues,
  getIngestionOrchestrationSummary,
  getIngestionRuns,
  getSystemIntegrations,
} from '../../lib/api';
import Link from 'next/link';

interface OperationsPageProps {
  searchParams?: Promise<{
    connectorOperationalStatus?: 'healthy' | 'warning' | 'critical';
    connectorTriggerMode?: 'manual' | 'scheduled';
    issueConnector?: string;
    issueSeverity?: 'warning' | 'critical';
    issueType?: string;
  }>;
}

function buildOperationsHref(filters: {
  connectorOperationalStatus?: 'healthy' | 'warning' | 'critical';
  connectorTriggerMode?: 'manual' | 'scheduled';
  issueConnector?: string;
  issueSeverity?: 'warning' | 'critical';
  issueType?: string;
}) {
  const params = new URLSearchParams();

  if (filters.connectorOperationalStatus) {
    params.set('connectorOperationalStatus', filters.connectorOperationalStatus);
  }

  if (filters.connectorTriggerMode) {
    params.set('connectorTriggerMode', filters.connectorTriggerMode);
  }

  if (filters.issueConnector) {
    params.set('issueConnector', filters.issueConnector);
  }

  if (filters.issueSeverity) {
    params.set('issueSeverity', filters.issueSeverity);
  }

  if (filters.issueType) {
    params.set('issueType', filters.issueType);
  }

  const queryString = params.toString();

  return queryString ? `/operations?${queryString}` : '/operations';
}

export default async function OperationsPage({ searchParams }: OperationsPageProps) {
  const session = await requireOperatorSession();
  const filters = (await searchParams) ?? {};
  const [
    integrations,
    ingestionRuns,
    connectors,
    connectorIssues,
    orchestrationSummary,
    auditEvents,
    publicationStatus,
    subjectParcelLinks,
  ] = await Promise.all([
      getSystemIntegrations(session.accessToken),
      getIngestionRuns(session.accessToken),
      getIngestionConnectors(session.accessToken, {
        operationalStatus: filters.connectorOperationalStatus,
        triggerMode: filters.connectorTriggerMode,
      }),
      getIngestionConnectorIssues(session.accessToken, {
        connectorName: filters.issueConnector,
        severity: filters.issueSeverity,
        issueType: filters.issueType,
      }),
      getIngestionOrchestrationSummary(session.accessToken),
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
            <p className="text-sm text-[var(--pcb-muted)]">Issue connector</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{connectorIssues.total}</p>
            {orchestrationSummary.criticalConnectorIssues > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3d2e]">
                {orchestrationSummary.criticalConnectorIssues} critiche
              </p>
            ) : null}
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

      <SectionCard title="Connector attention" eyebrow="Ingestion">
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector healthy</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.healthyConnectors}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Issue critiche</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.criticalConnectorIssues}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Issue warning</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.warningConnectorIssues}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Connector bloccati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.blockedConnectors}
            </p>
          </article>
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildOperationsHref({
              connectorOperationalStatus: filters.connectorOperationalStatus,
              connectorTriggerMode: filters.connectorTriggerMode,
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.issueConnector
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i connector
          </Link>
          {Array.from(new Set(connectorIssues.items.map((issue) => issue.connectorName))).map((connectorName) => (
            <Link
              key={connectorName}
              href={buildOperationsHref({
                connectorOperationalStatus: filters.connectorOperationalStatus,
                connectorTriggerMode: filters.connectorTriggerMode,
                issueConnector: connectorName,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.issueConnector === connectorName
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {connectorName}
            </Link>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildOperationsHref({
              connectorOperationalStatus: filters.connectorOperationalStatus,
              connectorTriggerMode: filters.connectorTriggerMode,
              issueConnector: filters.issueConnector,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.issueSeverity
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutte le severity
          </Link>
          {(['critical', 'warning'] as const).map((severity) => (
            <Link
              key={severity}
              href={buildOperationsHref({
                connectorOperationalStatus: filters.connectorOperationalStatus,
                connectorTriggerMode: filters.connectorTriggerMode,
                issueConnector: filters.issueConnector,
                issueSeverity: severity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.issueSeverity === severity
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {severity}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildOperationsHref({
              connectorOperationalStatus: filters.connectorOperationalStatus,
              connectorTriggerMode: filters.connectorTriggerMode,
              issueConnector: filters.issueConnector,
              issueSeverity: filters.issueSeverity,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.issueType
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i tipi
          </Link>
          {['not_configured', 'not_runnable', 'dry_run_only', 'latest_run_failed', 'no_completed_runs'].map(
            (issueType) => (
              <Link
                key={issueType}
                href={buildOperationsHref({
                  connectorOperationalStatus: filters.connectorOperationalStatus,
                  connectorTriggerMode: filters.connectorTriggerMode,
                  issueConnector: filters.issueConnector,
                  issueSeverity: filters.issueSeverity,
                  issueType,
                })}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                  filters.issueType === issueType
                    ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                    : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
                }`}
              >
                {issueType}
              </Link>
            ),
          )}
        </div>
        {connectorIssues.total === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessuna issue aperta sui connector registrati.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {connectorIssues.items.map((issue, index) => (
              <article
                key={`${issue.connectorName}-${issue.issueType}-${index}`}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--pcb-ink)]">{issue.displayName}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                      {issue.issueType}
                    </p>
                  </div>
                  <StatusChip label={issue.severity} />
                </div>
                <p className="mt-4 text-sm text-[var(--pcb-muted)]">{issue.detail}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link
                    href={`/ingestion/connectors/${issue.connectorName}`}
                    className="font-semibold text-[var(--pcb-accent)]"
                  >
                    Apri connector
                  </Link>
                  {issue.latestRunId ? (
                    <Link
                      href={`/ingestion/${issue.latestRunId}`}
                      className="font-semibold text-[var(--pcb-accent)]"
                    >
                      Ultima run
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Catalogo connector" eyebrow="Orchestration">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildOperationsHref({
              connectorTriggerMode: filters.connectorTriggerMode,
              issueConnector: filters.issueConnector,
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.connectorOperationalStatus
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti gli stati
          </Link>
          {(['critical', 'warning', 'healthy'] as const).map((operationalStatus) => (
            <Link
              key={operationalStatus}
              href={buildOperationsHref({
                connectorOperationalStatus: operationalStatus,
                connectorTriggerMode: filters.connectorTriggerMode,
                issueConnector: filters.issueConnector,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.connectorOperationalStatus === operationalStatus
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {operationalStatus}
            </Link>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={buildOperationsHref({
              connectorOperationalStatus: filters.connectorOperationalStatus,
              issueConnector: filters.issueConnector,
              issueSeverity: filters.issueSeverity,
              issueType: filters.issueType,
            })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.connectorTriggerMode
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti i trigger
          </Link>
          {(['manual', 'scheduled'] as const).map((triggerMode) => (
            <Link
              key={triggerMode}
              href={buildOperationsHref({
                connectorOperationalStatus: filters.connectorOperationalStatus,
                connectorTriggerMode: triggerMode,
                issueConnector: filters.issueConnector,
                issueSeverity: filters.issueSeverity,
                issueType: filters.issueType,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.connectorTriggerMode === triggerMode
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {triggerMode}
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {connectors.items.map((connector) => (
            <article
              key={connector.connectorName}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--pcb-ink)]">
                    {connector.displayName}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                    {connector.connectorName}
                  </p>
                </div>
                <StatusChip label={connector.operationalStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusChip label={connector.triggerMode} />
                <StatusChip label={connector.executionReadiness.runnable ? 'runnable' : 'blocked'} />
              </div>
              <p className="mt-4 text-sm text-[var(--pcb-muted)]">
                Issue aperte {connector.issueCounters.total} · critiche {connector.issueCounters.critical} ·
                warning {connector.issueCounters.warning}
              </p>
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">
                {connector.executionReadiness.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <Link
                  href={`/ingestion/connectors/${connector.connectorName}`}
                  className="font-semibold text-[var(--pcb-accent)]"
                >
                  Apri connector
                </Link>
                {connector.latestRun ? (
                  <Link
                    href={`/ingestion/${connector.latestRun.id}`}
                    className="font-semibold text-[var(--pcb-accent)]"
                  >
                    Ultima run
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
