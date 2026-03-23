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
- riepilogo audit e filtri operativi via query string su `eventType` e `actorType`
- `operations` consolidata con riepilogo cross-domain su integrazioni, ingestion, audit e GIS
- sync inverso viewer -> pannello risultati per le feature GeoJSON PCB
- mappa GIS completa ancora non integrata
