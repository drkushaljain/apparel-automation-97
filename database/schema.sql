
-- Schema for Inventory Management System

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(100),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sales INTEGER NOT NULL DEFAULT 0,
  tax_percentage DECIMAL(5, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  phone VARCHAR(50),
  last_login TIMESTAMP,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2),
  discount_total DECIMAL(10, 2),
  tax_total DECIMAL(10, 2),
  apply_tax BOOLEAN DEFAULT TRUE,
  transaction_id VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  tracking_id VARCHAR(100),
  tracking_url TEXT,
  dispatch_image TEXT,
  notes TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  website VARCHAR(255),
  tax_id VARCHAR(100),
  social_media JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Stock History Table
CREATE TABLE IF NOT EXISTS stock_history (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  user_id VARCHAR(50),
  user_name VARCHAR(255) NOT NULL,
  reason TEXT,
  updated_by VARCHAR(255),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50),
  details TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user
INSERT INTO users (
  id, name, email, password, role, active, permissions, created_at, updated_at
) VALUES (
  'u1', 
  'Admin User', 
  'admin@example.com', 
  'password', -- In production, use a proper hashed password
  'admin', 
  TRUE, 
  '{"canViewDashboard": true, "canManageProducts": true, "canManageOrders": true, "canManageCustomers": true, "canManageUsers": true, "canExportData": true, "canSendMarketing": true, "canViewReports": true}', 
  NOW(), 
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
