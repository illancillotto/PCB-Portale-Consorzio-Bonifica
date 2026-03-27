# Changelog

## 2026-03-27

### Bootstrap locale e verifiche

- `c6ed3b3` Add developer onboarding checklist
- `89fdc45` Align package READMEs with local bootstrap
- `1f3fee6` Add unified local verification suite
- `30f1eb4` Add GIS smoke checks to local runtime
- `aac826f` Add ingestion smoke checks to local runtime
- `a6520f3` Add auth smoke checks to local runtime
- `fc1ab2f` Add local development bring-up and smoke scripts
- `fb5423e` Add local runtime bootstrap script

### Fix runtime locale

- `19ed899` Fix runtime env loading for backend and frontend
- `b0cab05` Fix auth module imports for protected domains

## 2026-03-26

### Porte e configurazione locale

- `b85957f` Update environment configuration and ports for API and frontend; add workspace settings

## 2026-03-25

### Monitoraggio e osservabilita` ingestion

- `84a598c` Add active run filter context to ingestion monitor
- `c4b06eb` Add pipeline attention shortcuts to operations
- `9a6218b` Link operations pipeline outcomes to ingestion filters
- `72759ce` Add operational run shortcuts to operations
- `6dcf549` Add pipeline outcomes to operations overview
- `1e60da1` Add pipeline reconciliation to ingestion run detail
- `101814d` Add raw outcome filters to ingestion run detail
- `b586401` Expose raw ingest outcome breakdowns
- `c75915f` Expose raw ingest summaries in operational views
- `1706c47` Expose raw ingest record outcomes
- `b73c7f6` Add outcome metadata to ingestion records
- `9cbd6bf` Add structured failure metadata to ingestion

### Error handling e osservabilita` runtime

- `6f27cea` Enrich runtime integration observability
- `bfc6373` Harden GIS feature info error handling
- `91f59e4` Handle API errors in operational detail views
- `0f4c27c` Extend domain error codes to GIS and audit
- `4aa58bd` Propagate request IDs across backend and proxy
- `2fc825a` Handle API errors in server-rendered views

## 2026-03-24 e precedenti

### Fondazioni applicative

- bootstrap workspace `backend/frontend/connectors`
- modular monolith NestJS con domini core
- frontend Next.js operativo protetto
- stack locale con Postgres/PostGIS, Redis, Keycloak, QGIS Server
- connector NAS bootstrapato e collegato alla pipeline `ingest`
- viewer GIS reale con WMS, `GetFeatureInfo` e deep link applicativi

Per il dettaglio completo e verificato dei blocchi chiusi:

- [PROGRESS.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/PROGRESS.md)
- [IMPLEMENTATION_PLAN.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/IMPLEMENTATION_PLAN.md)
