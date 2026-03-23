# PCB – Progress Tracking

## Scopo

Questo file traccia gli sviluppi effettivamente completati nel repository PCB.

Regole operative:

- aggiornare questo file a ogni milestone o blocco funzionale chiuso
- registrare solo lavoro realmente fatto e verificato
- indicare verifiche eseguite, blocchi emersi e file rilevanti

## Stato corrente

- Data ultimo aggiornamento: 2026-03-23
- Stato progetto: fondazioni completate, backend core collegato a PostgreSQL/PostGIS, frontend integrato alle API reali per soggetti, particelle, ricerca, ingestion monitor e base GIS, primo connector NAS read-only persistente su `ingest`, normalizzazione iniziale `raw -> normalized` disponibile nel backend
- Ambiente locale verificato:
  - `docker compose up -d pcb-postgres`
  - `docker compose up -d pcb-redis`
  - backend avviabile
  - API core testate contro database reale
  - Redis operativo e verificato lato backend

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
- Ingestion run detail frontend: prima versione completata
- Source links scheda soggetto: prima versione completata
- Documentale base scheda soggetto: prima versione completata
- Connector NAS read-only: persistenza `ingest` completata
- Normalizzazione `raw -> normalized`: prima versione backend completata
- Matching engine: versione raffinata `CUUA/source-link/canonical-name` completata
- Matching review UI: prima versione completata
- Matching manual subject assignment: prima versione completata
- Audit decisioni manuali matching: completato
- Audit passaggi automatici ingest: completato
- Redis operativo backend: completato
- Keycloak realm import + JWT verification backend: completato
- Keycloak protezione applicativa estesa: completato
- QGIS publication target: operativo con `GetCapabilities` verificato
- operations view centralizzata integrazioni: completata
- primo layer tematico QGIS reale: completato
- secondo layer tematico QGIS reale: completato
- overlay WMS QGIS nel viewer frontend: completato
- `GetFeatureInfo` QGIS dal viewer frontend: completato
- risultati `GetFeatureInfo` navigabili: completato
- evidenziazione feature da `GetFeatureInfo`: completato
- sync inverso viewer-pannello GIS: completato
- cartiglio `GetFeatureInfo` arricchito con contesto PCB: completato
- risultati `GetFeatureInfo` raffinati sul layer relazionale: completato
- controllo layer operativo nel viewer GIS: completato
- legenda cartografica esplicita nel viewer GIS: completato
- layer relazioni soggetto-particella pubblicato: completato
- endpoint GIS applicativo relazioni soggetto-particella: completato
- filtri GIS relazioni per soggetto/particella: completato
- filtri GIS `map-features` per soggetto/particella: completato
- filtri GIS `feature-links` per soggetto/particella: completato

## Blocchi aperti

