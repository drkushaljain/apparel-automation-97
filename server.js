
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoint to check database connection
app.get('/api/db-status', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    res.status(200).json({ 
      connected: true, 
      type: 'postgres',
      message: 'Connected to PostgreSQL database',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      connected: false, 
      type: 'postgres',
      message: 'Failed to connect to PostgreSQL database',
      error: error.message
    });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    
    // Convert PostgreSQL data types to JavaScript
    const products = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      isAvailable: row.is_available,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sales: 0, // This would be calculated from orders
      sku: row.sku
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const row = result.rows[0];
    const product = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      isAvailable: row.is_available,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sales: 0, // This would be calculated from orders
      sku: row.sku
    };
    
    res.json(product);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { 
      name, description, price, imageUrl, category, stock, 
      isAvailable, sku 
    } = req.body;
    
    const result = await pool.query(
      'INSERT INTO products (name, description, price, image_url, category, stock, is_available, sku) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, price, imageUrl, category, stock, isAvailable, sku]
    );
    
    const row = result.rows[0];
    const product = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      isAvailable: row.is_available,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sales: 0,
      sku: row.sku
    };
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, price, imageUrl, category, stock, 
      isAvailable, sku 
    } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, category = $5, stock = $6, is_available = $7, sku = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
      [name, description, price, imageUrl, category, stock, isAvailable, sku, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Stock History API
app.get('/api/stock-history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM stock_history 
      ORDER BY created_at DESC
    `);
    
    const history = result.rows.map(row => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: '', // We'll get this from a join in a real implementation
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.created_by ? row.created_by.toString() : '',
      userName: '', // We'll get this from a join in a real implementation
      timestamp: row.created_at,
      reason: row.notes
    }));
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

app.get('/api/stock-history/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const result = await pool.query(`
      SELECT sh.*, p.name as product_name, u.name as user_name
      FROM stock_history sh
      LEFT JOIN products p ON sh.product_id = p.id
      LEFT JOIN users u ON sh.created_by = u.id
      WHERE sh.product_id = $1
      ORDER BY sh.created_at DESC
    `, [productId]);
    
    const history = result.rows.map(row => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: row.product_name,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.created_by ? row.created_by.toString() : '',
      userName: row.user_name || '',
      timestamp: row.created_at,
      reason: row.notes
    }));
    
    res.json(history);
  } catch (error) {
    console.error(`Error fetching stock history for product ${req.params.productId}:`, error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

app.post('/api/stock-history', async (req, res) => {
  try {
    const { 
      productId, previousStock, newStock, changeAmount, 
      userId, reason 
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO stock_history 
      (product_id, previous_stock, new_stock, change_amount, transaction_type, notes, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `, [
      productId, 
      previousStock, 
      newStock, 
      changeAmount, 
      changeAmount > 0 ? 'increase' : 'decrease', 
      reason, 
      userId
    ]);
    
    const row = result.rows[0];
    const stockHistory = {
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: '', // We'll get this in a real implementation
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.created_by ? row.created_by.toString() : '',
      userName: '', // We'll get this in a real implementation
      timestamp: row.created_at,
      reason: row.notes
    };
    
    res.status(201).json(stockHistory);
  } catch (error) {
    console.error('Error adding stock history:', error);
    res.status(500).json({ error: 'Failed to add stock history' });
  }
});

// Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, array_agg(o.id) as order_ids
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    
    const customers = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.phone, // Using phone for WhatsApp if it's the same
      address: row.address,
      city: '', // These fields might be in separate columns or part of address
      state: '',
      pincode: '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      orders: row.order_ids.filter(id => id !== null).map(id => id.toString())
    }));
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY name');
    
    const users = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: 'password', // Don't send real password to client
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      active: true,
      permissions: {
        canViewDashboard: row.role === "admin",
        canManageProducts: row.role !== "employee",
        canManageOrders: true,
        canManageCustomers: true,
        canManageUsers: row.role === "admin",
        canExportData: row.role !== "employee",
        canSendMarketing: row.role !== "employee",
        canViewReports: row.role !== "employee",
      }
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.order_date DESC
    `);
    
    // Get all order items in a separate query
    const itemsResult = await pool.query(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
    `);
    
    // Create a map of order items by order_id
    const itemsByOrder = {};
    itemsResult.rows.forEach(item => {
      const orderId = item.order_id.toString();
      if (!itemsByOrder[orderId]) {
        itemsByOrder[orderId] = [];
      }
      
      itemsByOrder[orderId].push({
        id: item.id.toString(),
        productId: item.product_id.toString(),
        product: {
          id: item.product_id.toString(),
          name: item.product_name,
          imageUrl: item.image_url,
          price: parseFloat(item.unit_price)
        },
        quantity: item.quantity,
        price: parseFloat(item.unit_price)
      });
    });
    
    const orders = result.rows.map(row => ({
      id: row.id.toString(),
      customerId: row.customer_id.toString(),
      customer: {
        id: row.customer_id.toString(),
        name: row.customer_name
      },
      items: itemsByOrder[row.id.toString()] || [],
      totalAmount: parseFloat(row.total_amount),
      transactionId: row.payment_method,
      status: row.status,
      trackingId: row.tracking_id || '',
      trackingUrl: '',
      dispatchImage: '',
      createdAt: row.order_date,
      updatedAt: row.updated_at,
      createdBy: row.created_by ? row.created_by.toString() : ''
    }));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Company Settings API
app.get('/api/company-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company settings not found' });
    }
    
    const row = result.rows[0];
    const settings = {
      id: row.id.toString(),
      companyName: row.company_name,
      address: row.address,
      phone: row.phone,
      email: row.email,
      taxId: row.tax_id,
      logoUrl: row.logo_url,
      currency: row.currency
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ error: 'Failed to fetch company settings' });
  }
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use the PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
  
  // Log environment info
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Using PostgreSQL: ${process.env.USE_POSTGRES || 'true'}`);
  
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not set');
  }
});
