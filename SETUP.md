
# Database Setup Guide

This guide will help you set up the database for the Apparel Management System.

## Prerequisites

1. You need to have PostgreSQL installed on your machine or have access to a PostgreSQL server.
2. Node.js and npm installed on your machine.

## Setup Steps

### 1. Set up the database

Create a new PostgreSQL database for the application:

```sql
CREATE DATABASE apparel_management;
```

### 2. Set the DATABASE_URL environment variable

The application **requires** a `DATABASE_URL` environment variable to connect to your PostgreSQL database.

#### On Windows:

```bash
set DATABASE_URL=postgres://username:password@localhost:5432/apparel_management
```

#### On Mac/Linux:

```bash
export DATABASE_URL=postgres://username:password@localhost:5432/apparel_management
```

Replace `username`, `password`, and `apparel_management` with your PostgreSQL credentials and database name.

### 3. Initialize the database

Use one of the following setup scripts to initialize the database schema:

#### On Windows:

```bash
setup-db.bat
```

#### On Mac/Linux:

```bash
./setup-db.sh
```

These scripts will create all the necessary tables and default data in your database.

### 4. Verify database connection

Run the check-api script to verify that your database connection is working:

```bash
node src/scripts/check-api.js
```

This will check if the API server can connect to your database and if all required tables exist.

### 5. Run the application

```bash
npm start
```

The application should now be running at http://localhost:3000

## Troubleshooting

If you're experiencing any issues with the database connection:

1. Check if the `DATABASE_URL` is correctly set:
   ```
   echo %DATABASE_URL%  # Windows
   echo $DATABASE_URL   # Mac/Linux
   ```

2. Make sure PostgreSQL is running:
   ```
   pg_isready -h localhost -p 5432
   ```

3. Try connecting to the database directly:
   ```
   psql postgres://username:password@localhost:5432/apparel_management
   ```

4. Check the database schema by running the validation script:
   ```
   node src/scripts/check-api.js
   ```

5. If all else fails, initialize the database manually:
   ```
   psql -h localhost -U username -d apparel_management -f database/schema.sql
   ```

## Default Login Credentials

Once the database is set up, you can log in with these default credentials:

- **Admin User**: 
  - Email: admin@example.com
  - Password: password

- **Manager User**: 
  - Email: manager@example.com
  - Password: password

## Database Schema

The application uses the following main tables:

- `users` - Store user accounts and permissions
- `products` - Store product information
- `customers` - Store customer information
- `orders` - Store order information
- `order_items` - Store items within orders
- `stock_history` - Track inventory changes
- `company_settings` - Store company information

For more details, see the database schema in `database/schema.sql`.