- matching ancora rule-based, ma ora con priorita` `CUUA/identifier`, `source-link` e `canonical-name`
- manca ancora una pubblicazione QGIS con layer tematici reali oltre al bootstrap project
- manca ancora un collegamento frontend diretto a servizi QGIS pubblicati oltre al monitoraggio dello stato

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

1. Portare il documentale da seed a endpoint dedicato
2. Introdurre loading/error/empty states più raffinati nelle viste frontend
3. Estendere GIS foundation verso un viewer cartografico reale
4. Estendere Keycloak dal backend al frontend oppure procedere con viewer GIS reale

### 2026-03-23 – Keycloak backend reale

Completato:

- import automatico realm `pcb` in `docker compose`
- utenti seed `pcb.operator` e `pcb.admin`
- client `pcb-backend` e `pcb-frontend`
- discovery OpenID Connect reale lato backend
- validazione JWT via JWKS in modulo `auth`
- endpoint protetti:
  - `GET /api/v1/auth/session`
  - `GET /api/v1/auth/operator-access`

Verifiche eseguite:

- `docker compose up -d pcb-keycloak`
- discovery realm `pcb` verificata su porta `8180`
- lint e build backend
- token reale ottenuto via password grant per `pcb.operator`
- `GET /api/v1/auth/session` verificato con bearer token valido
- `GET /api/v1/auth/operator-access` verificato con ruolo `pcb-operator`

### 2026-03-23 – Keycloak frontend login operativo

Completato:

- sessione frontend httpOnly basata su token Keycloak validato dal backend
- pagina `login` reale con credenziali Keycloak locali
- route handler:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- protezione server-side delle viste operative:
  - `/ingestion`
  - `/ingestion/[id]`
  - `/gis`
- stato sessione visibile nell'header applicativo

Verifiche eseguite:

- lint e build frontend
- `GET /ingestion` senza cookie -> redirect `/login`
- login reale via `pcb.operator`
- `GET /ingestion` con cookie di sessione -> `200`
- `GET /gis` con cookie di sessione -> contenuto operativo visibile
- logout con invalidazione cookie verificato

### 2026-03-23 – Protezione API operative e token propagation

Completato:

- protezione backend con ruolo `pcb-operator` su:
  - `GET/POST /api/v1/ingestion/...`
  - `GET /api/v1/gis/...`
- propagazione bearer token server-side dal frontend alle API protette
- proxy frontend autenticato in `frontend/app/api/pcb/[...path]/route.ts`
- trigger client-side `ingestion` riallineati al proxy frontend invece che al backend diretto

Verifiche eseguite:

- lint e build backend
- lint e build frontend
- `GET /api/v1/ingestion/runs` senza token -> `401`
- `GET /api/v1/gis/layers` senza token -> `401`
- `GET /api/pcb/ingestion/runs` con sessione frontend -> `200`
- `GET /ingestion` con cookie di sessione -> `200`
- `GET /gis` con cookie di sessione -> contenuto operativo visibile

### 2026-03-23 – Audit protetto e vista operativa

Completato:

- protezione backend con ruolo `pcb-operator` su `GET /api/v1/audit/events`
- prima vista frontend `/audit` collegata all'API reale audit
- navigazione applicativa aggiornata con accesso a audit trail

Verifiche eseguite:

- lint e build backend
- lint e build frontend
- `GET /api/v1/audit/events` senza token -> `401`
- `GET /audit` senza sessione -> redirect `/login`
- `GET /audit` con sessione frontend -> contenuto operativo visibile

### 2026-03-23 – Viewer GIS reale

Completato:

- migrazione PostGIS `050-gis-map-features.sql` con geometrie su `gis.feature_link`
- endpoint backend `GET /api/v1/gis/map-features`
- viewer frontend reale su `/gis` con Leaflet
- overlay di feature point/polygon reali dal backend protetto

Verifiche eseguite:

- applicazione migrazione SQL locale
- lint e build backend
- lint e build frontend
- `GET /api/v1/gis/map-features` con token valido
- `/gis` verificata con viewer mappa e feature renderizzate

### 2026-03-23 – Deep-link GIS contestuale

Completato:

- link da scheda soggetto verso `/gis?subjectId=...`
- link da scheda particella verso `/gis?parcelId=...`
- filtro contestuale viewer GIS con evidenziazione delle feature corrispondenti

Verifiche eseguite:

- lint e build frontend
- `/gis?subjectId=...` verificata
- `/gis?parcelId=...` verificata

### 2026-03-23 – Publication status QGIS

Completato:

- endpoint backend `GET /api/v1/gis/publication-status`
- esposizione dello stato publication target nella vista frontend `/gis`
- tracciamento esplicito degli stati `not_configured`, `unavailable`, `ok`

Verifiche eseguite:

- lint e build backend
- lint e build frontend
- `GET /api/v1/gis/publication-status` senza token -> `401`
- endpoint verificato su backend isolato in esecuzione su porta `3002`

Nota:

- il pull dell'immagine `qgis/qgis-server:latest` e` molto pesante; l'availability reale del container non e` stata attesa sul critical path

### 2026-03-23 – Bootstrap progetto QGIS

Completato:

- file progetto minimale `infra/qgis/projects/pcb.qgs`
- riallineamento `docker-compose` a `PCB_QGIS_PROJECT_FILE`
- configurazione QGIS esplicita in `.env.example`

Verifiche eseguite:

- validazione strutturale del file nel repository
- wiring compose e documentazione aggiornati

### 2026-03-23 – Redis operativo backend

Completato:

