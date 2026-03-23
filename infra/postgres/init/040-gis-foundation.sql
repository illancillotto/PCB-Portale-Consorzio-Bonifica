CREATE TABLE IF NOT EXISTS gis.layer_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  code varchar(64) NOT NULL UNIQUE,
  owner_module varchar(64) NOT NULL,
  publication_status varchar(32) NOT NULL,
  source_system varchar(64) NOT NULL,
  geometry_type varchar(32) NOT NULL,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gis.feature_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid NOT NULL REFERENCES gis.layer_catalog(id) ON DELETE CASCADE,
  feature_external_id varchar(255) NOT NULL,
  subject_id uuid REFERENCES anagrafe.master_subject(id) ON DELETE SET NULL,
  parcel_id uuid REFERENCES catasto.parcel(id) ON DELETE SET NULL,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_link_layer_id
  ON gis.feature_link (layer_id);

CREATE INDEX IF NOT EXISTS idx_feature_link_subject_id
  ON gis.feature_link (subject_id);

CREATE INDEX IF NOT EXISTS idx_feature_link_parcel_id
  ON gis.feature_link (parcel_id);

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
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'Particelle consortili',
    'pcb_parcels',
    'gis',
    'published',
    'bootstrap',
    'Polygon',
    '{"theme":"catasto","description":"Layer base particelle collegate ai soggetti"}'::jsonb
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Soggetti georiferiti',
    'pcb_subjects',
    'gis',
    'draft',
    'bootstrap',
    'Point',
    '{"theme":"anagrafe","description":"Layer derivato per collocazione soggetti"}'::jsonb
  )
ON CONFLICT (code) DO NOTHING;

INSERT INTO gis.feature_link (
  id,
  layer_id,
  feature_external_id,
  subject_id,
  parcel_id,
  valid_from
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'parcel-feature-001',
    '11111111-1111-1111-1111-111111111111',
    '71111111-1111-1111-1111-111111111111',
    now()
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'subject-feature-002',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    now()
  )
ON CONFLICT DO NOTHING;
