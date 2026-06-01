#!/bin/sh
set -eu

PIDS=""

start_service() {
  NAME="$1"
  ENTRYPOINT="$2"

  echo "Starting ${NAME}..."
  node "${ENTRYPOINT}" 2>&1 | while IFS= read -r line || [ -n "$line" ]; do
    printf '[%s] %s\n' "$NAME" "$line"
  done &
  PID=$!
  PIDS="${PIDS} ${PID}"
  echo "${NAME} started with pid ${PID}"
}

shutdown() {
  echo "Stopping app services..."
  for PID in $PIDS; do
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
    fi
  done
  wait || true
}

trap shutdown INT TERM

start_service "auth-service" "dist/apps/auth-service/main.js"
start_service "user-service" "dist/apps/user-service/main.js"
start_service "api-gateway" "dist/apps/api-gateway/main.js"

while true; do
  for PID in $PIDS; do
    if ! kill -0 "$PID" 2>/dev/null; then
      wait "$PID" || EXIT_CODE=$?
      EXIT_CODE=${EXIT_CODE:-1}
      shutdown
      exit "$EXIT_CODE"
    fi
  done
  sleep 1
done
