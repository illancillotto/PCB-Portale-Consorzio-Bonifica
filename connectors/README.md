# PCB Connectors

Package separato per i connector Node.js + Playwright.

## Obiettivi

- mantenere i connettori fuori dal backend applicativo
- tracciare ogni `ingestion_run`
- rispettare la pipeline `source -> raw -> normalized -> matching -> master`
- evitare qualsiasi scrittura diretta su tabelle master

## Stato attuale

Bootstrap iniziale con struttura pronta per:

- `connector-nas-catasto`
- connettori browser-based Capacitas
- connettori HyperSIC e INAZ

## Connector NAS catasto

Implementazione attuale:

- scansione ricorsiva read-only del filesystem già montato
- classificazione directory/file
- rilevazione bucket alfabetico
- estrazione chiave potenziale soggetto da path
- hashing opzionale dei file
- output JSON strutturato di run

Variabili principali:

- `PCB_NAS_CATASTO_ROOT`
- `PCB_NAS_CATASTO_MAX_DEPTH`
- `PCB_NAS_CATASTO_HASH_FILES`
- `PCB_NAS_CATASTO_INCLUDE_HIDDEN`
- `PCB_NAS_CATASTO_SAMPLE_BYTES`
- `PCB_NAS_CATASTO_PERSIST_INGEST`
- `PCB_INGESTION_RUN_ID`

Esecuzione:

```bash
PCB_NAS_CATASTO_ROOT=/percorso/ARCHIVIO npm run run:nas-catasto --workspace connectors
```

Nota:

- il connector non scrive su tabelle master
- può lavorare in `dry-run` oppure persistire in:
  - `ingest.ingestion_run`
  - `ingest.ingestion_record_raw`
- la persistenza si attiva con `PCB_NAS_CATASTO_PERSIST_INGEST=true`
- se `PCB_INGESTION_RUN_ID` è valorizzato, il connector aggiorna la run esistente invece di crearne una nuova

Esempio con persistenza:

```bash
PCB_NAS_CATASTO_ROOT=/mnt/ARCHIVIO \
PCB_NAS_CATASTO_PERSIST_INGEST=true \
npm run run:nas-catasto --workspace connectors
```
