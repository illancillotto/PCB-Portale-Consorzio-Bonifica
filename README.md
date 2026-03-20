# PCB – Portale Consorzio Bonifica

Pacchetto documentale in formato Markdown per avviare lo sviluppo del progetto **PCB – Portale Consorzio Bonifica** con Codex in autonomia operativa.

## Contenuto del pacchetto

- `docs/00-project-brief.md` — sintesi esecutiva del progetto
- `docs/01-prd.md` — Product Requirements Document completo
- `docs/02-architecture.md` — architettura logica e tecnica
- `docs/03-data-model.md` — modello dati iniziale e linee guida DB
- `docs/04-connectors-and-ingestion.md` — strategia connettori e scraping/ingestion
- `docs/05-modules.md` — mappa completa dei moduli PCB
- `docs/06-api-guidelines.md` — linee guida API e naming
- `docs/07-frontend-guidelines.md` — linee guida frontend Next.js
- `docs/08-security-and-audit.md` — sicurezza, ruoli, audit e logging
- `docs/09-delivery-roadmap.md` — roadmap e milestone
- `docs/10-codex-instructions.md` — istruzioni operative da dare a Codex
- `docs/11-prompts-for-codex.md` — prompt pronti per far partire il lavoro
- `docs/12-definition-of-done.md` — criteri di completamento
- `docs/13-open-questions-and-risks.md` — rischi e questioni aperte

## Obiettivo

Questo materiale serve a dare a Codex:

- contesto funzionale solido
- vincoli architetturali chiari
- priorità corrette
- struttura tecnica coerente
- modalità di esecuzione progressiva

## Decisioni già fissate

- Nome progetto: **PCB – Portale Consorzio Bonifica**
- Architettura: **modular monolith**
- Frontend: **Next.js**
- Backend: **NestJS**
- Database: **PostgreSQL + PostGIS**
- Auth: **Keycloak**
- Queue/Cache: **Redis**
- GIS publishing: **QGIS Server**
- Connettori web: **Node.js + Playwright**
- Logica master data: **anagrafe unica centrata sul CUUA**

## Nota importante

Il progetto non parte come sostituzione totale dei sistemi esterni. Parte come **piattaforma interna di governo del dato**, integrazione, consultazione e collegamento con GIS e storico documentale.

