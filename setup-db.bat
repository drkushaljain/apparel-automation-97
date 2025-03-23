
@echo off
echo Apparel Management System - Database Setup
echo -----------------------------------------

rem Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL is not installed or not in your PATH
    echo Please install PostgreSQL and try again
    exit /b 1
)

echo Creating PostgreSQL database...

rem Database name
set DB_NAME=apparel_management

rem Prompt for PostgreSQL password
set /p PGUSER=Enter PostgreSQL username (default: postgres): 
if "%PGUSER%"=="" set PGUSER=postgres

set /p PGPASSWORD=Enter PostgreSQL password: 

rem Create database
createdb -U %PGUSER% %DB_NAME% 2>nul
if %ERRORLEVEL% neq 0 (
    echo Database '%DB_NAME%' already exists or couldn't be created
) else (
    echo Database '%DB_NAME%' created successfully
)

rem Set up DATABASE_URL environment variable
echo Setting up DATABASE_URL environment variable
set DATABASE_URL=postgresql://%PGUSER%:%PGPASSWORD%@localhost:5432/%DB_NAME%

rem Run the database initialization script
echo Initializing database schema and default users...
node src/scripts/db-init.js

rem Create .env file
echo Creating .env file with database configuration...
echo DATABASE_URL=postgresql://%PGUSER%:%PGPASSWORD%@localhost:5432/%DB_NAME%> .env
echo PORT=3000>> .env
echo NODE_ENV=development>> .env

echo.
echo Setup complete!
echo.
echo To start the application:
echo npm run build
echo npm start
echo.
echo Default login credentials:
echo Admin: admin@example.com / password
echo Manager: manager@example.com / password

pause
