import Link from 'next/link';
import { IngestionAutoRefresh } from '../../../components/ingestion-auto-refresh';
import { IngestionStageTrigger } from '../../../components/ingestion-stage-trigger';
import { MatchingDecisionTrigger } from '../../../components/matching-decision-trigger';
import { MatchingSubjectAssignment } from '../../../components/matching-subject-assignment';
import { PageShell } from '../../../components/page-shell';
import { SectionCard } from '../../../components/section-card';
import { ServerApiErrorState } from '../../../components/server-api-error-state';
import { StatusChip } from '../../../components/status-chip';
import { requireOperatorSession } from '../../../lib/auth';
import {
  getAuditSummary,
  getIngestionRun,
  getMatchingResults,
  getNormalizedRecords,
  getSubjects,
  isApiError,
} from '../../../lib/api';

interface IngestionRunDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    normalizedStatus?: string;
    matchingStatus?: string;
  }>;
}

function buildRunDetailFilterHref(
  runId: string,
  filters: { normalizedStatus?: string; matchingStatus?: string },
) {
  const params = new URLSearchParams();

  if (filters.normalizedStatus) {
    params.set('normalizedStatus', filters.normalizedStatus);
  }

  if (filters.matchingStatus) {
    params.set('matchingStatus', filters.matchingStatus);
  }

  const queryString = params.toString();

  return queryString ? `/ingestion/${runId}?${queryString}` : `/ingestion/${runId}`;
}

function formatDecisionLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function canConfirmMatch(status: string, matchedSubjectId: string | null) {
  return matchedSubjectId !== null && status !== 'accepted';
}

function canConfirmNoMatch(status: string) {
  return status === 'review' || status === 'unmatched';
}

function canAssignSubject(status: string) {
  return status === 'review' || status === 'unmatched' || status === 'rejected';
}

