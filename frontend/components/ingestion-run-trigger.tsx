'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface IngestionRunTriggerProps {
  connectorName: string;
  disabled?: boolean;
  disabledReason?: string;
}

interface StartIngestionRunResponse {
  id: string;
  connectorName: string;
  sourceSystem: string;
  status: string;
  startedAt: string;
  executionMode: 'manual';
  postProcessing?: {
    autoNormalize: boolean;
    autoMatch: boolean;
  };
}

export function IngestionRunTrigger({
  connectorName,
  disabled = false,
  disabledReason,
}: IngestionRunTriggerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (disabled) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/pcb/ingestion/connectors/${encodeURIComponent(connectorName)}/run`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Run request failed with status ${response.status}`);
      }

      const run = (await response.json()) as StartIngestionRunResponse;
      router.push(`/ingestion/${run.id}`);
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
        disabled={isSubmitting || disabled}
        className="min-h-12 rounded-2xl bg-[var(--pcb-accent)] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Avvio in corso...' : disabled ? `Bloccato ${connectorName}` : `Esegui ${connectorName}`}
      </button>
      {disabled && disabledReason ? <p className="text-sm text-[var(--pcb-muted)]">{disabledReason}</p> : null}
      {error ? <p className="text-sm text-[#9b3d2e]">{error}</p> : null}
    </div>
  );
}
