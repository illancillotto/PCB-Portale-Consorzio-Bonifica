'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { GisMapFeature } from '../lib/api';

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
    <div
      ref={containerRef}
      className="h-[480px] overflow-hidden rounded-[28px] border border-[var(--pcb-line)] shadow-[0_20px_60px_rgba(31,41,51,0.12)]"
    />
  );
}
