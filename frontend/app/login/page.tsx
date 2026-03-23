import { LoginForm } from '../../components/login-form';
import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { getOptionalSession } from '../../lib/auth';

export default async function LoginPage() {
  const session = await getOptionalSession();

  return (
    <PageShell
      title="Accesso operativo"
      description="Autenticazione reale via Keycloak locale. La sessione frontend viene validata dal backend PCB prima di abilitare le viste operative."
    >
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Login" eyebrow="Keycloak">
          {session ? (
            <div className="grid gap-4 text-sm text-[var(--pcb-muted)]">
              <p>
                Sessione attiva come <strong className="text-[var(--pcb-ink)]">{session.principal.preferredUsername}</strong>.
              </p>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-[var(--pcb-line)] px-5 py-3 font-semibold text-[var(--pcb-ink)]"
                >
                  Termina sessione
                </button>
              </form>
            </div>
          ) : (
            <LoginForm />
          )}
        </SectionCard>

        <SectionCard title="Ambiente locale" eyebrow="Seed">
          <dl className="grid gap-4 text-sm text-[var(--pcb-muted)]">
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
              <dt className="font-semibold text-[var(--pcb-ink)]">Realm</dt>
              <dd className="mt-1">pcb</dd>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
              <dt className="font-semibold text-[var(--pcb-ink)]">Utente operatore</dt>
              <dd className="mt-1">pcb.operator / pcb.operator</dd>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
              <dt className="font-semibold text-[var(--pcb-ink)]">Uso previsto</dt>
              <dd className="mt-1">
                In questa fase la protezione riguarda le viste operative `ingestion` e `gis`.
              </dd>
            </div>
          </dl>
        </SectionCard>
      </section>
    </PageShell>
  );
}
