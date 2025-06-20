@echo off
echo Setting up VFX Pipeline Companion...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed. Please install Python first.
    pause
    exit /b 1
)

echo Installing main dependencies...
npm install

echo Setting up frontend...
cd frontend
npm install
cd ..

echo Setting up backend...
cd backend
python -m pip install -r requirements.txt
cd ..

echo Setup complete! You can now run the app with: npm run dev
pause