@echo off
setlocal enabledelayedexpansion

echo =========================================
echo  VFX Pipeline Companion - Setup Script
echo =========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed.
    echo    Please install Node.js from https://nodejs.org/
    echo    Minimum version required: v16 or later
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

echo.

REM Check if Python is installed
echo [2/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed.
    echo    Please install Python from https://python.org/
    echo    Minimum version required: Python 3.8 or later
    echo    Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ Python found: !PYTHON_VERSION!
)

echo.

REM Install root dependencies
echo [3/6] Installing main dependencies...
echo Installing Electron, Concurrently, and build tools...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install main dependencies
    pause
    exit /b 1
)
echo ✅ Main dependencies installed successfully

echo.

REM Setup frontend
echo [4/6] Setting up React frontend...
if not exist "frontend" (
    echo ❌ Frontend directory not found
    echo    Make sure you're running this from the project root
    pause
    exit /b 1
)

cd frontend
echo Installing React, Vite, Tailwind CSS...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend setup complete

echo.

REM Setup backend
echo [5/6] Setting up Python backend...
if not exist "backend" (
    echo ❌ Backend directory not found
    echo    Make sure you're running this from the project root
    pause
    exit /b 1
)

cd backend

REM Create data directory if it doesn't exist
if not exist "data" mkdir data

echo Installing FastAPI, SQLAlchemy, and dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    echo    Try running: python -m pip install --upgrade pip
    echo    Then run setup.bat again
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Backend setup complete

echo.

REM Final verification
echo [6/6] Verifying installation...

REM Check if all required directories exist
set "MISSING_DIRS="
if not exist "frontend\src" set "MISSING_DIRS=!MISSING_DIRS! frontend\src"
if not exist "backend\data" set "MISSING_DIRS=!MISSING_DIRS! backend\data"
if not exist "electron" set "MISSING_DIRS=!MISSING_DIRS! electron"

if not "!MISSING_DIRS!"=="" (
    echo ⚠️  Warning: Some directories are missing: !MISSING_DIRS!
    echo    This might cause issues. Please check your project structure.
)

REM Check if key files exist
if not exist "backend\main.py" (
    echo ❌ Missing backend\main.py
    echo    Please make sure all backend files are in place
)
if not exist "frontend\src\App.jsx" (
    echo ❌ Missing frontend\src\App.jsx
    echo    Please make sure all frontend files are in place
)
if not exist "electron\main.js" (
    echo ❌ Missing electron\main.js
    echo    Please make sure Electron files are in place
)

echo.
echo =========================================
echo 🎉 Setup Complete!
echo =========================================
echo.
echo Next steps:
echo   1. Start development: npm run dev
echo   2. Or start components individually:
echo      - Frontend only: npm run dev:frontend
echo      - Backend only:  npm run dev:backend
echo      - Electron only: npm run electron:dev
echo.
echo   3. Build for production: npm run build
echo   4. Package app: npm run package
echo.
echo The app will run on:
echo   • Frontend: http://localhost:3000
echo   • Backend:  http://localhost:8000
echo   • Electron: Desktop app will launch automatically
echo.
echo For help, check the README.md file
echo =========================================

pause