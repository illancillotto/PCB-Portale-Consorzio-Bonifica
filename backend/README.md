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
- placeholder Keycloak isolato nel modulo `auth`
- nessuna logica connector nel backend applicativo
- predisposizione per separazione `raw` / `normalized` / `master`

## Comandi

```bash
npm install
npm run dev
```

## Endpoint iniziali

- `GET /api/v1/health`
- `GET /api/v1/system/modules`
- `GET /api/v1/auth/keycloak`
- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{id}`
- `GET /api/v1/subjects/by-cuua/{cuua}`
- `GET /api/v1/subjects/{id}/history`
- `GET /api/v1/ingestion/runs`
- `GET /api/v1/ingestion/runs/{id}`
- `POST /api/v1/ingestion/connectors/{connectorName}/run`
- `GET /api/v1/audit/events`