- modulo Redis in `backend/src/modules/core/redis`
- health backend con `PING` Redis
- metadata sistema con stato Redis
- uso applicativo Redis nel dominio `ingest` per:
  - marker ultima run manuale
  - stato effimero di normalizzazione
  - stato effimero di matching

Verifiche eseguite:

- backend build e lint
- runtime backend con Redis reale
- `GET /api/v1/health`
- `GET /api/v1/system/modules`

### 2026-03-23 – Audit passaggi automatici ingest

Completato:

- scrittura eventi audit automatici per:
  - richiesta run manuale
  - normalizzazione
  - matching
- payload minimi coerenti con stato pipeline

Verifiche eseguite:

- backend build e lint
- trigger reale di run manuale verificato
- normalizzazione e matching reali verificati
- eventi audit verificati via API

### 2026-03-23 – Audit decisioni manuali matching

Completato:

- scrittura esplicita di eventi in `audit.audit_event` per:
  - conferma match
  - conferma no-match
  - assegnazione manuale soggetto
- esposizione del `payload` anche nell'API audit

Verifiche eseguite:

- backend build e lint
- decisione manuale verificata contro backend reale
- evento audit verificato via API

### 2026-03-23 – Matching manual subject assignment

Completato:

- endpoint backend per assegnazione manuale soggetto a `matching_result`
- select frontend con soggetti esistenti per chiudere i casi residui
- accettazione automatica del risultato dopo assegnazione manuale

Verifiche eseguite:

- backend build e lint
- frontend build e lint
- assegnazione manuale verificata contro backend reale

### 2026-03-23 – Matching refinement CUUA/source-link aware

Completato:

