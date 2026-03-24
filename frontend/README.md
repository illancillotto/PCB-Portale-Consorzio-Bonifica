# PCB Frontend

Frontend Next.js per gli operatori interni PCB.

## Obiettivi del bootstrap

- shell applicativa sobria e istituzionale
- dashboard iniziale centrata sui domini PCB
- base pronta per ricerca globale, scheda soggetto e monitor ingestione

## Comandi

```bash
npm install
npm run dev
```

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
- il feed issue connector arriva gia` ordinato backend-side per severita`
- riepilogo audit e filtri operativi via query string su `eventType` e `actorType`
- `operations` consolidata con riepilogo cross-domain su integrazioni, ingestion, audit e GIS
- sync inverso viewer -> pannello risultati per le feature GeoJSON PCB
- mappa GIS completa ancora non integrata
