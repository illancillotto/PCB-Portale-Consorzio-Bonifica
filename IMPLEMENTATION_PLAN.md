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
- completata estensione della `search` come ingresso operativo verso GIS, ingestion, audit e operations
- completato filtro URL-shareable per tipo risultato nella `search`, con riepilogo sintetico dei match
- completato filtro URL-shareable `sourceModule` nella vista `audit`, con supporto backend dedicato
- completati riepiloghi cliccabili per attore e modulo sorgente nella vista `audit`
- completato filtro `entityType/entityId` nella vista `audit`, con ingressi contestuali dalla `search`
- completato cartiglio frontend dei filtri attivi nella vista `audit`
- completato riepilogo audit per modulo nella vista `operations`, con deep link verso `audit`
- completati ingressi audit per modulo anche nella dashboard principale
- completati ingressi audit per attore anche nella dashboard principale
- completati ingressi audit contestuali anche nelle schede soggetto e particella
- completati shortcut operativi anche nelle liste soggetti e particelle
- completati shortcut `audit` contestuali anche nella lista run e nel dettaglio run di `ingestion`
- completati shortcut `audit` anche nel dettaglio connector del dominio `ingestion`
- completato summary backend dedicato per `audit`, usato dalle principali viste operative
- completati contatori audit contestuali nei dettagli `ingestion` di run e connector
- completati contatori audit contestuali anche nei dettagli `subject` e `parcel`
- completato endpoint bulk `audit/entity-summaries` e suo riuso negli entry point `subjects`, `parcels`, `search`
- completati loading/error states condivisi nel frontend App Router
- completati empty states condivisi sui principali entry point frontend
- completato redirect contestuale verso `login` con `reason` e `next` sulle principali route protette
- completato resume post-login verso la vista richiesta
- completato fallback auth uniforme anche sul proxy operativo frontend per `401/403`
- completato redirect contestuale al login anche durante le azioni operative client-side
- completata classificazione operativa anche di dashboard, search e liste business
- completata navigazione globale coerente con la nuova access policy
- completata formalizzazione backend della stessa policy su `subjects`, `parcels`, `search`
- completata classificazione dei runtime endpoint tra pubblico tecnico e interno operativo
- completata uniformazione dei payload errore backend e proxy operativo frontend
- completata introduzione dei codici errore di dominio iniziali su `ingest`
- completata estensione dei codici errore di dominio a `auth`, `anagrafiche` e `catasto`
- completata classificazione dei fallimenti operativi anche nel frontend `ingestion/matching`
- completata la gestione SSR degli `ApiError` nelle viste operative principali
- completata la propagazione end-to-end dei `requestId` tra backend, proxy e frontend
- da completare eventuali notice ancora più specifici per sessioni degradate

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
- completato secondo layer tematico reale `pcb_subjects` pubblicato da QGIS Server
- completato overlay WMS pubblicato nel viewer frontend GIS
- completato `GetFeatureInfo` operativo dal viewer frontend GIS
- completati link navigabili dai risultati `GetFeatureInfo`
- completata evidenziazione automatica in mappa della feature selezionata via `GetFeatureInfo`
- completato sync inverso tra selezione mappa e pannello risultati
- completato cartiglio `GetFeatureInfo` con contesto PCB relazionale
- completato raffinamento `GetFeatureInfo` con priorita` al layer relazionale
- completato controllo layer operativo nel viewer GIS
- completata legenda cartografica esplicita nel viewer GIS
- completata sincronizzazione URL dei layer attivi del viewer GIS
- completati preset operativi GIS condivisibili
- completati quick link ai preset GIS da viste operative
- completati preset GIS contestuali da dashboard e search
- completate metriche GIS sintetiche in dashboard
- completate metriche ingestion e audit in dashboard
- completato riepilogo operativo ingestion in lista e dettaglio run
- completati filtri operativi ingestion in lista e dettaglio run
- completato catalogo connector orchestrato nel dominio ingestion
- completato summary backend di orchestration ingestion
- completati trigger manuali ingestion derivati dal catalogo connector
- completato dettaglio per singolo connector nel dominio ingestion
- completata esposizione readiness runtime dei connector
- completato uso della readiness runtime nel monitor ingestion e nei trigger manuali
- completato storico operativo sintetico per singolo connector nel dominio ingestion
- completato endpoint dedicato `connector runs` per ridurre coupling nel dettaglio ingestion
- completato filtro `status` sulle run per singolo connector
- completato elenco issue operative dei connector nel monitor ingestion
- completata esposizione cross-domain delle issue connector in `operations`
- completati filtri operativi sulle issue connector nel monitor ingestion
- completati contatori sintetici backend sulle issue connector per riepiloghi cross-domain
- completati filtri URL-shareable sulle issue connector anche nella vista `operations`
- completato filtro per singolo connector sulle issue operative cross-domain
- completati contatori issue per singolo connector nel catalogo e nel dettaglio ingestion
- completato elenco issue aperte nel dettaglio connector con filtro per severity
- completato consolidamento del payload `connector detail` con issue aperte incluse
- completato filtro `issueType` nel dettaglio connector
- completati contatori per tipo di issue nel dettaglio connector
- completato `operationalStatus` sintetico per catalogo e dettaglio connector
- completato ordinamento backend-side del catalogo connector per priorita` operativa
- completato ordinamento backend-side del feed issue connector
- completato conteggio backend dei connector `healthy` nei riepiloghi orchestration
- completati filtri backend/frontend sul catalogo connector per stato operativo e trigger mode
- completato riepilogo audit con filtri operativi dedicati
- completata osservabilita` cross-domain nella vista `operations`
- completata vista/overlay tematico dedicato alle relazioni soggetto-particella
- completato endpoint GIS applicativo dedicato alle relazioni soggetto-particella
- completati filtri `subjectId` e `parcelId` sull'endpoint GIS relazionale
- completati filtri `subjectId` e `parcelId` sull'endpoint GIS `map-features`
- completati filtri `subjectId` e `parcelId` sull'endpoint GIS `feature-links`

Prossimo passo naturale:

- usare il layer relazionale per popup/cartigli ancora piu` mirati nel viewer
- oppure iniziare il consolidamento del dominio connectors sul lato esecuzione reale

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
- completato redirect frontend contestuale per le principali route protette con ripresa della vista richiesta
- completato fallback uniforme del proxy frontend operativo con pulizia sessione scaduta
- completata estensione della protezione selettiva alle principali viste di business del portale
- da completare eventuale formalizzazione backend della stessa policy su endpoint oggi ancora pubblici

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

