
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
