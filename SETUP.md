
# Installation Guide for Order Management System

This guide will help you set up the Order Management System on your local machine or AWS server.

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional, for database integration)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd order-management-system
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
USE_POSTGRES=false
# If using PostgreSQL, uncomment and fill the next line
# DATABASE_URL=postgresql://username:password@localhost:5432/order_management
```

### Step 4: Build the Application

```bash
npm run build
# or
yarn build
```

### Step 5: Run the Application

```bash
node server.js
```

The application will be available at `http://localhost:3000`.

## PostgreSQL Integration

To use PostgreSQL instead of browser localStorage:

1. Install PostgreSQL and create a database
2. Set `USE_POSTGRES=true` in your `.env` file
3. Set `DATABASE_URL` to your PostgreSQL connection string in your `.env` file
4. Run the database schema setup script from `database/schema.sql`

## AWS Deployment

### Prerequisites

- AWS account
- Basic knowledge of AWS services (EC2, RDS)

### Step 1: Set Up an EC2 Instance

1. Launch an EC2 instance (recommend t2.micro or larger)
2. Choose Amazon Linux 2 or Ubuntu as your operating system
3. Configure security groups to allow HTTP (port 80), HTTPS (port 443), and SSH (port 22)
4. Create and download your key pair

### Step 2: Connect to Your EC2 Instance

```bash
ssh -i your-key-pair.pem ec2-user@your-instance-public-dns
```

### Step 3: Install Node.js

For Amazon Linux 2:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 16
```

For Ubuntu:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 4: Set Up PostgreSQL (Optional)

#### Using Amazon RDS:
1. Create a PostgreSQL database instance in RDS
2. Configure security groups to allow connections from your EC2 instance
3. Note the database endpoint, username, and password

#### Using EC2:
For Amazon Linux 2:
```bash
sudo amazon-linux-extras enable postgresql14
sudo yum install -y postgresql
```

For Ubuntu:
```bash
sudo apt install -y postgresql postgresql-contrib
```

### Step 5: Clone and Set Up the Application

```bash
git clone <repository-url>
cd order-management-system
npm install
```

Create a `.env` file:
```
PORT=80
USE_POSTGRES=true
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/order_management
```

### Step 6: Build and Run the Application

```bash
npm run build
sudo npm install -g pm2
pm2 start server.js
```

### Step 7: Configure PM2 to Start on Boot

```bash
pm2 startup
pm2 save
```

### Step 8: Set Up a Domain Name (Optional)

1. Register a domain through Route 53 or another registrar
2. Point your domain to your EC2 instance's public IP
3. Set up SSL using Let's Encrypt

## Troubleshooting

### Common Issues

#### Application Cannot Connect to PostgreSQL

1. Verify your DATABASE_URL is correct
2. Check that security groups allow traffic from your application to the database
3. Ensure the database exists and has the correct schema

#### Application Crashes on Startup

1. Check server logs: `pm2 logs`
2. Verify all required environment variables are set
3. Ensure the build was successful: `npm run build`

#### Date/Time Issues

If you encounter date-related errors, make sure all date objects are handled correctly:

1. When storing dates in the database, ensure they are in ISO format
2. When retrieving dates, convert string dates to Date objects

## Maintenance

### Database Backups

For PostgreSQL:
```bash
pg_dump -U username -d order_management > backup.sql
```

### Application Updates

```bash
git pull
npm install
npm run build
pm2 restart server
```

### Logs

View application logs:
```bash
pm2 logs
```

## Need Help?

For additional support, please contact the development team.
