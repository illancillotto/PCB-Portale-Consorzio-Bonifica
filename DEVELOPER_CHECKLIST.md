# PCB – Developer Checklist

Checklist operativa minima per chi entra nel progetto.

## Day 1

1. Preparare il runtime locale:

```bash
npm run dev:up
```

2. Avviare le applicazioni in due terminali:

```bash
npm run dev:backend
npm run dev:frontend
```

3. Verificare tutto con un solo comando:

```bash
npm run dev:verify
```

4. Accedere al portale:

- frontend: `http://127.0.0.1:3010`
- backend health: `http://127.0.0.1:5010/api/v1/health`
- Keycloak: `http://127.0.0.1:8180`
- QGIS Server: `http://127.0.0.1:8090/ows/`

Credenziali seed:

- `pcb.operator / pcb.operator`
- `pcb.admin / pcb.admin`

## Day 2

Controlli rapidi dopo modifiche locali:

```bash
npm run build --workspace backend
npm run build --workspace frontend
npm run build --workspace connectors
npm run lint --workspace backend
npm run lint --workspace frontend
npm run lint --workspace connectors
```

Smoke disponibili:

```bash
npm run dev:smoke
npm run dev:smoke:ingestion
npm run dev:smoke:gis
npm run dev:verify
```

## Troubleshooting base

Se `dev:verify` fallisce:

1. Verificare che lo stack Docker sia attivo:

```bash
docker compose ps
```

2. Verificare backend e frontend:

```bash
curl -fsS http://127.0.0.1:5010/api/v1/health
curl -fsS http://127.0.0.1:3010/login > /dev/null
```

3. Verificare Keycloak:

```bash
curl -fsS http://127.0.0.1:8180/realms/pcb/.well-known/openid-configuration > /dev/null
```

4. Verificare QGIS:

```bash
curl -fsS "http://127.0.0.1:8090/ows/?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs" > /dev/null
```

5. Verificare il sample NAS locale:

```bash
ls -la /tmp/pcb-nas-sample
```

## File guida

- [README.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/README.md)
- [PROGRESS.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/PROGRESS.md)
- [IMPLEMENTATION_PLAN.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/IMPLEMENTATION_PLAN.md)
- [scripts/README.md](/home/cbo/CursorProjects/PCB-Portale-Consorzio-Bonifica/scripts/README.md)
