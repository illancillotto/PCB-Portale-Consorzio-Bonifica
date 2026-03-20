# PCB – Questioni aperte e rischi

## 1. Qualità dati legacy
Il matching CUUA potrebbe essere complicato da:
- naming incoerente
- archivi storici non standard
- identificativi incompleti

## 2. Accessibilità sistemi esterni
Rischi:
- login complessi
- captchas
- variazioni UI
- sessioni instabili

## 3. Permessi e confidenzialità
Serve chiarire bene:
- chi vede cosa
- quali dati sono sensibili
- quali dati possono essere esportati

## 4. NAS storico
Rischi:
- naming cartelle non uniforme
- profondità non standard
- file duplicati
- estensioni eterogenee

## 5. GIS
Serve decidere con precisione:
- layer ufficiali
- ownership dei layer
- relazioni con particelle e soggetti
- flusso di pubblicazione

## 6. Connettori Capacitas
Senza API formali, la manutenzione dei connector sarà sensibile a cambi UI.

## 7. Decisioni da non rimandare troppo
- strategia ID tecnici
- convenzioni naming DB
- livello TypeScript/Javascript del progetto
- politica matching manuale
- politica di versioning dei record storici

