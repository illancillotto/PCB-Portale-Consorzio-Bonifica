interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="rounded-[24px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)] p-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--pcb-accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl font-semibold text-[var(--pcb-ink)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
