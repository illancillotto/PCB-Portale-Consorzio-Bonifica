'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OperationalErrorNotice } from './operational-error-notice';
import { OperationalActionFailure, resolveOperationalActionFailure } from '../lib/operational-action';

interface MatchingSubjectOption {
  id: string;
  label: string;
}

interface MatchingSubjectAssignmentProps {
  runId: string;
  resultId: string;
  options: MatchingSubjectOption[];
}

export function MatchingSubjectAssignment({
  runId,
  resultId,
  options,
}: MatchingSubjectAssignmentProps) {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState(options[0]?.id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failure, setFailure] = useState<OperationalActionFailure | null>(null);

  async function handleAssign() {
    if (!selectedSubjectId) {
      setFailure({
        redirected: false,
        kind: 'domain',
        code: 'ingest.subject_selection_required',
        message: 'Seleziona un soggetto',
        requestId: null,
      });
      return;
    }

    setIsSubmitting(true);
    setFailure(null);

    try {
      const response = await fetch(
        `/api/pcb/ingestion/runs/${encodeURIComponent(runId)}/matching-results/${encodeURIComponent(resultId)}/assign-subject/${encodeURIComponent(selectedSubjectId)}`,
        {
          method: 'POST',
        },
      );

      const failure = await resolveOperationalActionFailure(
        response,
        router,
        'Assegnazione soggetto non riuscita',
      );

      if (failure) {
        if (!failure.redirected) {
          setFailure(failure);
        }
        return;
      }

      router.refresh();
    } catch (caughtError) {
      setFailure({
        redirected: false,
        kind: 'runtime',
        code: null,
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Assegnazione soggetto non riuscita',
        requestId: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={selectedSubjectId}
        onChange={(event) => setSelectedSubjectId(event.target.value)}
        className="min-h-10 rounded-2xl border border-[var(--pcb-line)] bg-white px-4 text-sm text-[var(--pcb-ink)]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAssign}
        disabled={isSubmitting || !selectedSubjectId}
        className="min-h-10 rounded-2xl border border-[var(--pcb-line)] bg-white px-4 text-sm font-semibold text-[var(--pcb-ink)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Assegnazione...' : 'Assegna soggetto'}
      </button>
      <OperationalErrorNotice failure={failure} />
    </div>
  );
}
