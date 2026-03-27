# PCB – Local Environment Reference

Riferimento sintetico delle variabili ambiente più rilevanti per bootstrap, runtime e smoke locali.

Per i valori di default completi:

- [/.env.example](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/.env.example)

## 1. Runtime applicativo

### `PCB_API_PORT`

- default: `5010`
- usata da: backend NestJS
- impatto:
  - cambia la porta del backend locale
  - deve restare coerente con `PCB_API_BASE_URL`

### `PCB_API_HOST`

- default: `0.0.0.0`
- usata da: backend NestJS
- impatto:
  - bind del backend locale

### `PCB_API_PREFIX`

- default: `api/v1`
- usata da: backend NestJS
- impatto:
  - prefisso delle route API

### `PCB_FRONTEND_PORT`

- default: `3010`
- usata da: frontend Next.js
- impatto:
  - porta del frontend locale

### `PCB_FRONTEND_BASE_URL`

- default: `http://127.0.0.1:3010`
- usata da: route auth frontend
- impatto:
  - redirect coerenti di login/logout

### `PCB_API_BASE_URL`

- default: `http://127.0.0.1:5010/api/v1`
- usata da:
  - frontend server-side
  - proxy frontend
  - smoke `ingestion` e `gis`
- impatto:
  - endpoint base delle API PCB

### `NEXT_PUBLIC_PCB_API_BASE_URL`

- default: `http://127.0.0.1:5010/api/v1`
- usata da: componenti client-side frontend
- impatto:
  - base URL pubblica verso le API PCB

## 2. PostgreSQL / PostGIS

### `PCB_POSTGRES_HOST`

- default: `localhost`
- usata da:
  - backend
  - connectors

### `PCB_POSTGRES_PORT`

- default: `5432`

### `PCB_POSTGRES_DB`

- default: `pcb`

### `PCB_POSTGRES_USER`

- default: `pcb`

### `PCB_POSTGRES_PASSWORD`

- default: `pcb`

Impatto:

- governano l’accesso DB sia del backend sia dei connectors

## 3. Redis

### `PCB_REDIS_HOST`

- default: `localhost`

### `PCB_REDIS_PORT`

- default: `6379`

### `PCB_REDIS_URL`

- default: `redis://localhost:6379`

Impatto:

- runtime metadata
- marker effimeri di `ingestion`
- health / integrations

## 4. Keycloak

### `PCB_KEYCLOAK_URL`

- default: `http://localhost:8180`
- usata da:
  - backend auth
  - route login frontend
  - smoke auth / ingestion / GIS

### `PCB_KEYCLOAK_REALM`

- default: `pcb`

### `PCB_KEYCLOAK_CLIENT_ID`

- default: `pcb-backend`

### `PCB_KEYCLOAK_CLIENT_SECRET`

- default: `change-me`

### `PCB_KEYCLOAK_FRONTEND_CLIENT_ID`

- default: `pcb-frontend`

Impatto:

- autenticazione reale
- bearer token per route protette
- smoke operativi autenticati

## 5. QGIS

### `PCB_QGIS_SERVER_URL`

- default: `http://localhost:8090/ows/`
- usata da:
  - backend `publication-status`
  - proxy frontend `GetFeatureInfo`
  - smoke GIS

### `PCB_QGIS_PROJECT_FILE`

- default: `/io/projects/pcb.qgs`
- usata da:
  - backend `publication-status`
  - proxy frontend `GetFeatureInfo`

Impatto:

- publication target cartografico
- `GetCapabilities`
- `GetFeatureInfo`

## 6. Ingestion orchestration

### `PCB_INGEST_AUTO_NORMALIZE`

- default: `true`
- usata da: backend `ingest`
- impatto:
  - esegue la normalizzazione automaticamente dopo il connector run

### `PCB_INGEST_AUTO_MATCH`

- default: `true`
- usata da: backend `ingest`
- impatto:
  - esegue il matching automaticamente dopo la normalizzazione
  - e` effettiva solo se `PCB_INGEST_AUTO_NORMALIZE=true`

### `PCB_CONNECTORS_DIST_ROOT`

- default: `.../connectors/dist`
- usata da: backend `ingest`
- impatto:
  - il trigger manuale reale del connector dipende dalla presenza del dist

## 7. Connector NAS

### `PCB_NAS_CATASTO_ROOT`

- default example: `/mnt/ARCHIVIO`
- bootstrap locale: impostata automaticamente a `/tmp/pcb-nas-sample`
- usata da:
  - connector NAS
  - backend `ingest` per readiness runtime
  - smoke `ingestion`

### `PCB_NAS_CATASTO_MAX_DEPTH`

- default: `12`

### `PCB_NAS_CATASTO_HASH_FILES`

- default: `true`

### `PCB_NAS_CATASTO_INCLUDE_HIDDEN`

- default: `false`

### `PCB_NAS_CATASTO_SAMPLE_BYTES`

- default: `65536`

### `PCB_NAS_CATASTO_PERSIST_INGEST`

- default: `true` in `.env.example`
- impatto:
  - consente persistenza su `ingest.ingestion_run` e `ingest.ingestion_record_raw`

### `PCB_INGESTION_RUN_ID`

- usata da:
  - connector NAS
  - backend `ingest`
- impatto:
  - riuso della run esistente invece di crearne una nuova

## 8. Variabili di supporto per gli script

### `PCB_LOCAL_SAMPLE_NAS_ROOT`

- default: `/tmp/pcb-nas-sample`
- usata da: `scripts/prepare-local-runtime.sh`
- impatto:
  - sposta il sample NAS locale in un path diverso

### `PCB_SMOKE_USERNAME`

- default: `pcb.operator`
- usata da:
  - `dev:smoke`
  - `dev:smoke:ingestion`
  - `dev:smoke:gis`

### `PCB_SMOKE_PASSWORD`

- default: `pcb.operator`

### `PCB_SMOKE_CONNECTOR_NAME`

- default: `connector-nas-catasto`
- usata da: `dev:smoke:ingestion`

### `PCB_SMOKE_INGEST_TIMEOUT_SECONDS`

- default: `90`
- usata da: `dev:smoke:ingestion`

## 9. Variabili minime per lavorare in locale

In pratica, per il bootstrap locale standard bastano queste:

- `PCB_API_PORT`
- `PCB_FRONTEND_PORT`
- `PCB_API_BASE_URL`
- `PCB_FRONTEND_BASE_URL`
- `PCB_NAS_CATASTO_ROOT`
- `PCB_KEYCLOAK_URL`
- `PCB_QGIS_SERVER_URL`
- `PCB_QGIS_PROJECT_FILE`

Le altre possono rimanere ai default di `.env.example` se si usa lo stack locale standard.
