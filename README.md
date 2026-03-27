# PCB – Portale Consorzio Bonifica

Bootstrap iniziale del repository per la piattaforma interna PCB, coerente con la documentazione in `docs/`.

## Sintesi architetturale

- modular monolith backend con NestJS
- frontend Next.js per operatori interni
- PostgreSQL + PostGIS come database principale
- Redis per supporto runtime e job orchestration futura
- Keycloak come identity provider esterno
- QGIS Server come componente GIS infrastrutturale
- connettori separati in Node.js + Playwright
- anagrafe unica centrata sul CUUA
- separazione obbligatoria tra raw ingest, normalized data e master data

## Struttura repository

- `backend/` API NestJS e moduli PCB
- `frontend/` applicazione Next.js
- `connectors/` package separato per connettori e ingestion services
- `infra/` bootstrap infrastrutturale locale
- `docs/` documentazione di progetto

Checklist operativa rapida:

- [DEVELOPER_CHECKLIST.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/DEVELOPER_CHECKLIST.md)
- [CHANGELOG.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/CHANGELOG.md)
- [docs/OPERATIONS_RUNBOOK.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/OPERATIONS_RUNBOOK.md)

## Avvio locale

Bootstrap locale consigliato:

```bash
npm run dev:up
```

Poi avviare backend e frontend in sessioni separate:

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:verify
```

URL attesi:

- frontend: `http://127.0.0.1:3010`
- backend health: `http://127.0.0.1:5010/api/v1/health`
- Keycloak: `http://127.0.0.1:8180`
- QGIS Server: `http://127.0.0.1:8090/ows/`

Credenziali seed:

- `pcb.operator / pcb.operator`
- `pcb.admin / pcb.admin`

Lo script `npm run dev:prepare-runtime`:

- crea `.env` da `.env.example` se manca
- prepara un sample NAS locale idempotente in `/tmp/pcb-nas-sample`
- aggiunge le variabili locali minime per porte e `PCB_NAS_CATASTO_ROOT` se assenti

Lo script `npm run dev:up`:

- esegue `dev:prepare-runtime`
- avvia `docker compose`
- installa le dipendenze workspace
- builda i connectors

Lo script `npm run dev:smoke` verifica:

- backend health
- frontend login
- Keycloak discovery
- QGIS `GetCapabilities`
- login operatore seed via frontend
- accesso reale alla vista protetta `operations`

Lo script `npm run dev:smoke:ingestion` verifica:

- token operatore reale da Keycloak
- trigger reale del connector NAS locale
- completamento della pipeline `run -> normalize -> match`
- contatori principali di run e `pipeline-summary`

Lo script `npm run dev:smoke:gis` verifica:

- `publication-status` autenticato
- `map-features` autenticato
- login seed via frontend
- `GetFeatureInfo` end-to-end sul proxy frontend usando una feature reale

Lo script `npm run dev:verify` esegue in sequenza:

- `npm run dev:smoke`
- `npm run dev:smoke:ingestion`
- `npm run dev:smoke:gis`

## Stato del bootstrap

La milestone corrente prepara:

- skeleton backend con moduli `auth`, `anagrafiche`, `ingest`, `audit`, `catasto`, `gis`, `search`
- placeholder integrazione Keycloak
- compose base con PostGIS, Redis, Keycloak e QGIS Server
- package separato `connectors` per Playwright
- documentazione tecnica minima per backend e frontend

Non include ancora:

- documentale avanzato
- connettori ulteriori oltre il NAS bootstrap
- workflow business avanzati oltre il perimetro operativo attuale
