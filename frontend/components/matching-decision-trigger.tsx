'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OperationalErrorNotice } from './operational-error-notice';
import { OperationalActionFailure, resolveOperationalActionFailure } from '../lib/operational-action';

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
  const [failure, setFailure] = useState<OperationalActionFailure | null>(null);

  const label = action === 'confirm-match' ? 'Conferma match' : 'Conferma no match';

  async function handleAction() {
    setIsSubmitting(true);
    setFailure(null);

    try {
      const response = await fetch(
        `/api/pcb/ingestion/runs/${encodeURIComponent(runId)}/matching-results/${encodeURIComponent(resultId)}/${action}`,
        {
          method: 'POST',
        },
      );

      const failure = await resolveOperationalActionFailure(
        response,
        router,
        `Operazione ${action} non riuscita`,
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
            : `Operazione ${action} non riuscita`,
        requestId: null,
      });
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
      <OperationalErrorNotice failure={failure} />
    </div>
  );
}
