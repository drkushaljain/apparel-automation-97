
# PostgreSQL Integration Guide

This guide will help you integrate the application with a PostgreSQL database on your local computer and deploy it to AWS.

## Local Setup

### Step 1: Install PostgreSQL

1. **Download PostgreSQL**: Visit [postgresql.org](https://www.postgresql.org/download/) and download the appropriate version for your OS.
2. **Install PostgreSQL**: Follow the installation wizard. Make note of:
   - Port number (default: 5432)
   - Username (default: postgres)
   - Password (set during installation)

### Step 2: Create a Database

1. Open pgAdmin (comes with PostgreSQL) or any PostgreSQL client.
2. Create a new database:
   ```sql
   CREATE DATABASE inventory_management;
   ```

### Step 3: Create Tables

Connect to your database and run the SQL schema in the `database/schema.sql` file to create all necessary tables, indexes, and initial data.

### Step 4: Update Application to Use PostgreSQL

1. Create a `.env` file in the project root:
   ```
   PORT=3000
   USE_POSTGRES=true
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/inventory_management
   ```

2. Restart your application:
   ```
   node server.js
   ```

## AWS Deployment

### Step 1: Create an RDS Instance

1. Log in to AWS console and navigate to RDS service.
2. Click "Create database"
3. Choose PostgreSQL as the engine
4. Select appropriate settings:
   - Instance size (start with t3.micro for testing)
   - Storage (20GB is often sufficient to start)
   - VPC and security group (allow access from your application)
   - Username and password
5. Create the database

### Step 2: Configure Security Group

1. Ensure the security group allows inbound traffic on port 5432 (PostgreSQL)
2. For development, you can open it to your IP
3. For production, restrict it to your application server's security group

### Step 3: Connect and Initialize

1. Use a PostgreSQL client (like pgAdmin) to connect to your RDS instance using:
   - Host: Your RDS endpoint (e.g., mydb.abc123xyz.us-east-1.rds.amazonaws.com)
   - Port: 5432
   - Username and password from step 1
2. Create your database and run the schema.sql file to set up all tables

### Step 4: Deploy Application

#### Option 1: EC2

1. Launch an EC2 instance
2. Configure security group to allow HTTP/HTTPS traffic
3. Install Node.js and other dependencies
4. Clone your application repository
5. Set up environment variables to connect to RDS
6. Install PM2 or similar to keep your application running
7. Configure a reverse proxy (Nginx/Apache) if needed

#### Option 2: Elastic Beanstalk

1. Package your application
2. Create a new Elastic Beanstalk application
3. Choose Node.js platform
4. Upload your application package
5. Configure environment variables to connect to RDS
6. Launch the environment

### Step 5: Data Migration

When moving from localStorage to PostgreSQL:

1. Export your data using the application's export functionality
2. Import the data into PostgreSQL using appropriate SQL INSERT statements or a migration script

## Conclusion

This guide provides a basic setup for PostgreSQL integration. You may need to adapt it based on your specific requirements and infrastructure. For production environments, consider adding:

- Connection pooling
- Proper error handling and retries
- Logging and monitoring
- Backup strategies
- Performance optimizations
