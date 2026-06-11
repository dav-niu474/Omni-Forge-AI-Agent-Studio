#!/bin/bash
cd "$(dirname "$0")"
while true; do
  bun index.ts
  echo "[Daemon] Restarting in 2 seconds..."
  sleep 2
done
