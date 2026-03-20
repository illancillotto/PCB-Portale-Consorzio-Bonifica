# PCB – Modello dati iniziale

## 1. Decisione DB

Database principale: **PostgreSQL + PostGIS**

### Perché
- relazioni forti
- storico temporale
- GIS tecnico
- audit e tracciabilità
- matching e riconciliazione
- query amministrative e territoriali complesse

MongoDB non deve essere usato come database principale del progetto.

## 2. Principio di modellazione

Il dominio è centrato sul **soggetto master** e sui suoi identificativi.

### Chiavi
- chiave tecnica primaria: UUID o bigint interno
- chiave di business: CUUA

## 3. Schemi consigliati

- `core`
- `anagrafe`
- `catasto`
- `gis`
- `docs`
- `ingest`
- `audit`
- `reporting`

## 4. Tabelle fondamentali

### anagrafe.master_subject
Campi minimi:
- id
- cuua
- status
- created_at
- updated_at
- confidence_score
- notes

### anagrafe.subject_identifier
- id
- subject_id
- identifier_type
- identifier_value
- source_system
- source_record_id
- valid_from
- valid_to

### anagrafe.subject_name_history
- id
- subject_id
- display_name
- source_system
- valid_from
- valid_to

### anagrafe.subject_address_history
- id
- subject_id
- address_text
- source_system
- valid_from
- valid_to

### anagrafe.subject_source_link
- id
- subject_id
- source_system
- source_record_id
- source_url
- is_active
- first_seen_at
- last_seen_at

### catasto.parcel
- id
- comune
- foglio
- particella
- subalterno
- geometry_id opzionale
- source_system

### catasto.subject_parcel_relation
- id
- subject_id
- parcel_id
- relation_type
- quota
- title
- valid_from
- valid_to
- source_system

### docs.document_item
- id
- subject_id nullable
- source_system
- file_path
- file_name
- file_hash
- mime_type
- archive_bucket
- discovered_at

### ingest.ingestion_run
- id
- connector_name
- source_system
- started_at
- ended_at
- status
- records_total
- records_success
- records_error
- log_excerpt

### ingest.ingestion_record_raw
- id
- ingestion_run_id
- source_record_id
- payload_jsonb
- payload_hash
- captured_at

### ingest.ingestion_record_normalized
- id
- ingestion_run_id
- source_record_id
- normalized_jsonb
- normalization_status

### ingest.matching_result
- id
- ingestion_run_id
- source_record_id
- matched_subject_id nullable
- matching_score
- decision_type
- decision_status
- notes

### audit.audit_event
- id
- event_type
- actor_type
- actor_id
- source_module
- entity_type
- entity_id
- payload_jsonb
- created_at

## 5. Regole di modellazione

### R-01
Usare campi temporali `valid_from` / `valid_to` dove esiste storicizzazione.

### R-02
Non perdere mai il riferimento alla sorgente.

### R-03
Conservare i raw payload in `jsonb`.

### R-04
Tenere separato:
- raw data
- normalized data
- master data

### R-05
Il GIS va modellato come relazione reale, non come allegato.

## 6. GIS data model

### gis.layer_catalog
- id
- name
- code
- owner_module
- publication_status
- source_system
- geometry_type
- metadata_jsonb

### gis.feature_link
- id
- layer_id
- feature_external_id
- subject_id nullable
- parcel_id nullable
- valid_from
- valid_to

## 7. Query fondamentali che il modello deve supportare

- trova soggetto per CUUA
- mostra storico nominativi del soggetto
- mostra tutti gli ID esterni collegati
- mostra relazioni catastali attuali e storiche
- mostra documenti da NAS e altre sorgenti
- mostra feature GIS collegate
- mostra provenienza dati e run di ingestione

