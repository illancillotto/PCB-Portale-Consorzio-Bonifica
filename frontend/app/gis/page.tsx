import { PageShell } from '../../components/page-shell';
import { GisMap } from '../../components/gis-map';
import { GisPublicationLinks } from '../../components/gis-publication-links';
import { ServerApiErrorState } from '../../components/server-api-error-state';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { requireOperatorSession } from '../../lib/auth';
import Link from 'next/link';
import {
  getGisFeatureLinks,
  getFilteredGisSubjectParcelLinks,
  getGisLayers,
  getGisMapFeatures,
  getGisPublicationStatus,
  isApiError,
} from '../../lib/api';

interface GisPageProps {
  searchParams?: Promise<{
    subjectId?: string;
    parcelId?: string;
    layers?: string;
    preset?: string;
  }>;
}

const validQgisLayers = ['pcb_subject_parcel_links', 'pcb_parcels', 'pcb_subjects'] as const;

function buildGisHref(filters: {
  subjectId?: string;
  parcelId?: string;
  layers?: string;
  preset?: string;
}) {
  const params = new URLSearchParams();

  if (filters.subjectId) {
    params.set('subjectId', filters.subjectId);
  }

  if (filters.parcelId) {
    params.set('parcelId', filters.parcelId);
  }

  if (filters.layers) {
    params.set('layers', filters.layers);
  }

  if (filters.preset) {
    params.set('preset', filters.preset);
  }

  const queryString = params.toString();

  return queryString ? `/gis?${queryString}` : '/gis';
}

export default async function GisPage({ searchParams }: GisPageProps) {
  const session = await requireOperatorSession('/gis');
  const filters = searchParams ? await searchParams : {};
  const selectedSubjectId = filters.subjectId;
  const selectedParcelId = filters.parcelId;
  const initialActiveQgisLayers = (
    filters.layers
      ? filters.layers
          .split(',')
          .filter(
            (layerCode): layerCode is (typeof validQgisLayers)[number] =>
              validQgisLayers.includes(layerCode as (typeof validQgisLayers)[number]),
          )
      : [...validQgisLayers]
  ) as Array<(typeof validQgisLayers)[number]>;
  let layers;
  let featureLinks;
  let mapFeatures;
  let publicationStatus;
  let subjectParcelLinks;

  try {
    [layers, featureLinks, mapFeatures, publicationStatus, subjectParcelLinks] = await Promise.all([
      getGisLayers(session.accessToken),
      getGisFeatureLinks(session.accessToken, {
        subjectId: selectedSubjectId,
        parcelId: selectedParcelId,
      }),
      getGisMapFeatures(session.accessToken, {
        subjectId: selectedSubjectId,
        parcelId: selectedParcelId,
      }),
      getGisPublicationStatus(session.accessToken),
      getFilteredGisSubjectParcelLinks(session.accessToken, {
        subjectId: selectedSubjectId,
        parcelId: selectedParcelId,
      }),
    ]);
  } catch (error) {
    if (isApiError(error)) {
      return (
        <PageShell
          title="GIS operativo"
          description="Viewer cartografico iniziale basato su PostGIS reale, catalogo layer PCB e feature georiferite esposte dal backend protetto."
        >
          <ServerApiErrorState
            error={error}
            primaryAction={{ href: buildGisHref(filters), label: 'Ricarica viewer' }}
            secondaryAction={{ href: '/operations', label: 'Apri operations' }}
          />
        </PageShell>
      );
    }

    throw error;
  }
  const displayedFeatures = mapFeatures.items;

  return (
    <PageShell
      title="GIS operativo"
      description="Viewer cartografico iniziale basato su PostGIS reale, catalogo layer PCB e feature georiferite esposte dal backend protetto."
    >
      <SectionCard title="Supporto operativo" eyebrow="Help">
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/operations/help"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Operations help</strong>
            Apri checklist, escalation e riferimenti documentali.
          </Link>
          <Link
            href="/operations/help"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">First response GIS</strong>
            Usa il percorso per publication status, GetCapabilities e failure di GetFeatureInfo.
          </Link>
          <Link
            href="/operations"
            className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]"
          >
            <strong className="block text-[var(--pcb-ink)]">Torna a operations</strong>
            Riapri summary runtime e quick diagnostics.
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Viewer mappa" eyebrow="Map">
        <div className="grid gap-4">
          {selectedSubjectId || selectedParcelId ? (
            <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-bg)]/55 p-4 text-sm text-[var(--pcb-muted)]">
              Focus attivo:
              {selectedSubjectId ? ` soggetto ${selectedSubjectId}` : ''}
              {selectedParcelId ? ` particella ${selectedParcelId}` : ''}
              {displayedFeatures.length === 0 ? ' · nessuna feature dedicata trovata' : ''}
            </div>
          ) : null}
          <GisMap
            features={displayedFeatures}
            featureLinks={featureLinks.items}
            subjectParcelLinks={subjectParcelLinks.items}
            initialActiveQgisLayers={initialActiveQgisLayers}
            selectedSubjectId={selectedSubjectId}
            selectedParcelId={selectedParcelId}
            wmsServiceUrl={publicationStatus.available ? publicationStatus.serviceUrl : null}
            wmsProjectFile={publicationStatus.available ? publicationStatus.projectFile : null}
          />
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4 text-sm text-[var(--pcb-muted)]">
            Il viewer combina overlay WMS pubblicato da QGIS Server, incluse le relazioni soggetto-particella, e feature applicative GeoJSON del backend PCB.
          </div>
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
            <GisPublicationLinks publicationStatus={publicationStatus} />
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

      <SectionCard title="Relazioni soggetto-particella" eyebrow="Domain">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-bg)]/55 p-4 text-sm text-[var(--pcb-muted)]">
            Relazioni GIS applicative disponibili:{' '}
            <strong className="text-[var(--pcb-ink)]">{subjectParcelLinks.total}</strong>
          </div>
          {subjectParcelLinks.items.map((relation) => (
            <article key={relation.id} className="rounded-2xl border border-[var(--pcb-line)] bg-white p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">
                  {relation.subjectDisplayName ?? relation.cuua} {'->'} {relation.comune} / foglio {relation.foglio} / particella {relation.particella}
                  {relation.subalterno ? ` / sub ${relation.subalterno}` : ''}
                </h3>
                <StatusChip label={relation.relationType} />
              </div>
              <p className="mt-2 text-sm text-[var(--pcb-muted)]">CUUA {relation.cuua}</p>
              <p className="mt-1 text-sm text-[var(--pcb-muted)]">
                {relation.title ?? 'Titolo non specificato'}
                {relation.quota !== null ? ` · quota ${relation.quota}` : ''}
              </p>
              <p className="mt-1 text-xs text-[var(--pcb-muted)]">
                Dal {relation.validFrom ? new Date(relation.validFrom).toLocaleString('it-IT') : 'n/a'}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
