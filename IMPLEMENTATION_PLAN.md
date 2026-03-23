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

- frontend integrato con backend reale in prima versione
- GIS viewer cartografico completo
- Keycloak end-to-end completo lato frontend
- connector NAS operativo con matching
- matching engine con workflow base
- documentale dedicato
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

Nota:

- lista run e trigger manuale sono già presenti e verificati

Deliverable previsti:

- client API frontend
- ricerca globale reale
- lista soggetti
- scheda soggetto base
- lista particelle / vista particella base
- loading/error/empty states

Stato attuale:

- completati client API, ricerca reale, lista soggetti, scheda soggetto base, lista/vista particella base
- completati source links e documentale base nella scheda soggetto
- da completare loading/error/empty states più raffinati

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
- dettaglio run dedicato implementato
- visibilità frontend su normalized e matching implementata

Dipendenze:

- M2 completata
- M3 almeno parzialmente completata

Nota:

- con M3 ormai avviata, M4 è il prossimo blocco raccomandato
- lista run e trigger manuale sono già verificati

### M5 – NAS connector operativo

Obiettivo:

- realizzare il primo connector read-only su NAS storico

Stato:

- in corso

Deliverable previsti:

- struttura config connector
- scansione ricorsiva read-only
- metadati file/cartelle
- hashing dove utile
- scrittura in raw ingest
- tracciamento `ingestion_run`

Stato attuale:

- completati config, scansione ricorsiva, metadati, hashing, CLI locale e persistenza in `ingest`
- completata la normalizzazione iniziale nel backend `ingest`
- da completare collegamento a matching

Dipendenze:

- M2 completata
- chiarimento config locale NAS/SMB

Nota:

- il connector reale ora copre `source -> raw ingest`
- la normalizzazione è orchestrata nel backend per mantenere separati i confini del modular monolith

### M6 – GIS applicativo base

Obiettivo:

- collegare backend, PostGIS e vista mappa iniziale

Stato:

- completata

Deliverable previsti:

- catalogo layer
- endpoint GIS base
- prima vista mappa frontend
- linking tra particelle e soggetti
- publication status QGIS verificato su route pubblico `/ows/`

Stato attuale:

- completato catalogo layer
- completati endpoint GIS protetti
- completata vista mappa frontend reale
- completati deep-link contestuali soggetto/particella
- completato monitoraggio publication target QGIS con `GetCapabilities` reale sul progetto bootstrap
- completato accesso operativo dal frontend al publication target QGIS
- completato primo layer tematico reale `pcb_parcels` pubblicato da QGIS Server

Prossimo passo naturale:

- pubblicare il secondo layer tematico reale `pcb_subjects`
- oppure introdurre una vista QGIS dedicata alle relazioni soggetto-particella

Dipendenze:

- M2 completata
- Keycloak operativo per route protette

Stato attuale:

- completati catalogo layer, endpoint GIS base e vista frontend GIS foundation
- completato viewer cartografico iniziale con feature PostGIS reali
- completati deep-link contestuali da soggetti e particelle verso il viewer
- completata osservabilita` del publication target QGIS lato backend/frontend
- completato progetto QGIS minimale di bootstrap nel repository

Dipendenze:

- M3 completata almeno in parte
- decisioni sui layer ufficiali

### M7 – Keycloak reale e permessi

Obiettivo:

- passare dal placeholder auth all’integrazione reale

Stato:

- in corso

Deliverable previsti:

- integrazione login reale
- ruoli applicativi iniziali
- guard backend
- protezione API non pubbliche

Stato attuale:

- completato realm locale importato via compose
- completata discovery reale lato backend
- completata validazione JWT via JWKS
- completata prima guard backend verificata su endpoint auth
- completata integrazione login frontend
- completata protezione selettiva iniziale delle viste operative `ingestion` e `gis`
- completata protezione delle API operative `ingestion` e `gis`
- completata protezione e prima vista operativa `audit`
- da completare protezione selettiva delle altre API non pubbliche del portale

Dipendenze:

- ambiente Keycloak disponibile

### M8 – Matching engine base

Obiettivo:

- introdurre il primo motore di matching governato

Stato:

- in corso

Deliverable previsti:

- regole iniziali di matching su CUUA e indizi documentali
- persistenza in `ingest.matching_result`
- API di ispezione esito matching

Stato attuale:

- completate persistenza risultati e API di esecuzione/ispezione
- completate prime regole deterministic/review su `normalizedSubjectKey`
- completata review operativa base in UI
- completato raffinamento matching `CUUA-first`, `source-link-aware` e `canonical-name`
- completata assegnazione manuale soggetto nei casi review residui
- completato audit esplicito delle decisioni manuali di matching
- completato audit automatico dei passaggi chiave `run/normalize/match`
- completato Redis operativo backend su health/runtime e marker ingest

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

- quasi completato

Nota:

- overview, identificativi, storico e source links sono presenti
- documenti base presenti
- manca ancora un endpoint documentale dedicato e un viewer

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

### Step E

Centralizzare lo stato operativo delle integrazioni core.

Output:

- endpoint protetto di integrazione runtime
- vista frontend protetta per operatori

Stato:

- completato

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
