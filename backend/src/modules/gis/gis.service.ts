import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { GisFeatureLinkResponseDto } from './dto/feature-link-response.dto';
import { GisLayerResponseDto } from './dto/layer-response.dto';
import { GisMapFeatureResponseDto } from './dto/map-feature-response.dto';
import { GisPublicationStatusResponseDto } from './dto/publication-status-response.dto';

interface GisLayerRow {
  id: string;
  name: string;
  code: string;
  owner_module: string;
  publication_status: string;
  source_system: string;
  geometry_type: string;
  metadata_jsonb: Record<string, unknown>;
  linked_subjects: string;
  linked_parcels: string;
}

interface GisFeatureLinkRow {
  id: string;
  layer_code: string;
  feature_external_id: string;
  subject_id: string | null;
  parcel_id: string | null;
  valid_from: Date | string | null;
  valid_to: Date | string | null;
}

interface GisMapFeatureRow {
  id: string;
  layer_code: string;
  layer_name: string;
  feature_external_id: string;
  subject_id: string | null;
  parcel_id: string | null;
  valid_from: Date | string | null;
  valid_to: Date | string | null;
  geometry_geojson: string;
}

@Injectable()
export class GisService {
  constructor(private readonly databaseService: DatabaseService) {}

  getFoundation() {
    return {
      databaseExtension: 'postgis',
      publicationTarget: 'qgis-server',
    };
  }

  async getPublicationStatus(): Promise<GisPublicationStatusResponseDto> {
    const serviceUrl = process.env.PCB_QGIS_SERVER_URL ?? '';

    if (!serviceUrl) {
      return {
        publicationTarget: 'qgis-server',
        serviceUrl,
        configured: false,
        available: false,
        statusCode: null,
        statusLabel: 'not_configured',
        checkedAt: new Date().toISOString(),
      };
    }

    const requestUrl = new URL(serviceUrl);
    requestUrl.searchParams.set('SERVICE', 'WMS');
    requestUrl.searchParams.set('REQUEST', 'GetCapabilities');

    try {
      const response = await fetch(requestUrl, {
        headers: {
          Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
        },
      });

      return {
        publicationTarget: 'qgis-server',
        serviceUrl,
        configured: true,
        available: response.ok,
        statusCode: response.status,
        statusLabel: response.ok ? 'ok' : 'unavailable',
        checkedAt: new Date().toISOString(),
      };
    } catch {
      return {
        publicationTarget: 'qgis-server',
        serviceUrl,
        configured: true,
        available: false,
        statusCode: null,
        statusLabel: 'unavailable',
        checkedAt: new Date().toISOString(),
      };
    }
  }

  async listLayers(): Promise<{ items: GisLayerResponseDto[]; total: number }> {
    const result = await this.databaseService.query<GisLayerRow>(
      `
        SELECT
          lc.id,
          lc.name,
          lc.code,
          lc.owner_module,
          lc.publication_status,
          lc.source_system,
          lc.geometry_type,
          lc.metadata_jsonb,
          COUNT(fl.subject_id)::text AS linked_subjects,
          COUNT(fl.parcel_id)::text AS linked_parcels
        FROM gis.layer_catalog lc
        LEFT JOIN gis.feature_link fl
          ON fl.layer_id = lc.id
        GROUP BY lc.id
        ORDER BY lc.name
      `,
    );

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        ownerModule: row.owner_module,
        publicationStatus: row.publication_status,
        sourceSystem: row.source_system,
        geometryType: row.geometry_type,
        metadata: row.metadata_jsonb,
        linkedSubjects: Number(row.linked_subjects),
        linkedParcels: Number(row.linked_parcels),
      })),
      total: result.rows.length,
    };
  }

  async listFeatureLinks(): Promise<{ items: GisFeatureLinkResponseDto[]; total: number }> {
    const result = await this.databaseService.query<GisFeatureLinkRow>(
      `
        SELECT
          fl.id,
          lc.code AS layer_code,
          fl.feature_external_id,
          fl.subject_id,
          fl.parcel_id,
          fl.valid_from,
          fl.valid_to
        FROM gis.feature_link fl
        INNER JOIN gis.layer_catalog lc
          ON lc.id = fl.layer_id
        ORDER BY lc.code, fl.feature_external_id
      `,
    );

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        layerCode: row.layer_code,
        featureExternalId: row.feature_external_id,
        subjectId: row.subject_id,
        parcelId: row.parcel_id,
        validFrom: row.valid_from ? new Date(row.valid_from).toISOString() : null,
        validTo: row.valid_to ? new Date(row.valid_to).toISOString() : null,
      })),
      total: result.rows.length,
    };
  }

  async listMapFeatures(): Promise<{ items: GisMapFeatureResponseDto[]; total: number }> {
    const result = await this.databaseService.query<GisMapFeatureRow>(
      `
        SELECT
          fl.id,
          lc.code AS layer_code,
          lc.name AS layer_name,
          fl.feature_external_id,
          fl.subject_id,
          fl.parcel_id,
          fl.valid_from,
          fl.valid_to,
          ST_AsGeoJSON(fl.geometry)::text AS geometry_geojson
        FROM gis.feature_link fl
        INNER JOIN gis.layer_catalog lc
          ON lc.id = fl.layer_id
        WHERE fl.geometry IS NOT NULL
        ORDER BY lc.code, fl.feature_external_id
      `,
    );

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        type: 'Feature',
        geometry: JSON.parse(row.geometry_geojson) as GisMapFeatureResponseDto['geometry'],
        properties: {
          layerCode: row.layer_code,
          layerName: row.layer_name,
          featureExternalId: row.feature_external_id,
          subjectId: row.subject_id,
          parcelId: row.parcel_id,
          validFrom: row.valid_from ? new Date(row.valid_from).toISOString() : null,
          validTo: row.valid_to ? new Date(row.valid_to).toISOString() : null,
        },
      })),
      total: result.rows.length,
    };
  }
}
