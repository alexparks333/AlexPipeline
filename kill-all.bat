@echo off
echo Killing all VFX Pipeline processes...
echo.

echo [1/4] Killing Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js processes killed
) else (
    echo ℹ️  No Node.js processes found
)

echo [2/4] Killing Python processes...
taskkill /f /im python.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Python processes killed
) else (
    echo ℹ️  No Python processes found
)

echo [3/4] Killing Electron processes...
taskkill /f /im electron.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Electron processes killed
) else (
    echo ℹ️  No Electron processes found
)

echo [4/4] Killing processes on ports 3000 and 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
    echo ✅ Killed process on port 3000
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
    echo ✅ Killed process on port 8000
)

echo.
echo 🧹 Cleanup complete!
echo You can now start fresh with: npm run dev
echo.
pause