export default async function IngestionRunDetailPage({
  params,
  searchParams,
}: IngestionRunDetailPageProps) {
  const { id } = await params;
  const session = await requireOperatorSession(`/ingestion/${id}`);
  const filters = (await searchParams) ?? {};

  let run;

  try {
    run = await getIngestionRun(id, session.accessToken);
  } catch (error) {
    if (isApiError(error)) {
      return (
        <PageShell
          title="Dettaglio run"
          description="Dettaglio operativo della run ingest con esiti di normalizzazione e matching. Le azioni lavorano sul backend reale."
        >
          <ServerApiErrorState
            error={error}
            primaryAction={{ href: `/ingestion/${id}`, label: 'Ricarica dettaglio run' }}
            secondaryAction={{ href: '/ingestion', label: 'Torna a ingestion' }}
          />
        </PageShell>
      );
    }

    throw error;
  }

  let normalizedRecords;
  let matchingResults;
  let subjects;
  let runAuditSummary;
  let ingestAuditSummary;

  try {
    [normalizedRecords, matchingResults, subjects, runAuditSummary, ingestAuditSummary] = await Promise.all([
      getNormalizedRecords(id, session.accessToken),
      getMatchingResults(id, session.accessToken),
      getSubjects(session.accessToken),
      getAuditSummary(session.accessToken, {
        entityType: 'ingestion_run',
        entityId: run.id,
      }),
      getAuditSummary(session.accessToken, {
        sourceModule: 'ingest',
      }),
    ]);
  } catch (error) {
    if (isApiError(error)) {
      return (
        <PageShell
          title={`Run ${run.connectorName}`}
          description="Dettaglio operativo della run ingest con esiti di normalizzazione e matching. Le azioni lavorano sul backend reale."
        >
          <ServerApiErrorState
            error={error}
            primaryAction={{ href: `/ingestion/${id}`, label: 'Ricarica dettaglio run' }}
            secondaryAction={{ href: '/ingestion', label: 'Torna a ingestion' }}
          />
        </PageShell>
      );
    }

    throw error;
  }

  const matchedCount = matchingResults.items.filter(
    (item) => item.decisionStatus === 'matched' || item.decisionStatus === 'accepted',
  ).length;
  const reviewCount = matchingResults.items.filter(
    (item) => item.decisionStatus === 'review',
  ).length;
  const rejectedCount = matchingResults.items.filter(
    (item) => item.decisionStatus === 'rejected',
  ).length;
  const unmatchedCount = matchingResults.items.filter(
    (item) => item.decisionStatus === 'unmatched',
  ).length;
  const autoRefreshEnabled =
    run.status === 'queued' ||
    run.status === 'running' ||
    run.stages.postProcessing.status === 'queued' ||
    run.stages.postProcessing.status === 'running';
  const subjectOptions = subjects.items.map((subject) => ({
    id: subject.id,
    label: `${subject.currentDisplayName} · ${subject.cuua}`,
  }));
  const filteredNormalizedRecords = normalizedRecords.items.filter((item) => {
    if (filters.normalizedStatus && item.normalizationStatus !== filters.normalizedStatus) {
      return false;
    }

    return true;
  });
  const filteredMatchingResults = matchingResults.items.filter((item) => {
    if (filters.matchingStatus && item.decisionStatus !== filters.matchingStatus) {
      return false;
    }

    return true;
  });

  return (
    <PageShell
      title={`Run ${run.connectorName}`}
      description="Dettaglio operativo della run ingest con esiti di normalizzazione e matching. Le azioni lavorano sul backend reale."
      actions={
        <div className="flex flex-col gap-3 md:flex-row">
          <IngestionStageTrigger runId={run.id} stage="normalize" />
          <IngestionStageTrigger runId={run.id} stage="match" />
        </div>
      }
    >
      <IngestionAutoRefresh enabled={autoRefreshEnabled} />

      <SectionCard title="Sintesi run" eyebrow="Ingestion">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--pcb-ink)]">{run.connectorName}</h2>
            <p className="mt-1 text-sm text-[var(--pcb-muted)]">Sorgente {run.sourceSystem}</p>
          </div>
          <StatusChip label={run.status} />
        </div>
        <dl className="mt-5 grid gap-4 text-sm text-[var(--pcb-muted)] md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Run ID</dt>
            <dd className="break-all">{run.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Avvio</dt>
            <dd>{new Date(run.startedAt).toLocaleString('it-IT')}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Fine</dt>
            <dd>{run.endedAt ? new Date(run.endedAt).toLocaleString('it-IT') : 'In corso / queued'}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--pcb-ink)]">Esito raw</dt>
            <dd>
              {run.recordsSuccess}/{run.recordsTotal} successi, {run.recordsError} errori
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-[var(--pcb-muted)]">
          {run.logExcerpt || 'Nessun log excerpt disponibile.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/audit?entityType=ingestion_run&entityId=${run.id}`}
            className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
          >
            Audit run
          </Link>
          <Link
            href="/audit?sourceModule=ingest"
            className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
          >
            Audit ingestion
          </Link>
          <Link
            href="/operations"
            className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
          >
            Operations
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Acquisition</p>
            <div className="mt-3">
              <StatusChip label={run.stages.acquisition.status} />
            </div>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Post-processing</p>
            <div className="mt-3">
              <StatusChip label={run.stages.postProcessing.status} />
            </div>
            <p className="mt-3 text-xs text-[var(--pcb-muted)]">
              normalize {run.stages.postProcessing.autoNormalize ? 'on' : 'off'} · match{' '}
              {run.stages.postProcessing.autoMatch ? 'on' : 'off'}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Normalization</p>
            <div className="mt-3">
              <StatusChip label={run.stages.normalization.status} />
            </div>
            <p className="mt-3 text-xs text-[var(--pcb-muted)]">
              record scritti {run.stages.normalization.recordsWritten}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Matching</p>
            <div className="mt-3">
              <StatusChip label={run.stages.matching.status} />
            </div>
            <p className="mt-3 text-xs text-[var(--pcb-muted)]">
              risultati scritti {run.stages.matching.resultsWritten}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Contesto audit" eyebrow="Audit">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Eventi run</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{runAuditSummary.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Ultimo evento run</p>
            <p className="mt-2 text-sm font-semibold text-[var(--pcb-ink)]">
              {runAuditSummary.latestCreatedAt
                ? new Date(runAuditSummary.latestCreatedAt).toLocaleString('it-IT')
                : 'n/d'}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Eventi modulo ingest</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{ingestAuditSummary.total}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">System operator modulo</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {ingestAuditSummary.systemOperatorEvents}
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Esiti pipeline" eyebrow="Workflow">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Record normalizzati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">
              {normalizedRecords.total}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Match diretti</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{matchedCount}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Da review</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{reviewCount}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Unmatched</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{unmatchedCount}</p>
          </article>
          <article className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
            <p className="text-sm text-[var(--pcb-muted)]">Rifiutati</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--pcb-ink)]">{rejectedCount}</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Normalized records" eyebrow="Normalized">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunDetailFilterHref(run.id, { matchingStatus: filters.matchingStatus })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.normalizedStatus
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti
          </Link>
          {Array.from(new Set(normalizedRecords.items.map((item) => item.normalizationStatus))).map((status) => (
            <Link
              key={status}
              href={buildRunDetailFilterHref(run.id, {
                normalizedStatus: status,
                matchingStatus: filters.matchingStatus,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.normalizedStatus === status
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
        {filteredNormalizedRecords.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">
            Nessun record normalizzato disponibile per questa run.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredNormalizedRecords.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--pcb-ink)]">
                      {item.sourceRecordId}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                      Tipo {item.normalized.recordType ?? 'n/d'} · Famiglia documento{' '}
                      {item.normalized.documentHints?.documentFamily ?? 'n/d'}
                    </p>
                  </div>
                  <StatusChip label={item.normalizationStatus} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Path relativo</dt>
                    <dd className="break-all">
                      {item.normalized.filesystem?.relativePath ?? 'n/d'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Bucket</dt>
                    <dd>{item.normalized.filesystem?.bucketLetter ?? 'n/d'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Subject hint</dt>
                    <dd>{item.normalized.subjectHints?.normalizedSubjectKey ?? 'n/d'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Creato</dt>
                    <dd>{new Date(item.createdAt).toLocaleString('it-IT')}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Matching results" eyebrow="Matching">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href={buildRunDetailFilterHref(run.id, { normalizedStatus: filters.normalizedStatus })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              !filters.matchingStatus
                ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
            }`}
          >
            Tutti
          </Link>
          {Array.from(new Set(matchingResults.items.map((item) => item.decisionStatus))).map((status) => (
            <Link
              key={status}
              href={buildRunDetailFilterHref(run.id, {
                normalizedStatus: filters.normalizedStatus,
                matchingStatus: status,
              })}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                filters.matchingStatus === status
                  ? 'border-[var(--pcb-accent)] bg-[var(--pcb-accent)] text-white'
                  : 'border-[var(--pcb-line)] bg-white text-[var(--pcb-ink)]'
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
        {filteredMatchingResults.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">
            Nessun risultato di matching disponibile per questa run.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredMatchingResults.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--pcb-ink)]">
                      {item.sourceRecordId}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                      Decisione {formatDecisionLabel(item.decisionType)} · score {item.matchingScore}
                    </p>
                  </div>
                  <StatusChip label={item.decisionStatus} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Subject collegato</dt>
                    <dd className="break-all">
                      {item.matchedSubjectId ? (
                        <Link
                          href={`/subjects/${item.matchedSubjectId}`}
                          className="font-semibold text-[var(--pcb-accent)]"
                        >
                          {item.matchedSubjectId}
                        </Link>
                      ) : (
                        'Nessun match'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Stato</dt>
                    <dd>{formatDecisionLabel(item.decisionStatus)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Creato</dt>
                    <dd>{new Date(item.createdAt).toLocaleString('it-IT')}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-[var(--pcb-muted)]">
                  {item.notes ?? 'Nessuna nota disponibile.'}
                </p>
                {canConfirmMatch(item.decisionStatus, item.matchedSubjectId) ||
                canConfirmNoMatch(item.decisionStatus) ||
                canAssignSubject(item.decisionStatus) ? (
                  <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    {canConfirmMatch(item.decisionStatus, item.matchedSubjectId) ? (
                      <MatchingDecisionTrigger
                        runId={run.id}
                        resultId={item.id}
                        action="confirm-match"
                      />
                    ) : null}
                    {canConfirmNoMatch(item.decisionStatus) ? (
                      <MatchingDecisionTrigger
                        runId={run.id}
                        resultId={item.id}
                        action="confirm-no-match"
                      />
                    ) : null}
                    {canAssignSubject(item.decisionStatus) && subjectOptions.length > 0 ? (
                      <MatchingSubjectAssignment
                        runId={run.id}
                        resultId={item.id}
                        options={subjectOptions}
                      />
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
