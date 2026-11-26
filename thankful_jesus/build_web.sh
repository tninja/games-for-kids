#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -x "$ROOT_DIR/node_modules/.bin/tsc" ]; then
  echo "Missing node_modules; run 'npm install' first." >&2
  exit 1
fi

"$ROOT_DIR/node_modules/.bin/tsc" --noEmit
node "$ROOT_DIR/thankful_jesus/ts/build.mjs" "$@"
