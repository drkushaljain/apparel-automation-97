import { Pool } from 'pg';
import { ensureUploadDirectories, handleImageUpload } from './fileUpload';

// Initialize the pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
});

// Ensure upload directories exist when the server starts
ensureUploadDirectories();

// Database status check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// PRODUCT FUNCTIONS
export const getAllProducts = async () => {
  const result = await pool.query('SELECT * FROM products ORDER BY name');
  return result.rows;
};

export const getProductById = async (id: string) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createProduct = async (product: any) => {
  // Handle image upload
  const imagePath = handleImageUpload(product.imageUrl, 'products');
  
  const result = await pool.query(
    `INSERT INTO products 
    (name, description, price, image_url, category, stock, sku, is_available, tax_percentage) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [
      product.name,
      product.description,
      product.price,
      imagePath,
      product.category,
      product.stock || 0,
      product.sku,
      product.isAvailable === undefined ? true : product.isAvailable,
      product.taxPercentage || 0
    ]
  );
  
  return result.rows[0];
};

export const updateProduct = async (id: string, product: any) => {
  // Handle image upload
  const imagePath = handleImageUpload(product.imageUrl, 'products');
  
  const result = await pool.query(
    `UPDATE products SET 
      name = $1, 
      description = $2, 
      price = $3, 
      image_url = $4, 
      category = $5, 
      stock = $6, 
      sku = $7, 
      is_available = $8, 
      tax_percentage = $9,
      updated_at = NOW()
    WHERE id = $10 
    RETURNING *`,
    [
      product.name,
      product.description,
      product.price,
      imagePath,
      product.category,
      product.stock,
      product.sku,
      product.isAvailable,
      product.taxPercentage,
      id
    ]
  );
  
  return result.rows[0] || null;
};

export const deleteProduct = async (id: string) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return result.rowCount > 0;
};

// CUSTOMER FUNCTIONS
export const getAllCustomers = async () => {
  const result = await pool.query('SELECT * FROM customers ORDER BY name');
  return result.rows;
};

export const getCustomerById = async (id: string) => {
  const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createCustomer = async (customer: any) => {
  const result = await pool.query(
    `INSERT INTO customers (name, email, phone, whatsapp, address, city, state, pincode, category_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [
      customer.name,
      customer.email,
      customer.phone,
      customer.whatsapp,
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      customer.category_id,
    ]
  );
  return result.rows[0];
};

export const updateCustomer = async (id: string, customer: any) => {
  const result = await pool.query(
    `UPDATE customers SET 
      name = $1, 
      email = $2, 
      phone = $3, 
      whatsapp = $4, 
      address = $5, 
      city = $6, 
      state = $7, 
      pincode = $8,
      category_id = $9,
      updated_at = NOW()
    WHERE id = $10 
    RETURNING *`,
    [
      customer.name,
      customer.email,
      customer.phone,
      customer.whatsapp,
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      customer.category_id,
      id
    ]
  );
  return result.rows[0] || null;
};

export const deleteCustomer = async (id: string) => {
  try {
    // Check if the customer has any associated orders
    const orderCheckResult = await pool.query('SELECT COUNT(*) FROM orders WHERE customer_id = $1', [id]);
    const orderCount = parseInt(orderCheckResult.rows[0].count, 10);

    if (orderCount > 0) {
      // Customer has associated orders, prevent deletion
      console.log(`Customer with ID ${id} has ${orderCount} associated orders and cannot be deleted.`);
      return false;
    }

    // No associated orders, proceed with deletion
    const result = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};

// ORDER FUNCTIONS
export const getAllOrders = async () => {
  const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
  return result.rows;
};

export const getOrderById = async (id: string) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createOrder = async (order: any) => {
  const result = await pool.query(
    `INSERT INTO orders (customer_id, order_date, status, total_amount, subtotal, tax_total, discount_total, apply_tax, transaction_id, tracking_id, tracking_url, dispatch_image, notes, shipping_address, payment_method, payment_status, created_by) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
    RETURNING *`,
    [
      order.customer_id,
      order.order_date,
      order.status,
      order.total_amount,
      order.subtotal,
      order.tax_total,
      order.discount_total,
      order.apply_tax,
      order.transaction_id,
      order.tracking_id,
      order.tracking_url,
      order.dispatch_image,
      order.notes,
      order.shipping_address,
      order.payment_method,
      order.payment_status,
      order.created_by
    ]
  );
  return result.rows[0];
};

export const updateOrder = async (id: string, order: any) => {
  const result = await pool.query(
    `UPDATE orders SET 
      customer_id = $1, 
      order_date = $2, 
      status = $3, 
      total_amount = $4, 
      subtotal = $5, 
      tax_total = $6, 
      discount_total = $7, 
      apply_tax = $8, 
      transaction_id = $9, 
      tracking_id = $10, 
      tracking_url = $11, 
      dispatch_image = $12, 
      notes = $13, 
      shipping_address = $14, 
      payment_method = $15, 
      payment_status = $16,
      updated_at = NOW()
    WHERE id = $17 
    RETURNING *`,
    [
      order.customer_id,
      order.order_date,
      order.status,
      order.total_amount,
      order.subtotal,
      order.tax_total,
      order.discount_total,
      order.apply_tax,
      order.transaction_id,
      order.tracking_id,
      order.tracking_url,
      order.dispatch_image,
      order.notes,
      order.shipping_address,
      order.payment_method,
      order.payment_status,
      id
    ]
  );
  return result.rows[0] || null;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const result = await pool.query(
    `UPDATE orders SET 
      status = $1,
      updated_at = NOW()
    WHERE id = $2 
    RETURNING *`,
    [
      status,
      id
    ]
  );
  return result.rows[0] || null;
};

export const deleteOrder = async (id: string) => {
  const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  return result.rowCount > 0;
};

// USER FUNCTIONS
export const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY name');
  return result.rows;
};

export const getUserById = async (id: string) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createUser = async (user: any) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, password, role, active, permissions, phone) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
    [
      user.name,
      user.email,
      user.password_hash,
      user.password,
      user.role,
      user.active,
      user.permissions,
      user.phone
    ]
  );
  return result.rows[0];
};

