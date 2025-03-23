
-- Database Schema for Apparel Management System

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password VARCHAR(100) NOT NULL, -- Plain password for demo purposes only
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    active BOOLEAN DEFAULT TRUE,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    tax_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock History Table
CREATE TABLE stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Categories Table
CREATE TABLE customer_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    category_id INTEGER REFERENCES customer_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'packed', 'dispatched', 'out-for-delivery', 'delivered', 'cancelled')),
    total_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_address TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    tax_percentage DECIMAL(5, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Campaigns Table
CREATE TABLE marketing_campaigns (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    budget DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'draft',
    target_category_id INTEGER REFERENCES customer_categories(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Settings Table
CREATE TABLE company_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    tax_id VARCHAR(50),
    logo_url TEXT,
    currency VARCHAR(3) DEFAULT 'INR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (name, email, password_hash, password, role, active, permissions) 
VALUES (
    'Admin User', 
    'admin@example.com', 
    '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm', 
    'password', 
    'admin',
    TRUE,
    '{"canViewDashboard":true,"canManageProducts":true,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":true,"canExportData":true,"canSendMarketing":true,"canViewReports":true}'
);

-- Insert default manager user
INSERT INTO users (name, email, password_hash, password, role, active, permissions) 
VALUES (
    'Manager User', 
    'manager@example.com', 
    '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm', 
    'password', 
    'manager',
    TRUE,
    '{"canViewDashboard":true,"canManageProducts":true,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":false,"canExportData":true,"canSendMarketing":true,"canViewReports":true}'
);

-- Insert default employee user
INSERT INTO users (name, email, password_hash, password, role, active, permissions) 
VALUES (
    'Employee User', 
    'employee@example.com', 
    '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm', 
    'password', 
    'employee',
    TRUE,
    '{"canViewDashboard":true,"canManageProducts":false,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":false,"canExportData":false,"canSendMarketing":false,"canViewReports":false}'
);

-- Insert default customer categories
INSERT INTO customer_categories (name, description, discount_percentage)
VALUES 
('Regular', 'Regular customers', 0),
('Silver', 'Silver tier customers', 5),
('Gold', 'Gold tier customers', 10),
('Platinum', 'Platinum tier VIP customers', 15);

-- Insert default company settings
INSERT INTO company_settings (company_name, address, phone, email, tax_id, currency)
VALUES ('Apparel Management System', '123 Main Street, City, Country', '+91-1234567890', 'contact@apparelmgmt.com', 'TAX12345678', 'INR');

-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customers_category_id ON customers(category_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX idx_stock_history_timestamp ON stock_history(timestamp);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customer_categories_modtime BEFORE UPDATE ON customer_categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_marketing_campaigns_modtime BEFORE UPDATE ON marketing_campaigns FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_company_settings_modtime BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

