# PCB – Progress Tracking

## Scopo

Questo file traccia gli sviluppi effettivamente completati nel repository PCB.

Regole operative:

- aggiornare questo file a ogni milestone o blocco funzionale chiuso
- registrare solo lavoro realmente fatto e verificato
- indicare verifiche eseguite, blocchi emersi e file rilevanti

## Stato corrente

- Data ultimo aggiornamento: 2026-03-24
- Stato progetto: fondazioni completate, backend core collegato a PostgreSQL/PostGIS, frontend integrato alle API reali per soggetti, particelle, ricerca, ingestion monitor e base GIS, primo connector NAS read-only persistente su `ingest`, normalizzazione iniziale `raw -> normalized` disponibile nel backend
- Ambiente locale verificato:
  - `docker compose up -d pcb-postgres`
  - `docker compose up -d pcb-redis`
  - backend avviabile
  - API core testate contro database reale
- Redis operativo e verificato lato backend

### 2026-03-27 – Bootstrap runtime locale ripetibile

Completato:

- script idempotente `scripts/prepare-local-runtime.sh`
- script root `npm run dev:prepare-runtime`
- script root `npm run dev:stack`
- bootstrap automatico del sample NAS locale in `/tmp/pcb-nas-sample`
- README root riallineato all'avvio reale verificato del progetto

Verifiche eseguite:

- `npm run dev:prepare-runtime`
- verifica `.env` presente e coerente con:
  - `PCB_BACKEND_PORT=5010`
  - `PCB_FRONTEND_PORT=3010`
  - `PCB_NAS_CATASTO_ROOT=/tmp/pcb-nas-sample`

Output operativo:

- avvio locale non dipende più da setup manuale non tracciato
- sample NAS di sviluppo sempre riproducibile

### 2026-03-27 – Bring-up completo di sviluppo e smoke check locale

Completato:

- script `scripts/dev-up.sh`
- script `scripts/smoke-local-runtime.sh`
- script root `npm run dev:up`
- script root `npm run dev:smoke`
- README root e `scripts/README.md` riallineati al bootstrap completo

Verifiche eseguite:

- `npm run dev:up`
- `npm run dev:smoke`

Output operativo:

- bring-up locale fino a stack, dipendenze e build connectors in un solo comando
- smoke check locale ripetibile per backend, frontend, Keycloak e QGIS

### 2026-03-27 – Smoke auth end-to-end nel bootstrap locale

Completato:

- estensione di `scripts/smoke-local-runtime.sh` con login seed operatore reale
- verifica automatica di accesso alla vista protetta `operations`
- documentazione allineata sullo smoke end-to-end applicativo

Verifiche eseguite:

- `npm run dev:smoke`

Output operativo:

- lo smoke locale non si ferma più a `health/discovery`
- il bootstrap di sviluppo verifica anche auth applicativa e sessione frontend reale

### 2026-03-27 – Smoke operativo ingestion nel bootstrap locale

Completato:

- script `scripts/smoke-ingestion-runtime.sh`
- script root `npm run dev:smoke:ingestion`
- verifica automatica di una run reale del connector NAS locale
- polling fino a completamento della pipeline `acquisition -> postProcessing -> normalization -> matching`

Verifiche eseguite:

- `npm run dev:smoke:ingestion`

Output operativo:

- il bootstrap locale verifica anche il percorso applicativo minimo del dominio `ingest`
- il sample NAS locale è ora usato anche per smoke test operativi ripetibili

### 2026-03-27 – Smoke operativo GIS nel bootstrap locale

Completato:

- script `scripts/smoke-gis-runtime.sh`
- script root `npm run dev:smoke:gis`
- verifica autenticata di `publication-status` e `map-features`
- verifica `GetFeatureInfo` end-to-end tramite proxy frontend su una feature reale

Verifiche eseguite:

- `npm run dev:smoke:gis`

Output operativo:

- il bootstrap locale copre anche la catena GIS `backend -> QGIS -> proxy frontend`
- la verifica non usa coordinate hardcoded ma una feature reale dell'ambiente locale

