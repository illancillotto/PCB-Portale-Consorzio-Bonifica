# Script locali

## `prepare-local-runtime.sh`

Bootstrap locale idempotente per sviluppo:

- crea `.env` da `.env.example` se mancante
- aggiunge solo le variabili locali minime se ancora assenti
- prepara un sample NAS in `/tmp/pcb-nas-sample` o in `PCB_LOCAL_SAMPLE_NAS_ROOT`

Uso:

```bash
bash ./scripts/prepare-local-runtime.sh
```

## `dev-up.sh`

Bring-up locale dei prerequisiti di sviluppo:

- prepara `.env`
- prepara il sample NAS
- avvia lo stack Docker
- installa le dipendenze workspace
- builda i connectors

Uso:

```bash
bash ./scripts/dev-up.sh
```

## `smoke-local-runtime.sh`

Smoke check del runtime locale attivo:

- backend health
- frontend login
- Keycloak discovery
- QGIS GetCapabilities
- login operatore seed via frontend
- accesso a `operations` con sessione reale

Uso:

```bash
bash ./scripts/smoke-local-runtime.sh
```

Credenziali smoke di default:

- `pcb.operator / pcb.operator`

Override opzionali:

- `PCB_SMOKE_USERNAME`
- `PCB_SMOKE_PASSWORD`
