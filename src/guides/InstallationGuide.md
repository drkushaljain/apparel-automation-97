
# Installation Guide for Inventory Management System

This guide will help you set up the Inventory Management System on your local machine and deploy it to an AWS server with PostgreSQL integration.

## Local Installation

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- PostgreSQL database (optional, the app will fall back to localStorage if not configured)
- Git

### Step 1: Clone the Repository
```bash
git clone https://your-repository-url.git
cd inventory-management-system
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with the following content (only needed if you want PostgreSQL integration):

```
# Database Configuration (optional)
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

### Step 3: Set Up PostgreSQL Database (Optional)
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

## Using the Web Application Without Backend

If you choose not to set up PostgreSQL, the application will automatically use the browser's localStorage for data storage. This is perfect for:
- Development and testing
- Small deployments where a database is not needed
- Demonstrations and presentations

All data will be stored locally in the browser, and will persist between sessions.

## Backend Configuration for Production

### Creating a Server Bundle with PostgreSQL Support

For production deployment with PostgreSQL support, you need to create a server bundle:

1. Build the client application:
```bash
npm run build
```

2. Create a simple Node.js server to host the application:
```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. Install Express:
```bash
npm install express
```

4. Create a package.json script to run the server:
```json
"scripts": {
  "start": "node server.js"
}
```

## AWS Deployment

### Prerequisites
- AWS Account
- Basic knowledge of AWS services (EC2, RDS)

### Step 1: Set Up an RDS PostgreSQL Instance (Optional)
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

# Create .env file if you want PostgreSQL support
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

# Create server.js file as described in the Backend Configuration section
# ...

# Install Express
npm install express
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
# Create server.js (as shown in Backend Configuration section)
# Then start the application
pm2 start server.js --name "inventory-app"

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

## Troubleshooting

### Application Uses localStorage Instead of PostgreSQL
- Make sure you're running in a Node.js environment, not just a browser
- Verify that all environment variables (DB_HOST, etc.) are correctly set
- Check database connection permissions and network settings

### Database Connection Issues
- Verify your database credentials in the `.env` file
- Ensure the database server is running and accessible
- Check that the security group/firewall allows connections to the database port

### Application Not Starting
- Check the logs: `npm run dev` for local development or `pm2 logs` on the server
- Verify all dependencies are installed: `npm install`
- Ensure Node.js version is compatible: `node -v`

## Support and Maintenance

For ongoing support and maintenance:
- Regularly update dependencies: `npm audit fix`
- Back up the database regularly
- Monitor server resources using AWS CloudWatch
- Set up alerts for critical issues
