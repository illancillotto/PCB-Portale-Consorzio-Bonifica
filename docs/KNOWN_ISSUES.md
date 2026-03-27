# PCB – Known Issues

Problemi reali gia` incontrati nel progetto e relativi fix/contromisure.

## 1. `.env` root non caricato correttamente

Sintomo:

- backend o frontend partivano con valori di default inattesi
- le porte locali non seguivano i valori desiderati

Causa:

- il backend e gli script frontend non caricavano in modo affidabile il `.env` root del repository

Fix applicato:

- backend riallineato a `ConfigModule.forRoot(...)`
- script frontend aggiornati per leggere `../.env`

Commit correlato:

- `19ed899` `Fix runtime env loading for backend and frontend`

## 2. Moduli protetti senza import di `AuthModule`

Sintomo:

- errore NestJS a runtime su domini protetti
- backend non avviabile con guard auth attive

Causa:

- alcuni moduli di business protetti non importavano `AuthModule`

Fix applicato:

- import esplicito di `AuthModule` nei moduli interessati

Commit correlato:

- `b0cab05` `Fix auth module imports for protected domains`

## 3. `GetFeatureInfo` vuoto per axis order `EPSG:4326`

Sintomo:

- `GetFeatureInfo` rispondeva `200` ma con `features: []`

Causa:

- WMS 1.3 con `EPSG:4326` usa axis order lat/lon nel `bbox`
- la query iniziale usava ordine lon/lat

Fix applicato:

- correzione del `bbox` nello smoke GIS sul contratto reale di QGIS Server

Contromisura:

- quando si costruiscono query `GetFeatureInfo`, verificare sempre axis order e CRS

Commit correlato:

- `30f1eb4` `Add GIS smoke checks to local runtime`

## 4. Validazione DTO `audit` troppo restrittiva

Sintomo:

- `GET /api/v1/audit/events?...` restituiva `400`

Causa:

- DTO query `audit` non allineato alla validazione effettiva dei filtri opzionali

Fix applicato:

- aggiunti campi opzionali stringa espliciti nel DTO

Commit correlato:

- `19e71e6` `Add optional fields to ListAuditEventsQueryDto for enhanced filtering`

## 5. Trigger manuale `ingestion` dipendente da `connectors/dist`

Sintomo:

- il trigger reale del connector NAS falliva anche con backend attivo

Causa:

- il backend esegue il CLI reale del connector, quindi serve `connectors/dist`

Contromisura:

- eseguire sempre:

```bash
npm run build --workspace connectors
```

- usare `npm run dev:up`, che include la build dei connectors

## 6. Smoke eseguito prima che backend/frontend fossero davvero pronti

Sintomo:

- `dev:smoke` falliva subito su backend o frontend non raggiungibili

Causa:

- i processi `dev:backend` e `dev:frontend` non erano ancora pronti quando partiva lo smoke

Contromisura:

- attendere il messaggio di startup completo
- poi eseguire `npm run dev:smoke` oppure `npm run dev:verify`

## 7. NAS locale mancante o non accessibile

Sintomo:

- issue connector `not_runnable`
- trigger manuale ingestion non eseguibile

Causa:

- `PCB_NAS_CATASTO_ROOT` assente o non accessibile

Contromisura:

- eseguire `npm run dev:prepare-runtime`
- verificare il sample locale in `/tmp/pcb-nas-sample`

## 8. Come usare questo file

Questo documento serve per evitare che problemi gia` risolti vengano riscoperti.

Per troubleshooting operativo piu` ampio:

- [docs/OPERATIONS_RUNBOOK.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/OPERATIONS_RUNBOOK.md)
- [docs/SMOKE_TESTS.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/SMOKE_TESTS.md)
- [docs/LOCAL_ENV_REFERENCE.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/docs/LOCAL_ENV_REFERENCE.md)
