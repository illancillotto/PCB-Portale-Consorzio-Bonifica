# PCB – Prompt pronti per Codex

## Prompt 1 – Bootstrap progetto

```text
Leggi tutta la documentazione nella cartella docs del progetto PCB.
Poi prepara il bootstrap iniziale del repository con questa struttura:

- backend NestJS modular monolith
- frontend Next.js
- cartella connectors separata per i connettori Playwright
- docker-compose base
- PostgreSQL + PostGIS
- Redis
- placeholder Keycloak integration

Requisiti:
- non usare microservizi
- non usare MongoDB
- predisporre moduli backend: auth, anagrafiche, ingest, audit, catasto, gis, search
- creare README tecnici minimi per backend e frontend
- non scrivere codice demo inutile
- mantieni naming coerente con PCB

Output richiesto:
1. albero cartelle
2. file creati
3. motivazione tecnica sintetica
4. prossimi step consigliati
```

## Prompt 2 – Data model iniziale

```text
Usando docs/03-data-model.md progetta il primo schema database reale per PCB.

Obiettivo:
- creare lo schema SQL iniziale PostgreSQL/PostGIS
- includere schemi: anagrafe, catasto, docs, ingest, audit, gis
- definire tabelle fondamentali per subject master, identifiers, history, parcels, subject_parcel_relation, ingestion_run, raw ingest, matching_result, audit_event

Vincoli:
- CUUA chiave di business
- usare chiavi tecniche interne
- usare jsonb per payload raw
- usare valid_from/valid_to dove serve
- niente semplificazioni che rompano lo storico

Output richiesto:
1. file SQL completi
2. spiegazione delle scelte
3. punti che richiedono conferma futura
```

## Prompt 3 – NAS connector

```text
Progetta e implementa il connettore iniziale per il NAS storico catasto.

Contesto:
- sorgente SMB
- cartella radice: ARCHIVIO
- sottocartelle A-Z
- dentro ogni lettera esistono cartelle utenza
- il sistema deve lavorare in read-only

Obiettivi:
- scansione ricorsiva
- indicizzazione file e cartelle
- calcolo hash file dove utile
- salvataggio metadati in tabelle ingest/docs
- tracciamento run
- nessuna modifica ai file originali

Tecnologia:
- Node.js
- TypeScript se il progetto la adotta, altrimenti JavaScript coerente con la codebase
- logging chiaro

Output:
1. modulo connector
2. struttura config
3. modello dati usato
4. istruzioni run locale
```

## Prompt 4 – Scheda soggetto

```text
Implementa la prima versione della scheda soggetto PCB nel frontend e backend.

La scheda deve mostrare:
- dati anagrafici attuali
- identificativi collegati
- storico nominativi
- relazioni catastali
- documenti collegati
- link GIS placeholder
- sorgenti esterne collegate

Requisiti:
- UI istituzionale e leggibile
- API REST dedicate
- niente mock gratuiti: usa struttura reale e dati seed minimi
- mantieni componenti frontend modulari

Output:
1. endpoint creati
2. componenti frontend creati
3. esempio navigazione
4. debiti tecnici residui
```

## Prompt 5 – Matching engine base

```text
Progetta il primo motore di matching tra record normalizzati e anagrafe master.

Input possibili:
- CUUA
- codice fiscale
- partita IVA
- denominazione
- identificativi esterni
- elementi catastali

Requisiti:
- sistema a punteggio
- output matched / possible_match / no_match / conflict
- persistenza dei risultati
- nessun merge automatico distruttivo
- base per future validazioni manuali

Output:
1. struttura algoritmo
2. file implementati
3. schema dati coinvolto
4. limiti della prima versione
```

