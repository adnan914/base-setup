#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${ROOT_DIR}/.tmp/modular-smoke"
mkdir -p "${LOG_DIR}"

PIDS=()

cleanup() {
  local exit_code=$?

  for pid in "${PIDS[@]:-}"; do
    if kill -0 "${pid}" >/dev/null 2>&1; then
      kill "${pid}" >/dev/null 2>&1 || true
      wait "${pid}" >/dev/null 2>&1 || true
    fi
  done

  if [[ ${exit_code} -ne 0 ]]; then
    for log_file in "${LOG_DIR}"/*.log; do
      [[ -f "${log_file}" ]] || continue
      echo "--- ${log_file}"
      tail -n 200 "${log_file}" || true
    done
  fi

  exit ${exit_code}
}

trap cleanup EXIT

export NODE_ENV="${NODE_ENV:-development}"
export HOST="${HOST:-127.0.0.1}"
export API_PREFIX="${API_PREFIX:-api}"
export GATEWAY_URL="${GATEWAY_URL:-http://${HOST}:3000}"
export LOGIN_EMAIL="${LOGIN_EMAIL:-admin@example.com}"
export LOGIN_PASSWORD="${LOGIN_PASSWORD:-Admin@123}"

start_service() {
  local name=$1
  local port=$2
  local entrypoint=$3
  shift 3

  echo "Starting ${name} on port ${port}"
  (
    cd "${ROOT_DIR}"
    env \
      PORT="${port}" \
      HOST="${HOST}" \
      API_PREFIX="${API_PREFIX}" \
      "$@" \
      npx ts-node -r tsconfig-paths/register "${entrypoint}" \
      > "${LOG_DIR}/${name}.log" 2>&1
  ) &

  PIDS+=("$!")
}

wait_for_http() {
  local name=$1
  local url=$2

  for _ in $(seq 1 60); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      echo "${name} is reachable at ${url}"
      return 0
    fi
    sleep 2
  done

  echo "${name} did not become reachable at ${url}" >&2
  return 1
}

start_service "auth-service" "3001" "apps/auth-service/src/main.ts"
start_service "user-service" "3002" "apps/user-service/src/main.ts"
start_service \
  "api-gateway" \
  "3000" \
  "apps/api-gateway/src/main.ts" \
  AUTH_SERVICE_URL="http://${HOST}:3001" \
  USER_SERVICE_URL="http://${HOST}:3002"

wait_for_http "auth-service" "http://${HOST}:3001/docs"
wait_for_http "user-service" "http://${HOST}:3002/docs"
wait_for_http "api-gateway" "http://${HOST}:3000/docs"

cd "${ROOT_DIR}"
node scripts/smoke-modular.js
