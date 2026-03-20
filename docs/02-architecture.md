# PCB – Architettura

## 1. Decisione architetturale

Il progetto deve essere implementato come **modular monolith**.

### Motivazione
Il numero utenti e la complessità di integrazione non giustificano microservizi. Il rischio maggiore non è la scala computazionale ma la complessità dei dati, dei matching e delle integrazioni.

## 2. Stack deciso

### Frontend
- Next.js
- React
- Tailwind CSS
- OpenLayers per mappe

### Backend
- NestJS
- REST API
- job schedulati per connettori e sincronizzazioni

### Data layer
- PostgreSQL
- PostGIS
- JSONB per payload raw di ingestione

### Supporting services
- Redis
- Keycloak
- QGIS Server
- Nginx
- Docker / Docker Compose

## 3. Architettura logica

```text
Next.js UI
   ↓
NestJS Backend (modular monolith)
   ↓
PostgreSQL / PostGIS
   ↓
Connectors / Ingestion Services
   ↓
Capacitas / NAS / HyperSIC / INAZ / altri sistemi
```

## 4. Separazione per moduli backend

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
- report
- search

## 5. Principi architetturali

### P-01
I moduli devono essere separati per dominio, non per schermata.

### P-02
I connettori non devono scrivere direttamente nelle tabelle master.

### P-03
I dati raw devono essere conservati.

### P-04
Ogni sorgente deve avere il proprio adapter dedicato.

### P-05
La componente GIS è core, non accessoria.

### P-06
Il CUUA è chiave di business, non necessariamente chiave tecnica primaria del database.

## 6. Ambiti da tenere separati

### UI layer
Responsabile di:
- visualizzazione
- ricerca
- schede
- dashboard
- mappe

### Domain layer
Responsabile di:
- logica business
- matching
- storico
- regole anagrafiche
- audit

### Connector layer
Responsabile di:
- acquisizione
- login ai sistemi esterni
- download
- parsing
- pianificazione run
- log di ingestione

## 7. Evoluzione futura

In futuro alcuni moduli potranno essere estratti, ma solo se emergerà una necessità reale. Fino ad allora il codice deve restare nello stesso backend con confini chiari.

