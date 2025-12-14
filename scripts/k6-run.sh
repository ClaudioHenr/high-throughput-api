#!/usr/bin/env bash

SCRIPT_PATH=${1:-test/load/k6-script.js}

docker run --rm -i \
  --network=host \
  -v "$(pwd):/scripts" \
  grafana/k6 run "/scripts/${SCRIPT_PATH}"
