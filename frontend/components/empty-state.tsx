import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--pcb-line)] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--pcb-accent)]">PCB Empty State</p>
      <h3 className="mt-3 text-lg font-semibold text-[var(--pcb-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--pcb-muted)]">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
