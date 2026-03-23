'use client';

import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { GisMapFeature } from '../lib/api';

interface QgisFeatureInfoFeature {
  id: string;
  type: 'Feature';
  properties: Record<string, string | number | boolean | null>;
}

interface QgisFeatureInfoResponse {
  type: 'FeatureCollection';
  features: QgisFeatureInfoFeature[];
}

function toFeatureInfoFeature(feature: GisMapFeature): QgisFeatureInfoFeature {
  return {
    id: `${feature.properties.layerCode}.${feature.id}`,
    type: 'Feature',
    properties: {
      id: feature.id,
      feature_external_id: feature.properties.featureExternalId,
      subject_id: feature.properties.subjectId,
      parcel_id: feature.properties.parcelId,
      layer_code: feature.properties.layerCode,
      layer_name: feature.properties.layerName,
      valid_from: feature.properties.validFrom,
      valid_to: feature.properties.validTo,
    },
  };
}

function getFeatureSelectionKey(layerCode: string | null, id: string | null) {
  if (!layerCode || !id) {
    return null;
  }

  return `${layerCode}:${id}`;
}

function asOptionalString(value: string | number | boolean | null | undefined) {
  if (typeof value === 'string' && value !== 'NULL' && value.trim().length > 0) {
    return value;
  }

  return null;
}

interface GisMapProps {
  features: GisMapFeature[];
  selectedSubjectId?: string;
  selectedParcelId?: string;
  wmsServiceUrl?: string | null;
  wmsProjectFile?: string | null;
}