### 2026-03-27 – Suite unica di verifica locale

Completato:

- script `scripts/verify-local-runtime.sh`
- script root `npm run dev:verify`
- orchestrazione sequenziale di smoke base, ingestion e GIS

Verifiche eseguite:

- `npm run dev:verify`

Output operativo:

- il bootstrap locale arriva a validazione operativa completa con un solo comando

### 2026-03-27 – README package allineati al bootstrap locale

Completato:

- `backend/README.md` riallineato a `dev:up`, `dev:smoke`, `dev:smoke:ingestion`, `dev:verify`
- `frontend/README.md` riallineato a `dev:up`, `dev:smoke`, `dev:smoke:gis`, `dev:verify`
- `connectors/README.md` riallineato a bootstrap locale, sample NAS e smoke `ingestion`

Verifiche eseguite:

- revisione dei comandi e prerequisiti rispetto ai workflow locali già validati

Output operativo:

- la disciplina di avvio e verifica locale è ora coerente anche nei README dei package

### 2026-03-27 – Developer checklist root

Completato:

- nuovo file `DEVELOPER_CHECKLIST.md`
- checklist sintetica `day 1 / day 2 / troubleshooting`
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione dei passi contro i comandi root già validati (`dev:up`, `dev:verify`)

Output operativo:

- onboarding locale più rapido
- troubleshooting base standardizzato in root

### 2026-03-27 – Changelog sintetico root

Completato:

- nuovo file `CHANGELOG.md`
- sintesi cronologica per milestone e commit chiave
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione dei commit recenti contro la cronologia locale del repository

Output operativo:

- panoramica storica più leggibile rispetto al solo `PROGRESS.md`

### 2026-03-27 – Operations runbook

Completato:

- nuovo file `docs/OPERATIONS_RUNBOOK.md`
- runbook operativo sintetico per login, ingestion, audit, GIS, issue connector e prima diagnosi
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione dei flussi contro le viste e gli smoke già validati localmente

Output operativo:

- percorso operativo più chiaro per chi usa il portale, non solo per chi lo sviluppa

### 2026-03-27 – API surface sintetica

Completato:

- nuovo file `docs/API_SURFACE.md`
- distinzione tra endpoint pubblici, autenticati e protetti
- sintesi dei filtri query principali e degli endpoint più utili per smoke locale
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione della superficie API contro `backend/README.md` e workflow di smoke già validati

Output operativo:

- orientamento più rapido su access policy, endpoint utili e filtri supportati

### 2026-03-27 – Local environment reference

Completato:

- nuovo file `docs/LOCAL_ENV_REFERENCE.md`
- riferimento sintetico per le variabili ambiente realmente usate in bootstrap, auth, ingestion e GIS
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione delle variabili contro `.env.example`, script locali e consumer `backend/frontend/connectors`

Output operativo:

- configurazione locale più leggibile rispetto alla sola lettura di `.env.example`

### 2026-03-27 – Smoke tests reference

Completato:

- nuovo file `docs/SMOKE_TESTS.md`
- raccolta sintetica di `dev:smoke`, `dev:smoke:ingestion`, `dev:smoke:gis`, `dev:verify`
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione degli smoke contro gli script locali già esistenti e le verifiche già passate

Output operativo:

- uso dei comandi di verifica più chiaro e standardizzato

### 2026-03-27 – Known issues root

Completato:

- nuovo file `docs/KNOWN_ISSUES.md`
- raccolta dei problemi reali già incontrati e risolti durante l’evoluzione del progetto
- collegamento esplicito dal `README.md` root

Verifiche eseguite:

- revisione della cronologia commit e dei fix runtime già effettivamente applicati

Output operativo:

