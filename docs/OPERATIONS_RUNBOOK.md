# PCB – Operations Runbook

Runbook operativo minimo per usare il portale in ambiente locale o di test.

## 1. Accesso operatore

Prerequisiti:

- frontend attivo su `http://127.0.0.1:3010`
- backend attivo su `http://127.0.0.1:5010`
- Keycloak attivo su `http://127.0.0.1:8180`

Credenziali seed:

- `pcb.operator / pcb.operator`
- `pcb.admin / pcb.admin`

Flusso:

1. Aprire `http://127.0.0.1:3010/login`
2. Autenticarsi con un utente seed
3. Verificare l’accesso a una vista protetta:
   - `http://127.0.0.1:3010/operations`

## 2. Ingestion manuale

Prerequisiti:

- sample NAS locale preparato da `npm run dev:prepare-runtime`
- connector NAS visibile senza issue critiche nel monitor `ingestion`

Flusso:

1. Aprire `http://127.0.0.1:3010/ingestion`
2. Verificare il catalogo connector
3. Avviare `connector-nas-catasto`
4. Aprire il dettaglio della run creata
5. Verificare il completamento di:
   - acquisition
   - post-processing
   - normalization
   - matching

Punti da osservare:

- `recordsTotal / recordsSuccess / recordsError`
- `rawSummary`
- `normalizedSummary`
- `matchingSummary`
- `pipeline summary`
- `failureStage / failureCode`

## 3. Consultazione audit

Flusso:

1. Aprire `http://127.0.0.1:3010/audit`
2. Filtrare per:
   - `sourceModule`
   - `eventType`
   - `actorType`
   - `entityType / entityId`
3. Usare i deep link verso:
   - run `ingestion`
   - entita` soggetto/particella
   - `operations`

Casi tipici:

- verificare `connector_run_requested`
- verificare `connector_run_completed`
- verificare `ingestion_normalized`
- verificare `ingestion_matched`
- verificare decisioni manuali di matching

## 4. Consultazione GIS

Flusso:

1. Aprire `http://127.0.0.1:3010/gis`
2. Verificare lo stato publication target
3. Attivare i layer necessari:
   - `pcb_subject_parcel_links`
   - `pcb_parcels`
   - `pcb_subjects`
4. Usare i preset operativi quando utili
5. Cliccare in mappa per `GetFeatureInfo`
6. Usare i link di navigazione verso soggetti, particelle e focus GIS

Punti da osservare:

- `publication-status`
- risultati `GetFeatureInfo`
- evidenziazione feature
- contesto PCB relazionale nel pannello risultati

## 5. Lettura issue connector

Flusso:

1. Aprire `http://127.0.0.1:3010/ingestion`
2. Verificare:
   - issue per connector
   - `operationalStatus`
   - readiness runtime
3. Aprire il dettaglio connector se serve approfondire

Issue tipiche:

- `not_configured`
- `not_runnable`
- `dry_run_only`
- `latest_run_failed`
- `no_completed_runs`

Punti da osservare:

- `failureCode`
- ultima run completata
- ultima run fallita
- raw summary dell’ultima run

## 6. Prima diagnosi di guasto

Se qualcosa non funziona:

1. Verificare lo stack:

```bash
docker compose ps
```

2. Verificare il runtime base:

```bash
npm run dev:smoke
```

3. Verificare la pipeline ingestion:

```bash
npm run dev:smoke:ingestion
```

4. Verificare la catena GIS:

```bash
npm run dev:smoke:gis
```

5. Eseguire la suite completa:

```bash
npm run dev:verify
```

## 7. Entry point utili

- `http://127.0.0.1:3010/operations`
- `http://127.0.0.1:3010/ingestion`
- `http://127.0.0.1:3010/audit`
- `http://127.0.0.1:3010/gis`
- `http://127.0.0.1:3010/search`
