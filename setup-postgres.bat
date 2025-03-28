
@echo off
echo Apparel Management System - PostgreSQL Setup
echo ============================================

rem Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL is not installed or not in your PATH
    echo Please install PostgreSQL and try again
    exit /b 1
)

echo Creating PostgreSQL database...

rem Prompt for PostgreSQL credentials
set /p PGUSER=Enter PostgreSQL username (default: postgres): 
if "%PGUSER%"=="" set PGUSER=postgres

set /p PGPASSWORD=Enter PostgreSQL password: 

rem Database name
set DB_NAME=mybiz

rem Create database if it doesn't exist
echo Creating database if it doesn't exist...
psql -U %PGUSER% -c "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr /C:"1 row" >nul
if %ERRORLEVEL% neq 0 (
    echo Database '%DB_NAME%' does not exist. Creating it...
    createdb -U %PGUSER% %DB_NAME%
    if %ERRORLEVEL% neq 0 (
        echo Failed to create database '%DB_NAME%'
        exit /b 1
    ) else (
        echo Database '%DB_NAME%' created successfully
    )
) else (
    echo Database '%DB_NAME%' already exists
)

rem Update the .env file with the correct DATABASE_URL
echo Updating .env file with database connection string...
echo DATABASE_URL=postgresql://%PGUSER%:%PGPASSWORD%@localhost:5433/%DB_NAME%> .env
echo PORT=8088>> .env
echo NODE_ENV=development>> .env

echo Running database initialization script...
node src/scripts/db-init.js

echo.
echo PostgreSQL setup complete!
echo You can now run start-app.bat to start the application.
echo.
echo Default login credentials:
echo - Admin: admin@example.com / password
echo - Manager: manager@example.com / password
