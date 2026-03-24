'use client';

import { RouteErrorState } from '../components/route-error-state';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      title="Errore applicativo PCB"
      description="La vista richiesta ha generato un errore non gestito. Puoi riprovare senza perdere il contesto di navigazione."
      onRetry={reset}
    />
  );
}
