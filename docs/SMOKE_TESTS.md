# PCB – Smoke Tests

Raccolta sintetica degli smoke test locali disponibili.

## 1. `npm run dev:smoke`

Scopo:

- validare il runtime base
- validare l’accesso operatore frontend

Prerequisiti:

- stack Docker attivo
- backend attivo
- frontend attivo

Verifiche incluse:

- backend health
- pagina login frontend
- Keycloak discovery
- QGIS `GetCapabilities`
- login seed `pcb.operator`
- accesso alla vista protetta `operations`

Quando usarlo:

- dopo l’avvio locale
- dopo modifiche auth/proxy/runtime
- prima di passare a smoke più costosi

## 2. `npm run dev:smoke:ingestion`

Scopo:

- validare la pipeline minima `ingestion`

Prerequisiti:

- tutto ciò che serve per `dev:smoke`
- sample NAS locale disponibile
- connectors buildati

Verifiche incluse:

- token operatore reale da Keycloak
- trigger del connector `connector-nas-catasto`
- polling della run
- completamento di:
  - acquisition
  - post-processing
  - normalization
  - matching
- controllo dei contatori principali:
  - run
  - `pipeline-summary`

Quando usarlo:

- dopo modifiche a `ingest`
- dopo modifiche al connector NAS
- dopo modifiche a orchestration o matching

## 3. `npm run dev:smoke:gis`

Scopo:

- validare la catena GIS end-to-end

Prerequisiti:

- tutto ciò che serve per `dev:smoke`
- QGIS Server attivo

Verifiche incluse:

- token operatore reale da Keycloak
- `GET /gis/publication-status`
- `GET /gis/map-features`
- login frontend seed
- `GetFeatureInfo` tramite proxy frontend su una feature reale

Quando usarlo:

- dopo modifiche GIS backend
- dopo modifiche viewer GIS
- dopo modifiche QGIS publication target o proxy `GetFeatureInfo`

## 4. `npm run dev:verify`

Scopo:

- eseguire la suite completa locale con un solo comando

Esegue in sequenza:

- `npm run dev:smoke`
- `npm run dev:smoke:ingestion`
- `npm run dev:smoke:gis`

Quando usarlo:

- prima di chiudere una milestone locale
- dopo refactor che toccano più domini
- come verifica finale del bootstrap locale

## 5. Output atteso

Esito positivo:

- tutti i comandi terminano con exit code `0`
- i log mostrano solo check `[ok]`

Segnali di guasto tipici:

- backend non raggiungibile -> problema runtime locale o server non avviato
- login frontend fallito -> problema Keycloak, proxy o sessione
- run ingestion non completata -> problema connector, NAS locale o orchestration
- `GetFeatureInfo` vuoto/fallito -> problema QGIS, bbox/feature, proxy GIS

## 6. Ordine consigliato

1. `npm run dev:up`
2. `npm run dev:backend`
3. `npm run dev:frontend`
4. `npm run dev:smoke`
5. `npm run dev:smoke:ingestion`
6. `npm run dev:smoke:gis`
7. `npm run dev:verify`

## 7. Documenti correlati

- [DEVELOPER_CHECKLIST.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/DEVELOPER_CHECKLIST.md)
- [docs/OPERATIONS_RUNBOOK.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/OPERATIONS_RUNBOOK.md)
- [docs/LOCAL_ENV_REFERENCE.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/LOCAL_ENV_REFERENCE.md)
- [scripts/README.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/scripts/README.md)
