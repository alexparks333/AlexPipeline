@echo off
ECHO "Setting up and starting VFX Pipeline Companion..."
ECHO "This single command will handle everything for you."

ECHO "Ensuring all dependencies are installed..."
IF NOT EXIST .venv (
    ECHO "Python virtual environment not found. Running one-time setup..."
    ECHO "This might take a few minutes..."
    npm run setup
) ELSE (
    ECHO "Found virtual environment. Updating Node.js packages..."
    npm install
)

ECHO "Launching application..."
npm start

ECHO "Script finished. If the application did not start, check the errors above."
pause