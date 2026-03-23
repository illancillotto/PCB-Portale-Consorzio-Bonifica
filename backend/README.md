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

Note matching:

- priorita` a match esatti su `CUUA` e identificativi
- supporto a match `source-link aware`
- supporto a match su nome soggetto canonico per ridurre review evitabili
- decisioni manuali di matching tracciate anche in `audit.audit_event`
- eventi audit automatici per `connector_run_requested`, `ingestion_normalized`, `ingestion_matched`
- Redis operativo per:
  - `PING` da health/runtime metadata
  - marker di run manuale ingest
  - stato effimero di normalizzazione e matching
- `GET /api/v1/parcels`
- `GET /api/v1/parcels/{id}`
- `GET /api/v1/parcels/{id}/subjects`
- `GET /api/v1/search?q=...`
- `GET /api/v1/gis/layers`
- `GET /api/v1/gis/feature-links`

API protette da ruolo `pcb-operator`:

- tutte le route `GET/POST /api/v1/ingestion/...`
- tutte le route `GET /api/v1/gis/...`
- tutte le route `GET /api/v1/audit/...`

## Keycloak locale

`docker compose` importa automaticamente il realm `pcb` da `infra/keycloak/import/realm-pcb.json`.

Credenziali seed sviluppo:

- utente `pcb.operator` / password `pcb.operator`
- utente `pcb.admin` / password `pcb.admin`
- client backend `pcb-backend`
- secret backend `change-me`
- client frontend `pcb-frontend`
