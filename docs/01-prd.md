# PCB – Product Requirements Document

## 1. Executive summary

PCB (Portale Consorzio Bonifica) è la piattaforma applicativa interna del Consorzio di Bonifica dell'Oristanese progettata per centralizzare dati, integrare servizi esistenti, ricostruire la storia delle utenze e collegare il dominio amministrativo-catastale con il dominio territoriale GIS.

PCB non sostituisce subito i sistemi esterni. Li integra, li indicizza, li collega e li rende governabili.

## 2. Obiettivi di business

### Obiettivi primari
- Creare una **anagrafe unica utenze** basata sul CUUA
- Ricostruire lo **storico completo del CUUA**
- Collegare il CUUA a catasto, documenti, riscossione e GIS
- Ridurre la frammentazione operativa tra sistemi esterni
- Portare il Consorzio verso un modello dati governato e tracciabile

### Obiettivi secondari
- Abilitare dashboard e reporting direzionale
- Centralizzare l'accesso interno in un unico portale
- Costruire una base tecnica che consenta sviluppi futuri
- Predisporre moduli interni sostitutivi per parti oggi esterne, dove conveniente

## 3. Problema attuale

Oggi il Consorzio lavora su più piattaforme eterogenee. Le informazioni sono distribuite tra:
- portali gestiti da terzi
- archivi file legacy
- strumenti desktop
- basi dati non unificate
- conoscenza operativa dispersa tra uffici

Conseguenze:
- bassa visibilità trasversale
- tempi lunghi di reperimento informazioni
- impossibilità di ricostruire in modo affidabile la storia completa dell'utenza
- scarsa integrazione con GIS
- forte dipendenza dai front-end dei fornitori

## 4. Ambito del progetto

### In ambito
- piattaforma web interna
- anagrafe CUUA
- integrazione con Capacitas
- integrazione con NAS storico
- integrazione con HyperSIC
- integrazione con INAZ
- GIS centralizzato
- audit e log
- dashboard, schede soggetto, ricerca unificata

### Fuori ambito iniziale
- sostituzione completa di tutti i sistemi esterni
- area pubblica per cittadini/consorziati
- integrazioni approfondite con Agenzia delle Entrate
- automazioni massive di back-office non ancora mappate

## 5. Utenti del sistema

### Primari
- Settore Catasto
- CED
- Ufficio Amministrativo
- Operatori che consultano dati utenze e storico
- Tecnici GIS

### Secondari
- Direzione
- Responsabili di settore
- Presidenza

## 6. Principio guida del prodotto

PCB deve essere progettato come:
- piattaforma di **governo del dato**
- punto unico di accesso interno
- sistema capace di collegare domini diversi attraverso una identità master

Non deve essere una semplice dashboard che apre link ai portali esterni.

## 7. Requisiti funzionali principali

### RF-01 — Anagrafe unica CUUA
Il sistema deve mantenere un'anagrafe master delle utenze avente il CUUA come chiave di business principale.

### RF-02 — Storico completo
Il sistema deve consentire la ricostruzione storica dell'identità utenza:
- nominativi
- indirizzi
- identificativi esterni
- relazioni catastali
- eventi significativi
- documenti collegati
- dati GIS collegati

### RF-03 — Ingestione da sorgenti esterne
Il sistema deve acquisire dati da sorgenti esterne anche in assenza di API tramite connettori dedicati.

### RF-04 — Pipeline dati governata
Ogni import deve seguire il flusso:
sorgente → raw ingest → normalizzazione → matching → aggiornamento master

### RF-05 — Scheda utenza completa
Per ogni CUUA deve esistere una scheda completa con:
- dati attuali
- storico
- collegamenti esterni
- documenti
- relazioni catastali
- mappa GIS

### RF-06 — Integrazione NAS storico
Il sistema deve indicizzare il NAS storico di settore catasto in modalità iniziale read-only.

### RF-07 — GIS integrato
Il sistema deve collegare le utenze alle informazioni catastali e territoriali tramite PostGIS e layer GIS.

### RF-08 — Audit e tracciabilità
Ogni operazione rilevante deve essere tracciata.

### RF-09 — Ricerca unificata
Il sistema deve offrire ricerca per:
- CUUA
- nominativo
- codice fiscale / partita IVA
- identificativi esterni
- riferimenti catastali
- eventuali codici sorgente

## 8. Requisiti non funzionali

### RNF-01 — Manutenibilità
Architettura chiara, modulare, testabile.

### RNF-02 — Affidabilità
I connettori devono essere resilienti, loggati, con gestione errori e retry.

### RNF-03 — Sicurezza
Ruoli, permessi, audit, segreti esterni via environment/config sicura.

### RNF-04 — Estendibilità
Ogni modulo deve poter crescere senza rompere gli altri.

### RNF-05 — Performance
Le viste principali devono essere reattive per uso quotidiano interno.

## 9. Criteri di successo

- esistenza di un'anagrafe master affidabile
- capacità di ricostruire correttamente la storia del CUUA
- possibilità di collegare soggetto, catasto, documenti e GIS
- riduzione del tempo di reperimento informazioni
- riduzione della dipendenza dal solo front-end dei fornitori

## 10. Vincoli architetturali

- backend unico modulare
- niente microservizi in questa fase
- PostgreSQL come database principale
- PostGIS per il dominio geografico
- Playwright per i connettori browser-based
- Keycloak per autenticazione e ruoli

## 11. KPI iniziali

- % utenze riconciliate con CUUA
- % record sorgente correttamente associati a un soggetto master
- tempo medio di accesso a una scheda utenza completa
- numero di sorgenti integrate
- accuratezza del matching iniziale

