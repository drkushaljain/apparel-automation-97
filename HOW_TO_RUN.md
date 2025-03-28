
# Apparel Management System - Setup and Run Instructions

## Prerequisites

1. **Node.js** - Make sure you have Node.js installed (v14.x or higher)
2. **PostgreSQL** - Install and set up PostgreSQL database

## Setup Steps

### 1. Database Setup

1. Make sure PostgreSQL is installed and running
2. Create a new database named "mybiz" (or choose a different name)
3. Run the database setup script:

```
setup-postgres.bat
```

This will:
- Configure the database connection in .env file
- Create necessary tables
- Set up initial data

### 2. Starting the Server

Run the following command to start the backend server:

```
start-server.bat
```

The server should start on port 8088 (or whatever port is configured in .env)

### 3. Running the Frontend

In a separate terminal, start the frontend development server:

```
npm run dev
```

This will start the frontend application, usually on http://localhost:3000

## API Endpoints

The following API endpoints are available:

- `/api/health` - Server health check
- `/api/db-status` - Database connection status
- `/api/products` - Product management
- `/api/customers` - Customer management
- `/api/customer-categories` - Customer category management
- `/api/orders` - Order management
- `/api/users` - User management
- `/api/company-settings` - Company settings
- `/api/stock-history` - Stock history records
- `/api/activity-logs` - Activity logs
- `/api/auth/login` - Authentication

## Troubleshooting Database Connection

If you see database connection errors:

1. Make sure PostgreSQL is running
2. Check the DATABASE_URL in your .env file:
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://postgres:password@localhost:5432/mybiz`
3. Make sure the username and password are correct
4. Try connecting to the database directly using `psql` to verify credentials
5. Make sure the server is running by checking for messages in the terminal

## Default Login Credentials

Once setup is complete, you can log in with:

- **Admin user**: admin@example.com / admin123
- **Manager user**: manager@example.com / password

## Common Issues

### Server Not Starting

If the server doesn't start and you see an error about "require is not defined", this is because the project is using ES Modules (import/export) instead of CommonJS (require/module.exports). Make sure all server files use the ES Module syntax.

### 404 Not Found Errors

If your frontend is getting 404 errors when trying to connect to API endpoints:

1. Make sure the server is running
2. Check that the API endpoints are correctly defined in `src/server/router.js`
3. Verify that `server.js` is correctly importing and using the router
4. Check the browser console for more specific error messages
