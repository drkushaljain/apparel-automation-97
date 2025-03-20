
# Installation Guide for Inventory Management System

This guide will help you set up the Inventory Management System on your local machine and deploy it to an AWS server with PostgreSQL integration.

## Local Installation

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- PostgreSQL database
- Git

### Step 1: Clone the Repository
```bash
git clone https://your-repository-url.git
cd inventory-management-system
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with the following content:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=inventory_db

# Application Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### Step 3: Set Up PostgreSQL Database
1. Create a new PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE inventory_db;
\q
```

2. Initialize the database schema by running the SQL scripts in the `database` folder:
```bash
psql -U postgres -d inventory_db -f database/schema.sql
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Start the Development Server
```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## AWS Deployment

### Prerequisites
- AWS Account
- Basic knowledge of AWS services (EC2, RDS)

### Step 1: Set Up an RDS PostgreSQL Instance
1. Log in to the AWS Management Console.
2. Navigate to RDS and create a new PostgreSQL database instance.
3. Make note of the endpoint, port, username, password, and database name.

### Step 2: Set Up an EC2 Instance
1. Navigate to EC2 and launch a new instance (Amazon Linux 2 is recommended).
2. Configure security groups to allow inbound traffic on ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
3. Connect to your instance via SSH.

### Step 3: Install Required Software on EC2
```bash
# Update system packages
sudo yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2 (for process management)
sudo npm install -g pm2
```

### Step 4: Clone and Set Up the Application
```bash
# Clone the repository
git clone https://your-repository-url.git
cd inventory-management-system

# Create .env file
cat > .env << EOF
# Database Configuration
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=inventory_db

# Application Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret
EOF

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 5: Set Up Nginx as a Reverse Proxy
```bash
# Install Nginx
sudo amazon-linux-extras install nginx1

# Configure Nginx
sudo nano /etc/nginx/conf.d/inventory.conf
```

Add the following configuration:
```
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start Nginx and enable it on boot
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Start the Application with PM2
```bash
# Start the application
pm2 start npm --name "inventory-app" -- start

# Set PM2 to start on boot
pm2 save
pm2 startup
```

### Step 7: Set Up SSL with Let's Encrypt (Optional)
```bash
# Install certbot
sudo amazon-linux-extras install epel -y
sudo yum install -y certbot python2-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Set up automatic renewal
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

## Database Integration Notes

The application uses an ORM (Object-Relational Mapping) layer to interact with the PostgreSQL database. The configuration for this is in the `src/services/dbService.ts` file.

### Key Database-Related Files:
- `src/services/dbService.ts`: Database connection and operations
- `src/types/index.ts`: TypeScript interfaces that map to database tables
- `database/schema.sql`: SQL schema for creating the database tables

## Troubleshooting

### Database Connection Issues
- Verify your database credentials in the `.env` file
- Ensure the database server is running and accessible
- Check that the security group/firewall allows connections to the database port

### Application Not Starting
- Check the logs: `npm run dev` for local development or `pm2 logs` on the server
- Verify all dependencies are installed: `npm install`
- Ensure Node.js version is compatible: `node -v`

### Performance Issues
- Consider adding indexes to frequently queried database columns
- Implement database connection pooling
- Use AWS CloudFront as a CDN for static assets

## Support and Maintenance

For ongoing support and maintenance:
- Regularly update dependencies: `npm audit fix`
- Back up the database regularly
- Monitor server resources using AWS CloudWatch
- Set up alerts for critical issues

## Additional Resources
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
