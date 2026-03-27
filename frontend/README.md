# PCB Frontend

Frontend Next.js per gli operatori interni PCB.

## Obiettivi del bootstrap

- shell applicativa sobria e istituzionale
- dashboard iniziale centrata sui domini PCB
- base pronta per ricerca globale, scheda soggetto e monitor ingestione

## Comandi

```bash
npm run dev:prepare-runtime
npm run dev:stack
npm install
npm run dev --workspace frontend
```

Bootstrap locale consigliato dal root:

```bash
npm run dev:up
npm run dev --workspace frontend
```

Verifiche locali utili dal root:

```bash
npm run dev:smoke
npm run dev:smoke:gis
npm run dev:verify
```

URL locale atteso:

- frontend: `http://127.0.0.1:3010`

Prerequisiti runtime locali:

- backend PCB attivo su `5010`
- Keycloak locale attivo su `8180`
- QGIS Server locale attivo su `8090`
- sample NAS locale preparato da `npm run dev:prepare-runtime`

## Note

Configurazione utile:

- `PCB_API_BASE_URL` per puntare il frontend alle API backend
- `PCB_FRONTEND_BASE_URL` per redirect coerenti delle route auth

Stato attuale:

- ricerca reale collegata al backend
- lista soggetti
- scheda soggetto base
- lista e vista particella base
- vista GIS foundation basata su catalogo layer
- ingestion monitor iniziale
- dettaglio run ingestion con normalized e matching
- audit trail operativo protetto
- vista `operations` protetta con stato centralizzato di Postgres, Redis, Keycloak e QGIS
- login frontend reale via Keycloak locale
- protezione selettiva delle viste operative `ingestion` e `gis`
- proxy frontend autenticato per le azioni operative `ingestion`
- viewer GIS reale con Leaflet e feature PostGIS esposte dal backend
- deep-link GIS da scheda soggetto e scheda particella
- stato publication target QGIS esposto nella vista GIS
- accesso operativo dal frontend GIS a endpoint OWS e `GetCapabilities`
- overlay WMS QGIS reale nel viewer GIS sopra il publication target locale
- `GetFeatureInfo` operativo dal viewer GIS via route frontend dedicata
- risultati `GetFeatureInfo` con link navigabili a soggetti e particelle PCB
- evidenziazione automatica nel viewer della feature selezionata da `GetFeatureInfo`
- cartiglio `GetFeatureInfo` arricchito con feature links e relazioni soggetto-particella PCB
- risultati `GetFeatureInfo` ordinati con priorita` al layer relazionale e al focus attivo
- controllo layer operativo nel viewer GIS per overlay WMS e `GetFeatureInfo`
- legenda cartografica esplicita per layer, simboli e ruolo di overlay WMS/GeoJSON
- layer attivi del viewer GIS sincronizzati con la URL tramite query `layers=...`
- preset operativi GIS condivisibili via URL: `completo`, `relazioni`, `catasto`, `soggetti`
- azioni rapide ai preset GIS da schede soggetto, particella e operations
- preset GIS contestuali disponibili anche da dashboard e risultati ricerca
- metriche GIS sintetiche nella dashboard principale per sessioni operatore
- metriche sintetiche ingestion e audit nella dashboard principale per sessioni operatore
- riepilogo operativo ingestion su lista run e dettaglio run
- filtri operativi ingestion via query string su lista run e dettaglio run
- catalogo connector esposto nel monitor ingestion con capacità e ultimo stato noto
- summary backend di orchestration ingestion esposto nel monitor
- trigger manuali ingestion derivati dal catalogo connector, non più hardcoded
- dettaglio per singolo connector nel dominio ingestion
- readiness runtime dei connector esposta in catalogo e dettaglio
- trigger manuale ingestion bloccato in UI quando il connector non e` eseguibile
- dettaglio connector con storico operativo sintetico su ultimo completamento, ultimo fallimento e volumi osservati
- dettaglio connector alimentato da endpoint backend dedicato per le run del singolo connector
- storico run del connector filtrabile via query string `status`
- monitor ingestion con sezione issue operative dei connector derivata dal backend
- `operations` mostra anche issue connector cross-domain con severita` e link rapidi
- issue connector nel monitor ingestion filtrabili via query string su `issueSeverity` e `issueType`
- riepiloghi `ingestion` e `operations` usano anche contatori backend sintetici su issue connector
- i riepiloghi usano anche il conteggio backend dei connector `healthy`
- anche `operations` espone filtri URL-shareable su `issueSeverity` e `issueType`
- `ingestion` e `operations` supportano anche filtro issue per `issueConnector`
- catalogo e dettaglio connector mostrano anche i contatori di issue aperte
- il dettaglio connector espone anche l’elenco delle issue aperte con filtro per severity
- il dettaglio connector usa un payload backend unico per profilo, contatori e issue aperte
- il dettaglio connector supporta anche filtro `issueType` oltre a `issueSeverity`
- il dettaglio connector mostra anche un riepilogo per tipo di issue
- catalogo e dettaglio connector mostrano anche uno stato operativo sintetico `healthy/warning/critical`
- il catalogo connector nel monitor ingestion arriva gia` ordinato per priorita` operativa
- il catalogo connector supporta filtri URL-shareable su `connectorOperationalStatus` e `connectorTriggerMode`
- `operations` espone anche il catalogo connector con gli stessi filtri URL-shareable su `connectorOperationalStatus` e `connectorTriggerMode`
- le viste `ingestion` e `ingestion/[id]` si auto-aggiornano quando esistono run `queued` o `running`
- il trigger manuale ingestion può innescare anche `normalize -> match` lato backend sulla stessa run, se abilitato da configurazione
- il trigger manuale frontend reindirizza direttamente al dettaglio della run appena creata
- monitor e dettaglio run mostrano ora gli stage `acquisition`, `post-processing`, `normalization`, `matching`
- il monitor run supporta anche filtri URL-shareable per stage `acquisition` e `post-processing`
- il monitor run supporta anche filtri URL-shareable per stage `normalization` e `matching`
- `operations` mostra anche i contatori cross-domain degli stage ingestion
- i contatori stage in `operations` sono link operativi al monitor `ingestion` gia` filtrato
- anche la dashboard principale espone ingressi rapidi verso gli stage operativi di ingestion
- la vista `audit` espone deep link operativi a run, soggetti e moduli sorgente quando il payload lo consente
- il dettaglio connector collega contatori, issue e storico run ai filtri stage del monitor `ingestion`
- la vista `search` espone anche shortcut operativi diretti a `operations`, `audit`, `ingestion` e GIS completo
- i risultati della `search` offrono azioni esplicite verso scheda PCB, GIS contestuale e ingressi operativi applicativi
- la vista `search` supporta anche filtro URL-shareable per tipo risultato e riepilogo sintetico `totale/soggetti/particelle`
- la `search` apre anche `audit` contestuale per entita` tramite filtri su `entityType` e `entityId`
- il feed issue connector arriva gia` ordinato backend-side per severita`
- riepilogo audit e filtri operativi via query string su `eventType` e `actorType`
- riepilogo audit e filtri operativi via query string anche su `sourceModule`
- la vista `audit` espone anche riepiloghi cliccabili per attore e modulo sorgente
- la vista `audit` espone anche il contesto dei filtri attivi, utile per ingressi contestuali dalla `search`
- la vista `operations` espone anche riepiloghi audit per modulo con deep link diretti a `audit`
- anche la dashboard principale espone ingressi audit per modulo con deep link diretti a `audit`
- anche la dashboard principale espone ingressi audit per attore con deep link diretti a `audit`
- anche le schede soggetto e particella espongono ingressi audit contestuali per entita`
- anche le liste soggetti e particelle espongono shortcut operativi verso scheda, GIS e audit contestuale
- lista run e dettaglio run di `ingestion` espongono shortcut diretti al trail `audit` della run e del modulo ingest
- anche il dettaglio connector `ingestion` espone shortcut diretti al trail `audit` del modulo e delle ultime run
- dashboard, operations e vista `audit` riusano un summary backend dedicato invece di aggregare gli eventi lato frontend
- anche i dettagli `ingestion` di run e connector mostrano contatori audit contestuali dal summary backend
- anche i dettagli `subject` e `parcel` mostrano contatori audit contestuali dal summary backend
- `subjects`, `parcels` e `search` usano summary audit bulk per mostrare contatori contestuali senza query per-card
- App Router espone ora loading/error states condivisi a livello root per tutto il frontend PCB
- gli empty states principali del frontend usano ora un componente condiviso per viste lista e monitor operative
- le route protette preservano ora `reason` e `next` nel redirect a `login`
- il login resume reindirizza l'operatore alla vista richiesta dopo autenticazione o sessione non autorizzata
- il proxy frontend operativo intercetta ora `401/403`, normalizza il ritorno a `login` e pulisce la sessione scaduta
- i trigger client-side operativi reindirizzano al login contestuale quando la sessione scade durante un'azione
- dashboard, ricerca, liste soggetti e liste particelle sono ora trattate come viste operative protette
- la navigazione globale instrada gli utenti non autenticati verso `login` con ritorno contestuale alla vista richiesta
- le API di business `subjects`, `parcels` e `search` passano ora sempre da bearer token esplicito
- il proxy operativo frontend riallinea i `401/403` allo stesso schema errore del backend
- le azioni operative `ingestion` e `matching` classificano ora gli errori in `authentication`, `authorization`, `domain`, `runtime`
- i pannelli errore operativi mostrano anche `error.code` e `requestId` quando disponibili
- le viste server-side principali intercettano ora `ApiError` e mostrano pannelli SSR con classificazione `domain/runtime/auth`
- il proxy `/api/pcb` propaga `x-request-id` verso il backend e lo rende disponibile anche ai pannelli errore frontend
- anche le viste di dettaglio `subjects/[id]`, `parcels/[id]`, `ingestion/[id]` e `ingestion/connectors/[connectorName]` gestiscono ora `ApiError` senza degradare automaticamente a `notFound()`
- i pannelli SSR espongono anche azioni contestuali di recupero, ritorno alla lista o accesso rapido a `operations`
- anche il proxy frontend `api/qgis/feature-info` espone ora payload errore normalizzati con `error.code`, `requestId` e redirect auth coerente
- il viewer GIS riusa la classificazione degli errori operativi per `GetFeatureInfo` e mostra retry/azioni operative invece di stringhe grezze
- `operations` mostra ora anche `failureCode`, `statusCode` e `target` per le integrazioni runtime principali
- `operations` consolidata con riepilogo cross-domain su integrazioni, ingestion, audit e GIS
- il monitor `ingestion`, il dettaglio run e il dettaglio connector mostrano ora `failureCode` e `failureStage` quando un fallimento e` stato classificato dal backend
- le issue dei connector ingestion mostrano ora anche il `failureCode` strutturato oltre al dettaglio testuale
- il dettaglio run mostra ora anche `outcomeCode` sui record normalizzati e sui risultati di matching
- il dettaglio run mostra ora anche i record `raw ingest` con `outcomeCode` strutturato
- monitor `ingestion` e dettaglio connector mostrano ora anche summary raw ingest strutturati per run e ultima esecuzione
- monitor `ingestion` e dettaglio connector mostrano ora anche il breakdown outcome del raw layer NAS
- il dettaglio run supporta ora filtri URL-shareable sul layer raw tramite `rawOutcomeCode`
- il dettaglio run espone ora una vista di riconciliazione pipeline con deep link ai filtri raw, normalized e matching anche per `outcomeCode`
- `operations` mostra ora anche gli outcome aggregati cross-run della pipeline ingestion
- `operations` espone ora anche ingressi rapidi alle run piu` rilevanti: fallite, queued e da verificare
- i contatori outcome in `operations` aprono ora il monitor `ingestion` gia` filtrato per outcome e stage
- `operations` espone ora anche una sezione `Pipeline attention` con shortcut diretti ai casi raw/normalized/matching che richiedono verifica
- il monitor `ingestion` espone ora il contesto dei filtri run attivi con reset puntuale e ritorno rapido a `operations`
- il dettaglio run distingue anche `resolutionMode` e `requiresManualReview` sui risultati di matching
- sync inverso viewer -> pannello risultati per le feature GeoJSON PCB
- la vista `operations` espone ora anche una sezione help e una pagina protetta `/operations/help` con riferimenti a runbook, smoke, known issues e API surface
- la vista `operations` espone ora anche una sezione `Quick diagnostics` con URL runtime e comandi rapidi di triage locale
- la pagina `/operations/help` include ora anche una checklist `First response` per login, ingestion, GIS e connector NAS
- la pagina `/operations/help` include ora anche una sezione `Escalation signals` con moduli target e comandi di escalation
- `ingestion`, `audit` e `gis` espongono ora shortcut contestuali verso `/operations/help`
- i dettagli `ingestion/[id]`, `ingestion/connectors/[connectorName]`, `subjects/[id]` e `parcels/[id]` espongono ora shortcut verso `/operations/help`
- `/operations/help` supporta ora `?topic=auth|ingestion|audit|gis` per aprire l’help center già focalizzato
- `/operations/help` espone ora anche `Related commands` filtrati per topic
- mappa GIS completa ancora non integrata
