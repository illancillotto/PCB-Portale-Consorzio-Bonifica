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

### M0.15 – Quick diagnostics in Operations

Obiettivo:

- esporre nella UI operativa i riferimenti più immediati per triage tecnico locale

Stato:

- completata

Deliverable:

- sezione `Quick diagnostics` nella vista `operations`
- URL runtime chiave per frontend, backend, Keycloak e QGIS
- comandi rapidi per bootstrap e verifica locale

### M0.16 – First response checklist in Operations Help

Obiettivo:

- fornire nel portale una checklist di prima diagnosi per i guasti operativi più probabili

Stato:

- completata

Deliverable:

- checklist `First response` nella pagina `/operations/help`
- copertura minima per login, ingestion, GIS e connector NAS
- shortcut diretti ai moduli o ai target runtime utili al triage

### M0.17 – Escalation signals in Operations Help

Obiettivo:

- chiarire quando fermare il triage locale e passare al modulo o al livello diagnostico successivo

Stato:

- completata

Deliverable:

- sezione `Escalation signals` nella pagina `/operations/help`
- criteri pratici di escalation verso `audit`, `ingestion`, `gis`
- comandi rapidi per verify e log runtime

### M0.18 – Shortcut all’help center dai moduli operativi

Obiettivo:

- rendere l’help center operativo raggiungibile direttamente dai moduli piu` usati

Stato:

- completata

Deliverable:

- shortcut contestuali a `/operations/help` da `ingestion`, `audit` e `gis`
- link di ritorno rapido a `operations`

### M0.19 – Shortcut help nei dettagli operativi

Obiettivo:

- rendere disponibile l’help center anche nei dettagli più usati durante il troubleshooting

Stato:

- completata

Deliverable:

- shortcut a `/operations/help` in `ingestion/[id]`
- shortcut a `/operations/help` in `ingestion/connectors/[connectorName]`
- shortcut a `/operations/help` nelle schede soggetto e particella

### M0.20 – Help center topic-aware

Obiettivo:

- aprire l’help center già focalizzato sul dominio corretto invece di usare sempre una vista generica

Stato:

- completata

Deliverable:

- supporto query `topic` in `/operations/help`
- contenuto filtrato per `auth`, `ingestion`, `audit`, `gis`
- shortcut contestuali riallineati nei moduli operativi

### M0.21 – Related commands topic-aware

Obiettivo:

- mostrare nell’help center il comando più utile per il topic attivo senza costringere a navigare tutta la documentazione

Stato:

- completata

Deliverable:

- sezione `Related commands` in `/operations/help`
- comandi filtrati per `auth`, `ingestion`, `audit`, `gis`
- fallback generale con comandi di verifica e log runtime

### M0.22 – Related docs topic-aware

Obiettivo:

- mostrare nell’help center i documenti più pertinenti per il topic attivo senza perdere il contesto generale

Stato:

- completata

Deliverable:

- sezione `Guide disponibili` filtrata per topic in `/operations/help`
- fallback generale per runbook, smoke tests e known issues
- tagging esplicito dei riferimenti documentali

### M0.23 – Related routes topic-aware

Obiettivo:

- mostrare nell’help center anche le viste del portale più pertinenti per il topic attivo

Stato:

- completata

Deliverable:

- sezione `Related routes` in `/operations/help`
- route filtrate per `auth`, `ingestion`, `audit`, `gis`
- fallback generale con `operations` e help center completo

### M0.24 – Topic summary nell’help center

Obiettivo:

- dare un orientamento immediato sul topic attivo senza richiedere scorrimento della pagina

Stato:

- completata

Deliverable:

- sezione `Topic summary` in testa a `/operations/help`
- problema tipico, primo comando, prima route e primo documento per topic

### M0.25 – Shortcut help topic-aware nella dashboard

Obiettivo:

- rendere raggiungibile l’help center topic-aware anche dalla home

Stato:

- completata

Deliverable:

- sezione `Serve aiuto?` nella dashboard
- shortcut diretti ai topic `auth`, `ingestion`, `audit`, `gis`

### M0.26 – Shortcut help topic-aware nella ricerca

Obiettivo:

- rendere disponibile l’help center topic-aware anche nel punto di analisi dei risultati applicativi

Stato:

- completata

Deliverable:

- sezione `Serve aiuto?` nella vista `search`
- shortcut diretti ai topic `audit`, `gis`, `ingestion` e help center completo

### M0.27 – Shortcut help topic-aware nelle liste business

Obiettivo:

- chiudere il cerchio sugli entry point business principali con accesso diretto al supporto operativo

Stato:

- completata

Deliverable:

- sezione `Serve aiuto?` nelle viste `subjects` e `parcels`
- shortcut diretti ai topic `audit`, `gis`, `ingestion` e help center completo

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

### Step 0

Stabilizzare l'avvio locale con bootstrap ripetibile.

Output:

- script locale per `.env` e sample NAS
- istruzioni root riallineate al runtime reale

Stato:

- completato

### Step 0.1

Chiudere il bring-up locale con uno smoke check ripetibile.

Output:

- script unico per prerequisiti locali
- smoke check standardizzato del runtime attivo

Stato:

- completato

### Step 0.2

Estendere lo smoke locale all'autenticazione applicativa reale.

Output:

- login seed operatore verificato via frontend
- accesso a una vista protetta verificato nello smoke standard

Stato:

- completato

### Step 0.3

Estendere lo smoke locale alla pipeline `ingestion`.

Output:

- trigger reale di una run locale
- verifica end-to-end del chaining `run -> normalize -> match`

Stato:

- completato

### Step 0.4

Estendere lo smoke locale alla catena GIS applicativa.

Output:

- verifica autenticata dei principali endpoint GIS
- verifica `GetFeatureInfo` end-to-end tramite proxy frontend

Stato:

- completato

### Step 0.5

Unificare le verifiche locali in una suite unica.

Output:

- un solo comando per validare stack, auth, ingestion e GIS

Stato:

- completato

### Step 0.6

Allineare i README dei package al bootstrap locale reale.

Output:

- backend/frontend/connectors documentati con gli stessi comandi root e prerequisiti runtime

Stato:

- completato

### Step 0.7

Introdurre una checklist root per onboarding e troubleshooting.

Output:

- percorso `day 1`
- percorso `day 2`
- troubleshooting base standardizzato

Stato:

- completato

### Step 0.8

Introdurre un changelog sintetico root per milestone e commit chiave.

Output:

- cronologia breve leggibile
- collegamento dal README root

Stato:

- completato

### Step 0.9

Introdurre un runbook operativo corto per uso del portale.

Output:

- flussi operativi minimi documentati
- diagnosi iniziale standardizzata

Stato:

- completato

### Step 0.10

Documentare la superficie API effettiva in forma sintetica.

Output:

- endpoint pubblici
- endpoint protetti
- query filter principali
- endpoint più utili per smoke e troubleshooting

Stato:

- completato

### Step 0.11

Documentare le variabili ambiente locali rilevanti.

Output:

- default
- scopo
- impatto operativo

Stato:

- completato

### Step 0.12

Documentare gli smoke test locali in forma sintetica.

Output:

- prerequisiti
- copertura
- output atteso
- quando usare ogni smoke

Stato:

- completato

### Step 0.13

Raccogliere i problemi noti gia` risolti in un documento root.

