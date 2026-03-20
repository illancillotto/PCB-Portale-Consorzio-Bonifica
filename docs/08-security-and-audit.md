# PCB – Sicurezza, ruoli e audit

## 1. Principi

- minimo privilegio
- ruoli chiari
- accesso profilato
- audit completo
- segreti fuori dal codice

## 2. Autenticazione

Usare Keycloak come identity provider centrale.

## 3. Autorizzazione

Esempio ruoli:
- super_admin
- ced_admin
- catasto_operator
- gis_operator
- read_only_manager
- direction_viewer

## 4. Audit

Audit su:
- login
- consultazione dati sensibili/critici
- modifiche anagrafiche
- merge/split soggetti
- esecuzione connector
- approvazione matching
- aggiornamenti layer o link GIS

## 5. Logging tecnico

Ogni connettore deve loggare:
- inizio run
- fine run
- errori
- timeout
- retry
- numero record

## 6. Sicurezza applicativa

- validation input
- sanitize output dove serve
- protezione segreti via env
- credenziali per sorgenti esterne cifrate o protette
- niente hardcoding

## 7. Tracciabilità dati

Ogni dato importante deve poter rispondere alla domanda:
- da dove viene?
- quando è stato acquisito?
- con quale run?
- chi lo ha approvato o corretto?

