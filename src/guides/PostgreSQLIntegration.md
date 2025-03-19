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

Connect to your database and run the following SQL to create the necessary tables:

```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category VARCHAR(50),
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  sales INTEGER DEFAULT 0,
  tax_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  pincode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) REFERENCES customers(id),
  subtotal DECIMAL(10, 2),
  discount_total DECIMAL(10, 2) DEFAULT 0,
  tax_total DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  apply_tax BOOLEAN DEFAULT TRUE,
  transaction_id VARCHAR(100),
  status VARCHAR(20) NOT NULL,
  tracking_id VARCHAR(100),
  tracking_url TEXT,
  dispatch_image TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(id),
  product_id VARCHAR(50) REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  user_name VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(20) NOT NULL,
  entity_id VARCHAR(50),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  company_name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(100),
  gst_number VARCHAR(30),
  bank_details JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 4: Update Application to Use PostgreSQL

1. Install required packages:
   ```
   npm install pg pg-promise dotenv
   ```

2. Create a `.env` file in the project root:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=inventory_management
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   ```

3. Update `dbService.ts` to use PostgreSQL instead of localStorage:

```typescript
import pgPromise from 'pg-promise';
import { Product, Customer, Order, User, CompanySettings } from '@/types';

// Initialize pg-promise
const pgp = pgPromise();

// Database connection details
const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'inventory_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
});

// Products
export const getProducts = async (): Promise<Product[]> => {
  return await db.any(`
    SELECT * FROM products ORDER BY name
  `);
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'id', 'name', 'description', 'price', 'image_url', 'category',
    'stock', 'sku', 'is_available', 'sales', 'tax_percentage',
    { name: 'created_at', mod: ':raw' },
    { name: 'updated_at', mod: ':raw' }
  ], { table: 'products' });
  
  // Format data for insertion
  const formattedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl,
    category: p.category,
    stock: p.stock,
    sku: p.sku,
    is_available: p.isAvailable,
    sales: p.sales,
    tax_percentage: p.taxPercentage,
    created_at: 'CURRENT_TIMESTAMP',
    updated_at: 'CURRENT_TIMESTAMP'
  }));
  
  // Generate the query
  const query = pgp.helpers.insert(formattedProducts, cs) + 
    ' ON CONFLICT (id) DO UPDATE SET ' +
    cs.columns.filter(c => c.name !== 'id').map(c => 
      `${c.name} = EXCLUDED.${c.name}`
    ).join(', ');
  
  await db.none(query);
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  return await db.any(`
    SELECT * FROM customers ORDER BY name
  `);
};

export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'id', 'name', 'email', 'phone', 'whatsapp', 'address',
    'city', 'state', 'pincode',
    { name: 'created_at', mod: ':raw' },
    { name: 'updated_at', mod: ':raw' }
  ], { table: 'customers' });
  
  // Format data for insertion
  const formattedCustomers = customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    whatsapp: c.whatsapp,
    address: c.address,
    city: c.city,
    state: c.state,
    pincode: c.pincode,
    created_at: 'CURRENT_TIMESTAMP',
    updated_at: 'CURRENT_TIMESTAMP'
  }));
  
  // Generate the query
  const query = pgp.helpers.insert(formattedCustomers, cs) + 
    ' ON CONFLICT (id) DO UPDATE SET ' +
    cs.columns.filter(c => c.name !== 'id').map(c => 
      `${c.name} = EXCLUDED.${c.name}`
    ).join(', ');
  
  await db.none(query);
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  return await db.any(`
    SELECT * FROM orders ORDER BY created_at DESC
  `);
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'id', 'customer_id', 'subtotal', 'discount_total', 'tax_total',
    'total_amount', 'apply_tax', 'transaction_id', 'status',
    'tracking_id', 'tracking_url', 'dispatch_image', 'notes',
    { name: 'created_at', mod: ':raw' },
    { name: 'updated_at', mod: ':raw' }
  ], { table: 'orders' });
  
  // Format data for insertion
  const formattedOrders = orders.map(o => ({
    id: o.id,
    customer_id: o.customerId,
    subtotal: o.subtotal,
    discount_total: o.discountTotal,
    tax_total: o.taxTotal,
    total_amount: o.totalAmount,
    apply_tax: o.applyTax,
    transaction_id: o.transactionId,
    status: o.status,
    tracking_id: o.trackingId,
    tracking_url: o.trackingUrl,
    dispatch_image: o.dispatchImage,
    notes: o.notes,
    created_at: 'CURRENT_TIMESTAMP',
    updated_at: 'CURRENT_TIMESTAMP'
  }));
  
  // Generate the query
  const query = pgp.helpers.insert(formattedOrders, cs) + 
    ' ON CONFLICT (id) DO UPDATE SET ' +
    cs.columns.filter(c => c.name !== 'id').map(c => 
      `${c.name} = EXCLUDED.${c.name}`
    ).join(', ');
  
  await db.none(query);
};

// Order Items
export const getOrderItems = async (orderId: string): Promise<any[]> => {
  return await db.any(`
    SELECT * FROM order_items WHERE order_id = $1
  `, orderId);
};

export const saveOrderItems = async (orderItems: any[]): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'id', 'order_id', 'product_id', 'quantity', 'price', 'discount', 'tax_amount',
    { name: 'created_at', mod: ':raw' },
    { name: 'updated_at', mod: ':raw' }
  ], { table: 'order_items' });
  
  // Format data for insertion
  const formattedOrderItems = orderItems.map(oi => ({
    id: oi.id,
    order_id: oi.order_id,
    product_id: oi.product_id,
    quantity: oi.quantity,
    price: oi.price,
    discount: oi.discount,
    tax_amount: oi.tax_amount,
    created_at: 'CURRENT_TIMESTAMP',
    updated_at: 'CURRENT_TIMESTAMP'
  }));
  
  // Generate the query
  const query = pgp.helpers.insert(formattedOrderItems, cs) + 
    ' ON CONFLICT (id) DO UPDATE SET ' +
    cs.columns.filter(c => c.name !== 'id').map(c => 
      `${c.name} = EXCLUDED.${c.name}`
    ).join(', ');
  
  await db.none(query);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  return await db.any(`
    SELECT * FROM users ORDER BY name
  `);
};

export const saveUsers = async (users: User[]): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'id', 'name', 'email', 'password', 'role', 'active', 'permissions',
    { name: 'created_at', mod: ':raw' },
    { name: 'updated_at', mod: ':raw' }
  ], { table: 'users' });
  
  // Format data for insertion
  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
    active: u.active,
    permissions: u.permissions,
    created_at: 'CURRENT_TIMESTAMP',
    updated_at: 'CURRENT_TIMESTAMP'
  }));
  
  // Generate the query
  const query = pgp.helpers.insert(formattedUsers, cs) + 
    ' ON CONFLICT (id) DO UPDATE SET ' +
    cs.columns.filter(c => c.name !== 'id').map(c => 
      `${c.name} = EXCLUDED.${c.name}`
    ).join(', ');
  
  await db.none(query);
};

// Activity Logs
export const saveActivityLogs = async (logs: any[]): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'id', 'user_id', 'user_name', 'action', 'entity_type', 'entity_id', 'details',
    { name: 'timestamp', mod: ':raw' }
  ], { table: 'activity_logs' });
  
  // Format data for insertion
  const formattedLogs = logs.map(log => ({
    id: log.id,
    user_id: log.userId,
    user_name: log.userName,
    action: log.action,
    entity_type: log.entityType,
    entity_id: log.entityId,
    details: log.details,
    timestamp: 'CURRENT_TIMESTAMP'
  }));
  
  // Generate the query
  const query = pgp.helpers.insert(formattedLogs, cs) + 
    ' ON CONFLICT (id) DO UPDATE SET ' +
    cs.columns.filter(c => c.name !== 'id').map(c => 
      `${c.name} = EXCLUDED.${c.name}`
    ).join(', ');
  
  await db.none(query);
};

// Company Settings
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  return await db.oneOrNone(`
    SELECT * FROM company_settings WHERE id = 1
  `);
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<void> => {
  const cs = new pgp.helpers.ColumnSet([
    'company_name', 'logo_url', 'address', 'phone', 'email', 'website', 'gst_number', 'bank_details',
    { name: 'updated_at', mod: ':raw' }
  ], { table: 'company_settings' });
  
  // Format data for insertion
  const formattedSettings = {
    company_name: settings.companyName,
    logo_url: settings.logoUrl,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    gst_number: settings.gstNumber,
    bank_details: settings.bankDetails,
    updated_at: 'CURRENT_TIMESTAMP'
  };
  
  // Generate the query
  const query = pgp.helpers.update(formattedSettings, cs, null, 'company_settings') + 
    ' WHERE id = 1';
  
  await db.none(query);
};

// Initialization
export const initializeDatabase = async (
  products: Product[],
  customers: Customer[],
  orders: Order[],
  users: User[]
): Promise<void> => {
  try {
    await saveProducts(products);
    await saveCustomers(customers);
    await saveOrders(orders);
    await saveUsers(users);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};
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
2. Create your database and tables using the same SQL from the local setup

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

1. Create a migration script to transfer data:

```typescript
import { getProducts, saveProducts, getCustomers, saveCustomers, /* other imports */ } from '@/services/dbService';

const migrateData = async () => {
  // Get data from localStorage
  const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
  const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
  // ...other data
  
  try {
    // Save to PostgreSQL
    await saveProducts(localProducts);
    await saveCustomers(localCustomers);
    // ...other data
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

migrateData();
```

2. Run this script once to migrate existing data
3. Update your application to use PostgreSQL for all operations
4. Test thoroughly before deploying to production

## Conclusion

This guide provides a basic setup for PostgreSQL integration. You may need to adapt it based on your specific requirements and infrastructure. For production environments, consider adding:

- Connection pooling
- Proper error handling and retries
- Logging and monitoring
- Backup strategies
- Performance optimizations

For more advanced setups, consider using an ORM like TypeORM, Prisma, or Sequelize, which can simplify database operations and migrations.
