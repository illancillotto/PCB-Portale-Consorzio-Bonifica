UPDATE gis.layer_catalog
SET publication_status = 'published'
WHERE code = 'pcb_subjects';

INSERT INTO gis.layer_catalog (
  id,
  name,
  code,
  owner_module,
  publication_status,
  source_system,
  geometry_type,
  metadata_jsonb
)
VALUES (
  'b3333333-3333-3333-3333-333333333333',
  'Relazioni soggetto-particella',
  'pcb_subject_parcel_links',
  'gis',
  'published',
  'bootstrap',
  'LineString',
  '{"theme":"relations","description":"Layer lineare delle relazioni soggetto-particella"}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO gis.feature_link (
  id,
  layer_id,
  feature_external_id,
  subject_id,
  parcel_id,
  valid_from,
  geometry
)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'b2222222-2222-2222-2222-222222222222',
  'subject-feature-001',
  '11111111-1111-1111-1111-111111111111',
  NULL,
  now(),
  ST_GeomFromText('POINT(8.6000 39.9132)', 4326)
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO gis.feature_link (
  id,
  layer_id,
  feature_external_id,
  subject_id,
  parcel_id,
  valid_from,
  geometry
)
VALUES (
  'c4444444-4444-4444-4444-444444444444',
  'b1111111-1111-1111-1111-111111111111',
  'parcel-feature-002',
  NULL,
  '72222222-2222-2222-2222-222222222222',
  now(),
  ST_GeomFromText(
    'POLYGON((8.6942 39.9614, 8.7002 39.9614, 8.7002 39.9656, 8.6942 39.9656, 8.6942 39.9614))',
    4326
  )
)
ON CONFLICT (id) DO NOTHING;
