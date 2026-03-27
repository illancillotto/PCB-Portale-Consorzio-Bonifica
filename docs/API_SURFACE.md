# PCB – API Surface

Vista sintetica della superficie API utile per sviluppo, smoke e troubleshooting.

Base URL locale:

- `http://127.0.0.1:5010/api/v1`

## 1. Endpoint tecnici pubblici

- `GET /health`

Uso tipico:

```bash
curl -fsS http://127.0.0.1:5010/api/v1/health
```

## 2. Endpoint autenticati senza ruolo operatore

- `GET /auth/session`

Uso tipico:

- validazione sessione frontend via bearer token

## 3. Endpoint protetti da ruolo `pcb-operator`

### System

- `GET /system/modules`
- `GET /system/integrations`

### Auth operativo

- `GET /auth/keycloak`
- `GET /auth/keycloak/discovery`
- `GET /auth/operator-access`

### Subjects

- `GET /subjects`
- `GET /subjects/{id}`
- `GET /subjects/by-cuua/{cuua}`
- `GET /subjects/{id}/history`
- `GET /subjects/{id}/parcels`

### Parcels

- `GET /parcels`
- `GET /parcels/{id}`
- `GET /parcels/{id}/subjects`

### Search

- `GET /search?q=...`

### Audit

- `GET /audit/events`
- `GET /audit/summary`
- `GET /audit/entity-summaries`

### GIS

- `GET /gis/layers`
- `GET /gis/feature-links`
- `GET /gis/map-features`
- `GET /gis/subject-parcel-links`
- `GET /gis/publication-status`

### Ingestion

- `GET /ingestion/connectors`
- `GET /ingestion/connectors/issues`
- `GET /ingestion/connectors/{connectorName}`
- `GET /ingestion/connectors/{connectorName}/runs`
- `GET /ingestion/orchestration-summary`
- `GET /ingestion/runs`
- `GET /ingestion/runs/{id}`
- `GET /ingestion/runs/{id}/raw-records`
- `GET /ingestion/runs/{id}/pipeline-summary`
- `GET /ingestion/runs/{id}/normalized-records`
- `GET /ingestion/runs/{id}/matching-results`
- `POST /ingestion/connectors/{connectorName}/run`
- `POST /ingestion/runs/{id}/normalize`
- `POST /ingestion/runs/{id}/match`
- `POST /ingestion/runs/{id}/matching-results/{resultId}/confirm-match`
- `POST /ingestion/runs/{id}/matching-results/{resultId}/confirm-no-match`
- `POST /ingestion/runs/{id}/matching-results/{resultId}/assign-subject/{subjectId}`

## 4. Filtri query principali

### Audit

- `/audit/events`
  - `eventType`
  - `actorType`
  - `sourceModule`
  - `entityType`
  - `entityId`

- `/audit/summary`
  - stessi filtri di `audit/events`

- `/audit/entity-summaries`
  - `entityType`
  - `entityIds`

### GIS

- `/gis/feature-links`
  - `subjectId`
  - `parcelId`

- `/gis/map-features`
  - `subjectId`
  - `parcelId`

- `/gis/subject-parcel-links`
  - `subjectId`
  - `parcelId`

### Ingestion

- `/ingestion/connectors`
  - `operationalStatus`
  - `triggerMode`

- `/ingestion/connectors/issues`
  - `connectorName`
  - `severity`
  - `issueType`

- `/ingestion/connectors/{connectorName}/runs`
  - `status`

- `/ingestion/runs/{id}/raw-records`
  - `outcomeCode`

- `/ingestion/runs/{id}/normalized-records`
  - `status`
  - `outcomeCode`

- `/ingestion/runs/{id}/matching-results`
  - `status`
  - `outcomeCode`

## 5. Endpoint più utili per smoke locale

### Smoke base

- `GET /health`
- `GET /auth/operator-access`
- `GET /gis/publication-status`

### Smoke ingestion

- `POST /ingestion/connectors/connector-nas-catasto/run`
- `GET /ingestion/runs/{id}`
- `GET /ingestion/runs/{id}/pipeline-summary`

### Smoke GIS

- `GET /gis/map-features`
- proxy frontend `GET /api/qgis/feature-info?...`

## 6. Error shape

Le response di errore backend sono normalizzate:

- `statusCode`
- `error.code`
- `error.type`
- `error.message`
- `error.details`
- `error.path`
- `error.timestamp`
- `error.requestId`

Header correlato:

- `x-request-id`

## 7. Documenti correlati

- [backend/README.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/backend/README.md)
- [docs/OPERATIONS_RUNBOOK.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/OPERATIONS_RUNBOOK.md)
- [DEVELOPER_CHECKLIST.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/DEVELOPER_CHECKLIST.md)
