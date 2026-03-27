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
BACKEND_BASE_URL="${PCB_API_BASE_URL:-http://127.0.0.1:${BACKEND_PORT}/api/v1}"
KEYCLOAK_BASE_URL="${PCB_KEYCLOAK_URL:-http://127.0.0.1:8180}"
KEYCLOAK_REALM="${PCB_KEYCLOAK_REALM:-pcb}"
KEYCLOAK_CLIENT_ID="${PCB_KEYCLOAK_CLIENT_ID:-pcb-backend}"
KEYCLOAK_CLIENT_SECRET="${PCB_KEYCLOAK_CLIENT_SECRET:-change-me}"
SMOKE_USERNAME="${PCB_SMOKE_USERNAME:-pcb.operator}"
SMOKE_PASSWORD="${PCB_SMOKE_PASSWORD:-pcb.operator}"

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
  local path="$1"
  local token="$2"

  curl -fsS \
    -H "Authorization: Bearer ${token}" \
    -H 'Content-Type: application/json' \
    "${BACKEND_BASE_URL}${path}"
}

check_frontend_login() {
  local cookie_file="$1"
  local body_file
  local status_code

  body_file="$(mktemp)"

  status_code="$(
    curl -sS \
      -o "${body_file}" \
      -w '%{http_code}' \
      -c "${cookie_file}" \
      -H 'Content-Type: application/json' \
      -d "{\"username\":\"${SMOKE_USERNAME}\",\"password\":\"${SMOKE_PASSWORD}\"}" \
      "http://127.0.0.1:${FRONTEND_PORT}/api/auth/login"
  )"

  rm -f "${body_file}"

  if [[ "${status_code}" != "200" ]]; then
    printf '[fail] frontend auth login for GIS smoke (status %s)\n' "${status_code}" >&2
    exit 1
  fi

  printf '[ok] frontend auth login for GIS smoke\n'
}

build_feature_info_query() {
  node -e '
    const payload = JSON.parse(process.argv[1]);
    const feature = payload.items?.[0];

    if (!feature || !feature.geometry || !feature.properties?.layerCode) {
      process.exit(1);
    }

    const coordinates = [];

    const walk = (value) => {
      if (Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === "number")) {
        coordinates.push(value);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(walk);
      }
    };

    walk(feature.geometry.coordinates);

    if (coordinates.length === 0) {
      process.exit(1);
    }

    const xs = coordinates.map((coordinate) => coordinate[0]);
    const ys = coordinates.map((coordinate) => coordinate[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const paddingX = Math.max((maxX - minX) * 0.15, 0.0005);
    const paddingY = Math.max((maxY - minY) * 0.15, 0.0005);

    const params = new URLSearchParams({
      returnTo: "/gis",
      layers: String(feature.properties.layerCode),
      queryLayers: String(feature.properties.layerCode),
      bbox: `${minY - paddingY},${minX - paddingX},${maxY + paddingY},${maxX + paddingX}`,
      width: "1000",
      height: "1000",
      i: "500",
      j: "500",
      featureCount: "5",
      crs: "EPSG:4326",
    });

    process.stdout.write(params.toString());
  ' "$1"
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

TOKEN_JSON="$(fetch_access_token)"
ACCESS_TOKEN="$(node_json_field 'access_token' "${TOKEN_JSON}")"

if [[ -z "${ACCESS_TOKEN}" ]]; then
  printf '[fail] unable to obtain Keycloak access token for GIS smoke\n' >&2
  exit 1
fi

printf '[ok] keycloak operator token acquired\n'

PUBLICATION_JSON="$(api_json '/gis/publication-status' "${ACCESS_TOKEN}")"
MAP_FEATURES_JSON="$(api_json '/gis/map-features' "${ACCESS_TOKEN}")"

if [[ "$(node_json_field 'statusLabel' "${PUBLICATION_JSON}")" != "ok" ]]; then
  printf '[fail] gis publication status is not ok\n' >&2
  exit 1
fi

printf '[ok] gis publication status -> ok\n'
assert_positive_number 'gis map features total' "$(node_json_field 'total' "${MAP_FEATURES_JSON}")"

FEATURE_INFO_QUERY="$(build_feature_info_query "${MAP_FEATURES_JSON}")"

if [[ -z "${FEATURE_INFO_QUERY}" ]]; then
  printf '[fail] unable to prepare GetFeatureInfo query from GIS features\n' >&2
  exit 1
fi

COOKIE_FILE="$(mktemp)"
trap 'rm -f "${COOKIE_FILE}"' EXIT

check_frontend_login "${COOKIE_FILE}"

FEATURE_INFO_JSON="$(
  curl -fsS \
    -b "${COOKIE_FILE}" \
    "http://127.0.0.1:${FRONTEND_PORT}/api/qgis/feature-info?${FEATURE_INFO_QUERY}"
)"

assert_positive_number 'qgis feature info results' "$(node_json_field 'features.length' "${FEATURE_INFO_JSON}")"

printf '\nGIS smoke check passed.\n'