- minore rischio di riscoprire problemi già risolti

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
- layer attivi del viewer GIS sincronizzati con URL: completato
- preset operativi GIS condivisibili: completato
- quick link ai preset GIS da viste operative: completato
- preset GIS contestuali da dashboard e search: completato
- metriche GIS sintetiche in dashboard: completato
- metriche ingestion e audit in dashboard: completato
- riepilogo operativo ingestion in lista e dettaglio run: completato
- filtri operativi ingestion in lista e dettaglio run: completato
- catalogo connector orchestrato nel backend e visibile in ingestion UI: completato
- summary backend di orchestration ingestion: completato
- trigger manuali ingestion derivati dal catalogo connector: completato
- dettaglio per singolo connector in ingestion: completato
- readiness runtime dei connector nel dominio ingestion: completato
- summary orchestration ingestion con readiness runtime e trigger UI bloccato per connector non eseguibili: completato
- dettaglio connector con storico operativo sintetico su esecuzioni e volumi: completato
- endpoint backend dedicato alle run del singolo connector e dettaglio frontend disaccoppiato dal fetch globale delle run: completato
- filtro `status` sulle run del singolo connector, applicato lato backend e frontend: completato
- endpoint e vista per issue operative dei connector nel monitor ingestion: completato
- vista `operations` estesa con issue connector cross-domain: completato
- filtri backend/frontend sulle issue operative dei connector nel monitor ingestion: completato
- orchestration summary arricchito con contatori sintetici sulle issue connector, usati da ingestion e operations: completato
- vista `operations` estesa con filtri URL-shareable sulle issue connector: completato
- filtro `connectorName` sulle issue connector, esposto in backend e nelle viste `ingestion` e `operations`: completato
- catalogo e dettaglio connector arricchiti con contatori issue aperte: completato
- dettaglio connector arricchito con elenco issue aperte e filtro per severity: completato
- endpoint dettaglio connector esteso con elenco issue aperte, eliminando il fetch frontend separato: completato
- dettaglio connector esteso con filtro `issueType` sulle issue aperte: completato
- dettaglio connector arricchito con contatori per tipo di issue: completato
- vista `search` estesa come ingresso operativo verso `operations`, `audit`, `ingestion` e GIS: completato
- risultati `search` arricchiti con shortcut espliciti a scheda PCB, GIS e ingressi operativi contestuali: completato
- vista `search` arricchita con riepilogo sintetico e filtro URL-shareable per tipo risultato: completato
- audit trail esteso con filtro backend/frontend per `sourceModule`: completato
- vista `audit` arricchita con riepiloghi cliccabili per attore e modulo sorgente: completato
- audit trail esteso con filtro backend/frontend per entita` (`entityType`, `entityId`) e collegato alla `search`: completato
- vista `audit` arricchita con cartiglio dei filtri attivi e reset rapido del contesto: completato
- vista `operations` arricchita con riepilogo audit per modulo sorgente e deep link ai filtri audit: completato
- dashboard principale arricchita con ingressi audit per modulo sorgente: completato
- dashboard principale arricchita con ingressi audit per attore: completato
- schede soggetto e particella arricchite con ingressi audit contestuali per entita`: completato
- liste soggetti e particelle arricchite con shortcut operativi verso scheda, GIS e audit contestuale: completato
- lista run e dettaglio run `ingestion` arricchiti con shortcut diretti a `audit` contestuale: completato
- dettaglio connector `ingestion` arricchito con shortcut diretti a `audit` del modulo e delle ultime run: completato
- summary backend dedicato per il dominio `audit`, riusato da dashboard, operations e vista audit: completato
- dettagli `ingestion` di run e connector arricchiti con contatori audit contestuali: completato
- dettagli `subject` e `parcel` arricchiti con contatori audit contestuali: completato
- endpoint backend bulk `audit/entity-summaries` introdotto e riusato da `subjects`, `parcels`, `search`: completato
- loading/error states condivisi introdotti nel frontend Next.js a livello App Router root: completato
- empty states condivisi introdotti e applicati ai principali entry point frontend: completato
- redirect auth frontend contestuali con `reason` e `next` sulle route protette: completato
- login frontend con resume automatico verso la vista richiesta: completato
- proxy frontend operativo con fallback auth uniforme su `401/403`: completato
- azioni operative client-side con redirect contestuale al login su sessione scaduta: completato
- dashboard, ricerca e liste business classificate come viste protette: completato
- navigazione globale riallineata alla stessa access policy operativa: completato

