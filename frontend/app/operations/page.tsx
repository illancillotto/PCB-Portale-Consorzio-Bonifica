import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import { getSystemIntegrations } from '../../lib/api';

export default async function OperationsPage() {
  const session = await requireOperatorSession();
  const integrations = await getSystemIntegrations(session.accessToken);

  return (
    <PageShell
      title="Operations"
      description="Stato operativo centralizzato delle integrazioni core del Portale Consorzio Bonifica."
    >
      <SectionCard title="Integrazioni runtime" eyebrow="System">
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.items.map((item) => (
            <article key={item.key} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--pcb-ink)]">{item.label}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--pcb-muted)]">
                    {item.key}
                  </p>
                </div>
                <StatusChip label={item.statusLabel} />
              </div>
              <p className="mt-4 text-sm text-[var(--pcb-muted)]">
                {item.configured ? 'Configurazione presente' : 'Configurazione assente'}
              </p>
              {item.detail ? (
                <p className="mt-2 break-all text-xs text-[var(--pcb-muted)]">{item.detail}</p>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--pcb-muted)]">
          Ultimo controllo {new Date(integrations.checkedAt).toLocaleString('it-IT')}
        </p>
      </SectionCard>
    </PageShell>
  );
}