Output:

- sintomo
- causa
- fix o contromisura

Stato:

- completato

### Step 0.14

Portare i riferimenti documentali principali dentro la UI operativa.

Output:

- sezione help nella vista `operations`
- pagina protetta di orientamento documentale

Stato:

- completato

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
- il viewer GIS e il proxy `GetFeatureInfo` usano ora lo stesso contratto errore operativo del resto del frontend
- `operations` espone ora anche failure code, status code e target delle integrazioni runtime
- il dominio `ingestion` espone ora failure metadata strutturati (`failureCode`, `failureStage`) su run e connector issue
- la pipeline `normalized -> matching` espone ora anche outcome metadata strutturati a livello record
- la pipeline `raw -> normalized -> matching` espone ora outcome metadata strutturati su tutti i livelli record
- il monitor operativo e il dettaglio connector espongono ora anche `rawSummary` strutturato per run e ultima esecuzione
- `rawSummary` espone ora anche il breakdown per outcome del layer NAS, visibile in monitor e dettaglio connector
- il dettaglio run supporta ora filtri raw per `outcomeCode` con query string condivisibile
- il dettaglio run espone ora riconciliazione pipeline con deep link outcome-aware tra raw, normalized e matching
- `operations` espone ora anche gli outcome aggregati cross-run della pipeline ingestion
- `operations` espone ora anche ingressi operativi diretti alle run piu` rilevanti
- i contatori outcome in `operations` aprono ora `ingestion` con filtri outcome-aware e stage-aware
- `operations` espone ora anche shortcut `pipeline attention` per i principali casi da verificare nel monitor `ingestion`
- il monitor `ingestion` espone ora anche il contesto dei filtri run attivi con reset puntuale e ritorno rapido a `operations`
