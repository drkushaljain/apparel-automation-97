
@echo off
echo Starting Apparel Management System Server...
echo ===========================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in your PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found
    echo Creating a default .env file...
    echo DATABASE_URL=postgresql://postgres:password@localhost:5432/mybiz> .env
    echo PORT=8088>> .env
    echo NODE_ENV=development>> .env
    echo.
    echo Default .env file created. Please edit it with your PostgreSQL connection details.
    echo.
)

REM Start the server
echo Starting server...
node server.js

pause
