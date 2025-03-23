
#!/bin/bash

# Apparel Management System - Database Setup Script

echo "Apparel Management System - Database Setup"
echo "-----------------------------------------"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed or not in your PATH"
    echo "Please install PostgreSQL and try again"
    exit 1
fi

echo "Creating PostgreSQL database..."

# Create database (prompt for password)
echo "Enter your PostgreSQL user password:"
read -s PGPASSWORD
export PGPASSWORD

# Database name
DB_NAME="apparel_management"
DB_USER=$(whoami)

# Create database
createdb -U $DB_USER $DB_NAME 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Database '$DB_NAME' already exists or couldn't be created"
else
    echo "Database '$DB_NAME' created successfully"
fi

# Set up DATABASE_URL environment variable
echo "Setting up DATABASE_URL environment variable"
export DATABASE_URL="postgresql://$DB_USER:$PGPASSWORD@localhost:5432/$DB_NAME"

# Run the database initialization script
echo "Initializing database schema and default users..."
node src/scripts/db-init.js

# Create .env file
echo "Creating .env file with database configuration..."
echo "DATABASE_URL=postgresql://$DB_USER:$PGPASSWORD@localhost:5432/$DB_NAME" > .env
echo "PORT=3000" >> .env
echo "NODE_ENV=development" >> .env

echo ""
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "npm run build"
echo "npm start"
echo ""
echo "Default login credentials:"
echo "Admin: admin@example.com / password"
echo "Manager: manager@example.com / password"
