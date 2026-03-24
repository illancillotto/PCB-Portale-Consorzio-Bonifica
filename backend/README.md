# PCB Backend

Backend NestJS organizzato come modular monolith.

## Moduli iniziali

- `core`
- `auth`
- `anagrafiche`
- `ingest`
- `audit`
- `catasto`
- `gis`
- `search`

## Principi applicati

- prefisso API `api/v1`
- logica di dominio nei service
- integrazione Keycloak isolata nel modulo `auth`
- nessuna logica connector nel backend applicativo
- predisposizione per separazione `raw` / `normalized` / `master`
- accesso DB esplicito con `pg`, senza ORM in questa fase

## Comandi

```bash
npm install
npm run dev
```

## Endpoint iniziali

- `GET /api/v1/health`
- `GET /api/v1/system/modules`
- `GET /api/v1/system/integrations`
- `GET /api/v1/auth/keycloak`
- `GET /api/v1/auth/keycloak/discovery`
- `GET /api/v1/auth/session`
- `GET /api/v1/auth/operator-access`
- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{id}`
- `GET /api/v1/subjects/by-cuua/{cuua}`
- `GET /api/v1/subjects/{id}/history`
- `GET /api/v1/subjects/{id}/parcels`
- `GET /api/v1/subjects/{id}` include source links e documenti collegati
- `GET /api/v1/ingestion/runs`
- `GET /api/v1/ingestion/connectors`
  supporta filtri query `operationalStatus` e `triggerMode`
- `GET /api/v1/ingestion/connectors/{connectorName}`
- `GET /api/v1/ingestion/connectors/{connectorName}/runs`
  supporta filtro query `status`
- `GET /api/v1/ingestion/connectors/issues`
  supporta filtri query `connectorName`, `severity` e `issueType`
- `GET /api/v1/ingestion/orchestration-summary`
- `GET /api/v1/ingestion/runs/{id}`
- `POST /api/v1/ingestion/runs/{id}/normalize`
- `GET /api/v1/ingestion/runs/{id}/normalized-records`
- `POST /api/v1/ingestion/runs/{id}/match`
- `GET /api/v1/ingestion/runs/{id}/matching-results`
- `POST /api/v1/ingestion/runs/{id}/matching-results/{resultId}/confirm-match`
- `POST /api/v1/ingestion/runs/{id}/matching-results/{resultId}/confirm-no-match`
- `POST /api/v1/ingestion/runs/{id}/matching-results/{resultId}/assign-subject/{subjectId}`
- `POST /api/v1/ingestion/connectors/{connectorName}/run`
- `GET /api/v1/audit/events`
  supporta filtri query `eventType`, `actorType` e `sourceModule`

Note matching:

- priorita` a match esatti su `CUUA` e identificativi
- supporto a match `source-link aware`
- supporto a match su nome soggetto canonico per ridurre review evitabili
- decisioni manuali di matching tracciate anche in `audit.audit_event`
- eventi audit automatici per `connector_run_requested`, `connector_run_completed`, `connector_run_failed`, `ingestion_normalized`, `ingestion_matched`
- il trigger manuale `POST /api/v1/ingestion/connectors/{connectorName}/run` esegue il CLI reale del connector quando `connectors/dist` è disponibile
- per `connector-nas-catasto` il backend riusa la `ingestion_run` già creata e forza la persistenza nel layer `raw ingest`
- il chaining post-run è configurabile via `PCB_INGEST_AUTO_NORMALIZE` e `PCB_INGEST_AUTO_MATCH`
- `PCB_INGEST_AUTO_MATCH` è effettivo solo se `PCB_INGEST_AUTO_NORMALIZE=true`
- a completamento del connector il backend può orchestrare automaticamente `normalize -> match` sulla stessa run
- Redis operativo per:
  - `PING` da health/runtime metadata
  - marker di run manuale ingest
  - stato effimero di normalizzazione e matching
- il catalogo connector ingestion espone anche readiness runtime locale
- il trigger manuale backend rifiuta connector supportati ma non eseguibili nel contesto corrente
- `GET /api/v1/ingestion/orchestration-summary` espone anche conteggi readiness runtime (`configured`, `runnable`, `persistent`)
- `GET /api/v1/ingestion/orchestration-summary` espone anche conteggi sintetici su issue connector (`critical`, `warning`, `blocked`, `dry-run`)
- `GET /api/v1/ingestion/orchestration-summary` espone anche il conteggio dei connector `healthy`
- `GET /api/v1/ingestion/connectors/{connectorName}` espone anche storico operativo sintetico (`lastCompletedRun`, `lastFailedRun`, contatori record)
- `GET /api/v1/ingestion/connectors` e `GET /api/v1/ingestion/connectors/{connectorName}` espongono anche contatori di issue aperte
- `GET /api/v1/ingestion/connectors/{connectorName}` espone anche l’elenco issue del singolo connector
- il dettaglio connector espone anche contatori per tipo di issue
- catalogo e dettaglio connector espongono anche `operationalStatus` derivato da issue critiche/warning
- il catalogo connector e` ordinato backend-side per priorita` operativa (`critical -> warning -> healthy`)
- il feed issue connector e` ordinato backend-side per severita` e poi per connector
- `GET /api/v1/parcels`
- `GET /api/v1/parcels/{id}`
- `GET /api/v1/parcels/{id}/subjects`
- `GET /api/v1/search?q=...`
- `GET /api/v1/gis/layers`
- `GET /api/v1/gis/feature-links`
  supporta filtri query `subjectId` e `parcelId`
- `GET /api/v1/gis/map-features`
  supporta filtri query `subjectId` e `parcelId`
- `GET /api/v1/gis/subject-parcel-links`
  supporta filtri query `subjectId` e `parcelId`
- `GET /api/v1/gis/publication-status`

API protette da ruolo `pcb-operator`:

- tutte le route `GET/POST /api/v1/ingestion/...`
- tutte le route `GET /api/v1/gis/...`
- tutte le route `GET /api/v1/audit/...`

Il dominio `gis` espone anche lo stato del publication target QGIS Server via `GET /api/v1/gis/publication-status`.
Il controllo usa `PCB_QGIS_SERVER_URL` e `PCB_QGIS_PROJECT_FILE` per verificare `GetCapabilities` sul route pubblico `/ows/`.
Il publication target locale espone gia` i layer tematici reali `pcb_parcels`, `pcb_subjects` e `pcb_subject_parcel_links`.

## Keycloak locale

`docker compose` importa automaticamente il realm `pcb` da `infra/keycloak/import/realm-pcb.json`.

Credenziali seed sviluppo:

- utente `pcb.operator` / password `pcb.operator`
- utente `pcb.admin` / password `pcb.admin`
- client backend `pcb-backend`
- secret backend `change-me`
- client frontend `pcb-frontend`
