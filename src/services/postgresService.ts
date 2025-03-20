
import { Pool, PoolClient } from 'pg';
import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection
export const initPostgresConnection = async () => {
  try {
    // Check if we're running in a browser environment (development mode)
    const isBrowser = typeof window !== 'undefined';
    
    // Only attempt to connect to PostgreSQL in a Node.js environment
    if (!isBrowser) {
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'inventory_db',
      });
      
      // Test the connection
      const client = await pool.connect();
      console.log('Successfully connected to PostgreSQL database');
      client.release();
      
      // Create tables if they don't exist
      await initializeTables();
    }
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    // Fall back to local storage in case of database connection failure
    console.log('Falling back to local storage');
  }
};

// Create necessary database tables
const initializeTables = async () => {
  if (!pool) return;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Products table
    await client.query(`
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
      )
    `);
    
    // Customers table
    await client.query(`
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
      )
    `);
    
    // Users table
    await client.query(`
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
      )
    `);
    
    // Orders table
    await client.query(`
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
      )
    `);
    
    // Order items table
    await client.query(`
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
      )
    `);
    
    // Company settings table
    await client.query(`
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
      )
    `);
    
    // Stock history table
    await client.query(`
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
      )
    `);
    
    // Activity logs table
    await client.query(`
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
      )
    `);
    
    await client.query('COMMIT');
    console.log('Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating database tables:', error);
  } finally {
    client.release();
  }
};

// Generic function to execute a database query
const executeQuery = async <T>(query: string, params: any[] = []): Promise<T[]> => {
  if (!pool) return [];
  
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  } finally {
    client.release();
  }
};

// Products CRUD
export const getProducts = async (): Promise<Product[]> => {
  return executeQuery<Product>('SELECT * FROM products ORDER BY name');
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const products = await executeQuery<Product>('SELECT * FROM products WHERE id = $1', [id]);
  return products.length > 0 ? products[0] : null;
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  if (!pool) return null;
  
  const id = `p${Date.now()}`;
  const client = await pool.connect();
  
  try {
    const { rows } = await client.query(
      `INSERT INTO products (
        id, name, description, price, image_url, category, stock, sku, 
        is_available, sales, tax_percentage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        id, product.name, product.description || null, product.price, 
        product.imageUrl || null, product.category || null, product.stock,
        product.sku || null, product.isAvailable, product.sales || 0,
        product.taxPercentage || null
      ]
    );
    
    return rows[0] as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  } finally {
    client.release();
  }
};

export const updateProduct = async (product: Product): Promise<Product | null> => {
  if (!pool) return null;
  
  const client = await pool.connect();
  
  try {
    const { rows } = await client.query(
      `UPDATE products SET
        name = $1, description = $2, price = $3, image_url = $4,
        category = $5, stock = $6, sku = $7, is_available = $8,
        sales = $9, tax_percentage = $10, updated_at = NOW()
      WHERE id = $11 RETURNING *`,
      [
        product.name, product.description || null, product.price,
        product.imageUrl || null, product.category || null, product.stock,
        product.sku || null, product.isAvailable, product.sales || 0,
        product.taxPercentage || null, product.id
      ]
    );
    
    return rows[0] as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  } finally {
    client.release();
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!pool) return false;
  
  const client = await pool.connect();
  
  try {
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  } finally {
    client.release();
  }
};

// Add more database operations for other entities (Customers, Orders, Users, etc.)
// Implementation follows the same pattern as the Products CRUD operations

// Stock history operations
export const addStockHistory = async (record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> => {
  if (!pool) return null;
  
  const id = `sc${Date.now()}`;
  const client = await pool.connect();
  
  try {
    const { rows } = await client.query(
      `INSERT INTO stock_history (
        id, product_id, product_name, previous_stock, new_stock,
        change_amount, user_id, user_name, reason, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id, record.productId, record.productName, record.previousStock,
        record.newStock, record.changeAmount, record.userId,
        record.userName, record.reason, record.updatedBy || null
      ]
    );
    
    return rows[0] as StockHistoryRecord;
  } catch (error) {
    console.error('Error adding stock history record:', error);
    return null;
  } finally {
    client.release();
  }
};

export const getStockHistoryByProduct = async (productId: string): Promise<StockHistoryRecord[]> => {
  return executeQuery<StockHistoryRecord>(
    'SELECT * FROM stock_history WHERE product_id = $1 ORDER BY timestamp DESC',
    [productId]
  );
};

// Backup and restore methods to support local storage fallback
export const exportToJson = async (): Promise<string> => {
  if (!pool) return '{}';
  
  const client = await pool.connect();
  
  try {
    const products = await executeQuery<Product>('SELECT * FROM products');
    const customers = await executeQuery<Customer>('SELECT * FROM customers');
    const orders = await executeQuery<any>('SELECT * FROM orders');
    const users = await executeQuery<User>('SELECT * FROM users');
    const companySettings = await executeQuery<CompanySettings>('SELECT * FROM company_settings LIMIT 1');
    const stockHistory = await executeQuery<StockHistoryRecord>('SELECT * FROM stock_history');
    
    // Fetch order items for each order
    for (const order of orders) {
      const items = await executeQuery(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      order.items = items;
    }
    
    const data = {
      products,
      customers,
      orders,
      users,
      companySettings: companySettings[0] || null,
      stockHistory
    };
    
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error exporting data to JSON:', error);
    return '{}';
  } finally {
    client.release();
  }
};

export default {
  initPostgresConnection,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Export other functions as needed
  addStockHistory,
  getStockHistoryByProduct,
  exportToJson
};
