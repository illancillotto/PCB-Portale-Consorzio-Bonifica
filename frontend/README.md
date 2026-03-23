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
- login frontend reale via Keycloak locale
- protezione selettiva delle viste operative `ingestion` e `gis`
- mappa GIS completa ancora non integrata
