
@echo off
echo Starting Apparel Management System
echo ==============================

echo Step 1: Building frontend...
call npm run build

echo Step 2: Starting backend server...
node server.js

echo If the server starts successfully, you can access the application at:
echo http://localhost:3000
