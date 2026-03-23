'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface IngestionAutoRefreshProps {
  enabled: boolean;
  intervalMs?: number;
}

export function IngestionAutoRefresh({
  enabled,
  intervalMs = 3000,
}: IngestionAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timer = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, router]);

  if (!enabled) {
    return null;
  }

  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]">
      aggiornamento automatico attivo finche&apos; esistono run in coda o in esecuzione
    </p>
  );
}
