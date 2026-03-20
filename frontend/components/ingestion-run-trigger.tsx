'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_PCB_API_BASE_URL ?? 'http://127.0.0.1:3001/api/v1';

interface IngestionRunTriggerProps {
  connectorName: string;
}

export function IngestionRunTrigger({ connectorName }: IngestionRunTriggerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/ingestion/connectors/${encodeURIComponent(connectorName)}/run`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Run request failed with status ${response.status}`);
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Run request failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleRun}
        disabled={isSubmitting}
        className="min-h-12 rounded-2xl bg-[var(--pcb-accent)] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Avvio in corso...' : `Esegui ${connectorName}`}
      </button>
      {error ? <p className="text-sm text-[#9b3d2e]">{error}</p> : null}
    </div>
  );
}