### 2026-03-24 – Route protette con redirect contestuale

Completato:

- `requireOperatorSession` esteso con redirect contestuale verso `login`
- preservazione di `reason=authentication_required|unauthorized`
- preservazione del path richiesto tramite query `next`
- resume post-login verso la vista originariamente richiesta
- estensione del pattern a:
  - `audit`
  - `operations`
  - `gis`
  - `ingestion`
  - dettaglio run `ingestion`
  - dettaglio connector `ingestion`
  - dettaglio `subject`
  - dettaglio `parcel`

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-24 – Access policy esplicita per le viste business

Completato:

- protezione server-side estesa a:
  - dashboard `/`
  - ricerca `/search`
  - lista soggetti `/subjects`
  - lista particelle `/parcels`
- preservazione del contesto query nei redirect a `login` per:
  - `/search?q=...&type=...`
  - `/subjects?q=...`
- navigazione globale riallineata: i link protetti aprono `login` con `next` contestuale quando non esiste sessione
- rimozione dei fallback anonimi residuali dalle viste ormai classificate come operative

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-24 – Proxy operativo e fallback auth uniformi

Completato:

- validazione sicura del parametro `next` nel frontend auth
- proxy `frontend/app/api/pcb/[...path]/route.ts` esteso con payload uniforme per:
  - `authentication_required`
  - `unauthorized`
- pulizia del cookie `pcb_session` quando il backend restituisce `401`
- redirect al login contestuale anche per azioni operative client-side:
  - trigger run ingestion
  - trigger normalize/match
  - decisioni manuali matching
  - assegnazione manuale soggetto

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`
- catalogo e dettaglio connector arricchiti con `operationalStatus` sintetico: completato
- catalogo connector ordinato backend-side per priorita` operativa: completato
- feed issue connector ordinato backend-side per severita` e connector: completato
- orchestration summary esteso con conteggio `healthyConnectors`: completato
- catalogo connector filtrabile via backend/frontend per `operationalStatus` e `triggerMode`: completato
- riepilogo audit e filtri operativi dedicati: completato
- `operations` consolidata come punto unico di osservabilita`: completato
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

### 2026-03-23 – Catalogo connector anche in operations

Completato:

- vista `operations` allineata al monitor `ingestion` con catalogo connector operativo
- filtri URL-shareable su `connectorOperationalStatus` e `connectorTriggerMode` anche in `operations`
- preservazione dei filtri issue nello stesso contesto operativo

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Esecuzione reale del trigger manuale NAS

Completato:

- trigger manuale backend collegato al CLI reale di `connector-nas-catasto`
- riuso della `ingestion_run` già creata dall'API, senza duplicare run tra backend e connector
- aggiornamento automatico di stato `running/completed/failed` con audit e cache runtime
- readiness runtime estesa alla presenza del CLI buildato in `connectors/dist`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace connectors`
- `npm run build --workspace connectors`

### 2026-03-23 – Auto-refresh delle viste ingestion

Completato:

- auto-refresh del monitor `ingestion` quando esistono run `queued` o `running`
- auto-refresh del dettaglio run `ingestion/[id]` nello stesso scenario
- visibilita` delle run in esecuzione nel riepilogo del monitor

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Chaining automatico run -> normalize -> match

Completato:

