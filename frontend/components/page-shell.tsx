import Link from 'next/link';
import { getOptionalSession } from '../lib/auth';
import { buildLoginRedirectPath } from '../lib/auth-redirect';

interface PageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const navigationItems = [
  { href: '/', label: 'Dashboard', protected: true },
  { href: '/subjects', label: 'Soggetti', protected: true },
  { href: '/parcels', label: 'Particelle', protected: true },
  { href: '/gis', label: 'GIS', protected: true },
  { href: '/ingestion', label: 'Ingestion', protected: true },
  { href: '/audit', label: 'Audit', protected: true },
  { href: '/operations', label: 'Operations', protected: true },
];

export async function PageShell({ title, description, children, actions }: PageShellProps) {
  const session = await getOptionalSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <header className="rounded-[32px] border border-[var(--pcb-line)] bg-[var(--pcb-surface)]/95 p-8 shadow-[0_24px_80px_rgba(31,41,51,0.08)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={
                    session || !item.protected
                      ? item.href
                      : buildLoginRedirectPath('authentication_required', item.href)
                  }
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]"
                >
                  {item.label}
                </Link>
              ))}
              {session ? (
                <span className="rounded-full bg-[var(--pcb-accent)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-accent)]">
                  {session.principal.preferredUsername}
                </span>
              ) : null}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--pcb-ink)]">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--pcb-muted)]">{description}</p>
          </div>
          <div className="flex w-full max-w-xl flex-col gap-3">
            {actions}
            <div className="flex items-center justify-end">
              {session ? (
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]"
                  >
                    Logout
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pcb-muted)]"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </main>
  );
}
