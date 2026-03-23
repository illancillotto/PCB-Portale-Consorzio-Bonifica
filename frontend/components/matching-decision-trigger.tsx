'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MatchingDecisionTriggerProps {
  runId: string;
  resultId: string;
  action: 'confirm-match' | 'confirm-no-match';
}

export function MatchingDecisionTrigger({
  runId,
  resultId,
  action,
}: MatchingDecisionTriggerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = action === 'confirm-match' ? 'Conferma match' : 'Conferma no match';

  async function handleAction() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/pcb/ingestion/runs/${encodeURIComponent(runId)}/matching-results/${encodeURIComponent(resultId)}/${action}`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`${action} failed with status ${response.status}`);
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : `${action} failed`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAction}
        disabled={isSubmitting}
        className="min-h-10 rounded-2xl border border-[var(--pcb-line)] bg-white px-4 text-sm font-semibold text-[var(--pcb-ink)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Aggiornamento...' : label}
      </button>
      {error ? <p className="text-sm text-[#9b3d2e]">{error}</p> : null}
    </div>
  );
}
