CREATE TABLE IF NOT EXISTS catasto.parcel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comune varchar(128) NOT NULL,
  foglio varchar(32) NOT NULL,
  particella varchar(32) NOT NULL,
  subalterno varchar(32),
  geometry_id uuid,
  source_system varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parcel_comune_foglio_particella
  ON catasto.parcel (comune, foglio, particella);

CREATE UNIQUE INDEX IF NOT EXISTS uq_parcel_business_key
  ON catasto.parcel (comune, foglio, particella, COALESCE(subalterno, ''));

CREATE TABLE IF NOT EXISTS catasto.subject_parcel_relation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES anagrafe.master_subject(id) ON DELETE CASCADE,
  parcel_id uuid NOT NULL REFERENCES catasto.parcel(id) ON DELETE CASCADE,
  relation_type varchar(64) NOT NULL,
  quota numeric(8,4),
  title varchar(255),
  valid_from timestamptz,
  valid_to timestamptz,
  source_system varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subject_parcel_relation_subject_id
  ON catasto.subject_parcel_relation (subject_id);

CREATE INDEX IF NOT EXISTS idx_subject_parcel_relation_parcel_id
  ON catasto.subject_parcel_relation (parcel_id);

INSERT INTO catasto.parcel (
  id,
  comune,
  foglio,
  particella,
  subalterno,
  source_system
)
VALUES
  (
    '71111111-1111-1111-1111-111111111111',
    'Oristano',
    '12',
    '345',
    NULL,
    'bootstrap'
  ),
  (
    '72222222-2222-2222-2222-222222222222',
    'Cabras',
    '7',
    '89',
    '1',
    'bootstrap'
  )
ON CONFLICT DO NOTHING;

INSERT INTO catasto.subject_parcel_relation (
  id,
  subject_id,
  parcel_id,
  relation_type,
  quota,
  title,
  valid_from,
  source_system
)
VALUES
  (
    '81111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '71111111-1111-1111-1111-111111111111',
    'owner',
    1.0000,
    'piena proprietà',
    now(),
    'bootstrap'
  ),
  (
    '82222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '72222222-2222-2222-2222-222222222222',
    'tenant',
    NULL,
    'conduzione',
    now(),
    'bootstrap'
  )
ON CONFLICT DO NOTHING;
