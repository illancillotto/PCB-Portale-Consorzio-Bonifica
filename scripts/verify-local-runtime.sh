#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

printf 'Running local verification suite...\n\n'

bash ./scripts/smoke-local-runtime.sh
printf '\n'
bash ./scripts/smoke-ingestion-runtime.sh
printf '\n'
bash ./scripts/smoke-gis-runtime.sh

printf '\nLocal verification suite passed.\n'
