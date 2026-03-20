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
