# PCB – Portale Consorzio Bonifica
## Product Requirements Document (PRD)

---

# 1. Visione

PCB è la piattaforma applicativa interna del Consorzio di Bonifica dell’Oristanese progettata per unificare l’accesso ai dati, integrare sistemi esistenti e fornire strumenti operativi e decisionali avanzati.

Obiettivo: diventare il **punto centrale di governo del dato e delle operazioni**.

---

# 2. Obiettivi

- Unificare accesso ai sistemi esistenti
- Centralizzare i dati (CUUA-based)
- Integrare GIS e catasto
- Migliorare operatività interna
- Costruire base per evoluzione futura

---

# 3. Utenti

- Direzione
- Amministrazione
- Settore Catasto
- Tecnici GIS
- Operatori irrigazione
- CED

---

# 4. Architettura

- Frontend: Next.js
- Backend: NestJS (modular monolith)
- Database: PostgreSQL + PostGIS
- Auth: Keycloak
- Queue: Redis
- GIS: QGIS Server

---

# 5. Moduli

## Core
- Anagrafiche (CUUA)
- Identity & Permissions
- Audit

## Operativi
- Documentale
- Irrigazione
- Personale
- Magazzino

## Trasversali
- GIS
- Workflow
- Report
- Notifiche

## Integrazioni
- NAS
- Capacitas
- INAZ
- HyperSIC

---

# 6. Anagrafe CUUA

Entità centrale:

- CUUA
- Identificativi multipli
- Storico variazioni
- Relazioni catastali
- Collegamenti GIS
- Documenti

---

# 7. Ingestione dati

Pipeline:

sorgente → raw → normalizzazione → matching → master

Tecnologie:
- Node.js
- Playwright
- Crawlee

---

# 8. NAS

- Scan SMB
- Indicizzazione
- Hash file
- Mapping utenti

---

# 9. GIS

- PostGIS
- Layer management
- Versioning
- Collegamento utenze

---

# 10. Sicurezza

- RBAC
- Audit log
- Config env

---

# 11. Roadmap

Fase 1:
- Core + Anagrafe + NAS

Fase 2:
- Capacitas + GIS

Fase 3:
- Workflow + report

---

# 12. Codex Instructions

- Modular monolith
- No microservices
- Strong typing
- DTO validation
- Separate connectors
- Use PostgreSQL

---

# 13. Deliverables

- Backend API
- Frontend UI
- DB schema
- Connectors
- GIS portal

---

# 14. Naming

PCB – Portale Consorzio Bonifica

---

# 15. Conclusione

PCB è la piattaforma centrale per la trasformazione digitale del Consorzio.
