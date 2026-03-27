#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

bash ./scripts/prepare-local-runtime.sh
docker compose up -d
npm install
npm run build --workspace connectors

cat <<EOF

Local development prerequisites are ready.

To start the applications in separate terminals:
  npm run dev:backend
  npm run dev:frontend

Then verify runtime with:
  npm run dev:smoke
EOF