- orchestrazione post-run configurabile via ambiente per `autoNormalize` e `autoMatch`
- chaining eseguito solo dopo `connector_run_completed`
- reuse della stessa `ingestion_run` per acquisition, normalization e matching
- audit aggiuntivo per `connector_post_processing_completed` e `connector_post_processing_failed`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`

### 2026-03-23 – Redirect frontend al dettaglio run

Completato:

- il trigger manuale frontend porta direttamente alla run appena creata
- il redirect sfrutta l'auto-refresh gia` presente sul dettaglio per seguire acquisition, normalization e matching

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Visibilita` esplicita degli stage di run

Completato:

- payload backend delle run arricchito con stato stage `acquisition`, `post-processing`, `normalization`, `matching`
- monitor `ingestion` aggiornato con badge stage e contatori sintetici
- dettaglio run aggiornato con snapshot esplicito del post-processing

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Filtri stage nel monitor ingestion

Completato:

- filtri URL-shareable per stage `acquisition` e `post-processing` nella lista run
- filtri URL-shareable anche per stage `normalization` e `matching`
- preservazione dei filtri esistenti su `status` e `connector`

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Stage ingestion anche in operations

Completato:

- summary backend orchestration arricchito con contatori stage ingestion
- vista `operations` aggiornata con lettura cross-domain di acquisition, post-processing, normalization e matching

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Deep link stage da operations a ingestion

Completato:

- i contatori stage della vista `operations` aprono direttamente il monitor `ingestion` con filtri coerenti

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Deep link stage anche in dashboard

Completato:

- dashboard principale allineata a `operations` con ingressi rapidi verso run, audit e stage ingestion

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-23 – Deep link operativi nella vista audit

Completato:

- la vista `audit` apre direttamente run, soggetti e moduli collegati quando l'evento contiene riferimenti applicativi utili

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-24 – Deep link stage dal dettaglio connector

Completato:

- il dettaglio connector collega contatori, issue e storico run ai filtri stage del monitor `ingestion`

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-24 – Access policy backend sui domini di business

Completato:

- protezione Keycloak con ruolo `pcb-operator` estesa agli endpoint:
  - `subjects`
  - `parcels`
  - `search`
- riallineamento del client frontend per usare bearer token esplicito anche su:
  - dashboard
  - search
  - liste soggetti e particelle
  - dettagli soggetto e particella
  - dettaglio run ingestion per assegnazione soggetto

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-24 – Classificazione endpoint tecnici e interni

Completato:

- `GET /api/v1/health` mantenuto come endpoint tecnico pubblico
- protezione `pcb-operator` estesa agli endpoint runtime/configurazione:
  - `GET /api/v1/system/modules`
  - `GET /api/v1/system/integrations`
  - `GET /api/v1/auth/keycloak`
  - `GET /api/v1/auth/keycloak/discovery`
- formalizzazione documentale del confine tra:
  - endpoint tecnici pubblici
  - endpoint operativi protetti
  - endpoint autenticati ma non role-gated

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`

### 2026-03-24 – Payload errori backend uniformi

Completato:

- filtro globale backend per tutte le eccezioni Nest/applicative
- payload uniforme con:
  - `statusCode`
  - `error.code`
  - `error.type`
  - `error.message`
  - `error.details`
  - `error.path`
  - `error.timestamp`
  - `error.requestId`
- riallineamento del proxy frontend operativo per emettere lo stesso schema sui `401/403`
- riallineamento del consumer frontend delle azioni operative per leggere `error.message`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Codici errore di dominio per ingest

Completato:

- introduzione di una eccezione di dominio riusabile con:
  - `statusCode`
  - `errorCode`
  - `message`
  - `details`
- applicazione nel dominio `ingest` per:
  - connector non supportato
  - connector non eseguibile
  - run non trovata
  - matching result non trovato
  - conferma match senza soggetto
  - assegnazione manuale a soggetto inesistente
  - CLI connector mancante
  - fallimenti di avvio del post-processing
- controller `ingestion` riallineato per preservare i codici dominio nelle response normalizzate

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`

### 2026-03-25 – Codici errore di dominio per auth e lookup business

Completato:

- estensione dei codici errore di dominio a:
  - guard/auth service Keycloak
  - lookup `subjects`
  - lookup `parcels`
- copertura dei casi:
  - header Authorization mancante o invalido
  - token non valido o emesso per client errato
  - ruoli realm insufficienti
  - integrazione Keycloak non configurata
  - soggetto non trovato
  - particella non trovata

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`

### 2026-03-25 – Classificazione errori operativi nel frontend

Completato:

- classificazione frontend dei fallimenti operativi in:
  - `authentication`
  - `authorization`
  - `domain`
  - `runtime`
- pannello riusabile per errori operativi con:
  - titolo coerente per tipo errore
  - `error.code`
  - `requestId`
