#!/usr/bin/env python3

import os
import sys

from qgis.core import (
    QgsApplication,
    QgsCoordinateReferenceSystem,
    QgsDataSourceUri,
    QgsFillSymbol,
    QgsLayerTreeLayer,
    QgsProject,
    QgsSingleSymbolRenderer,
    QgsVectorLayer,
)


PROJECT_PATH = os.environ.get("PCB_QGIS_PROJECT_FILE", "/io/projects/pcb.qgs")
POSTGRES_HOST = os.environ.get("PCB_POSTGRES_HOST", "pcb-postgres")
POSTGRES_PORT = os.environ.get("PCB_POSTGRES_PORT", "5432")
POSTGRES_DB = os.environ.get("PCB_POSTGRES_DB", "pcb")
POSTGRES_USER = os.environ.get("PCB_POSTGRES_USER", "pcb")
POSTGRES_PASSWORD = os.environ.get("PCB_POSTGRES_PASSWORD", "pcb")
QGIS_PREFIX_PATH = os.environ.get("QGIS_PREFIX_PATH", "/usr")


def build_parcels_layer() -> QgsVectorLayer:
    uri = QgsDataSourceUri()
    uri.setConnection(
        POSTGRES_HOST,
        POSTGRES_PORT,
        POSTGRES_DB,
        POSTGRES_USER,
        POSTGRES_PASSWORD,
    )
    uri.setDataSource("gis", "v_qgis_parcels", "geometry", "", "id")

    layer = QgsVectorLayer(uri.uri(False), "Particelle consortili", "postgres")

    if not layer.isValid():
        raise RuntimeError("Impossibile caricare il layer PostGIS gis.v_qgis_parcels")

    symbol = QgsFillSymbol.createSimple(
        {
            "color": "120,165,154,120",
            "outline_color": "35,83,71,255",
            "outline_width": "0.8",
        }
    )
    layer.setRenderer(QgsSingleSymbolRenderer(symbol))
    layer.setShortName("pcb_parcels")
    layer.setCrs(QgsCoordinateReferenceSystem("EPSG:4326"))

    return layer


def main() -> int:
    QgsApplication.setPrefixPath(QGIS_PREFIX_PATH, True)
    app = QgsApplication([], False)
    app.initQgis()

    project = QgsProject.instance()
    project.clear()
    project.setFileName(PROJECT_PATH)

    project.setTitle("PCB - Portale Consorzio Bonifica")
    project.setCrs(QgsCoordinateReferenceSystem("EPSG:4326"))

    parcels_layer = build_parcels_layer()
    project.addMapLayer(parcels_layer)

    root = project.layerTreeRoot()
    root.removeAllChildren()
    root.addChildNode(QgsLayerTreeLayer(parcels_layer))

    if not project.write(PROJECT_PATH):
        raise RuntimeError(f"Impossibile scrivere il progetto QGIS: {PROJECT_PATH}")

    print(f"QGIS project updated: {PROJECT_PATH}")
    print(f"Project layers: {len(project.mapLayers())}")
    print(f"Layer published: pcb_parcels -> {parcels_layer.name()}")
    app.exitQgis()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
