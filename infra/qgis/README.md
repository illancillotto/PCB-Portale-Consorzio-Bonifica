# PCB QGIS

Questa cartella ospita i progetti QGIS Server che verranno pubblicati nella fase GIS.

Stato corrente:

- il backend PCB espone `GET /api/v1/gis/publication-status`
- la vista frontend `/gis` mostra lo stato del publication target `qgis-server`
- il container `pcb-qgis-server` puo` richiedere un pull iniziale molto pesante
- il progetto minimo pubblicabile e` `infra/qgis/projects/pcb.qgs`
- il publication target pubblico previsto e` `http://localhost:8090/ows/` con parametro `MAP=/io/projects/pcb.qgs`

Layer tematico reale pubblicato:

- `gis.v_qgis_parcels`
- nome WMS pubblicato: `pcb_parcels`
- titolo layer: `Particelle consortili`
- `gis.v_qgis_subjects`
- nome WMS pubblicato: `pcb_subjects`
- titolo layer: `Soggetti georiferiti`
- `gis.v_qgis_subject_parcel_links`
- nome WMS pubblicato: `pcb_subject_parcel_links`
- titolo layer: `Relazioni soggetto-particella`

Rigenerazione progetto QGIS dal container:

```bash
docker exec \
  -e PCB_POSTGRES_HOST=pcb-postgres \
  -e PCB_POSTGRES_PORT=5432 \
  -e PCB_POSTGRES_DB=pcb \
  -e PCB_POSTGRES_USER=pcb \
  -e PCB_POSTGRES_PASSWORD=pcb \
  pcb-qgis-server \
  python3 /io/scripts/generate_project.py
```

Il progetto QGIS ufficiale resta ancora da consolidare; per ora il publication target usa un progetto minimale di bootstrap, sufficiente per chiudere il wiring compose/backend/frontend.
