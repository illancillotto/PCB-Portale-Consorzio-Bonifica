# PCB – Project Brief

## Sintesi

PCB è la piattaforma interna del Consorzio di Bonifica dell'Oristanese pensata per unificare dati, sistemi e processi oggi distribuiti tra software esterni, archivi legacy e strumenti GIS frammentati.

## Perché esiste

La situazione attuale è caratterizzata da:

- più applicazioni esterne non integrate
- dati distribuiti e poco governati
- assenza di un'anagrafe unica forte
- archivio documentale storico su NAS non indicizzato in modo strutturato
- componente GIS distribuita su singole postazioni
- difficoltà di visione trasversale tra catasto, utenze, riscossione, documenti e territorio

## Scopo del progetto

Costruire una piattaforma che permetta di:

- avere una **anagrafe unica utenze** basata sul **CUUA**
- ricostruire la **storia completa** del CUUA
- collegare anagrafe, catasto, documenti, pagamenti, GIS e sistemi esterni
- integrare dati da portali senza API tramite connettori e scraping controllato
- offrire un'interfaccia moderna, coerente e istituzionale per gli operatori interni
- predisporre una base tecnica solida per evoluzioni future

## Sorgenti esterne note

### Sistemi già identificati
- HyperSIC — gestione documentale / amministrativa
- Gestionale attività irrigue — applicazione esterna dedicata
- INAZ — personale / presenze / paghe
- NAS storico settore catasto — archivio file legacy su SMB
- Capacitas InBollettini
- Capacitas InCass
- Capacitas InGIS
- Capacitas InVolture

### Fuori perimetro iniziale
- alcune integrazioni con Agenzia delle Entrate, da rimandare

## Punto centrale del dominio

La piattaforma non è document-centric, né GIS-centric, né billing-centric.

La piattaforma è **CUUA-centric**.

Il CUUA è la chiave di business che collega:
- soggetto/utenza
- storico anagrafico
- relazioni catastali
- partite / bollettini / incassi
- documenti e fascicoli
- particelle e geometrie GIS

## Vincolo tecnico principale

Il progetto deve essere costruito come **modular monolith** e non come microservizi.

