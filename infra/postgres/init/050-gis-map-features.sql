ALTER TABLE gis.feature_link
  ADD COLUMN IF NOT EXISTS geometry geometry(Geometry, 4326);

CREATE INDEX IF NOT EXISTS idx_feature_link_geometry
  ON gis.feature_link
  USING GIST (geometry);

UPDATE gis.feature_link
SET geometry = ST_GeomFromText(
  'POLYGON((8.5962 39.9098, 8.6038 39.9098, 8.6038 39.9152, 8.5962 39.9152, 8.5962 39.9098))',
  4326
)
WHERE id = 'c1111111-1111-1111-1111-111111111111'
  AND geometry IS NULL;

UPDATE gis.feature_link
SET geometry = ST_GeomFromText('POINT(8.6004 39.9179)', 4326)
WHERE id = 'c2222222-2222-2222-2222-222222222222'
  AND geometry IS NULL;
