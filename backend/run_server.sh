#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ACTIVATED_HERE=false

cleanup() {
  if [[ "$ACTIVATED_HERE" == "true" ]]; then
    deactivate || true
    echo "Virtual environment deactivated."
  fi
}

trap cleanup EXIT

if [[ -z "${VIRTUAL_ENV:-}" ]]; then
  VENV_CANDIDATES=(
    "$SCRIPT_DIR/.venv/bin/activate"
    "$SCRIPT_DIR/../.venv/bin/activate"
  )

  VENV_ACTIVATE=""
  for candidate in "${VENV_CANDIDATES[@]}"; do
    if [[ -f "$candidate" ]]; then
      VENV_ACTIVATE="$candidate"
      break
    fi
  done

  if [[ -z "$VENV_ACTIVATE" ]]; then
    echo "Error: could not find a virtual environment activate script."
    echo "Checked:"
    echo "  - $SCRIPT_DIR/.venv/bin/activate"
    echo "  - $SCRIPT_DIR/../.venv/bin/activate"
    exit 1
  fi

  # shellcheck disable=SC1091
  source "$VENV_ACTIVATE"
  ACTIVATED_HERE=true
  echo "Virtual environment activated: $VIRTUAL_ENV"
else
  echo "Using already active virtual environment: $VIRTUAL_ENV"
fi

PORT="${PORT:-8000}"
HOST="${HOST:-127.0.0.1}"

echo "Starting FastAPI server at http://${HOST}:${PORT}"
echo "Press Ctrl+C to stop."
uvicorn app.main:app --reload --host "$HOST" --port "$PORT"