Estensioni completate:

- issue connector cross-domain in `operations`
- filtri URL-shareable issue connector in `operations`
- catalogo connector operativo in `operations`
- filtri URL-shareable del catalogo su stato operativo e trigger mode
- trigger manuale backend collegato al CLI reale del connector NAS con riuso della stessa `ingestion_run`
- auto-refresh delle viste operative `ingestion` per run asincrone `queued/running`
- chaining opzionale `run -> normalize -> match` orchestrato dal backend sulla stessa run
- il trigger frontend apre direttamente il dettaglio della run per seguire il chaining asincrono
- monitor e dettaglio run mostrano esplicitamente gli stage di pipeline della singola run
- il monitor run supporta filtri stage URL-shareable per lettura operativa piu` rapida
- `operations` espone anche i contatori cross-domain degli stage ingestion
- i contatori stage in `operations` fungono da deep link operativo verso `ingestion`
- la dashboard principale riusa gli stessi deep link operativi per ingestion e audit

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

## Estensioni operative completate

- il monitor `ingestion` copre tutti gli stage applicativi con filtri condivisibili
- la vista `audit` supporta deep link operativi verso run e soggetti collegati
- il dettaglio connector riusa i filtri stage del monitor `ingestion`
- il contratto errori backend copre ora anche `gis` e `audit` con codici di dominio per query incoerenti e identificativi invalidi
- le viste server-side principali e di dettaglio espongono ora errori classificati con `error.code`, `requestId` e azioni contestuali di recupero
