#!/bin/bash
# Double-click from macOS Finder, or run from Terminal.
cd "$(dirname "$0")" || exit 1
echo "Pelagic Atlas is available at http://localhost:8080"
command -v open >/dev/null && open "http://localhost:8080" &
python3 -m http.server 8080
