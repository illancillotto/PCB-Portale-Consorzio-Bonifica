CREATE TABLE IF NOT EXISTS anagrafe.master_subject (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuua varchar(32) NOT NULL UNIQUE,
  status varchar(32) NOT NULL,
  confidence_score numeric(5,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_master_subject_confidence_score
    CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

CREATE TABLE IF NOT EXISTS anagrafe.subject_identifier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES anagrafe.master_subject(id) ON DELETE CASCADE,
  identifier_type varchar(64) NOT NULL,
  identifier_value varchar(255) NOT NULL,
  source_system varchar(64) NOT NULL,
  source_record_id varchar(255),
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subject_identifier_subject_id
  ON anagrafe.subject_identifier (subject_id);

CREATE INDEX IF NOT EXISTS idx_subject_identifier_value
  ON anagrafe.subject_identifier (identifier_value);

CREATE TABLE IF NOT EXISTS anagrafe.subject_name_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES anagrafe.master_subject(id) ON DELETE CASCADE,
  display_name varchar(255) NOT NULL,
  source_system varchar(64) NOT NULL,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subject_name_history_subject_id
  ON anagrafe.subject_name_history (subject_id);

CREATE TABLE IF NOT EXISTS anagrafe.subject_address_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES anagrafe.master_subject(id) ON DELETE CASCADE,
  address_text text NOT NULL,
  source_system varchar(64) NOT NULL,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subject_address_history_subject_id
  ON anagrafe.subject_address_history (subject_id);

CREATE TABLE IF NOT EXISTS anagrafe.subject_source_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES anagrafe.master_subject(id) ON DELETE CASCADE,
  source_system varchar(64) NOT NULL,
  source_record_id varchar(255) NOT NULL,
  source_url text,
  is_active boolean NOT NULL DEFAULT true,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_system, source_record_id)
);

CREATE INDEX IF NOT EXISTS idx_subject_source_link_subject_id
  ON anagrafe.subject_source_link (subject_id);

CREATE TABLE IF NOT EXISTS ingest.ingestion_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_name varchar(128) NOT NULL,
  source_system varchar(64) NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  status varchar(32) NOT NULL,
  records_total integer NOT NULL DEFAULT 0,
  records_success integer NOT NULL DEFAULT 0,
  records_error integer NOT NULL DEFAULT 0,
  log_excerpt text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_run_connector_name
  ON ingest.ingestion_run (connector_name);

CREATE INDEX IF NOT EXISTS idx_ingestion_run_status
  ON ingest.ingestion_run (status);

CREATE TABLE IF NOT EXISTS ingest.ingestion_record_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id uuid NOT NULL REFERENCES ingest.ingestion_run(id) ON DELETE CASCADE,
  source_record_id varchar(255) NOT NULL,
  payload_jsonb jsonb NOT NULL,
  payload_hash varchar(128) NOT NULL,
  captured_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_record_raw_run_id
  ON ingest.ingestion_record_raw (ingestion_run_id);

CREATE INDEX IF NOT EXISTS idx_ingestion_record_raw_source_record_id
  ON ingest.ingestion_record_raw (source_record_id);

CREATE TABLE IF NOT EXISTS ingest.ingestion_record_normalized (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id uuid NOT NULL REFERENCES ingest.ingestion_run(id) ON DELETE CASCADE,
  source_record_id varchar(255) NOT NULL,
  normalized_jsonb jsonb NOT NULL,
  normalization_status varchar(32) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_record_normalized_run_id
  ON ingest.ingestion_record_normalized (ingestion_run_id);

CREATE TABLE IF NOT EXISTS ingest.matching_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id uuid NOT NULL REFERENCES ingest.ingestion_run(id) ON DELETE CASCADE,
  source_record_id varchar(255) NOT NULL,
  matched_subject_id uuid REFERENCES anagrafe.master_subject(id) ON DELETE SET NULL,
  matching_score numeric(5,2) NOT NULL DEFAULT 0,
  decision_type varchar(32) NOT NULL,
  decision_status varchar(32) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_matching_result_score
    CHECK (matching_score >= 0 AND matching_score <= 100)
);

CREATE INDEX IF NOT EXISTS idx_matching_result_run_id
  ON ingest.matching_result (ingestion_run_id);

CREATE INDEX IF NOT EXISTS idx_matching_result_matched_subject_id
  ON ingest.matching_result (matched_subject_id);

CREATE TABLE IF NOT EXISTS audit.audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type varchar(64) NOT NULL,
  actor_type varchar(64) NOT NULL,
  actor_id varchar(255),
  source_module varchar(64) NOT NULL,
  entity_type varchar(64) NOT NULL,
  entity_id varchar(255) NOT NULL,
  payload_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_event_event_type
  ON audit.audit_event (event_type);

CREATE INDEX IF NOT EXISTS idx_audit_event_entity
  ON audit.audit_event (entity_type, entity_id);

INSERT INTO anagrafe.master_subject (id, cuua, status, confidence_score, notes)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'RSSMRA80A01H501Z', 'active', 98.50, 'Seed bootstrap PCB'),
  ('22222222-2222-2222-2222-222222222222', '01234560953', 'active', 93.00, 'Seed bootstrap PCB')
ON CONFLICT (cuua) DO NOTHING;

INSERT INTO anagrafe.subject_identifier (
  id,
  subject_id,
  identifier_type,
  identifier_value,
  source_system,
  source_record_id,
  valid_from
)
VALUES
  (
    '31111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'fiscal_code',
    'RSSMRA80A01H501Z',
    'bootstrap',
    'subject-001',
    now()
  ),
  (
    '32222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'vat_number',
    '01234560953',
    'bootstrap',
    'subject-002',
    now()
  )
ON CONFLICT DO NOTHING;

INSERT INTO anagrafe.subject_name_history (
  id,
  subject_id,
  display_name,
  source_system,
  valid_from
)
VALUES
  (
    '41111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Mario Rossi',
    'bootstrap',
    now()
  ),
  (
    '42222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Azienda Agricola Delta Srl',
    'bootstrap',
    now()
  )
ON CONFLICT DO NOTHING;

INSERT INTO ingest.ingestion_run (
  id,
  connector_name,
  source_system,
  started_at,
  ended_at,
  status,
  records_total,
  records_success,
  records_error,
  log_excerpt
)
VALUES
  (
    '51111111-1111-1111-1111-111111111111',
    'connector-nas-catasto',
    'nas-catasto',
    now() - interval '10 minutes',
    now() - interval '8 minutes',
    'completed',
    12,
    12,
    0,
    'Bootstrap inventory run'
  )
ON CONFLICT DO NOTHING;

INSERT INTO audit.audit_event (
  id,
  event_type,
  actor_type,
  actor_id,
  source_module,
  entity_type,
  entity_id,
  payload_jsonb
)
VALUES
  (
    '61111111-1111-1111-1111-111111111111',
    'bootstrap_initialized',
    'system',
    'pcb-bootstrap',
    'core',
    'repository',
    'pcb',
    '{"milestone":"1-2","status":"initialized"}'::jsonb
  )
ON CONFLICT DO NOTHING;
