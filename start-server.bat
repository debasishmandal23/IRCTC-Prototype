@echo off
REM Serve IRCTC OneTrip on http://localhost:8080 (needs Python 3). Close window to stop.
cd /d "%~dp0"
echo Open http://localhost:8080 in Chrome or Edge
start "" http://localhost:8080
python -m http.server 8080 || py -m http.server 8080
pause
