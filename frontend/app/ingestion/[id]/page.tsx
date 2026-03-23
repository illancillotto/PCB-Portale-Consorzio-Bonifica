import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IngestionStageTrigger } from '../../../components/ingestion-stage-trigger';
import { MatchingDecisionTrigger } from '../../../components/matching-decision-trigger';
import { MatchingSubjectAssignment } from '../../../components/matching-subject-assignment';
import { PageShell } from '../../../components/page-shell';
import { SectionCard } from '../../../components/section-card';
import { StatusChip } from '../../../components/status-chip';
import {
  getSubjects,
  getIngestionRun,
  getMatchingResults,
  getNormalizedRecords,
} from '../../../lib/api';

interface IngestionRunDetailPageProps {
  params: Promise<{
    id: string;
  }>;
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
}: IngestionRunDetailPageProps) {
  const { id } = await params;

  let run;

  try {
    run = await getIngestionRun(id);
  } catch {
    notFound();
  }

  const [normalizedRecords, matchingResults, subjects] = await Promise.all([
    getNormalizedRecords(id),
    getMatchingResults(id),
    getSubjects(),
  ]);

  const matchedCount = matchingResults.items.filter(
    (item) => item.decisionStatus === 'matched',
  ).length;
  const reviewCount = matchingResults.items.filter(
    (item) => item.decisionStatus === 'review',
  ).length;
  const subjectOptions = subjects.items.map((subject) => ({
    id: subject.id,
    label: `${subject.currentDisplayName} · ${subject.cuua}`,
  }));

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
      </SectionCard>

      <SectionCard title="Esiti pipeline" eyebrow="Workflow">
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>
      </SectionCard>

      <SectionCard title="Normalized records" eyebrow="Normalized">
        {normalizedRecords.items.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">
            Nessun record normalizzato disponibile per questa run.
          </p>
        ) : (
          <div className="grid gap-4">
            {normalizedRecords.items.map((item) => (
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
        {matchingResults.items.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">
            Nessun risultato di matching disponibile per questa run.
          </p>
        ) : (
          <div className="grid gap-4">
            {matchingResults.items.map((item) => (
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
