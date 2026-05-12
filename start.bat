@echo off
echo Starting FPL Platform...
echo.

cd /d "%~dp0"

REM Open a new window for the proxy server
start cmd /k "npm run server"

REM Wait 2 seconds for the server to start
timeout /t 2 /nobreak

REM Open a new window for the dev server
start cmd /k "npm run dev"

REM Wait 3 seconds for dev server to start
timeout /t 3 /nobreak

REM Open the app in default browser
start http://localhost:5174

echo.
echo FPL Platform is launching!
echo - Proxy Server: http://localhost:3001
echo - App: http://localhost:5174
echo.
echo Keep these windows open while using the app.
echo Press Ctrl+C in each window to stop the servers.
