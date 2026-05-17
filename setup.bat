@echo off
echo.
echo  ===================================
echo   FORGE FITNESS - Setup Script
echo  ===================================
echo.

echo [1/3] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies.
    echo Make sure Node.js is installed: https://nodejs.org
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies.
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Setup complete!
echo.
echo ============================================
echo  NEXT STEPS:
echo ============================================
echo.
echo  1. Edit backend\.env and add your keys:
echo     - MONGODB_URI (free at mongodb.com/atlas)
echo     - ANTHROPIC_API_KEY (free at console.anthropic.com)
echo.
echo  2. Open TWO terminal windows:
echo.
echo     Terminal 1 (Backend):
echo       cd backend
echo       npm start
echo.
echo     Terminal 2 (Frontend):
echo       cd frontend
echo       npm start
echo.
echo  3. Open http://localhost:3000 in your browser
echo.
echo  See README.md for full deployment instructions!
echo.
pause
