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
    
    // Update last login time
    await pool.query(
      'UPDATE users SET updated_at = NOW() WHERE id = $1',
      [user.id]
    );
    
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
      sales: row.sales || 0,
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
      sales: row.sales || 0,
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
      sales: row.sales || 0,
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
      SELECT sh.*, p.name as product_name, u.name as user_name
      FROM stock_history sh
      LEFT JOIN products p ON sh.product_id = p.id
      LEFT JOIN users u ON sh.user_id = u.id::text
      ORDER BY sh.timestamp DESC
    `);
    
    const history = result.rows.map(row => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: row.product_name || row.product_name,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.user_id,
      userName: row.user_name || row.user_name,
      timestamp: row.timestamp,
      reason: row.reason
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
      LEFT JOIN users u ON sh.user_id = u.id::text
      WHERE sh.product_id = $1
      ORDER BY sh.timestamp DESC
    `, [productId]);
    
    const history = result.rows.map(row => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: row.product_name || row.product_name,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.user_id,
      userName: row.user_name || row.user_name,
      timestamp: row.timestamp,
      reason: row.reason
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
      userId, userName, reason 
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO stock_history 
      (product_id, previous_stock, new_stock, change_amount, user_id, user_name, reason, timestamp) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
      RETURNING *
    `, [
      productId, 
      previousStock, 
      newStock, 
      changeAmount, 
      userId,
      userName,
      reason
    ]);
    
    const row = result.rows[0];
    const stockHistory = {
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: row.product_name || '',
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.user_id,
      userName: row.user_name || '',
      timestamp: row.timestamp,
      reason: row.reason
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
      whatsapp: row.whatsapp || row.phone,
      address: row.address,
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
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

app.post('/api/customers', async (req, res) => {
  try {
    const {
      name, email, phone, whatsapp, address, city, state, pincode
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO customers
      (name, email, phone, whatsapp, address, city, state, pincode)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, email, phone, whatsapp || phone, address, city, state, pincode]);
    
    const row = result.rows[0];
    const customer = {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp || row.phone,
      address: row.address,
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      orders: []
    };
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, whatsapp, address, city, state, pincode, category
    } = req.body;
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        error: 'Name and phone are required fields' 
      });
    }
    
    const result = await pool.query(`
      UPDATE customers
      SET name = $1, email = $2, phone = $3, whatsapp = $4, 
          address = $5, city = $6, state = $7, pincode = $8, 
          category_id = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [name, email, phone, whatsapp || phone, address, city, state, pincode, category || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const updatedCustomer = {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      whatsapp: result.rows[0].whatsapp || result.rows[0].phone,
      address: result.rows[0].address,
      city: result.rows[0].city || '',
      state: result.rows[0].state || '',
      pincode: result.rows[0].pincode || '',
      category: result.rows[0].category_id ? result.rows[0].category_id.toString() : undefined,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      orders: []  // We'll need to query orders separately
    };
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error(`Error updating customer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer has orders
    const ordersResult = await pool.query(
      'SELECT COUNT(*) FROM orders WHERE customer_id = $1',
      [id]
    );
    
    if (parseInt(ordersResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing orders' 
      });
    }
    
    const result = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting customer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

app.put('/api/customers/batch', async (req, res) => {
  try {
    const customers = req.body;
    
    if (!Array.isArray(customers)) {
      return res.status(400).json({ error: 'Expected an array of customers' });
    }
    
    // Update each customer
    for (const customer of customers) {
      await pool.query(`
        UPDATE customers
        SET name = $1, email = $2, phone = $3, whatsapp = $4, 
            address = $5, city = $6, state = $7, pincode = $8, updated_at = NOW()
      `, [
        customer.name, 
        customer.email, 
        customer.phone, 
        customer.whatsapp || customer.phone, 
        customer.address, 
        customer.city, 
        customer.state, 
        customer.pincode, 
        customer.id
      ]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating customers in batch:', error);
    res.status(500).json({ error: 'Failed to update customers' });
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
      password: row.password,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      active: row.active,
      phone: row.phone,
      permissions: row.permissions || {
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

app.post('/api/users', async (req, res) => {
  try {
    const {
      name, email, password, role, permissions, active, phone
    } = req.body;
    
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const result = await pool.query(`
      INSERT INTO users
      (name, email, password_hash, password, role, permissions, active, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      name, 
      email, 
      '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm', // Dummy hash
      password, 
      role, 
      JSON.stringify(permissions), 
      active,
      phone
    ]);
    
    const row = result.rows[0];
    const user = {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      active: row.active,
      phone: row.phone,
      permissions: row.permissions
    };
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, password, role, permissions, active, phone
    } = req.body;
    
    let queryParams = [
      name, email, role, JSON.stringify(permissions), active, phone, id
    ];
    
    let query = `
      UPDATE users
      SET name = $1, email = $2, role = $3, permissions = $4, active = $5, phone = $6, updated_at = NOW()
    `;
    
    // Include password in update only if provided
    if (password) {
      query += `, password_hash = $7, password = $8 WHERE id = $9`;
      queryParams = [
        name, email, role, JSON.stringify(permissions), active, phone,
        '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm', // Dummy hash
        password, id
      ];
    } else {
      query += ` WHERE id = $7`;
    }
    
    const result = await pool.query(query, queryParams);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the last admin
    const adminCountResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin' AND active = true"
    );
    
    const userRoleResult = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [id]
    );
    
    if (userRoleResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isAdmin = userRoleResult.rows[0].role === 'admin';
    const adminCount = parseInt(adminCountResult.rows[0].count);
    
    if (isAdmin && adminCount <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last admin user' 
      });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/users/batch', async (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Expected an array of users' });
    }
    
    // Update each user
    for (const user of users) {
      let queryParams = [
        user.name, user.email, user.role, 
        JSON.stringify(user.permissions), 
        user.active, 
        user.phone || null,
        user.id
      ];
      
      let query = `
        UPDATE users
        SET name = $1, email = $2, role = $3, permissions = $4, active = $5, phone = $6, updated_at = NOW()
      `;
      
      // Include password in update only if changed
      if (user.password && !user.password.startsWith('$2a$')) {
        query += `, password_hash = $7, password = $8 WHERE id = $9`;
        queryParams = [
          user.name, user.email, user.role, 
          JSON.stringify(user.permissions), 
          user.active, 
          user.phone || null,
          '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm', // Dummy hash
          user.password, 
          user.id
        ];
      } else {
        query += ` WHERE id = $7`;
      }
      
      await pool.query(query, queryParams);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating users in batch:', error);
    res.status(500).json({ error: 'Failed to update users' });
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
        price: parseFloat(item.unit_price),
        discount: parseFloat(item.discount || 0),
        taxAmount: parseFloat(item.tax_amount || 0)
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
      subtotal: parseFloat(row.subtotal || 0),
      discountTotal: parseFloat(row.discount_total || 0),
      taxTotal: parseFloat(row.tax_total || 0),
      applyTax: row.apply_tax || false,
      transactionId: row.transaction_id || '',
      status: row.status,
      trackingId: row.tracking_id || '',
      trackingUrl: row.tracking_url || '',
      dispatchImage: row.dispatch_image || '',
      notes: row.notes || '',
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

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerId, items, totalAmount, subtotal, discountTotal, taxTotal,
      applyTax, transactionId, status, notes, createdBy
    } = req.body;
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create the order
      const orderResult = await client.query(`
        INSERT INTO orders
        (customer_id, total_amount, subtotal, discount_total, tax_total, apply_tax, 
         transaction_id, status, notes, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        customerId, totalAmount, subtotal, discountTotal, taxTotal,
        applyTax, transactionId, status, notes, createdBy
      ]);
      
      const orderId = orderResult.rows[0].id;
      
      // Insert order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items
          (order_id, product_id, product_name, quantity, unit_price, 
           discount, tax_amount, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          orderId,
          item.productId,
          item.product.name,
          item.quantity,
          item.price,
          item.discount || 0,
          item.taxAmount || 0,
          (item.price * item.quantity) - (item.discount || 0) + (item.taxAmount || 0)
        ]);
        
        // Update product stock
        await client.query(`
          UPDATE products
          SET stock = stock - $1, sales = sales + $1, updated_at = NOW()
          WHERE id = $2
        `, [item.quantity, item.productId]);
      }
      
      await client.query('COMMIT');
      
      const newOrder = {
        id: orderId.toString(),
        customerId,
        items,
        totalAmount,
        subtotal,
        discountTotal,
        taxTotal,
        applyTax,
        transactionId,
        status,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: createdBy ? createdBy.toString() : ''
      };
      
      res.status(201).json(newOrder);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, trackingId, trackingUrl, dispatchImage, notes
    } = req.body;
    
    const result = await pool.query(`
      UPDATE orders
      SET status = $1, tracking_id = $2, tracking_url = $3, 
          dispatch_image = $4, notes = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [status, trackingId, trackingUrl, dispatchImage, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating order ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.put('/api/orders/batch', async (req, res) => {
  try {
    const orders = req.body;
    
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Expected an array of orders' });
    }
    
    // Update each order
    for (const order of orders) {
      await pool.query(`
        UPDATE orders
        SET status = $1, tracking_id = $2, tracking_url = $3,
            dispatch_image = $4, notes = $5, updated_at = NOW()
        WHERE id = $6
      `, [
        order.status,
        order.trackingId || null,
        order.trackingUrl || null,
        order.dispatchImage || null,
        order.notes || null,
        order.id
      ]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating orders in batch:', error);
    res.status(500).json({ error: 'Failed to update orders' });
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
      name: row.name || row.company_name,
      appName: row.app_name || row.company_name,
      address: row.address,
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      phone: row.phone,
      email: row.email,
      taxId: row.tax_id,
      logoUrl: row.logo_url,
      logo: row.logo || row.logo_url,
      website: row.website || '',
      currency: row.currency,
      socialMedia: row.social_media || { facebook: '', instagram: '', twitter: '' }
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ error: 'Failed to fetch company settings' });
  }
});

app.put('/api/company-settings', async (req, res) => {
  try {
    const {
      companyName, name, appName, address, city, state, pincode,
      phone, email, taxId, logoUrl, logo, website, currency, socialMedia
    } = req.body;
    
    // Check if settings exist
    const checkResult = await pool.query('SELECT COUNT(*) FROM company_settings');
    const exists = parseInt(checkResult.rows[0].count) > 0;
    
    let result;
    if (exists) {
      result = await pool.query(`
        UPDATE company_settings
        SET company_name = $1, name = $2, app_name = $3, address = $4, 
            city = $5, state = $6, pincode = $7, phone = $8, email = $9, 
            tax_id = $10, logo_url = $11, logo = $12, website = $13, 
            currency = $14, social_media = $15, updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `, [
        companyName, name, appName, address, city, state, pincode,
        phone, email, taxId, logoUrl, logo, website, currency, 
        JSON.stringify(socialMedia)
      ]);
    } else {
      result = await pool.query(`
        INSERT INTO company_settings
        (company_name, name, app_name, address, city, state, pincode, 
         phone, email, tax_id, logo_url, logo, website, currency, social_media)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        companyName, name, appName, address, city, state, pincode,
        phone, email, taxId, logoUrl, logo, website, currency, 
        JSON.stringify(socialMedia)
      ]);
    }
    
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to update company settings' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ error: 'Failed to update company settings' });
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

// Add a new API endpoint to validate database tables
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