- adozione sui trigger:
  - avvio run ingestion
  - normalizzazione
  - matching
  - decisioni manuali
  - assegnazione soggetto

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Gestione SSR degli errori applicativi principali

Completato:

- `ApiError` tipizzato nel client API frontend con:
  - `statusCode`
  - `code`
  - `kind`
  - `requestId`
  - `details`
- pannello SSR riusabile per errori applicativi server-side
- adozione nelle viste principali:
  - dashboard
  - search
  - subjects
  - parcels
  - ingestion
  - audit
  - operations
  - gis

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Correlazione end-to-end dei request ID

Completato:

- middleware backend che assegna e restituisce `x-request-id` per ogni request
- filtro globale backend riallineato a `request.requestId`
- proxy frontend `/api/pcb` riallineato per:
  - inoltrare `x-request-id` al backend
  - restituire `x-request-id` al client
  - preservare lo stesso `requestId` anche nei `401/403` locali del proxy
- `ApiError` frontend riallineato per leggere `requestId` anche dagli header di risposta

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Codici errore di dominio estesi a GIS e Audit

Completato:

- validazione riusabile UUID per filtri operativi in `core/validation`
- `gis` ora rifiuta `subjectId` e `parcelId` non validi con `error.code` dedicati
- `audit` ora rifiuta query incoerenti come `entityId` senza `entityType`
- `audit` ora rifiuta richieste bulk senza `entityIds`
- `audit` valida anche gli `entityId` UUID-based per `subject`, `parcel`, `ingestion_run` e `matching_result`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`

### 2026-03-25 – Gestione SSR degli errori estesa anche ai dettagli operativi

Completato:

- `ServerApiErrorState` esteso con azioni contestuali di recupero
- dashboard, search, subjects, parcels, ingestion, audit, operations e gis mostrano ora CTA coerenti per reload e rientro operativo
- i dettagli `subjects/[id]`, `parcels/[id]`, `ingestion/[id]` e `ingestion/connectors/[connectorName]` non degradano piu` automaticamente a `notFound()` su errore API
- anche i dettagli operativi espongono `error.code` e `requestId` con navigazione guidata verso lista o monitor

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Error handling operativo del viewer GIS

Completato:

- `api/qgis/feature-info` riallineato al contratto errori operativo con `error.code`, `requestId` e redirect auth coerente
- il viewer GIS usa ora la stessa classificazione `authentication/authorization/domain/runtime` dei trigger operativi
- il pannello `GetFeatureInfo` mostra retry e accesso rapido a `operations` quando il proxy QGIS fallisce
- il `requestId` del proxy QGIS resta disponibile anche nella diagnostica del viewer

Verifiche eseguite:

- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Observability runtime delle integrazioni in Operations

Completato:

- `GET /api/v1/system/integrations` espone ora `statusCode`, `failureCode` e `target` per integrazione
- `operations` mostra contesto strutturato per PostgreSQL, Redis, Keycloak e QGIS invece del solo testo libero
- i target URL di Keycloak e QGIS sono ora apribili direttamente dalla vista operativa

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run lint --workspace frontend`
- `npm run build --workspace frontend`

### 2026-03-25 – Failure metadata strutturati nel dominio Ingestion

Completato:

- le run `ingestion` espongono ora `failureStage` e `failureCode`
- il catalogo connector e il dettaglio connector riportano anche il failure metadata dell’ultima run quando presente
- le issue dei connector espongono ora `failureCode` strutturato, distinto dal `detail`
- monitor `ingestion`, dettaglio run e dettaglio connector mostrano questi metadati senza dipendere solo da `logExcerpt`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Outcome metadata strutturati su normalizzazione e matching

Completato:

- i record normalizzati espongono ora `outcomeCode`
- i risultati di matching espongono ora `outcomeCode`, `requiresManualReview` e `resolutionMode`
- il dettaglio run mostra questi metadati direttamente nelle sezioni `Normalized records` e `Matching results`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

Nota:

- come nei blocchi precedenti, il primo `lint` frontend e` fallito se lanciato mentre `.next/types` era ancora in rigenerazione; rilanciato a build completata, poi OK

