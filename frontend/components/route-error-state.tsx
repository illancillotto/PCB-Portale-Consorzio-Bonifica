'use client';

interface RouteErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function RouteErrorState({
  title = 'Errore di caricamento',
  description = 'PCB non e` riuscito a completare il caricamento della vista richiesta.',
  onRetry,
}: RouteErrorStateProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-[32px] border border-[#d8b7ae] bg-[#fff8f6] p-10 text-center shadow-[0_24px_80px_rgba(31,41,51,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b3d2e]">PCB Error</p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--pcb-ink)]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--pcb-muted)]">{description}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-full border border-[#d8b7ae] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9b3d2e]"
        >
          Riprova
        </button>
      </div>
    </main>
  );
}
