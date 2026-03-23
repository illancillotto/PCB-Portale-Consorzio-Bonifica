# PCB QGIS

Questa cartella ospita i progetti QGIS Server che verranno pubblicati nella fase GIS.

Stato corrente:

- il backend PCB espone `GET /api/v1/gis/publication-status`
- la vista frontend `/gis` mostra lo stato del publication target `qgis-server`
- il container `pcb-qgis-server` puo` richiedere un pull iniziale molto pesante
- il progetto minimo pubblicabile e` `infra/qgis/projects/pcb.qgs`

Il progetto QGIS ufficiale resta ancora da consolidare; per ora il publication target usa un progetto minimale di bootstrap, sufficiente per chiudere il wiring compose/backend/frontend.
