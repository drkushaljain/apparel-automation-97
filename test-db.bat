
@echo off
echo Testing Database Connection...
echo ===========================================
echo.

node test-db-connection.js

echo.
if %ERRORLEVEL% neq 0 (
    echo Database connection test FAILED!
) else (
    echo Database connection test SUCCEEDED!
)

pause
