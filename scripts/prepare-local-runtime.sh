#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
ENV_EXAMPLE_FILE="${ROOT_DIR}/.env.example"
SAMPLE_NAS_ROOT="${PCB_LOCAL_SAMPLE_NAS_ROOT:-/tmp/pcb-nas-sample}"

ensure_env_file() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    cp "${ENV_EXAMPLE_FILE}" "${ENV_FILE}"
    echo "Created ${ENV_FILE} from .env.example"
  fi
}

ensure_env_key() {
  local key="$1"
  local value="$2"

  if grep -Eq "^${key}=" "${ENV_FILE}"; then
    return 0
  fi

  printf '%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}"
  echo "Added ${key}=${value} to ${ENV_FILE}"
}

prepare_sample_nas() {
  mkdir -p \
    "${SAMPLE_NAS_ROOT}/M/MarioRossi" \
    "${SAMPLE_NAS_ROOT}/A/AziendaDelta" \
    "${SAMPLE_NAS_ROOT}/Z/Archivio"

  if [[ ! -f "${SAMPLE_NAS_ROOT}/M/MarioRossi/voltura-2024.pdf" ]]; then
    printf 'Sample NAS file for Mario Rossi\n' > "${SAMPLE_NAS_ROOT}/M/MarioRossi/voltura-2024.pdf"
  fi

  if [[ ! -f "${SAMPLE_NAS_ROOT}/A/AziendaDelta/istanza-voltura.pdf" ]]; then
    printf 'Sample NAS file for Azienda Delta\n' > "${SAMPLE_NAS_ROOT}/A/AziendaDelta/istanza-voltura.pdf"
  fi

  if [[ ! -f "${SAMPLE_NAS_ROOT}/Z/Archivio/promemoria.txt" ]]; then
    printf 'Promemoria archivio storico\n' > "${SAMPLE_NAS_ROOT}/Z/Archivio/promemoria.txt"
  fi
}

print_next_steps() {
  cat <<EOF

Local runtime prepared.

Environment file: ${ENV_FILE}
Sample NAS root:   ${SAMPLE_NAS_ROOT}

Suggested next steps:
  docker compose up -d
  npm install
  npm run build --workspace connectors
  npm run dev:backend
  npm run dev:frontend

Expected local URLs:
  frontend: http://127.0.0.1:3010
  backend:  http://127.0.0.1:5010/api/v1/health
  keycloak: http://127.0.0.1:8180
  qgis:     http://127.0.0.1:8090/ows/

Seed credentials:
  pcb.operator / pcb.operator
  pcb.admin    / pcb.admin
EOF
}

ensure_env_file
prepare_sample_nas

ensure_env_key "PCB_BACKEND_PORT" "5010"
ensure_env_key "PCB_FRONTEND_PORT" "3010"
ensure_env_key "PCB_API_BASE_URL" "http://127.0.0.1:5010/api/v1"
ensure_env_key "NEXT_PUBLIC_PCB_API_BASE_URL" "http://127.0.0.1:5010/api/v1"
ensure_env_key "PCB_FRONTEND_BASE_URL" "http://127.0.0.1:3010"
ensure_env_key "PCB_NAS_CATASTO_ROOT" "${SAMPLE_NAS_ROOT}"

print_next_steps
