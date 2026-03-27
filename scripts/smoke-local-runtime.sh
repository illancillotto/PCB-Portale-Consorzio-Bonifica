#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

BACKEND_PORT="${PCB_BACKEND_PORT:-5010}"
FRONTEND_PORT="${PCB_FRONTEND_PORT:-3010}"
KEYCLOAK_BASE_URL="${PCB_KEYCLOAK_BASE_URL:-http://127.0.0.1:8180}"
QGIS_BASE_URL="${PCB_QGIS_BASE_URL:-http://127.0.0.1:8090/ows/}"

check_url() {
  local label="$1"
  local url="$2"

  if curl -fsS "${url}" > /dev/null; then
    printf '[ok] %s -> %s\n' "${label}" "${url}"
    return 0
  fi

  printf '[fail] %s -> %s\n' "${label}" "${url}" >&2
  return 1
}

cd "${ROOT_DIR}"

docker compose ps > /dev/null

check_url "backend health" "http://127.0.0.1:${BACKEND_PORT}/api/v1/health"
check_url "frontend login" "http://127.0.0.1:${FRONTEND_PORT}/login"
check_url "keycloak discovery" "${KEYCLOAK_BASE_URL}/realms/pcb/.well-known/openid-configuration"
check_url "qgis capabilities" "${QGIS_BASE_URL}?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs"

printf '\nLocal smoke check passed.\n'
