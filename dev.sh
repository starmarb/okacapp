#!/usr/bin/env bash
#
# Start the Django and Angular dev servers together.
#
#   ./dev.sh      (Ctrl-C stops both)
#
# Run from anywhere; paths resolve relative to this file.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS=()

cleanup() {
  trap - EXIT INT TERM
  printf '\nShutting down...\n'
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "-> backend    http://localhost:8000   (Django)"
( cd "$ROOT/backend" && exec uv run manage.py runserver ) &
PIDS+=($!)

echo "-> frontend   http://localhost:4200   (Angular)"
( cd "$ROOT/frontend" && exec npm start ) &
PIDS+=($!)

wait
