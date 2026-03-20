import Link from 'next/link';

interface PageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const navigationItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/subjects', label: 'Soggetti' },
  { href: '/parcels', label: 'Particelle' },
  { href: '/ingestion', label: 'Ingestion' },
];

export function PageShell({ title, description, children, actions }: PageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <header className="rounded-[32px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)]/95 p-8 shadow-[0_24px_80px_rgba(31,41,51,0.08)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--pcb-ink)]">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--pcb-muted)]">{description}</p>
          </div>
          {actions ? <div className="w-full max-w-xl">{actions}</div> : null}
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </main>
  );
}
