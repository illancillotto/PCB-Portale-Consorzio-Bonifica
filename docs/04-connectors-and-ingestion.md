# PCB – Connettori e pipeline di ingestione

## 1. Premessa

Poiché le API non sono disponibili o non sono garantite, il progetto deve prevedere una strategia di acquisizione dati basata su **connettori dedicati**.

Il termine corretto di progetto è **connector / ingestion service**, non semplicemente scraper.

## 2. Famiglie di connettori

### 2.1 File connector
Per il NAS storico:
- scansione alberatura SMB
- indicizzazione file/cartelle
- raccolta metadati
- hash file
- mapping verso utenze

### 2.2 Browser connector
Per portali web esterni senza API:
- autenticazione
- navigazione
- ricerca
- estrazione tabelle/dettagli
- download documenti

### 2.3 Batch import connector
Per eventuali export:
- CSV
- XLSX
- PDF strutturati
- altri file periodici

## 3. Tecnologia scelta

### Browser automation
- Node.js
- Playwright

### Orchestrazione crawling, se utile
- Crawlee

### Motivazione
Playwright è la scelta più solida per applicazioni web moderne, sessioni autenticate e download controllati.

## 4. Connettori prioritari

### NAS storico catasto
Nome modulo: `connector-nas-catasto`

Funzioni:
- mount/read SMB
- scansione cartelle A-Z
- rilevazione cartelle utenza
- indicizzazione file
- hash
- metadati
- associazione potenziale con CUUA o soggetto

### Capacitas InVolture
Nome modulo: `connector-capacitas-involture`

Obiettivo:
- acquisire dati catasto / volture / soggetti utili alla ricostruzione del CUUA

### Capacitas InGIS
Nome modulo: `connector-capacitas-ingis`

Obiettivo:
- acquisire dati territoriali / catastali / riferimenti cartografici collegabili ai soggetti

### Capacitas InCass
Nome modulo: `connector-capacitas-incass`

Obiettivo:
- acquisire dati di riscossione e riferimenti economici

### Capacitas InBollettini
Nome modulo: `connector-capacitas-inbollettini`

Obiettivo:
- acquisire bollettini e riferimenti di pagamento

### HyperSIC
Nome modulo: `connector-hypersic`

Obiettivo:
- acquisire metadati documentali e riferimenti utili alle schede soggetto

### INAZ
Nome modulo: `connector-inaz`

Obiettivo:
- solo perimetro interno personale/organizzazione, non centrale nel dominio CUUA ma utile al portale

## 5. Pipeline obbligatoria

Ogni connector deve seguire questa pipeline:

1. acquisizione dal sistema sorgente
2. scrittura in `ingest.ingestion_record_raw`
3. normalizzazione
4. matching contro anagrafe master
5. aggiornamento o creazione relazioni storiche
6. logging e audit

## 6. Regole fondamentali

### R-01
Mai scrivere direttamente nelle tabelle master dal connettore.

### R-02
Ogni esecuzione deve generare un `ingestion_run`.

### R-03
Ogni errore deve essere loggato in modo utile.

### R-04
I connettori devono essere idempotenti, per quanto possibile.

### R-05
Dove i dati sono ambigui, generare una decisione di matching da validare.

## 7. Matching strategy

Il matching deve essere per punteggio e non per euristica singola.

Input potenziali:
- CUUA
- codice fiscale
- partita IVA
- nome/denominazione
- riferimenti catastali
- identificativi esterni
- path e naming archivio storico

Output:
- matched
- possible_match
- no_match
- conflict

## 8. Modalità esecutive

### Pianificata
- cron
- job queue
- run notturne o orarie

### Manuale
- run su richiesta da pannello amministrativo

## 9. Fase iniziale del NAS

La scansione NAS deve essere:
- read-only
- non distruttiva
- orientata a inventario e classificazione
- senza spostamenti automatici file