### 2026-03-25 – Outcome metadata strutturati anche sul raw ingest

Completato:

- nuovo endpoint `GET /api/v1/ingestion/runs/{id}/raw-records`
- i record `raw ingest` espongono ora `outcomeCode` strutturato
- il dettaglio run mostra ora una sezione dedicata ai record raw con kind, depth, bucket, subject hint e path
- la visibilità della pipeline ora copre in modo esplicito `raw -> normalized -> matching`

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Summary raw ingest strutturati nel monitor operativo

Completato:

- le run `ingestion` espongono ora `rawSummary` derivato dal layer `ingestion_record_raw`
- il catalogo e il dettaglio connector riportano il summary raw dell’ultima run disponibile
- il monitor `ingestion` mostra i volumi raw catturati e i subject hint rilevati
- il dettaglio connector mostra raw summary su ultima run, ultimo completamento e ultimo fallimento

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Breakdown outcome del raw layer NAS

Completato:

- `rawSummary` espone ora anche i contatori per outcome del layer NAS
- il monitor `ingestion` mostra il breakdown dei record raw per run e per ultima run del connector
- il dettaglio connector mostra il breakdown raw su ultima run, ultimo completamento e ultimo fallimento
- la lettura operativa del layer documentale e` ora piu` utile per capire struttura, bucket e subject hint gia` in fase di capture

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Filtri raw outcome nel dettaglio run

Completato:

- `GET /api/v1/ingestion/runs/{id}/raw-records` supporta ora il filtro `outcomeCode`
- il dettaglio run espone filtri URL-shareable sul layer raw
- i filtri raw, normalized e matching convivono sulla stessa query string della run
- la lettura operativa della pipeline nella singola run e` ora piu` rapida e focalizzata

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Riconciliazione pipeline nel dettaglio run

Completato:

- nuovo endpoint `GET /api/v1/ingestion/runs/{id}/pipeline-summary`
- i layer `normalized` e `matching` supportano ora anche filtri `outcomeCode`
- il dettaglio run espone una sezione di riconciliazione `raw -> normalized -> matching`
- i contatori outcome della pipeline generano deep link diretti ai filtri della stessa run

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Outcome pipeline cross-run in Operations

Completato:

- `orchestration-summary` espone ora gli outcome aggregati cross-run per `raw`, `normalized` e `matching`
- `operations` mostra una sezione dedicata agli outcome della pipeline ingestion
- il monitor cross-domain legge ora non solo run e issue, ma anche la distribuzione concreta degli esiti pipeline

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Ingressi operativi run da Operations

Completato:

- `operations` espone ora link diretti alle run piu` rilevanti
- aggiunti ingressi per:
  - ultima run fallita
  - ultima run queued
  - ultima run da verificare
- il monitor cross-domain e` ora anche punto di ingresso operativo, non solo osservativo

Verifiche eseguite:

- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Outcome pipeline di Operations collegati a Ingestion

Completato:

- le run `ingestion` espongono ora `normalizedSummary` e `matchingSummary`
- il monitor `ingestion` supporta ora anche filtri outcome-aware sulle run
- i contatori outcome di `operations` aprono direttamente il monitor `ingestion` gia` filtrato per outcome e stage coerente

Verifiche eseguite:

- `npm run lint --workspace backend`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Pipeline attention in Operations

Completato:

- `operations` espone ora shortcut dedicati ai principali casi pipeline da verificare
- i shortcut coprono raw senza subject hint, normalized senza subject hint e matching review/unmatched/rejected
- ogni shortcut apre direttamente `ingestion` con i filtri outcome-aware gia` impostati

Verifiche eseguite:

- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`

### 2026-03-25 – Contesto filtri run nel monitor Ingestion

Completato:

- il monitor `ingestion` mostra ora il contesto dei filtri run attivi
- i filtri outcome-aware e stage-aware sono removibili singolarmente
- aggiunti reset completo dei filtri run e ritorno rapido a `operations`

Verifiche eseguite:

- `npm run build --workspace frontend`
- `npm run lint --workspace frontend`
