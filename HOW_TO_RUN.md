
# How to Run the Apparel Management System on Windows

This guide will walk you through setting up and running the Apparel Management System on Windows with PostgreSQL.

## Prerequisites

1. **Node.js** (v14 or later) - [Download from nodejs.org](https://nodejs.org/)
2. **PostgreSQL** (v12 or later) - [Download from postgresql.org](https://postgresql.org/download/)
3. **Git** (optional, for cloning the repository)

## Step-by-Step Setup Instructions

### 1. Install PostgreSQL

- Download and install PostgreSQL from [postgresql.org](https://postgresql.org/download/)
- Remember the password you set for the 'postgres' user during installation
- Make sure PostgreSQL is running (it should start automatically after installation)

### 2. Setup the Database

Run the setup-postgres.bat script in a command prompt:

```
setup-postgres.bat
```

This script will:
- Check if PostgreSQL is installed
- Create a database named 'mybiz'
- Create an .env file with the correct database connection string
- Run the database initialization script to create tables and default users
- For port number, you may need to change the default port from 5432 to 5433 in the .env file if you use a different port

### 3. Install Dependencies

Open a command prompt in the project directory and run:

```
npm install
```

This will install all the required packages.

### 4. Start the Application

Run the start-app.bat script:

```
start-app.bat
```

This script will:
- Build the frontend application
- Start the backend server

### 5. Access the Application

Open your browser and go to:

```
http://localhost:8088
```

### 6. Login Credentials

Use the following default credentials to log in:

- **Admin User**:
  - Email: admin@example.com
  - Password: password

- **Manager User**:
  - Email: manager@example.com
  - Password: password

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check that PostgreSQL is running
2. Verify the connection details in the .env file:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mybiz
   ```
3. Make sure the port number matches your PostgreSQL installation (typically 5432)
4. Run the check-api.js script to diagnose connection issues:
   ```
   node src/scripts/check-api.js
   ```

### Port Already in Use

If port 8088 is already in use, edit the .env file and change the PORT value.

## Database Structure

The application uses the following tables:
- products
- customers
- orders
- users
- company_settings
- stock_history

Each table contains relevant fields for managing the apparel business.
