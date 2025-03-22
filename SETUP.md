
# Installation Guide for Apparel Management System

This guide will help you set up the Apparel Management System on your local machine or AWS server.

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional, for database integration)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd apparel-management-system
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
# DATABASE_URL=postgresql://username:password@localhost:5432/apparel_management
```

### Step 4: Build the Application

```bash
npm run build
# or
yarn build
```

### Step 5: Run the Application

For development:
```bash
npm run dev
# or
yarn dev
```

For production:
```bash
node server.js
```

The application will be available at `http://localhost:3000`.

## PostgreSQL Integration

To use PostgreSQL instead of browser localStorage:

1. Install PostgreSQL and create a database
   ```bash
   # Ubuntu
   sudo apt install postgresql postgresql-contrib
   sudo -u postgres createdb apparel_management
   
   # macOS (with Homebrew)
   brew install postgresql
   createdb apparel_management
   ```

2. Set `USE_POSTGRES=true` in your `.env` file

3. Set `DATABASE_URL` to your PostgreSQL connection string in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/apparel_management
   ```

4. Run the database schema setup script:
   ```bash
   psql -U your_username -d apparel_management -f database/schema.sql
   ```

## AWS Deployment

### Option 1: EC2 Deployment

#### Step 1: Launch an EC2 Instance

1. Log in to the AWS Management Console and open the EC2 dashboard
2. Click "Launch Instance"
3. Choose Amazon Linux 2023 or Ubuntu 22.04 LTS
4. Select an instance type (t2.micro is eligible for free tier)
5. Configure security groups to allow:
   - HTTP (port 80)
   - HTTPS (port 443)
   - SSH (port 22)
6. Create and download your key pair
7. Launch the instance

#### Step 2: Connect to Your EC2 Instance

```bash
ssh -i your-key-pair.pem ec2-user@your-instance-public-dns
# or for Ubuntu:
ssh -i your-key-pair.pem ubuntu@your-instance-public-dns
```

#### Step 3: Install Node.js and Git

For Amazon Linux 2023:
```bash
sudo dnf update -y
sudo dnf install -y git
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
sudo dnf install -y nodejs
```

For Ubuntu:
```bash
sudo apt update
sudo apt install -y git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 4: Set Up PostgreSQL

##### Option A: Using Amazon RDS
1. Create a PostgreSQL database instance in RDS
2. Configure security groups to allow connections from your EC2 instance
3. Note the database endpoint, username, and password

##### Option B: Installing PostgreSQL on EC2
For Amazon Linux 2023:
```bash
sudo dnf install -y postgresql postgresql-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

For Ubuntu:
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Configure PostgreSQL:
```bash
sudo -u postgres psql

# In the PostgreSQL prompt:
CREATE DATABASE apparel_management;
CREATE USER apparel_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE apparel_management TO apparel_user;
\q

# Import the schema
sudo -u postgres psql -d apparel_management -f /path/to/database/schema.sql
```

#### Step 5: Clone and Configure the Application

```bash
git clone <repository-url>
cd apparel-management-system
npm install
```

Create a `.env` file:
```
PORT=80
USE_POSTGRES=true
DATABASE_URL=postgresql://apparel_user:your_password@localhost:5432/apparel_management
# Or if using RDS:
# DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/apparel_management
```

#### Step 6: Build and Run the Application

```bash
npm run build
sudo npm install -g pm2
pm2 start server.js
```

Configure PM2 to start on boot:
```bash
pm2 startup
pm2 save
```

### Option 2: Containerized Deployment (Docker and ECS)

#### Prerequisites
- Docker installed locally
- AWS CLI configured with appropriate permissions

#### Step 1: Create a Dockerfile in your project root

```Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Step 2: Build and Test Docker Image Locally

```bash
docker build -t apparel-management-system .
docker run -p 3000:3000 -e PORT=3000 -e USE_POSTGRES=true -e DATABASE_URL=postgresql://user:pass@host:5432/apparel_management apparel-management-system
```

#### Step 3: Push to Amazon ECR

```bash
# Create an ECR repository
aws ecr create-repository --repository-name apparel-management-system

# Login to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com

# Tag and push your image
docker tag apparel-management-system:latest your-account-id.dkr.ecr.your-region.amazonaws.com/apparel-management-system:latest
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/apparel-management-system:latest
```

#### Step 4: Create ECS Cluster and Task Definition

1. Open the Amazon ECS console
2. Create a new cluster
3. Create a task definition:
   - Use the ECR image you pushed
   - Configure environment variables for database connection
   - Set up port mappings
4. Create a service within your cluster using the task definition

#### Step 5: Set Up Load Balancer and Domain Name (Optional)

1. Create an Application Load Balancer
2. Configure target groups to point to your ECS service
3. Set up Route 53 to point your domain to the load balancer

## SSL Configuration with Let's Encrypt

For production environments, secure your application with HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Backups and Maintenance

### Database Backups

Set up regular PostgreSQL backups:

```bash
# Create a backup script
echo '#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U apparel_user -d apparel_management > "$BACKUP_DIR/backup_$TIMESTAMP.sql"' > /usr/local/bin/backup-db.sh

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab to run daily
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -
```

### Updating the Application

```bash
cd /path/to/apparel-management-system
git pull
npm install
npm run build
pm2 restart server
```

## Troubleshooting

### Database Connection Issues

- Verify the DATABASE_URL is correct
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Check database connectivity: `psql -U apparel_user -h localhost -d apparel_management`

### Application Not Starting

- Check the logs: `pm2 logs`
- Verify the port is not in use: `sudo lsof -i :3000`
- Check Node.js version: `node -v`

### Common Frontend Issues

- Clear browser cache
- Check browser console for JavaScript errors
- Verify file permissions if images aren't loading

## Need Help?

For additional support, please contact the development team.
