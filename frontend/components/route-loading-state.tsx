interface RouteLoadingStateProps {
  title?: string;
  description?: string;
}

export function RouteLoadingState({
  title = 'Caricamento in corso',
  description = 'PCB sta recuperando dati applicativi e contesto operativo.',
}: RouteLoadingStateProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-[32px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)] p-10 text-center shadow-[0_24px_80px_rgba(31,41,51,0.08)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--pcb-line)] border-t-[var(--pcb-accent)]" />
        <h1 className="mt-6 text-3xl font-semibold text-[var(--pcb-ink)]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--pcb-muted)]">{description}</p>
      </div>
    </main>
  );
}
