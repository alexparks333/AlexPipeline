@echo off
echo Starting VFX Pipeline Companion...
echo.

echo [1/3] Cleaning up old processes...
call npm run kill-ports

echo [2/3] Starting all services...
echo Electron will start automatically in ~6 seconds
echo.
echo ⚠️  Keep this window open - Press Ctrl+C to stop all services
echo.

call npm run dev