- priorita` di match su `CUUA` e identificativi
- regole `source-link aware`
- regole su nome soggetto canonico
- riduzione dei casi `review/unmatched` evitabili nel backend `ingest`

Verifiche eseguite:

- backend build e lint
- re-run matching su run reale del connector NAS
- verifica miglioramento esiti in `ingest.matching_result`

### 2026-03-23 – Ingestion run detail frontend

Completato:

- pagina dettaglio run in `frontend/app/ingestion/[id]/page.tsx`
- link dal monitor lista al dettaglio run
- visualizzazione record normalizzati
- visualizzazione risultati di matching
- trigger manuali frontend per:
  - `normalize`
  - `match`

Verifiche eseguite:

- frontend build e lint
- pagina dettaglio verificata contro backend reale

### 2026-03-23 – Matching review operativa

Completato:

- endpoint backend per:
  - conferma match
  - conferma no-match
- pulsanti UI per chiudere manualmente i casi review/unmatched/matched
- stato visuale migliorato dei badge di stato

Verifiche eseguite:

- backend build e lint
- frontend build e lint
- decisioni manuali verificate contro backend reale

### 2026-03-23 – Normalizzazione iniziale ingest

Completato:

- normalizzazione avviabile da backend su `ingest.ingestion_record_raw`
- persistenza in `ingest.ingestion_record_normalized`
- endpoint backend:
  - `POST /api/v1/ingestion/runs/{id}/normalize`
  - `GET /api/v1/ingestion/runs/{id}/normalized-records`
- regole iniziali di normalizzazione per `connector-nas-catasto`:
  - segmentazione path
  - bucket letter
  - subject key normalizzata
  - classificazione documentale base
  - metadati file system

Verifiche eseguite:

- backend build e lint
- normalizzazione eseguita su run reale persistita dal connector NAS
- verifica record in `ingest.ingestion_record_normalized`

### 2026-03-23 – Matching engine base

Completato:

- matching avviabile da backend su `ingest.ingestion_record_normalized`
- persistenza esiti in `ingest.matching_result`
- endpoint backend:
  - `POST /api/v1/ingestion/runs/{id}/match`
  - `GET /api/v1/ingestion/runs/{id}/matching-results`
- regole iniziali:
  - ignore su directory strutturali senza indizi soggetto
  - match esatto su `normalizedSubjectKey` vs nome soggetto o identificativo
  - coda review su documenti con indizio soggetto non risolto

Verifiche eseguite:

- backend build e lint
- matching eseguito su run reale del connector NAS
- verifica record in `ingest.matching_result`

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

### 2026-03-23 – Connector NAS catasto read-only

Completato:

- configurazione esplicita per `connector-nas-catasto`
- scansione ricorsiva filesystem read-only
- classificazione directory e file
- rilevazione bucket alfabetico
- estrazione chiave potenziale soggetto dal path
- hashing opzionale dei file
- CLI locale con output JSON strutturato di run
- aggiornamento documentazione tecnica connectors

Verifiche eseguite:

- `npm run lint --workspace connectors`
- `npm run build --workspace connectors`
- esecuzione sample locale:
  - `PCB_NAS_CATASTO_ROOT=/tmp/pcb-nas-sample npm run run:nas-catasto --workspace connectors`
- output verificato con:
  - `directoriesScanned = 5`
  - `filesScanned = 2`
  - `bucketLetter` coerente
  - `potentialSubjectKey` coerente
  - `fileHash` valorizzato

### 2026-03-23 – Connector NAS persistito in ingest

Completato:

- accesso PostgreSQL dal package `connectors`
- persistenza in:
  - `ingest.ingestion_run`
  - `ingest.ingestion_record_raw`
- modalita `dry-run` e `persisted` nello stesso CLI
- configurazione `PCB_NAS_CATASTO_PERSIST_INGEST`

Verifiche eseguite:

- `npm run lint --workspace connectors`
- `npm run build --workspace connectors`
- esecuzione persistita con:
  - `PCB_NAS_CATASTO_ROOT=/tmp/pcb-nas-sample PCB_NAS_CATASTO_PERSIST_INGEST=true node connectors/dist/connectors/connector-nas-catasto/cli.js`
- risultato verificato:
  - `ingestionRunId` valorizzato
  - `recordsPersisted = 7`
  - `ingest.ingestion_run` da `3` a `4`
  - `ingest.ingestion_record_raw` da `0` a `7`

### 2026-03-23 – QGIS publication target operativo

Completato:

- allineamento del route pubblico QGIS a `/ows/`
- verifica backend `gis/publication-status` con `MAP=/io/projects/pcb.qgs`
- progetto bootstrap `infra/qgis/projects/pcb.qgs` pubblicabile
- volume `infra/qgis/plugins` versionato per eliminare warning runtime del container
- diagnostica frontend/backend arricchita con:
  - `capabilitiesUrl`
  - `projectFile`
  - `statusDetail`

Verifiche eseguite:

- `docker compose up -d --force-recreate pcb-qgis-server`
- `curl http://127.0.0.1:8090/ows/?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs`
- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`
- `GET /api/v1/gis/publication-status` verificato con token Keycloak reale:
  - `statusLabel = ok`
  - `statusCode = 200`
  - `available = true`

### 2026-03-23 – Viewer GIS collegato al publication target

Completato:

- accesso operativo dal frontend GIS a:
  - endpoint OWS QGIS
  - `GetCapabilities`
- riuso del contract `publication-status` per la navigazione operativa

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Stato integrazioni centralizzato

Completato:

- endpoint backend protetto `GET /api/v1/system/integrations`
- aggregazione runtime di:
  - PostgreSQL/PostGIS
  - Redis
  - Keycloak discovery
  - QGIS `GetCapabilities`
- vista frontend protetta `/operations`
- navigazione dashboard aggiornata con accesso dedicato

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`
- `GET /api/v1/system/integrations` senza token -> `401`
- `GET /api/v1/system/integrations` con token Keycloak reale -> `200`
- payload verificato con `postgres`, `redis`, `keycloak`, `qgis` tutti in stato `ok`

### 2026-03-23 – Primo layer tematico QGIS reale

Completato:

- vista PostGIS dedicata `gis.v_qgis_parcels`
- script versionato di generazione progetto QGIS `infra/qgis/scripts/generate_project.py`
- progetto `infra/qgis/projects/pcb.qgs` rigenerato con layer pubblicato:
  - `pcb_parcels`
  - titolo `Particelle consortili`
- wiring compose aggiornato per eseguire gli script QGIS nel container

Verifiche eseguite:

