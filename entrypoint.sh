#!/bin/sh
set -e

echo "Initializing database..."
# No Prisma setup needed anymore! Using JSON DB.

echo "Starting application..."
exec node server.js
