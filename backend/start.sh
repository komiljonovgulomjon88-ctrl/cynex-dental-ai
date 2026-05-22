#!/bin/bash
set -e
echo "=== Cynex Dental API Starting ==="
echo "PORT: ${PORT:-8000}"
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
