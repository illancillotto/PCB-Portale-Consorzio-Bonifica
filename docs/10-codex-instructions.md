# CODEX.md – Istruzioni operative progetto PCB

## Missione

Stai lavorando al progetto **PCB – Portale Consorzio Bonifica**, piattaforma interna del Consorzio di Bonifica dell'Oristanese.

Il progetto ha come fulcro una **anagrafe unica utenze centrata sul CUUA** e deve integrare dati da sistemi esterni, archivio NAS storico e componente GIS.

## Vincoli non negoziabili

1. Il backend deve restare un **modular monolith**
2. Non introdurre microservizi
3. Il database principale è **PostgreSQL**
4. Per GIS usare **PostGIS**
5. Per browser automation usare **Playwright**
6. Il CUUA è la chiave di business centrale
7. Non scrivere mai direttamente dai connettori nelle tabelle master
8. Conservare i raw payload di ingestione
9. Tenere forte separazione tra:
   - raw ingest
   - normalized data
   - master data
10. Trattare il GIS come dominio core

## Sistemi esterni da integrare

- NAS storico settore catasto via SMB
- Capacitas InVolture
- Capacitas InGIS
- Capacitas InCass
- Capacitas InBollettini
- HyperSIC
- INAZ

## Struttura logica backend

- auth
- users
- permissions
- anagrafiche
- catasto
- gis
- documentale
- riscossione
- personale
- integrazioni
- audit
- search
- report

## Regole di sviluppo

### Backend
- usare NestJS con moduli ordinati
- business logic nei service, non nei controller
- DTO espliciti
- validation obbligatoria
- error handling coerente
- logging chiaro
- repository/query ordinate
- no overengineering

### Frontend
- usare Next.js con app interna sobria e istituzionale
- la scheda soggetto è una schermata centrale
- la ricerca globale è una funzionalità core
- la mappa GIS deve essere integrata, non separata male
- evitare componenti giganti

### Database
- usare PostgreSQL + PostGIS
- usare `jsonb` per raw payload
- usare campi `valid_from` / `valid_to` dove c'è storico
- mantenere reference alla sorgente esterna
- progettare con relazioni forti

### Connettori
- usare adapter dedicati
- generare `ingestion_run`
- scrivere raw ingest
- normalizzare
- fare matching
- auditare il processo
- supportare run schedulate e manuali

## Priorità reali del progetto

Ordine di priorità:
1. modello dati
2. anagrafe CUUA
3. pipeline ingestione
4. NAS connector
5. catasto + GIS
6. connettori Capacitas
7. search e scheda soggetto
8. dashboard e reporting

## Cosa evitare

- microservizi
- dipendenze inutili
- coupling forte tra moduli
- scraping improvvisato e non tracciato
- query sparse senza criterio
- modelli dati deboli
- frontend appariscente ma poco utile
- duplicazione cieca della logica dei fornitori

## Aspettativa di output

Quando lavori:
- fai cambi incrementali ma completi
- spiega brevemente cosa hai fatto
- elenca i file toccati
- segnala rischi o assunzioni
- mantieni il progetto coerente con l'architettura

