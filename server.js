
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to log all API requests
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('WARNING: DATABASE_URL is not set. Using mock data instead.');
}

// Database connection (only if DATABASE_URL is set)
const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    databaseConfigured: !!pool,
    timestamp: new Date().toISOString() 
  });
});

// API endpoint to check database connection
app.get('/api/db-status', async (req, res) => {
  if (!pool) {
    return res.status(503).json({
      connected: false,
      type: 'none',
      message: 'DATABASE_URL not configured',
    });
  }
  
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

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // In a real app, you'd verify the password hash here
    // For demo purposes, we're just checking the plaintext password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Format user response
    const userResponse = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      permissions: user.permissions || {
        canViewDashboard: user.role === "admin",
        canManageProducts: user.role !== "employee",
        canManageOrders: true,
        canManageCustomers: true,
        canManageUsers: user.role === "admin",
        canExportData: user.role !== "employee",
        canSendMarketing: user.role !== "employee",
        canViewReports: user.role !== "employee",
      }
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Add a new API endpoint to initialize the database with basic data if empty
app.post('/api/initialize-db', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  try {
    // Check if users table exists
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (tablesResult.rows.length === 0) {
      // Run the schema.sql to create tables
      const schemaPath = path.join(__dirname, 'database', 'schema.sql');
      const schema = require('fs').readFileSync(schemaPath, 'utf8');
      
      await pool.query(schema);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Database initialized with schema' 
      });
    }
    
    // Check if users table has any records
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(usersResult.rows[0].count) === 0) {
      // Insert default admin user
      await pool.query(`
        INSERT INTO users (name, email, password_hash, password, role, active, permissions)
        VALUES (
          'Admin User',
          'admin@example.com',
          '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm',
          'password',
          'admin',
          true,
          '{"canViewDashboard":true,"canManageProducts":true,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":true,"canExportData":true,"canSendMarketing":true,"canViewReports":true}'
        )
      `);
      
      // Insert default manager user
      await pool.query(`
        INSERT INTO users (name, email, password_hash, password, role, active, permissions)
        VALUES (
          'Manager User',
          'manager@example.com',
          '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm',
          'password',
          'manager',
          true,
          '{"canViewDashboard":true,"canManageProducts":true,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":false,"canExportData":true,"canSendMarketing":true,"canViewReports":true}'
        )
      `);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Default users created' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Database already initialized' 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create an endpoint to validate database tables
app.get('/api/validate-db', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ 
      success: false, 
      message: 'Database not configured',
      tables: []
    });
  }
  
  try {
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Check if we have our essential tables
    const requiredTables = [
      'users', 'products', 'customers', 'orders', 'order_items', 
      'stock_history', 'company_settings'
    ];
    
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      return res.status(200).json({
        success: false,
        message: `Missing required tables: ${missingTables.join(', ')}`,
        tables,
        missingTables
      });
    }
    
    // Check for counts in each table
    const counts = {};
    for (const table of tables) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      counts[table] = parseInt(countResult.rows[0].count);
    }
    
    res.status(200).json({
      success: true,
      message: 'Database schema validated',
      tables,
      counts
    });
  } catch (error) {
    console.error('Database validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
  
  if (!databaseUrl) {
    console.warn('WARNING: DATABASE_URL is not set, database features will not work');
    console.warn('Set DATABASE_URL in your environment to connect to PostgreSQL');
  } else {
    console.log('Using PostgreSQL database with connection URL:', databaseUrl.split('@')[1] || 'hidden');
  }
});
