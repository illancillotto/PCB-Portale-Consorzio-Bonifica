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
