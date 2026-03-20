# PCB – Implementation Plan

## Scopo

Questo file definisce il piano di implementazione operativo del progetto PCB.

Va usato come riferimento per:

- ordine di sviluppo
- dipendenze tra milestone
- criteri di completamento
- prossimi step autorizzati

## Principi di esecuzione

- seguire rigorosamente la documentazione in `docs/`
- evitare rifacimenti strutturali
- fare sviluppi incrementali ma completi
- non introdurre dipendenze superflue
- preferire implementazioni leggibili, verificabili e tracciabili
- aggiornare `PROGRESS.md` al termine di ogni blocco chiuso

## Architettura target

- frontend Next.js
- backend NestJS modular monolith
- PostgreSQL + PostGIS
- Redis
- Keycloak
- QGIS Server
- connectors Node.js + Playwright

## Regole non negoziabili

- niente microservizi
- backend unico modulare
- CUUA come chiave di business centrale
- GIS trattato come dominio core
- separazione netta tra:
  - raw ingest
  - normalized data
  - master data
- i connettori non scrivono mai direttamente nelle tabelle master

## Stato baseline

Completato:

- bootstrap repository
- backend modulare iniziale
- compose base
- DB bootstrap iniziale
- access layer PostgreSQL esplicito
- API reali per anagrafiche, ingestion, audit, catasto, search
- validazione runtime backend contro Postgres reale

Non completato:

- frontend integrato con backend reale
- GIS applicativo
- Keycloak end-to-end
- Redis usato applicativamente
- connector NAS operativo
- matching engine
- documentale
- reporting

## Milestone operative

### M1 – Fondazioni repository

Obiettivo:

- struttura repository solida e coerente con la documentazione

Stato:

- completata

Deliverable:

- workspace npm
- backend skeleton
- frontend skeleton
- connectors skeleton
- compose base
- bootstrap PostGIS

### M2 – Core data e API base

Obiettivo:

- esporre le prime API reali su DB governato

Stato:

- completata

Deliverable:

- schema `anagrafe`, `ingest`, `audit`
- schema `catasto`
- access layer PostgreSQL
- endpoint reali `subjects`, `ingestion`, `audit`, `parcels`, `search`

### M3 – Frontend integrato

Obiettivo:

- sostituire la shell statica con viste collegate alle API reali

Stato:

- in corso

Deliverable previsti:

- client API frontend
- ricerca globale reale
- lista soggetti
- scheda soggetto base
- lista particelle / vista particella base
- loading/error/empty states

Stato attuale:

- completati client API, ricerca reale, lista soggetti, scheda soggetto base, lista/vista particella base
- da completare loading/error/empty states più raffinati e ingestion monitor

Dipendenze:

- M2 completata

### M4 – Ingestion monitoring UI

Obiettivo:

- rendere visibili le run ingestione e il loro stato

Stato:

- in corso

Deliverable previsti:

- schermata ingestion monitor
- dettaglio run
- trigger manuale connector da UI placeholder

Stato attuale:

- schermata lista run e trigger manuale implementati
- dettaglio run dedicato non ancora implementato

Dipendenze:

- M2 completata
- M3 almeno parzialmente completata

Nota:

- con M3 ormai avviata, M4 è il prossimo blocco raccomandato

### M5 – NAS connector operativo

Obiettivo:

- realizzare il primo connector read-only su NAS storico

Stato:

- da iniziare

Deliverable previsti:

- struttura config connector
- scansione ricorsiva read-only
- metadati file/cartelle
- hashing dove utile
- scrittura in raw ingest
- tracciamento `ingestion_run`

Dipendenze:

- M2 completata
- chiarimento config locale NAS/SMB

### M6 – GIS applicativo base

Obiettivo:

- collegare backend, PostGIS e vista mappa iniziale

Stato:

- da iniziare

Deliverable previsti:

- catalogo layer
- endpoint GIS base
- prima vista mappa frontend
- linking tra particelle e soggetti

Dipendenze:

- M3 completata almeno in parte
- decisioni sui layer ufficiali

### M7 – Keycloak reale e permessi

Obiettivo:

- passare dal placeholder auth all’integrazione reale

Stato:

- da iniziare

Deliverable previsti:

- integrazione login reale
- ruoli applicativi iniziali
- guard backend
- protezione API non pubbliche

Dipendenze:

- ambiente Keycloak disponibile

### M8 – Matching engine base

Obiettivo:

- introdurre il primo motore di matching governato

Stato:

- da iniziare

Deliverable previsti:

- scoring base
- persistenza `matching_result`
- esiti `matched`, `possible_match`, `no_match`, `conflict`
- base per validazione manuale

Dipendenze:

- ingestion reale disponibile

## Piano immediato raccomandato

### Step A

Collegare il frontend alle API reali.

Output:

- API client
- ricerca reale
- lista soggetti

Stato:

- completato

### Step B

Implementare la prima scheda soggetto.

Output:

- overview anagrafica
- identificativi
- storico nominativi
- collegamenti source

Stato:

- parzialmente completato

Nota:

- overview, identificativi e storico sono presenti
- i source links dedicati non sono ancora esposti

### Step C

Implementare vista particella.

Output:

- dati catastali
- relazioni soggetto-particella
- link di navigazione soggetto <-> particella

Stato:

- completato

### Step D

Implementare ingestion monitor iniziale.

Output:

- lista run
- stato run
- trigger manuale

Stato:

- in corso

## Criteri di done per ogni milestone

- codice coerente con modular monolith
- nessuna scorciatoia che rompa la separazione dei dati
- documentazione minima aggiornata
- `PROGRESS.md` aggiornato
- verifica concreta eseguita
- nessun codice demo inutile

## Decisioni già prese da preservare

- niente ORM in questa fase per il backend
- SQL esplicito per controllo del modello dati
- frontend istituzionale, non decorativo
- seed minimi solo per bootstrap e validazione

## File di governo da mantenere aggiornati

- `PROGRESS.md`
- `IMPLEMENTATION_PLAN.md`
- `README.md`
- `backend/README.md`
