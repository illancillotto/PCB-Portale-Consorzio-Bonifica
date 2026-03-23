CREATE OR REPLACE VIEW gis.v_qgis_parcels AS
SELECT
  fl.id,
  fl.feature_external_id,
  fl.subject_id,
  s.cuua,
  current_name.display_name AS subject_display_name,
  fl.parcel_id,
  p.comune,
  p.foglio,
  p.particella,
  p.subalterno,
  lc.code AS layer_code,
  lc.name AS layer_name,
  fl.valid_from,
  fl.valid_to,
  fl.geometry
FROM gis.feature_link fl
INNER JOIN gis.layer_catalog lc
  ON lc.id = fl.layer_id
LEFT JOIN catasto.parcel p
  ON p.id = fl.parcel_id
LEFT JOIN anagrafe.master_subject s
  ON s.id = fl.subject_id
LEFT JOIN LATERAL (
  SELECT snh.display_name
  FROM anagrafe.subject_name_history snh
  WHERE snh.subject_id = fl.subject_id
  ORDER BY snh.valid_to IS NULL DESC, snh.valid_from DESC
  LIMIT 1
) AS current_name
  ON TRUE
WHERE lc.code = 'pcb_parcels'
  AND fl.geometry IS NOT NULL;

CREATE OR REPLACE VIEW gis.v_qgis_subjects AS
SELECT
  fl.id,
  fl.feature_external_id,
  fl.subject_id,
  s.cuua,
  current_name.display_name AS subject_display_name,
  fl.parcel_id,
  p.comune,
  p.foglio,
  p.particella,
  p.subalterno,
  lc.code AS layer_code,
  lc.name AS layer_name,
  fl.valid_from,
  fl.valid_to,
  fl.geometry
FROM gis.feature_link fl
INNER JOIN gis.layer_catalog lc
  ON lc.id = fl.layer_id
LEFT JOIN catasto.parcel p
  ON p.id = fl.parcel_id
LEFT JOIN anagrafe.master_subject s
  ON s.id = fl.subject_id
LEFT JOIN LATERAL (
  SELECT snh.display_name
  FROM anagrafe.subject_name_history snh
  WHERE snh.subject_id = fl.subject_id
  ORDER BY snh.valid_to IS NULL DESC, snh.valid_from DESC
  LIMIT 1
) AS current_name
  ON TRUE
WHERE lc.code = 'pcb_subjects'
  AND fl.geometry IS NOT NULL;

CREATE OR REPLACE VIEW gis.v_qgis_subject_parcel_links AS
SELECT
  spr.id,
  s.id AS subject_id,
  s.cuua,
  current_name.display_name AS subject_display_name,
  p.id AS parcel_id,
  p.comune,
  p.foglio,
  p.particella,
  p.subalterno,
  spr.relation_type,
  spr.title,
  spr.quota,
  spr.valid_from,
  spr.valid_to,
  ST_MakeLine(
    ST_PointOnSurface(subject_feature.geometry),
    ST_PointOnSurface(parcel_feature.geometry)
  )::geometry(LineString, 4326) AS geometry
FROM catasto.subject_parcel_relation spr
INNER JOIN anagrafe.master_subject s
  ON s.id = spr.subject_id
INNER JOIN catasto.parcel p
  ON p.id = spr.parcel_id
INNER JOIN gis.feature_link subject_feature
  ON subject_feature.subject_id = spr.subject_id
 AND ST_GeometryType(subject_feature.geometry) = 'ST_Point'
INNER JOIN gis.feature_link parcel_feature
  ON parcel_feature.parcel_id = spr.parcel_id
 AND ST_GeometryType(parcel_feature.geometry) = 'ST_Polygon'
LEFT JOIN LATERAL (
  SELECT snh.display_name
  FROM anagrafe.subject_name_history snh
  WHERE snh.subject_id = spr.subject_id
  ORDER BY snh.valid_to IS NULL DESC, snh.valid_from DESC
  LIMIT 1
) AS current_name
  ON TRUE;
