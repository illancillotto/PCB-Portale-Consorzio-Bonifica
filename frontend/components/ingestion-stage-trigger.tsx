'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

interface IngestionStageTriggerProps {
  runId: string;
  stage: 'normalize' | 'match';
}

export function IngestionStageTrigger({ runId, stage }: IngestionStageTriggerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label =
    stage === 'normalize' ? 'Esegui normalizzazione' : 'Esegui matching';

  async function handleAction() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/ingestion/runs/${encodeURIComponent(runId)}/${stage}`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`${stage} failed with status ${response.status}`);
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : `${stage} failed`);
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
        className="min-h-11 rounded-2xl border border-[var(--pcb-line)] bg-white px-4 text-sm font-semibold text-[var(--pcb-ink)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Operazione in corso...' : label}
      </button>
      {error ? <p className="text-sm text-[#9b3d2e]">{error}</p> : null}
    </div>
  );
}
