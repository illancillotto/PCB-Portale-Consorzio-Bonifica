import { PageShell } from '../../components/page-shell';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import { getGisFeatureLinks, getGisLayers } from '../../lib/api';

export default async function GisPage() {
  await requireOperatorSession();
  const [layers, featureLinks] = await Promise.all([getGisLayers(), getGisFeatureLinks()]);

  return (
    <PageShell
      title="GIS foundation"
      description="Prima vista GIS applicativa basata su catalogo layer e feature links reali dal database. Non sostituisce ancora il viewer cartografico completo."
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Catalogo layer" eyebrow="GIS">
          <div className="grid gap-4">
            {layers.items.map((layer) => (
              <article key={layer.id} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">{layer.name}</h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                      Codice {layer.code} · {layer.geometryType}
                    </p>
                  </div>
                  <StatusChip label={layer.publicationStatus} />
                </div>
                <dl className="mt-4 grid gap-4 text-sm text-[var(--pcb-muted)] md:grid-cols-3">
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Owner</dt>
                    <dd>{layer.ownerModule}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Soggetti linked</dt>
                    <dd>{layer.linkedSubjects}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[var(--pcb-ink)]">Particelle linked</dt>
                    <dd>{layer.linkedParcels}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-[var(--pcb-muted)]">
                  {String(layer.metadata.description ?? 'Nessuna descrizione')}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Feature links" eyebrow="Relations">
          <div className="grid gap-3">
            {featureLinks.items.map((link) => (
              <article key={link.id} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--pcb-ink)]">{link.layerCode}</p>
                <p className="mt-1 text-xs text-[var(--pcb-muted)]">Feature {link.featureExternalId}</p>
                <p className="mt-2 text-xs text-[var(--pcb-muted)]">
                  Subject {link.subjectId ?? 'n/a'} · Parcel {link.parcelId ?? 'n/a'}
                </p>
                <p className="mt-1 text-xs text-[var(--pcb-muted)]">
                  Dal {link.validFrom ? new Date(link.validFrom).toLocaleString('it-IT') : 'n/a'}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
}