export const updateUser = async (id: string, user: any) => {
  const result = await pool.query(
    `UPDATE users SET 
      name = $1, 
      email = $2, 
      password_hash = $3, 
      password = $4, 
      role = $5, 
      active = $6, 
      permissions = $7,
      phone = $8,
      updated_at = NOW()
    WHERE id = $9 
    RETURNING *`,
    [
      user.name,
      user.email,
      user.password_hash,
      user.password,
      user.role,
      user.active,
      user.permissions,
      user.phone,
      id
    ]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id: string) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return result.rowCount > 0;
};

// COMPANY SETTINGS FUNCTIONS
export const getCompanySettings = async () => {
  const result = await pool.query('SELECT * FROM company_settings WHERE id = 1');
  return result.rows[0] || null;
};

export const updateCompanySettings = async (settings: any) => {
  // Handle logo upload
  const logoPath = handleImageUpload(settings.logo, 'company');
  
  const result = await pool.query(
    `UPDATE company_settings SET 
      company_name = $1, 
      name = $2,
      app_name = $3,
      address = $4, 
      city = $5, 
      state = $6, 
      pincode = $7, 
      phone = $8, 
      email = $9, 
      tax_id = $10, 
      logo_url = $11,
      logo = $11,
      website = $12, 
      social_media = $13, 
      currency = $14,
      updated_at = NOW()
    WHERE id = 1 
    RETURNING *`,
    [
      settings.company_name,
      settings.name,
      settings.app_name,
      settings.address,
      settings.city,
      settings.state,
      settings.pincode,
      settings.phone,
      settings.email,
      settings.tax_id,
      logoPath,
      settings.website,
      settings.social_media,
      settings.currency
    ]
  );
  
  return result.rows[0] || null;
};

// STOCK HISTORY FUNCTIONS
export const getStockHistory = async () => {
  const result = await pool.query('SELECT * FROM stock_history ORDER BY timestamp DESC');
  return result.rows;
};

export const addStockHistory = async (record: any) => {
  const result = await pool.query(
    `INSERT INTO stock_history (product_id, product_name, previous_stock, new_stock, change_amount, user_id, user_name, reason, updated_by) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [
      record.product_id,
      record.product_name,
      record.previous_stock,
      record.new_stock,
      record.change_amount,
      record.user_id,
      record.user_name,
      record.reason,
      record.updated_by
    ]
  );
  return result.rows[0];
};

// ACTIVITY LOGS FUNCTIONS
export const getActivityLogs = async () => {
  const result = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC');
  return result.rows;
};

export const addActivityLog = async (log: any) => {
  const result = await pool.query(
    `INSERT INTO activity_logs (user_id, user_name, action, entity_type, entity_id, details, timestamp) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`,
    [
      log.user_id,
      log.user_name,
      log.action,
      log.entity_type,
      log.entity_id,
      log.details,
      log.timestamp
    ]
  );
  return result.rows[0];
};
