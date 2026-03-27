import { PageShell } from '../../components/page-shell';
import { ServerApiErrorState } from '../../components/server-api-error-state';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import {
  getAuditSummary,
  getIngestionConnectors,
  getGisPublicationStatus,
  getGisSubjectParcelLinks,
  getIngestionConnectorIssues,
  getIngestionOrchestrationSummary,
  getIngestionRuns,
  isApiError,
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

interface PipelineAttentionLink {
  key: string;
  label: string;
  stage: 'raw' | 'normalized' | 'matching';
  total: number;
  href: string;
}

interface DiagnosticLink {
  label: string;
  href: string;
}

interface DiagnosticCommand {
  label: string;
  command: string;
}

interface OperationsTriageItem {
  key: string;
  label: string;
  total: number | string;
  detail: string;
  href: string;
  tone: 'critical' | 'warning' | 'neutral';
}

const frontendBaseUrl = process.env.PCB_FRONTEND_BASE_URL ?? 'http://127.0.0.1:3010';
const backendBaseUrl = process.env.PCB_API_BASE_URL ?? 'http://127.0.0.1:5010/api/v1';
const keycloakBaseUrl = process.env.PCB_KEYCLOAK_URL ?? 'http://localhost:8180';
const qgisBaseUrl = process.env.PCB_QGIS_SERVER_URL ?? 'http://localhost:8090/ows/';

const diagnosticLinks: DiagnosticLink[] = [
  {
    label: 'Frontend login',
    href: `${frontendBaseUrl}/login`,
  },
  {
    label: 'Backend health',
    href: `${backendBaseUrl}/health`,
  },
  {
    label: 'Keycloak discovery',
    href: `${keycloakBaseUrl}/realms/pcb/.well-known/openid-configuration`,
  },
  {
    label: 'QGIS GetCapabilities',
    href: `${qgisBaseUrl}?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs`,
  },
];

const diagnosticCommands: DiagnosticCommand[] = [
  {
    label: 'Bootstrap locale completo',
    command: 'npm run dev:up',
  },
  {
    label: 'Suite completa di verifica',
    command: 'npm run dev:verify',
  },
  {
    label: 'Smoke ingestion',
    command: 'npm run dev:smoke:ingestion',
  },
  {
    label: 'Stato stack Docker',
    command: 'docker compose ps',
  },
];

function triageToneClasses(tone: OperationsTriageItem['tone']) {
  if (tone === 'critical') {
    return 'border-rose-200 bg-rose-50';
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50';
  }

  return 'border-[var(--pcb-line)] bg-white';
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

function buildIngestionOutcomeHref(filters: {
  rawOutcomeCode?: string;
  normalizedOutcomeCode?: string;
  matchingOutcomeCode?: string;
  acquisitionStage?: 'queued' | 'running' | 'completed' | 'failed';
  postProcessingStage?: 'not_configured' | 'queued' | 'running' | 'completed' | 'failed';
  normalizationStage?: 'not_started' | 'running' | 'completed' | 'failed';
  matchingStage?: 'not_started' | 'running' | 'completed' | 'failed';
  status?: string;
}) {
  const params = new URLSearchParams();

  if (filters.rawOutcomeCode) {
    params.set('rawOutcomeCode', filters.rawOutcomeCode);
  }

  if (filters.normalizedOutcomeCode) {
    params.set('normalizedOutcomeCode', filters.normalizedOutcomeCode);
  }

  if (filters.matchingOutcomeCode) {
    params.set('matchingOutcomeCode', filters.matchingOutcomeCode);
  }

  if (filters.acquisitionStage) {
    params.set('acquisitionStage', filters.acquisitionStage);
  }

  if (filters.postProcessingStage) {
    params.set('postProcessingStage', filters.postProcessingStage);
  }

  if (filters.normalizationStage) {
    params.set('normalizationStage', filters.normalizationStage);
  }

  if (filters.matchingStage) {
    params.set('matchingStage', filters.matchingStage);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  const queryString = params.toString();
  return queryString ? `/ingestion?${queryString}` : '/ingestion';
}

function buildPipelineAttentionLinks(summary: {
  rawOutcomeCounters: Record<string, number>;
  normalizedOutcomeCounters: Record<string, number>;
  matchingOutcomeCounters: Record<string, number>;
}) {
  const items: PipelineAttentionLink[] = [
    {
      key: 'raw.file_without_subject_hint',
      label: 'File raw senza subject hint',
      stage: 'raw',
      total: summary.rawOutcomeCounters['raw.file_without_subject_hint'] ?? 0,
      href: buildIngestionOutcomeHref({ rawOutcomeCode: 'raw.file_without_subject_hint' }),
    },
    {
      key: 'raw.directory_structure_only',
      label: 'Directory raw senza bucket o soggetto',
      stage: 'raw',
      total: summary.rawOutcomeCounters['raw.directory_structure_only'] ?? 0,
      href: buildIngestionOutcomeHref({ rawOutcomeCode: 'raw.directory_structure_only' }),
    },
    {
      key: 'normalize.document_without_subject_hint',
      label: 'Normalized senza subject hint',
      stage: 'normalized',
      total: summary.normalizedOutcomeCounters['normalize.document_without_subject_hint'] ?? 0,
      href: buildIngestionOutcomeHref({
        normalizedOutcomeCode: 'normalize.document_without_subject_hint',
        normalizationStage: 'completed',
      }),
    },
    {
      key: 'match.review_required',
      label: 'Matching in review',
      stage: 'matching',
      total: summary.matchingOutcomeCounters['match.review_required'] ?? 0,
      href: buildIngestionOutcomeHref({
        matchingOutcomeCode: 'match.review_required',
        matchingStage: 'completed',
      }),
    },
    {
      key: 'match.unmatched_no_candidate',
      label: 'Matching senza candidato',
      stage: 'matching',
      total: summary.matchingOutcomeCounters['match.unmatched_no_candidate'] ?? 0,
      href: buildIngestionOutcomeHref({
        matchingOutcomeCode: 'match.unmatched_no_candidate',
        matchingStage: 'completed',
      }),
    },
    {
      key: 'match.manually_rejected',
      label: 'Matching respinti manualmente',
      stage: 'matching',
      total: summary.matchingOutcomeCounters['match.manually_rejected'] ?? 0,
      href: buildIngestionOutcomeHref({
        matchingOutcomeCode: 'match.manually_rejected',
        matchingStage: 'completed',
      }),
    },
  ];

  return items
    .filter((item) => item.total > 0)
    .sort((left, right) => right.total - left.total || left.label.localeCompare(right.label));
}

export default async function OperationsPage({ searchParams }: OperationsPageProps) {
  const session = await requireOperatorSession('/operations');
  const filters = (await searchParams) ?? {};
  let integrations;
  let ingestionRuns;
  let connectors;
  let connectorIssues;
  let orchestrationSummary;
  let auditSummary;
  let publicationStatus;
  let subjectParcelLinks;

  try {
    [
      integrations,
      ingestionRuns,
      connectors,
      connectorIssues,
      orchestrationSummary,
      auditSummary,
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
        getAuditSummary(session.accessToken),
        getGisPublicationStatus(session.accessToken),
        getGisSubjectParcelLinks(session.accessToken),
      ]);
  } catch (error) {
    if (isApiError(error)) {
      return (
        <PageShell
          title="Operations"
          description="Stato operativo centralizzato delle integrazioni core del Portale Consorzio Bonifica."
        >
          <ServerApiErrorState
            error={error}
            primaryAction={{ href: buildOperationsHref(filters), label: 'Ricarica operations' }}
            secondaryAction={{ href: '/ingestion', label: 'Apri ingestion' }}
          />
        </PageShell>
      );
    }

    throw error;
  }
  const queuedRuns = ingestionRuns.items.filter((run) => run.status === 'queued').length;
  const failedRuns = ingestionRuns.items.filter((run) => run.status === 'failed').length;
  const latestFailedRun = ingestionRuns.items.find((run) => run.status === 'failed') ?? null;
  const latestQueuedRun = ingestionRuns.items.find((run) => run.status === 'queued') ?? null;
  const latestReviewRun =
    ingestionRuns.items.find(
      (run) =>
        run.status !== 'failed' &&
        (run.stages.matching.status === 'completed' || run.stages.postProcessing.status === 'completed'),
    ) ?? null;
  const pipelineAttentionLinks = buildPipelineAttentionLinks(orchestrationSummary);
  const degradedIntegrations = integrations.items.filter((item) => item.statusLabel !== 'ok').length;
  const triageItems: OperationsTriageItem[] = [
    {
      key: 'runtime',
      label: 'Runtime degradato',
      total: degradedIntegrations,
      detail: 'Servizi non OK tra PostgreSQL, Redis, Keycloak e QGIS.',
      href: '#runtime-integrations',
      tone: degradedIntegrations > 0 ? 'critical' : 'neutral',
    },
    {
      key: 'connector-issues',
      label: 'Issue connector',
      total: connectorIssues.total,
      detail: 'Feed operativo per NAS non eseguibile, failure recenti e problemi di configurazione.',
      href: '#connector-attention',
      tone:
        orchestrationSummary.criticalConnectorIssues > 0
          ? 'critical'
          : connectorIssues.total > 0
            ? 'warning'
            : 'neutral',
    },
    {
      key: 'queued-runs',
      label: 'Run da seguire',
      total: queuedRuns + failedRuns,
      detail: 'Somma di run in coda e fallite che richiedono triage o follow-up operativo.',
      href: queuedRuns > 0 ? '/ingestion?status=queued' : failedRuns > 0 ? '/ingestion?status=failed' : '/ingestion',
      tone: failedRuns > 0 ? 'critical' : queuedRuns > 0 ? 'warning' : 'neutral',
    },
    {
      key: 'gis-status',
      label: 'Publication GIS',
      total: publicationStatus.statusLabel,
      detail: 'Stato del publication target QGIS e disponibilita` delle relazioni cartografiche.',
      href: publicationStatus.available ? '/gis' : '/operations/help?topic=gis',
      tone: publicationStatus.available ? 'neutral' : 'warning',
    },
  ];

  return (
    <PageShell
      title="Operations"
      description="Stato operativo centralizzato delle integrazioni core del Portale Consorzio Bonifica."
    >
      <SectionCard title="Triage rapido" eyebrow="Overview">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {triageItems.map((item) => (
              <article
                key={item.key}
                className={`rounded-2xl border p-5 ${triageToneClasses(item.tone)}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
                  {item.label}
                </p>
                <p className="mt-3 text-4xl font-semibold text-[var(--pcb-ink)]">{item.total}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--pcb-muted)]">{item.detail}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex rounded-full border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                >
                  Apri focus
                </Link>
              </article>
            ))}
          </div>

          <div className="grid gap-4">
            <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
                Supporto operativo
              </p>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/operations/help"
                  className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-wash)] p-4 text-sm text-[var(--pcb-muted)]"
                >
                  <strong className="block text-[var(--pcb-ink)]">Help center</strong>
                  Apri runbook, smoke, known issues e API surface gia` focalizzati sul triage.
                </Link>
                <Link
                  href="/ingestion"
                  className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-wash)] p-4 text-sm text-[var(--pcb-muted)]"
                >
                  <strong className="block text-[var(--pcb-ink)]">Apri ingestion</strong>
                  Vai subito al monitor pipeline per seguire run, issue e review queue.
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
                Quick diagnostics
              </p>
              <div className="mt-4 grid gap-3">
                {diagnosticCommands.slice(0, 3).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-wash)] px-4 py-3 text-sm text-[var(--pcb-muted)]"
                  >
                    <strong className="block text-[var(--pcb-ink)]">{item.label}</strong>
                    <code className="mt-2 block break-all text-xs text-[var(--pcb-muted)]">
                      {item.command}
                    </code>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Pulse operativo" eyebrow="Summary">
        <div className="grid gap-4 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
              Integrazioni
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--pcb-ink)]">
              {integrations.items.filter((item) => item.statusLabel === 'ok').length}/{integrations.items.length}
            </p>
            <p className="mt-3 text-sm text-[var(--pcb-muted)]">Servizi runtime in stato OK.</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
              Ingestion
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--pcb-ink)]">{queuedRuns}</p>
            <p className="mt-3 text-sm text-[var(--pcb-muted)]">
              run queued · {failedRuns} fallite · review queue {orchestrationSummary.reviewQueue}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
              Audit
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--pcb-ink)]">
              {auditSummary.systemOperatorEvents}
            </p>
            <p className="mt-3 text-sm text-[var(--pcb-muted)]">Eventi `system_operator` tracciati.</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-muted)]">
              GIS
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--pcb-ink)]">{subjectParcelLinks.total}</p>
            <p className="mt-3 text-sm text-[var(--pcb-muted)]">
              relazioni GIS · publication target {publicationStatus.statusLabel}
            </p>
          </article>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm font-semibold text-[var(--pcb-ink)]">URL chiave</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {diagnosticLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)] transition hover:-translate-y-0.5"
                >
                  <strong className="block text-[var(--pcb-ink)]">{item.label}</strong>
                  <code className="mt-2 block break-all text-xs text-[var(--pcb-muted)]">
                    {item.href}
                  </code>
                </a>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm font-semibold text-[var(--pcb-ink)]">Documentazione essenziale</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]">
                <strong className="block text-[var(--pcb-ink)]">Runbook</strong>
                <code className="mt-2 block text-xs">docs/OPERATIONS_RUNBOOK.md</code>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]">
                <strong className="block text-[var(--pcb-ink)]">Smoke tests</strong>
                <code className="mt-2 block text-xs">docs/SMOKE_TESTS.md</code>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]">
                <strong className="block text-[var(--pcb-ink)]">Known issues</strong>
                <code className="mt-2 block text-xs">docs/KNOWN_ISSUES.md</code>
              </div>
              <div className="rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]">
                <strong className="block text-[var(--pcb-ink)]">API surface</strong>
                <code className="mt-2 block text-xs">docs/API_SURFACE.md</code>
              </div>
            </div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Pipeline outcomes" eyebrow="Ingestion">
        <div className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Raw outcomes</p>
            <div className="mt-4 grid gap-3">
              {Object.entries(orchestrationSummary.rawOutcomeCounters).map(([key, total]) => (
                <Link
                  key={key}
                  href={buildIngestionOutcomeHref({
                    rawOutcomeCode: key,
                  })}
                  className="flex items-center justify-between rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]"
                >
                  <span className="break-all">{key}</span>
                  <strong className="text-[var(--pcb-ink)]">{total}</strong>
                </Link>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Normalized outcomes</p>
            <div className="mt-4 grid gap-3">
              {Object.entries(orchestrationSummary.normalizedOutcomeCounters).map(([key, total]) => (
                <Link
                  key={key}
                  href={buildIngestionOutcomeHref({
                    normalizedOutcomeCode: key,
                    normalizationStage: 'completed',
                  })}
                  className="flex items-center justify-between rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]"
                >
                  <span className="break-all">{key}</span>
                  <strong className="text-[var(--pcb-ink)]">{total}</strong>
                </Link>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Matching outcomes</p>
            <div className="mt-4 grid gap-3">
              {Object.entries(orchestrationSummary.matchingOutcomeCounters).map(([key, total]) => (
                <Link
                  key={key}
                  href={buildIngestionOutcomeHref({
                    matchingOutcomeCode: key,
                    matchingStage: 'completed',
                  })}
                  className="flex items-center justify-between rounded-2xl border border-[var(--pcb-line)] px-4 py-3 text-sm text-[var(--pcb-muted)]"
                >
                  <span className="break-all">{key}</span>
                  <strong className="text-[var(--pcb-ink)]">{total}</strong>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Pipeline attention" eyebrow="Ingestion">
        {pipelineAttentionLinks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pipelineAttentionLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <p className="text-sm text-[var(--pcb-muted)]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{item.total}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
                  {item.stage}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--pcb-muted)]">
            Nessun outcome di attenzione aperto sui layer raw, normalized o matching.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Ingressi operativi pipeline" eyebrow="Runs">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultima run fallita</p>
            {latestFailedRun ? (
              <>
                <p className="mt-2 text-lg font-semibold text-[var(--pcb-ink)]">
                  {latestFailedRun.connectorName}
                </p>
                <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                  {new Date(latestFailedRun.startedAt).toLocaleString('it-IT')}
                </p>
                {latestFailedRun.failureCode ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9b3d2e]">
                    {latestFailedRun.failureCode}
                    {latestFailedRun.failureStage ? ` · ${latestFailedRun.failureStage}` : ''}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/ingestion/${latestFailedRun.id}`} className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Apri run
                  </Link>
                  <Link href="/ingestion?status=failed" className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Tutte le fallite
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">Nessuna run fallita disponibile.</p>
            )}
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultima run in coda</p>
            {latestQueuedRun ? (
              <>
                <p className="mt-2 text-lg font-semibold text-[var(--pcb-ink)]">
                  {latestQueuedRun.connectorName}
                </p>
                <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                  {new Date(latestQueuedRun.startedAt).toLocaleString('it-IT')}
                </p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  raw {latestQueuedRun.rawSummary.totalRecords} · norm {latestQueuedRun.stages.normalization.recordsWritten} · match{' '}
                  {latestQueuedRun.stages.matching.resultsWritten}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/ingestion/${latestQueuedRun.id}`} className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Apri run
                  </Link>
                  <Link href="/ingestion?status=queued" className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Tutte le queued
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">Nessuna run in coda disponibile.</p>
            )}
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultima run da verificare</p>
            {latestReviewRun ? (
              <>
                <p className="mt-2 text-lg font-semibold text-[var(--pcb-ink)]">
                  {latestReviewRun.connectorName}
                </p>
                <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                  {new Date(latestReviewRun.startedAt).toLocaleString('it-IT')}
                </p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  matching {latestReviewRun.stages.matching.status} · post {latestReviewRun.stages.postProcessing.status}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/ingestion/${latestReviewRun.id}`} className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Apri run
                  </Link>
                  <Link href="/ingestion?matchingStage=completed" className="text-sm font-semibold text-[var(--pcb-accent)]">
                    Apri pipeline completate
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">Nessuna run recente disponibile.</p>
            )}
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
        <div id="runtime-integrations" />
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
              <div className="mt-3 grid gap-2 text-xs text-[var(--pcb-muted)]">
                {item.statusCode !== null ? <p>HTTP/status {item.statusCode}</p> : null}
                {item.failureCode ? <p>Failure code {item.failureCode}</p> : null}
                {item.target ? <p className="break-all">Target {item.target}</p> : null}
              </div>
              {item.detail ? (
                <p className="mt-2 break-all text-xs text-[var(--pcb-muted)]">{item.detail}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {item.key === 'qgis' && item.target ? (
                  <a
                    href={item.target}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                  >
                    Apri target
                  </a>
                ) : null}
                {item.key === 'keycloak' && item.target ? (
                  <a
                    href={item.target}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                  >
                    Apri discovery
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--pcb-muted)]">
          Ultimo controllo {new Date(integrations.checkedAt).toLocaleString('it-IT')}
        </p>
      </SectionCard>

      <SectionCard title="Audit per modulo" eyebrow="Audit">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/audit"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Tutti gli eventi</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{auditSummary.total}</p>
          </Link>
          {auditSummary.bySourceModule.map((item) => (
            <Link
              key={item.sourceModule}
              href={`/audit?sourceModule=${encodeURIComponent(item.sourceModule)}`}
              className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-sm text-[var(--pcb-muted)]">{item.sourceModule}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{item.total}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Connector attention" eyebrow="Ingestion">
        <div id="connector-attention" />
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

      <SectionCard title="Pipeline stages" eyebrow="Ingestion">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Link
            href="/ingestion?status=running&acquisitionStage=running"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Acquisition running</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.runningRuns}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              queued {orchestrationSummary.queuedRuns}
            </p>
          </Link>
          <Link
            href="/ingestion?postProcessingStage=running"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Post-processing running</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.postProcessingRunningRuns}
            </p>
            <p className="mt-2 text-xs text-[var(--pcb-muted)]">
              queued {orchestrationSummary.postProcessingQueuedRuns}
            </p>
          </Link>
          <Link
            href="/ingestion?normalizationStage=completed"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Normalization completed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.normalizationCompletedRuns}
            </p>
          </Link>
          <Link
            href="/ingestion?matchingStage=completed"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Matching completed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.matchingCompletedRuns}
            </p>
          </Link>
          <Link
            href="/ingestion?status=failed"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-[var(--pcb-muted)]">Run fallite</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {orchestrationSummary.failedRuns}
            </p>
          </Link>
        </div>
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
