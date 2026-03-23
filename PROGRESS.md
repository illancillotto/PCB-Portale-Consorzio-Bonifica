# PCB – Progress Tracking

## Scopo

Questo file traccia gli sviluppi effettivamente completati nel repository PCB.

Regole operative:

- aggiornare questo file a ogni milestone o blocco funzionale chiuso
- registrare solo lavoro realmente fatto e verificato
- indicare verifiche eseguite, blocchi emersi e file rilevanti

## Stato corrente

- Data ultimo aggiornamento: 2026-03-23
- Stato progetto: fondazioni completate, backend core collegato a PostgreSQL/PostGIS, frontend integrato alle API reali per soggetti, particelle, ricerca, ingestion monitor e base GIS
- Ambiente locale verificato:
  - `docker compose up -d pcb-postgres`
  - backend avviabile
  - API core testate contro database reale

## Vincoli attivi

- backend modular monolith
- niente microservizi
- PostgreSQL + PostGIS
- Next.js frontend
- NestJS backend
- Keycloak
- Redis
- QGIS Server
- connettori Node.js + Playwright
- anagrafe unica centrata sul CUUA
- separazione obbligatoria tra raw ingest, normalized data e master data
- i connettori non devono mai scrivere direttamente nelle tabelle master

## Sviluppi completati

### 2026-03-20 – Analisi documentale completa

Completato:

- lettura integrale di tutta la cartella `docs/`
- sintesi architetturale del progetto
- definizione della struttura repository
- definizione delle milestone tecniche iniziali

Output prodotto:

- analisi del dominio CUUA-centric
- piano bootstrap iniziale
- allineamento con roadmap e definition of done

### 2026-03-20 – Bootstrap milestone 1

Completato:

- root workspace npm con `backend`, `frontend`, `connectors`
- `docker-compose.yml` base
- `.env.example`, `.gitignore`, `.editorconfig`
- bootstrap PostgreSQL/PostGIS schemi base in `infra/postgres/init/001-extensions-and-schemas.sql`
- placeholder struttura QGIS in `infra/qgis/`
- backend NestJS modulare con moduli:
  - `auth`
  - `anagrafiche`
  - `ingest`
  - `audit`
  - `catasto`
  - `gis`
  - `search`
- frontend Next.js con shell istituzionale iniziale
- package separato `connectors` con base `connector-nas-catasto`
- README tecnici minimi per root, backend, frontend, connectors

Verifiche eseguite:

- `npm install --cache /tmp/pcb-npm-cache`
- `npm run lint --workspace backend`
- `npm run lint --workspace frontend`
- `npm run lint --workspace connectors`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run build --workspace connectors`

### 2026-03-20 – Core domain database-backed

Completato:

- schema SQL reale in `infra/postgres/init/010-core-domain.sql`
- tabelle iniziali per:
  - `anagrafe.master_subject`
  - `anagrafe.subject_identifier`
  - `anagrafe.subject_name_history`
  - `anagrafe.subject_address_history`
  - `anagrafe.subject_source_link`
  - `ingest.ingestion_run`
  - `ingest.ingestion_record_raw`
  - `ingest.ingestion_record_normalized`
  - `ingest.matching_result`
  - `audit.audit_event`
- seed minimi per soggetti, ingestion run e audit
- access layer PostgreSQL esplicito con `pg`
- sostituzione seed in memoria backend per:
  - `subjects`
  - `ingestion`
  - `audit`

Endpoint backend disponibili:

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

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`

### 2026-03-20 – Catasto e search DB-backed

Completato:

- schema SQL `infra/postgres/init/020-catasto-and-search.sql`
- tabelle:
  - `catasto.parcel`
  - `catasto.subject_parcel_relation`
- seed minimi per particelle e relazioni soggetto-particella
- API backend per:
  - `GET /api/v1/parcels`
  - `GET /api/v1/parcels/{id}`
  - `GET /api/v1/parcels/{id}/subjects`
  - `GET /api/v1/search?q=...`
- ricerca unificata iniziale su soggetti e particelle
- correzione DDL PostgreSQL: indice univoco espressivo su business key particella

Verifiche eseguite:

- `docker compose up -d pcb-postgres`
- applicazione script SQL nel container Postgres
- verifica schemi `anagrafe`, `ingest`, `audit`, `catasto`
- verifica seed:
  - `2` soggetti
  - `2` particelle
  - `2` relazioni
