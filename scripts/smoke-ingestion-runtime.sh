#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

BACKEND_PORT="${PCB_BACKEND_PORT:-5010}"
BACKEND_BASE_URL="${PCB_API_BASE_URL:-http://127.0.0.1:${BACKEND_PORT}/api/v1}"
KEYCLOAK_BASE_URL="${PCB_KEYCLOAK_URL:-http://127.0.0.1:8180}"
KEYCLOAK_REALM="${PCB_KEYCLOAK_REALM:-pcb}"
KEYCLOAK_CLIENT_ID="${PCB_KEYCLOAK_CLIENT_ID:-pcb-backend}"
KEYCLOAK_CLIENT_SECRET="${PCB_KEYCLOAK_CLIENT_SECRET:-change-me}"
SMOKE_USERNAME="${PCB_SMOKE_USERNAME:-pcb.operator}"
SMOKE_PASSWORD="${PCB_SMOKE_PASSWORD:-pcb.operator}"
SMOKE_CONNECTOR_NAME="${PCB_SMOKE_CONNECTOR_NAME:-connector-nas-catasto}"
SMOKE_TIMEOUT_SECONDS="${PCB_SMOKE_INGEST_TIMEOUT_SECONDS:-90}"
SAMPLE_NAS_ROOT="${PCB_NAS_CATASTO_ROOT:-/tmp/pcb-nas-sample}"

node_json_field() {
  local field_path="$1"
  node -e '
    const data = JSON.parse(process.argv[1]);
    const path = process.argv[2].split(".");
    let current = data;
    for (const key of path) {
      current = current?.[key];
    }
    if (typeof current === "object") {
      process.stdout.write(JSON.stringify(current));
    } else if (current !== undefined && current !== null) {
      process.stdout.write(String(current));
    }
  ' "$2" "$field_path"
}

require_sample_nas() {
  if [[ ! -d "${SAMPLE_NAS_ROOT}" ]]; then
    printf '[fail] sample NAS root not found -> %s\n' "${SAMPLE_NAS_ROOT}" >&2
    exit 1
  fi

  printf '[ok] sample NAS root -> %s\n' "${SAMPLE_NAS_ROOT}"
}

fetch_access_token() {
  curl -fsS \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d "grant_type=password" \
    -d "client_id=${KEYCLOAK_CLIENT_ID}" \
    -d "client_secret=${KEYCLOAK_CLIENT_SECRET}" \
    -d "username=${SMOKE_USERNAME}" \
    -d "password=${SMOKE_PASSWORD}" \
    "${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token"
}

api_json() {
  local method="$1"
  local path="$2"
  local token="$3"

  curl -fsS \
    -X "${method}" \
    -H "Authorization: Bearer ${token}" \
    -H 'Content-Type: application/json' \
    "${BACKEND_BASE_URL}${path}"
}

poll_run_completion() {
  local run_id="$1"
  local token="$2"
  local started_at
  local elapsed
  local run_json
  local status

  started_at="$(date +%s)"

  while true; do
    run_json="$(api_json GET "/ingestion/runs/${run_id}" "${token}")"
    status="$(node_json_field 'status' "${run_json}")"

    if [[ "${status}" == "completed" || "${status}" == "failed" ]]; then
      printf '%s' "${run_json}"
      return 0
    fi

    elapsed="$(( $(date +%s) - started_at ))"
    if (( elapsed >= SMOKE_TIMEOUT_SECONDS )); then
      printf '[fail] ingestion run timeout after %ss -> %s\n' "${SMOKE_TIMEOUT_SECONDS}" "${run_id}" >&2
      exit 1
    fi

    sleep 2
  done
}

assert_equals() {
  local label="$1"
  local expected="$2"
  local actual="$3"

  if [[ "${expected}" != "${actual}" ]]; then
    printf '[fail] %s -> expected %s, found %s\n' "${label}" "${expected}" "${actual}" >&2
    exit 1
  fi

  printf '[ok] %s -> %s\n' "${label}" "${actual}"
}

assert_positive_number() {
  local label="$1"
  local value="$2"

  if [[ -z "${value}" || ! "${value}" =~ ^[0-9]+$ || "${value}" -le 0 ]]; then
    printf '[fail] %s -> expected positive integer, found %s\n' "${label}" "${value:-<empty>}" >&2
    exit 1
  fi

  printf '[ok] %s -> %s\n' "${label}" "${value}"
}

cd "${ROOT_DIR}"

require_sample_nas

TOKEN_JSON="$(fetch_access_token)"
ACCESS_TOKEN="$(node_json_field 'access_token' "${TOKEN_JSON}")"

if [[ -z "${ACCESS_TOKEN}" ]]; then
  printf '[fail] unable to obtain Keycloak access token\n' >&2
  exit 1
fi

printf '[ok] keycloak operator token acquired\n'

TRIGGER_JSON="$(api_json POST "/ingestion/connectors/${SMOKE_CONNECTOR_NAME}/run" "${ACCESS_TOKEN}")"
RUN_ID="$(node_json_field 'id' "${TRIGGER_JSON}")"

if [[ -z "${RUN_ID}" ]]; then
  printf '[fail] unable to extract ingestion run id from trigger response\n' >&2
  exit 1
fi

printf '[ok] ingestion run triggered -> %s\n' "${RUN_ID}"

RUN_JSON="$(poll_run_completion "${RUN_ID}" "${ACCESS_TOKEN}")"
PIPELINE_JSON="$(api_json GET "/ingestion/runs/${RUN_ID}/pipeline-summary" "${ACCESS_TOKEN}")"

assert_equals 'ingestion status' 'completed' "$(node_json_field 'status' "${RUN_JSON}")"
assert_equals 'acquisition stage' 'completed' "$(node_json_field 'stages.acquisition.status' "${RUN_JSON}")"
assert_equals 'post-processing stage' 'completed' "$(node_json_field 'stages.postProcessing.status' "${RUN_JSON}")"
assert_equals 'normalization stage' 'completed' "$(node_json_field 'stages.normalization.status' "${RUN_JSON}")"
assert_equals 'matching stage' 'completed' "$(node_json_field 'stages.matching.status' "${RUN_JSON}")"

assert_positive_number 'raw records total' "$(node_json_field 'rawSummary.totalRecords' "${RUN_JSON}")"
assert_positive_number 'normalized records total' "$(node_json_field 'normalizedSummary.totalRecords' "${RUN_JSON}")"
assert_positive_number 'matching results total' "$(node_json_field 'matchingSummary.totalResults' "${RUN_JSON}")"
assert_positive_number 'pipeline raw total' "$(node_json_field 'raw.total' "${PIPELINE_JSON}")"
assert_positive_number 'pipeline normalized total' "$(node_json_field 'normalized.total' "${PIPELINE_JSON}")"
assert_positive_number 'pipeline matching total' "$(node_json_field 'matching.total' "${PIPELINE_JSON}")"

printf '\nIngestion smoke check passed for run %s.\n' "${RUN_ID}"
