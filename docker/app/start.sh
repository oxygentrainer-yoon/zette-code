#!/bin/sh
set -e

echo "Starting filter-service..."
node app.js &

echo "Starting gateway-ws..."
node server.js
