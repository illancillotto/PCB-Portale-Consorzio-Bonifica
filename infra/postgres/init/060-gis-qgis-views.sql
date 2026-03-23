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
