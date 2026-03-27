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
SMOKE_USERNAME="${PCB_SMOKE_USERNAME:-pcb.operator}"
SMOKE_PASSWORD="${PCB_SMOKE_PASSWORD:-pcb.operator}"

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

check_frontend_login() {
  local cookie_file
  local body_file
  local status_code

  cookie_file="$(mktemp)"
  body_file="$(mktemp)"

  trap 'rm -f "${cookie_file}" "${body_file}"' RETURN

  status_code="$(
    curl -sS \
      -o "${body_file}" \
      -w '%{http_code}' \
      -c "${cookie_file}" \
      -H 'Content-Type: application/json' \
      -d "{\"username\":\"${SMOKE_USERNAME}\",\"password\":\"${SMOKE_PASSWORD}\"}" \
      "http://127.0.0.1:${FRONTEND_PORT}/api/auth/login"
  )"

  if [[ "${status_code}" != "200" ]]; then
    printf '[fail] frontend auth login -> http://127.0.0.1:%s/api/auth/login (status %s)\n' "${FRONTEND_PORT}" "${status_code}" >&2
    cat "${body_file}" >&2
    return 1
  fi

  printf '[ok] frontend auth login -> http://127.0.0.1:%s/api/auth/login\n' "${FRONTEND_PORT}"

  status_code="$(
    curl -sS \
      -o /dev/null \
      -w '%{http_code}' \
      -b "${cookie_file}" \
      "http://127.0.0.1:${FRONTEND_PORT}/operations"
  )"

  if [[ "${status_code}" != "200" ]]; then
    printf '[fail] protected operations view -> http://127.0.0.1:%s/operations (status %s)\n' "${FRONTEND_PORT}" "${status_code}" >&2
    return 1
  fi

  printf '[ok] protected operations view -> http://127.0.0.1:%s/operations\n' "${FRONTEND_PORT}"
}

cd "${ROOT_DIR}"

docker compose ps > /dev/null

check_url "backend health" "http://127.0.0.1:${BACKEND_PORT}/api/v1/health"
check_url "frontend login" "http://127.0.0.1:${FRONTEND_PORT}/login"
check_url "keycloak discovery" "${KEYCLOAK_BASE_URL}/realms/pcb/.well-known/openid-configuration"
check_url "qgis capabilities" "${QGIS_BASE_URL}?SERVICE=WMS&REQUEST=GetCapabilities&MAP=/io/projects/pcb.qgs"
check_frontend_login

printf '\nLocal smoke check passed.\n'
