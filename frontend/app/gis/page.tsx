import { PageShell } from '../../components/page-shell';
import { GisMap } from '../../components/gis-map';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import {
  getGisFeatureLinks,
  getGisLayers,
  getGisMapFeatures,
  getGisPublicationStatus,
} from '../../lib/api';

interface GisPageProps {
  searchParams?: Promise<{
    subjectId?: string;
    parcelId?: string;
  }>;
}

export default async function GisPage({ searchParams }: GisPageProps) {
  const session = await requireOperatorSession();
  const filters = searchParams ? await searchParams : {};
  const selectedSubjectId = filters.subjectId;
  const selectedParcelId = filters.parcelId;
  const [layers, featureLinks, mapFeatures, publicationStatus] = await Promise.all([
    getGisLayers(session.accessToken),
    getGisFeatureLinks(session.accessToken),
    getGisMapFeatures(session.accessToken),
    getGisPublicationStatus(session.accessToken),
  ]);
  const focusedFeatures = mapFeatures.items.filter(
    (feature) =>
      (!selectedSubjectId || feature.properties.subjectId === selectedSubjectId) &&
      (!selectedParcelId || feature.properties.parcelId === selectedParcelId),
  );
  const displayedFeatures = focusedFeatures.length > 0 ? focusedFeatures : mapFeatures.items;

  return (
    <PageShell
      title="GIS operativo"
      description="Viewer cartografico iniziale basato su PostGIS reale, catalogo layer PCB e feature georiferite esposte dal backend protetto."
    >
      <SectionCard title="Viewer mappa" eyebrow="Map">
        <div className="grid gap-4">
          {selectedSubjectId || selectedParcelId ? (
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-bg)]/55 p-4 text-sm text-[var(--pcb-muted)]">
              Focus attivo:
              {selectedSubjectId ? ` soggetto ${selectedSubjectId}` : ''}
              {selectedParcelId ? ` particella ${selectedParcelId}` : ''}
              {focusedFeatures.length === 0 ? ' · nessuna feature dedicata trovata, vista completa mostrata' : ''}
            </div>
          ) : null}
          <GisMap
            features={displayedFeatures}
            selectedSubjectId={selectedSubjectId}
            selectedParcelId={selectedParcelId}
          />
        </div>
      </SectionCard>

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
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--pcb-ink)]">QGIS publication target</p>
                  <p className="mt-1 break-all text-xs text-[var(--pcb-muted)]">
                    {publicationStatus.serviceUrl || 'non configurato'}
                  </p>
                </div>
                <StatusChip label={publicationStatus.statusLabel} />
              </div>
              <p className="mt-3 text-xs text-[var(--pcb-muted)]">
                {publicationStatus.available
                  ? `QGIS Server raggiungibile · HTTP ${publicationStatus.statusCode ?? 'n/d'}`
                  : publicationStatus.configured
                    ? 'QGIS Server non ancora raggiungibile o non pronto'
                    : 'QGIS Server non configurato'}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-bg)]/55 p-4 text-sm text-[var(--pcb-muted)]">
              Feature mappate: <strong className="text-[var(--pcb-ink)]">{displayedFeatures.length}</strong>
            </div>
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
