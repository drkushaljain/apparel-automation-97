
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
    echo DATABASE_URL=postgresql://postgres:Kushaljain_28@localhost:5433/mybiz2> .env
    echo PORT=8088>> .env
    echo NODE_ENV=development>> .env
    echo.
    echo Default .env file created. Please edit it with your PostgreSQL connection details.
    echo.
)

REM Display current database settings
echo Current Database Settings:
for /f "tokens=*" %%a in ('findstr DATABASE_URL .env') do (
    echo %%a | findstr /v ":" >nul
    if %ERRORLEVEL% equ 0 (
        echo %%a
    ) else (
        for /f "tokens=1,2 delims==" %%b in ("%%a") do (
            echo %%b=postgresql://username:****@host:port/database
        )
    )
)
echo.

REM Start the server
echo Starting server...
node server.js

REM Check for errors
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Server failed to start with exit code %ERRORLEVEL%
    echo.
    echo If this is a database connection error, please check:
    echo 1. PostgreSQL is running on the specified port (5433)
    echo 2. Username and password in .env file are correct (password: Kushaljain_28)
    echo 3. Database 'mybiz2' exists
    echo.
    echo You can create the database with:
    echo createdb -U postgres mybiz2
    echo.
    pause
    exit /b 1
)

pause
