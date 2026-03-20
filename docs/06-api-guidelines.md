# PCB – Linee guida API

## 1. Stile

- API REST
- versioning `/api/v1`
- naming chiaro e coerente
- niente endpoint generici ambigui

## 2. Risorse principali

### Subjects
- `GET /api/v1/subjects`
- `GET /api/v1/subjects/{id}`
- `GET /api/v1/subjects/by-cuua/{cuua}`
- `GET /api/v1/subjects/{id}/history`
- `GET /api/v1/subjects/{id}/identifiers`
- `GET /api/v1/subjects/{id}/documents`
- `GET /api/v1/subjects/{id}/parcels`
- `GET /api/v1/subjects/{id}/gis`

### Parcels
- `GET /api/v1/parcels`
- `GET /api/v1/parcels/{id}`
- `GET /api/v1/parcels/{id}/subjects`

### Documents
- `GET /api/v1/documents`
- `GET /api/v1/documents/{id}`

### Ingestion
- `GET /api/v1/ingestion/runs`
- `GET /api/v1/ingestion/runs/{id}`
- `POST /api/v1/ingestion/connectors/{connectorName}/run`

### Search
- `GET /api/v1/search?q=...`

## 3. DTO e validazione

Ogni endpoint deve avere:
- request DTO
- response DTO o mapper esplicito
- validazione input
- paginazione ove serve

## 4. Error handling

Formato consistente:
- code
- message
- details opzionale
- correlation id

## 5. Filtri

Supportare filtri chiari, ad esempio:
- stato
- sorgente
- date validità
- comune/foglio/particella
- tipo identificativo

## 6. Logging

Ogni chiamata rilevante deve essere tracciabile.

## 7. Sicurezza

Tutte le API non pubbliche devono essere protette da autenticazione e autorizzazione.

