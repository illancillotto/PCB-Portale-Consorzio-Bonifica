'use client';

import 'leaflet/dist/leaflet.css';
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
            layers: 'pcb_parcels,pcb_subjects',
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
          layers: 'pcb_parcels,pcb_subjects',
          queryLayers: 'pcb_parcels,pcb_subjects',
          styles: 'default,default',
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

          setFeatureInfoState({
            loading: false,
            error: null,
            features: data.features ?? [],
          });
        } catch (error) {
          setFeatureInfoState({
            loading: false,
            error: error instanceof Error ? error.message : 'GetFeatureInfo non disponibile',
            features: [],
          });
        }
      });

      const geoJsonLayer = leaflet.geoJSON(features as unknown as GeoJSON.GeoJsonObject, {
        style(feature) {
          const layerCode = feature?.properties?.layerCode;
          const isSelected =
            feature?.properties?.subjectId === selectedSubjectId ||
            feature?.properties?.parcelId === selectedParcelId;

          if (layerCode === 'pcb_parcels') {
            return {
              color: isSelected ? '#235347' : '#3d6d64',
              weight: isSelected ? 4 : 2,
              fillColor: isSelected ? '#4d9988' : '#78a59a',
              fillOpacity: isSelected ? 0.5 : 0.35,
            };
          }

          return {
            color: isSelected ? '#8f2d17' : '#c85d3a',
            weight: isSelected ? 4 : 2,
          };
        },
        pointToLayer(feature, latlng) {
          const isSelected =
            feature.properties?.subjectId === selectedSubjectId ||
            feature.properties?.parcelId === selectedParcelId;

          return leaflet.circleMarker(latlng, {
            radius: isSelected ? 11 : 8,
            color: isSelected ? '#712714' : '#8f3a21',
            weight: isSelected ? 3 : 2,
            fillColor: isSelected ? '#e67d4a' : '#d88a58',
            fillOpacity: 0.9,
          });
        },
        onEachFeature(feature, layer) {
          const properties = feature.properties as GisMapFeature['properties'];
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
  }, [features, selectedSubjectId, selectedParcelId, wmsServiceUrl, wmsProjectFile]);

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
              <article
                key={feature.id}
                className="rounded-2xl border border-[var(--pcb-line)] bg-[var(--pcb-bg)]/55 p-4"
              >
                <p className="text-sm font-semibold text-[var(--pcb-ink)]">{feature.id}</p>
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
