'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { GisMapFeature } from '../lib/api';

interface GisMapProps {
  features: GisMapFeature[];
}

export function GisMap({ features }: GisMapProps) {
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

      const geoJsonLayer = leaflet.geoJSON(features as unknown as GeoJSON.GeoJsonObject, {
        style(feature) {
          const layerCode = feature?.properties?.layerCode;

          if (layerCode === 'pcb_parcels') {
            return {
              color: '#3d6d64',
              weight: 2,
              fillColor: '#78a59a',
              fillOpacity: 0.35,
            };
          }

          return {
            color: '#c85d3a',
            weight: 2,
          };
        },
        pointToLayer(feature, latlng) {
          return leaflet.circleMarker(latlng, {
            radius: 8,
            color: '#8f3a21',
            weight: 2,
            fillColor: '#d88a58',
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
  }, [features]);

  return (
    <div
      ref={containerRef}
      className="h-[480px] overflow-hidden rounded-[28px] border border-[var(--pcb-line)] shadow-[0_20px_60px_rgba(31,41,51,0.12)]"
    />
  );
}