- `docker exec -i pcb-postgres psql -U pcb -d pcb < infra/postgres/init/060-gis-qgis-views.sql`
- `docker exec pcb-qgis-server python3 /io/scripts/generate_project.py`
- `SELECT ... FROM gis.v_qgis_parcels`
- `GET http://127.0.0.1:8090/ows/?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs`
- `GET http://127.0.0.1:8090/ows/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&MAP=/io/projects/pcb.qgs&LAYERS=pcb_parcels...`
- `GetCapabilities` verificato con layer:
  - `pcb_parcels`
  - `Particelle consortili`

### 2026-03-23 – Secondo layer tematico QGIS reale

Completato:

- vista PostGIS dedicata `gis.v_qgis_subjects`
- progetto `infra/qgis/projects/pcb.qgs` rigenerato con secondo layer pubblicato:
  - `pcb_subjects`
  - titolo `Soggetti georiferiti`
- script QGIS aggiornato per pubblicare sia particelle sia soggetti georiferiti

Verifiche eseguite:

- `docker exec -i pcb-postgres psql -U pcb -d pcb < infra/postgres/init/060-gis-qgis-views.sql`
- `docker exec pcb-qgis-server python3 /io/scripts/generate_project.py`
- `SELECT ... FROM gis.v_qgis_subjects`
- `GET http://127.0.0.1:8090/ows/?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs`
- `GET http://127.0.0.1:8090/ows/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&MAP=/io/projects/pcb.qgs&LAYERS=pcb_subjects...`
- `GetCapabilities` verificato con layer:
  - `pcb_subjects`
  - `Soggetti georiferiti`

### 2026-03-23 – Overlay WMS QGIS nel viewer frontend

Completato:

- integrazione del publication target QGIS nel viewer Leaflet frontend
- overlay WMS pubblicato per:
  - `pcb_parcels`
  - `pcb_subjects`
- mantenuto overlay applicativo GeoJSON sopra il WMS per popup e focus contestuale

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – GetFeatureInfo QGIS dal viewer frontend

Completato:

- route frontend protetta `GET /api/qgis/feature-info`
- interrogazione `GetFeatureInfo` da click nel viewer GIS
- pannello risultati nel frontend con attributi del layer pubblicato

Verifiche eseguite:

- verifica manuale `GetFeatureInfo` QGIS in `application/json`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Risultati GetFeatureInfo navigabili

Completato:

- link diretti a:
  - scheda soggetto PCB
  - scheda particella PCB
  - focus GIS contestuale
- mapping dei campi `subject_id` e `parcel_id` dal payload QGIS ai route interni PCB

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Evidenziazione feature da GetFeatureInfo

Completato:

- selezione automatica della prima feature restituita da `GetFeatureInfo`
- pulsante esplicito `Evidenzia in mappa` sui risultati
- highlight coerente nel viewer Leaflet sulle feature GeoJSON PCB

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Sync inverso viewer-pannello GIS

Completato:

- click su feature GeoJSON PCB -> selezione attiva nel viewer
- click su feature GeoJSON PCB -> allineamento del pannello risultati
- inserimento nel pannello della feature cliccata quando non presente nei risultati correnti

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Layer relazioni soggetto-particella

Completato:

- migration GIS aggiuntiva `070-gis-relation-layer.sql`
- terzo layer QGIS pubblicato:
  - `pcb_subject_parcel_links`
  - titolo `Relazioni soggetto-particella`
- viewer frontend allineato per overlay e query WMS sul layer relazionale

Verifiche eseguite:

- `SELECT ... FROM gis.v_qgis_subject_parcel_links`
- `GetCapabilities` verificato con `pcb_subject_parcel_links`
- `GetMap` verificato con `pcb_subject_parcel_links`

### 2026-03-23 – Endpoint GIS applicativo relazioni

Completato:

- endpoint backend protetto `GET /api/v1/gis/subject-parcel-links`
- integrazione frontend della vista GIS con elenco relazioni applicative
- allineamento tra publication target QGIS e API applicativa PCB sullo stesso layer di relazione

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Filtri GIS relazioni per soggetto e particella

Completato:

- filtro `subjectId` su `GET /api/v1/gis/subject-parcel-links`
- filtro `parcelId` su `GET /api/v1/gis/subject-parcel-links`
- integrazione frontend GIS per usare i filtri del focus corrente

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`
