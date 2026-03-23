'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

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
  const [error, setError] = useState<string | null>(null);

  async function handleAssign() {
    if (!selectedSubjectId) {
      setError('Seleziona un soggetto');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/ingestion/runs/${encodeURIComponent(runId)}/matching-results/${encodeURIComponent(resultId)}/assign-subject/${encodeURIComponent(selectedSubjectId)}`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`assign-subject failed with status ${response.status}`);
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'assign-subject failed',
      );
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
      {error ? <p className="text-sm text-[#9b3d2e]">{error}</p> : null}
    </div>
  );
}