export function GisMap({
  features,
  selectedSubjectId,
  selectedParcelId,
  wmsServiceUrl,
  wmsProjectFile,
}: GisMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<string | null>(null);
  const [featureInfoState, setFeatureInfoState] = useState<{
    loading: boolean;
    error: string | null;
    features: QgisFeatureInfoFeature[];
  }>({
    loading: false,
    error: null,
    features: [],
  });

  useEffect(() => {
    let map: LeafletMap | null = null;

    async function mountMap() {
      if (!containerRef.current) {
        return;
      }

      const leaflet = await import('leaflet');

      map = leaflet.map(containerRef.current, {
        zoomControl: true,
      }).setView([39.914, 8.601], 14);

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        })
        .addTo(map);

      if (wmsServiceUrl && wmsProjectFile) {
        const wmsUrl = new URL(wmsServiceUrl);
        wmsUrl.searchParams.set('MAP', wmsProjectFile);

        leaflet
          .tileLayer
          .wms(wmsUrl.toString(), {
            layers: 'pcb_subject_parcel_links,pcb_parcels,pcb_subjects',
            format: 'image/png',
            transparent: true,
            version: '1.3.0',
            opacity: 0.72,
          })
          .addTo(map);
      }

      map.on('click', async (event) => {
        const size = map?.getSize();
        const bounds = map?.getBounds();

        if (!map || !size || !bounds || !wmsServiceUrl || !wmsProjectFile) {
          return;
        }

        const point = map.latLngToContainerPoint(event.latlng);
        const params = new URLSearchParams({
          layers: 'pcb_subject_parcel_links,pcb_parcels,pcb_subjects',
          queryLayers: 'pcb_subject_parcel_links,pcb_parcels,pcb_subjects',
          styles: 'default,default,default',
          crs: 'EPSG:4326',
          bbox: `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`,
          width: String(size.x),
          height: String(size.y),
          i: String(Math.round(point.x)),
          j: String(Math.round(point.y)),
          featureCount: '10',
        });

        setFeatureInfoState({
          loading: true,
          error: null,
          features: [],
        });

        try {
          const response = await fetch(`/api/qgis/feature-info?${params.toString()}`, {
            cache: 'no-store',
          });

          if (!response.ok) {
            throw new Error(`GetFeatureInfo failed: ${response.status}`);
          }

          const data = (await response.json()) as QgisFeatureInfoResponse;
          const nextFeatures = data.features ?? [];
          const firstFeature = nextFeatures[0];

          setFeatureInfoState({
            loading: false,
            error: null,
            features: nextFeatures,
          });
          setSelectedFeatureKey(
            getFeatureSelectionKey(
              asOptionalString(firstFeature?.properties.layer_code),
              asOptionalString(firstFeature?.properties.id),
            ),
          );
        } catch (error) {
          setFeatureInfoState({
            loading: false,
            error: error instanceof Error ? error.message : 'GetFeatureInfo non disponibile',
            features: [],
          });
          setSelectedFeatureKey(null);
        }
      });

      const geoJsonLayer = leaflet.geoJSON(features as unknown as GeoJSON.GeoJsonObject, {
        style(feature) {
          const layerCode = feature?.properties?.layerCode;
          const isFocusedByRoute =
            feature?.properties?.subjectId === selectedSubjectId ||
            feature?.properties?.parcelId === selectedParcelId;
          const isSelectedByFeatureInfo =
            getFeatureSelectionKey(
              typeof layerCode === 'string' ? layerCode : null,
              typeof feature?.id === 'string' ? feature.id : null,
            ) === selectedFeatureKey;
          const isSelected = isFocusedByRoute || isSelectedByFeatureInfo;

          if (layerCode === 'pcb_parcels') {
            return {
              color: isSelected ? '#235347' : '#3d6d64',
              weight: isSelected ? 5 : 2,
              fillColor: isSelected ? '#4d9988' : '#78a59a',
              fillOpacity: isSelected ? 0.62 : 0.35,
            };
          }

          return {
            color: isSelected ? '#8f2d17' : '#c85d3a',
            weight: isSelected ? 5 : 2,
          };
        },
        pointToLayer(feature, latlng) {
          const isFocusedByRoute =
            feature.properties?.subjectId === selectedSubjectId ||
            feature.properties?.parcelId === selectedParcelId;
          const isSelectedByFeatureInfo =
            getFeatureSelectionKey(
              typeof feature.properties?.layerCode === 'string' ? feature.properties.layerCode : null,
              typeof feature.id === 'string' ? feature.id : null,
            ) === selectedFeatureKey;
          const isSelected = isFocusedByRoute || isSelectedByFeatureInfo;

          return leaflet.circleMarker(latlng, {
            radius: isSelected ? 13 : 8,
            color: isSelected ? '#712714' : '#8f3a21',
            weight: isSelected ? 3 : 2,
            fillColor: isSelected ? '#e67d4a' : '#d88a58',
            fillOpacity: 0.9,
          });
        },
        onEachFeature(feature, layer) {
          const properties = feature.properties as GisMapFeature['properties'];
          const sourceFeature = feature as unknown as GisMapFeature;

          layer.on('click', () => {
            const selectedKey = getFeatureSelectionKey(properties.layerCode, sourceFeature.id);

            setSelectedFeatureKey(selectedKey);
            setFeatureInfoState((currentState) => {
              const nextFeature = toFeatureInfoFeature(sourceFeature);
              const alreadyPresent = currentState.features.some(
                (currentFeature) =>
                  getFeatureSelectionKey(
                    asOptionalString(currentFeature.properties.layer_code),
                    asOptionalString(currentFeature.properties.id),
                  ) === selectedKey,
              );

              if (alreadyPresent) {
                return currentState;
              }

              return {
                loading: false,
                error: null,
                features: [nextFeature, ...currentState.features],
              };
            });
          });

          layer.bindPopup(
            `
              <div style="min-width: 220px">
                <strong>${properties.layerName}</strong><br />
                Feature: ${properties.featureExternalId}<br />
                Subject: ${properties.subjectId ?? 'n/a'}<br />
                Parcel: ${properties.parcelId ?? 'n/a'}
              </div>
            `,
          );
        },
      });

      geoJsonLayer.addTo(map);

      const bounds = geoJsonLayer.getBounds();

      if (map && bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [24, 24],
        });
      }
    }

    mountMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [features, selectedSubjectId, selectedParcelId, selectedFeatureKey, wmsServiceUrl, wmsProjectFile]);

  return (
    <div className="grid gap-4">
      <div
        ref={containerRef}
        className="h-[480px] overflow-hidden rounded-[28px] border border-[var(--pcb-line)] shadow-[0_20px_60px_rgba(31,41,51,0.12)]"
      />
      <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--pcb-ink)]">Interrogazione mappa</p>
        <p className="mt-1 text-xs text-[var(--pcb-muted)]">
          Clicca sul viewer per interrogare il publication target QGIS con `GetFeatureInfo`.
        </p>
        <p className="mt-1 text-xs text-[var(--pcb-muted)]">
          Layer interrogati: `pcb_subject_parcel_links`, `pcb_parcels`, `pcb_subjects`.
        </p>
        {featureInfoState.loading ? (
          <p className="mt-3 text-sm text-[var(--pcb-muted)]">Caricamento feature info...</p>
        ) : null}
        {featureInfoState.error ? (
          <p className="mt-3 text-sm text-[#9b3d2e]">{featureInfoState.error}</p>
        ) : null}
        {!featureInfoState.loading &&
        !featureInfoState.error &&
        featureInfoState.features.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--pcb-muted)]">Nessun risultato ancora caricato.</p>
        ) : null}
        {featureInfoState.features.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {featureInfoState.features.map((feature) => (
              <article key={feature.id} className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-bg)]/55 p-4">
                <p className="text-sm font-semibold text-[var(--pcb-ink)]">{feature.id}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFeatureKey(
                        getFeatureSelectionKey(
                          asOptionalString(feature.properties.layer_code),
                          asOptionalString(feature.properties.id),
                        ),
                      )
                    }
                    className="rounded-full border border-[var(--pcb-line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                  >
                    Evidenzia in mappa
                  </button>
                  {asOptionalString(feature.properties.subject_id) ? (
                    <Link
                      href={`/subjects/${asOptionalString(feature.properties.subject_id)}`}
                      className="rounded-full border border-[var(--pcb-line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                    >
                      Apri soggetto
                    </Link>
                  ) : null}
                  {asOptionalString(feature.properties.parcel_id) ? (
                    <Link
                      href={`/parcels/${asOptionalString(feature.properties.parcel_id)}`}
                      className="rounded-full border border-[var(--pcb-line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
                    >
                      Apri particella
                    </Link>
                  ) : null}
                  {asOptionalString(feature.properties.subject_id) || asOptionalString(feature.properties.parcel_id) ? (
                    <Link
                      href={`/gis${asOptionalString(feature.properties.subject_id) ? `?subjectId=${asOptionalString(feature.properties.subject_id)}` : asOptionalString(feature.properties.parcel_id) ? `?parcelId=${asOptionalString(feature.properties.parcel_id)}` : ''}`}
                      className="rounded-full bg-[var(--pcb-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                    >
                      Apri focus GIS
                    </Link>
                  ) : null}
                </div>
                {getFeatureSelectionKey(
                  asOptionalString(feature.properties.layer_code),
                  asOptionalString(feature.properties.id),
                ) === selectedFeatureKey ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-accent)]">
                    Feature attualmente evidenziata nel viewer
                  </p>
                ) : null}
                <div className="mt-2 grid gap-1 text-xs text-[var(--pcb-muted)]">
                  {Object.entries(feature.properties).map(([key, value]) => (
                    <p key={key}>
                      <strong className="text-[var(--pcb-ink)]">{key}</strong>: {String(value)}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
