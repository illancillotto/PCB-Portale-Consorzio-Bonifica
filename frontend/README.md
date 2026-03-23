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
- mappa GIS completa ancora non integrata