- backend avviato contro DB reale
- endpoint testati con `curl`:
  - `GET /api/v1/subjects`
  - `GET /api/v1/parcels`
  - `GET /api/v1/search?q=oristano`
  - `GET /api/v1/audit/events`
  - `POST /api/v1/ingestion/connectors/connector-nas-catasto/run`
  - `GET /api/v1/ingestion/runs`

## Commit registrati

- `4f2118b` – `Add catasto and search database-backed APIs`

Nota:

- esiste almeno un commit precedente relativo al bootstrap già eseguito dall’utente; non ne registro hash non verificati qui

## Stato per area

- Root/workspace: pronto
- Docker compose: pronto
- PostgreSQL/PostGIS bootstrap: pronto
- Backend core NestJS: pronto
- Auth placeholder Keycloak: pronto
- Anagrafiche API: pronto su DB reale
- Ingestion API base: pronta su DB reale
- Audit API base: pronta su DB reale
- Catasto API base: pronta su DB reale
- Search API base: pronta su DB reale
- GIS: prima versione applicativa completata
- Frontend integrazione API: prima versione completata
- Ingestion monitor frontend: prima versione completata
- Source links scheda soggetto: prima versione completata
- Documentale base scheda soggetto: prima versione completata
- Connectors runtime reali: non iniziati
- Matching engine: non iniziato
- Keycloak reale end-to-end: non iniziato

## Blocchi aperti

- Docker accessibile ora, ma non ancora usato per Redis, Keycloak e QGIS Server
- nessun connettore operativo verso sorgenti esterne
- viewer cartografico GIS non ancora implementato

### 2026-03-20 – Frontend M3 prima integrazione reale

Completato:

- client API frontend server-side in `frontend/lib/api.ts`
- shell condivisa e componenti base riusabili
- homepage collegata a dati reali
- lista soggetti reale
- scheda soggetto base con:
  - overview anagrafica
  - identificativi
  - storico nominativi
  - relazioni catastali
- lista particelle reale
- vista particella base con soggetti collegati
- ricerca unificata frontend collegata a `/api/v1/search`
- estensione backend `GET /api/v1/subjects/{id}/parcels` per evitare placeholder gratuiti nella scheda soggetto
- aggiornamento documentazione tecnica frontend e variabile `PCB_API_BASE_URL`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- backend avviato contro Postgres reale
- frontend avviato su porta `3010`
- pagine testate con `curl`:
  - `/`
  - `/subjects`
  - `/subjects/{id}`
  - `/parcels`
  - `/parcels/{id}`
  - `/search?q=oristano`

## Prossimo sviluppo raccomandato

1. Avviare il primo connector NAS read-only
2. Portare il documentale da seed a endpoint dedicato
3. Introdurre loading/error/empty states più raffinati nelle viste frontend
4. Estendere GIS foundation verso un viewer cartografico reale

### 2026-03-20 – Ingestion monitor frontend

Completato:

- pagina frontend `ingestion monitor`
- elenco run da API reali `GET /api/v1/ingestion/runs`
- trigger manuale frontend per `connector-nas-catasto`
- aggiornamento navigazione applicativa

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`
- backend avviato contro Postgres reale
- frontend avviato su porta `3010`
- `GET /ingestion` verificato con `curl`
- trigger manuale `connector-nas-catasto` verificato
- lista run aggiornata verificata dopo il trigger

### 2026-03-23 – Scheda soggetto arricchita con source links e documentale base

Completato:

- script SQL `infra/postgres/init/030-subject-links-and-docs.sql`
- tabella `docs.document_item`
- seed minimi reali per:
  - `anagrafe.subject_source_link`
  - `docs.document_item`
- aggregazione source links e documenti dentro la `subject response`
- aggiornamento scheda soggetto frontend con sezioni:
  - sorgenti collegate
  - documenti collegati

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- script `030` applicato al container Postgres
- `GET /api/v1/subjects/{id}` verificato su `sourceLinks` e `documents`
- pagina `/subjects/{id}` verificata a runtime via frontend su porta `3010`

### 2026-03-23 – GIS foundation applicativa

Completato:

- script SQL `infra/postgres/init/040-gis-foundation.sql`
- tabelle:
  - `gis.layer_catalog`
  - `gis.feature_link`
- seed minimi reali per catalogo layer e feature links
- endpoint backend:
  - `GET /api/v1/gis/layers`
  - `GET /api/v1/gis/feature-links`
- pagina frontend `/gis`
- aggiornamento navigazione applicativa con sezione GIS

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- script `040` applicato al container Postgres
- `GET /api/v1/gis/layers` verificato
- `GET /api/v1/gis/feature-links` verificato
- pagina `/gis` verificata a runtime via frontend su porta `3010`
