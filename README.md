
# Apparel Management System

A complete solution for apparel inventory and sales management. This application helps businesses manage their product inventory, track sales, and streamline order processing.

## Features

- Product inventory management
- Order tracking and management
- Customer relationship management
- User management with role-based permissions
- Dashboard with key business metrics
- Reports and analytics

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/apparel-management.git
cd apparel-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

1. Create a PostgreSQL database
2. Set the DATABASE_URL environment variable to connect to your PostgreSQL database:

```bash
# For development
export DATABASE_URL=postgresql://username:password@localhost:5432/apparel_management

# For Windows command prompt
set DATABASE_URL=postgresql://username:password@localhost:5432/apparel_management

# For Windows PowerShell
$env:DATABASE_URL="postgresql://username:password@localhost:5432/apparel_management"
```

3. Initialize the database schema and default users:

```bash
node src/scripts/db-init.js
```

### 4. Build and start the application

```bash
npm run build
npm start
```

The application will be available at http://localhost:3000

## Development

To run the application in development mode:

```bash
npm run dev
```

## Default User Credentials

After initializing the database, you can login with these default credentials:

- Admin User:
  - Email: admin@example.com
  - Password: password

- Manager User:
  - Email: manager@example.com
  - Password: password

## Environment Variables

- `PORT`: The port to run the server on (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development, production)

## Troubleshooting

### API Connection Issues

If you see errors like "Unexpected token '<', "<!DOCTYPE "... is not valid JSON", it means:

1. The server is running but not properly handling API requests, or
2. The database is not properly configured

Solutions:
- Ensure the SERVER is running before accessing the web application
- Check that DATABASE_URL is correctly set
- Run the database initialization script: `node src/scripts/db-init.js`
- Check server logs for database connection errors
