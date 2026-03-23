# PCB QGIS

Questa cartella ospita i progetti QGIS Server che verranno pubblicati nella fase GIS.

Stato corrente:

- il backend PCB espone `GET /api/v1/gis/publication-status`
- la vista frontend `/gis` mostra lo stato del publication target `qgis-server`
- il container `pcb-qgis-server` puo` richiedere un pull iniziale molto pesante

Il progetto QGIS ufficiale resta ancora da consolidare; per ora il publication target viene osservato ma non e` ancora parte del flusso GIS operativo principale.
