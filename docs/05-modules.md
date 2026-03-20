# PCB – Mappa moduli

## 1. Moduli core

### PCB Core
Servizi comuni, configurazione, health, metadati di sistema.

### PCB Identity & Permissions
- login
- sessioni
- ruoli
- permessi
- scope per ufficio/modulo

### PCB Audit
- audit eventi
- log operativi
- storico modifiche

## 2. Moduli di dominio

### PCB Anagrafe
Dominio centrale:
- soggetto master
- CUUA
- identificativi
- storico nominativi/indirizzi
- collegamenti esterni

### PCB Catasto
- particelle
- volture
- relazioni soggetto-particella
- storico titolarità

### PCB GIS
- layer
- catalogo
- feature link
- map viewer
- tematizzazioni

### PCB Documentale
- riferimenti documenti
- collegamento documenti a soggetti, pratiche, particelle
- indicizzazione NAS e altre fonti

### PCB Riscossione
- bollettini
- incassi
- riferimenti economici provenienti da Capacitas

### PCB Personale
- utenze interne, organizzazione, dati utili al portale

### PCB Magazzino
Non prioritario nella prima fase ma previsto in architettura.

## 3. Moduli trasversali

### PCB Search
Ricerca unificata.

### PCB Reporting
Dashboard e report.

### PCB Workflow
Da predisporre architetturalmente, non prioritario nello sviluppo iniziale.

### PCB Notifications
Eventuale notifica interna.

## 4. Moduli integrazione

### PCB Integrations
Gestisce la registrazione dei connector, le schedule, gli stati run, i log.

## 5. Priorità di implementazione

### Priorità alta
- identity
- anagrafe
- ingest
- nas connector
- catasto
- gis basics
- audit
- search

### Priorità media
- Capacitas connectors
- documentale
- reporting

### Priorità successiva
- workflow
- notifications
- magazzino

