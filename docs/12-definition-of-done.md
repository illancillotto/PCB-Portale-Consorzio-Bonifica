# PCB – Definition of Done

## Regola generale

Una funzionalità non è finita solo perché compila. È finita quando è:
- coerente con l'architettura
- integrata nella codebase
- tracciabile
- documentata quanto basta
- verificabile

## Done per backend feature
- modulo creato nel punto giusto
- endpoint o service funzionanti
- DTO e validazione presenti
- log essenziali presenti
- error handling sensato
- test minimi o verifica concreta documentata
- documentazione aggiornata se cambia il comportamento

## Done per frontend feature
- schermata navigabile
- dati reali o seed minimi significativi
- UI leggibile
- loading/error/empty state gestiti
- componenti riusabili dove opportuno

## Done per connettore
- configurazione separata
- run tracciata
- errori loggati
- raw ingest salvato
- nessuna scrittura diretta su master
- idempotenza ragionevole
- documentazione tecnica minima

## Done per schema DB
- migrazione chiara
- nomi coerenti
- vincoli essenziali presenti
- relazioni corrette
- campi temporali inseriti dove richiesto

