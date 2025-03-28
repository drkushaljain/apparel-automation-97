
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

rem Use predefined credentials or prompt for PostgreSQL credentials
set PGUSER=postgres
set PGPASSWORD=Kushaljain_28

rem Allow user to override if needed
set /p OVERRIDE=Do you want to use the default credentials (postgres/Kushaljain_28)? (Y/N): 
if /i "%OVERRIDE%"=="N" (
    set /p PGUSER=Enter PostgreSQL username (default: postgres): 
    if "%PGUSER%"=="" set PGUSER=postgres
    set /p PGPASSWORD=Enter PostgreSQL password: 
)

rem Database name
set DB_NAME=mybiz2

rem Port number (default is 5433 based on your connection string)
set /p PGPORT=Enter PostgreSQL port (default: 5433): 
if "%PGPORT%"=="" set PGPORT=5433

rem Create database if it doesn't exist
echo Creating database if it doesn't exist...
echo SELECT 'CREATE DATABASE %DB_NAME%' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '%DB_NAME%');| psql -U %PGUSER% -p %PGPORT%

rem Test connection to the new database
echo Testing connection to the database...
psql -U %PGUSER% -p %PGPORT% -d %DB_NAME% -c "SELECT 'Connection successful!' as result;"

if %ERRORLEVEL% neq 0 (
    echo Failed to connect to database '%DB_NAME%'
    exit /b 1
) else (
    echo Successfully connected to database '%DB_NAME%'
)

rem Update the .env file with the correct DATABASE_URL
echo Updating .env file with database connection string...
echo DATABASE_URL=postgresql://%PGUSER%:%PGPASSWORD%@localhost:%PGPORT%/%DB_NAME%> .env
echo PORT=8088>> .env
echo NODE_ENV=development>> .env

echo Running database initialization script...
node src/scripts/db-init.js

echo.
echo PostgreSQL setup complete!
echo You can now run start-server.bat to start the application.
echo.
echo Default login credentials:
echo - Admin: admin@example.com / password
echo - Manager: manager@example.com / password
