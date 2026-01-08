@echo off
REM Keeper Desktop App Launcher
REM Starts the Electron app in development mode

cd /d "%~dp0keeper-desktop"

echo Starting Keeper Desktop App...
echo.
echo The app will open in a new window.
echo Keep this terminal open to see logs.
echo Press Ctrl+C to stop the app.
echo.

npm run dev
