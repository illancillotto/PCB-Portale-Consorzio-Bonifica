CREATE TABLE IF NOT EXISTS docs.document_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES anagrafe.master_subject(id) ON DELETE SET NULL,
  source_system varchar(64) NOT NULL,
  file_path text NOT NULL,
  file_name varchar(255) NOT NULL,
  file_hash varchar(128),
  mime_type varchar(128),
  archive_bucket varchar(128),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_item_subject_id
  ON docs.document_item (subject_id);

CREATE INDEX IF NOT EXISTS idx_document_item_source_system
  ON docs.document_item (source_system);

INSERT INTO anagrafe.subject_source_link (
  id,
  subject_id,
  source_system,
  source_record_id,
  source_url,
  is_active,
  first_seen_at,
  last_seen_at
)
VALUES
  (
    '91111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'nas-catasto',
    'nas-folder-mario-rossi',
    'smb://archivio/M/MarioRossi',
    true,
    now(),
    now()
  ),
  (
    '92222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'capacitas-involture',
    'inv-002',
    'https://capacitas.example.local/involture/002',
    true,
    now(),
    now()
  )
ON CONFLICT (source_system, source_record_id) DO NOTHING;

INSERT INTO docs.document_item (
  id,
  subject_id,
  source_system,
  file_path,
  file_name,
  file_hash,
  mime_type,
  archive_bucket,
  discovered_at
)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'nas-catasto',
    '/ARCHIVIO/M/MarioRossi/voltura-2024.pdf',
    'voltura-2024.pdf',
    'hash-bootstrap-001',
    'application/pdf',
    'nas-catasto',
    now()
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'capacitas-involture',
    '/exports/involture/azienda-delta/istanza-voltura.pdf',
    'istanza-voltura.pdf',
    'hash-bootstrap-002',
    'application/pdf',
    'capacitas',
    now()
  )
ON CONFLICT DO NOTHING;
