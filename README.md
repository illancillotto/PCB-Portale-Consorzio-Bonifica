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

## Avvio locale

1. Copiare `.env.example` in `.env` e adattare i valori necessari.
2. Avviare i servizi base:

```bash
docker compose up -d
```

3. Installare le dipendenze workspace:

```bash
npm install
```

4. Avviare backend e frontend in sessioni separate:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Stato del bootstrap

La milestone corrente prepara:

- skeleton backend con moduli `auth`, `anagrafiche`, `ingest`, `audit`, `catasto`, `gis`, `search`
- placeholder integrazione Keycloak
- compose base con PostGIS, Redis, Keycloak e QGIS Server
- package separato `connectors` per Playwright
- documentazione tecnica minima per backend e frontend

Non include ancora:

- persistenza applicativa reale
- matching engine
- scheda soggetto completa
- connector NAS operativo
- autenticazione Keycloak end-to-end
