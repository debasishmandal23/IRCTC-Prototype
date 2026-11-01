#!/usr/bin/env sh
# Serve IRCTC OneTrip on http://localhost:8080 (needs Python 3). Ctrl+C to stop.
cd "$(dirname "$0")"
echo "Open http://localhost:8080 in Chrome or Edge"
python3 -m http.server 8080 2>/dev/null || python -m http.server 8080
