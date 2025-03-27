
import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
import { 
  Product, 
  Customer, 
  Order, 
  User, 
  CompanySettings, 
  StockHistoryRecord, 
  OrderItem,
  OrderStatus,
  ActivityLog
} from '../types';

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/apparel',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute SQL queries
async function query(text: string, params?: any[]): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// API HANDLERS FOR PRODUCTS

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const result = await query(`
      SELECT * FROM products
      ORDER BY name ASC
    `);
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      sku: row.sku,
      isAvailable: row.is_available,
      sales: row.sales || 0,
      taxPercentage: row.tax_percentage ? parseFloat(row.tax_percentage) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      sku: row.sku,
      isAvailable: row.is_available,
      sales: row.sales || 0,
      taxPercentage: row.tax_percentage ? parseFloat(row.tax_percentage) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw error;
  }
}

// Create a new product
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const result = await query(`
      INSERT INTO products (
        name, description, price, image_url, category, stock, sku, is_available, sales, tax_percentage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      product.name,
      product.description || null,
      product.price,
      product.imageUrl || null,
      product.category || null,
      product.stock,
      product.sku || null,
      product.isAvailable,
      product.sales || 0,
      product.taxPercentage || null
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      sku: row.sku,
      isAvailable: row.is_available,
      sales: row.sales || 0,
      taxPercentage: row.tax_percentage ? parseFloat(row.tax_percentage) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update a product
export async function updateProduct(id: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
  try {
    const result = await query(`
      UPDATE products
      SET name = $1, description = $2, price = $3, image_url = $4, category = $5, 
          stock = $6, sku = $7, is_available = $8, sales = $9, tax_percentage = $10,
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [
      product.name,
      product.description || null,
      product.price,
      product.imageUrl || null,
      product.category || null,
      product.stock,
      product.sku || null,
      product.isAvailable,
      product.sales || 0,
      product.taxPercentage || null,
      id
    ]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      imageUrl: row.image_url,
      category: row.category,
      stock: row.stock,
      sku: row.sku,
      isAvailable: row.is_available,
      sales: row.sales || 0,
      taxPercentage: row.tax_percentage ? parseFloat(row.tax_percentage) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Update product stock
export async function updateProductStock(
  productId: string, 
  newStock: number, 
  userId: string,
  userName: string,
  previousStock: number,
  changeAmount: number,
  reason: string
): Promise<Product | null> {
  try {
    // Start a database transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update the product stock
      const productResult = await client.query(`
        UPDATE products
        SET stock = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [newStock, productId]);
      
      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // Add to stock history
      await client.query(`
        INSERT INTO stock_history (
          product_id, product_name, previous_stock, new_stock, change_amount,
          user_id, user_name, reason, timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        productId,
        productResult.rows[0].name,
        previousStock,
        newStock,
        changeAmount,
        userId,
        userName,
        reason
      ]);
      
      await client.query('COMMIT');
      
      const row = productResult.rows[0];
      return {
        id: row.id.toString(),
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        imageUrl: row.image_url,
        category: row.category,
        stock: row.stock,
        sku: row.sku,
        isAvailable: row.is_available,
        sales: row.sales || 0,
        taxPercentage: row.tax_percentage ? parseFloat(row.tax_percentage) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}

// API HANDLERS FOR CUSTOMERS

// Get all customers
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const result = await query(`
      SELECT c.*, cc.name as category_name
      FROM customers c
      LEFT JOIN customer_categories cc ON c.category_id = cc.id
      ORDER BY c.name ASC
    `);
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp || row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      category: row.category_name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      orders: [] // This will be populated if needed
    }));
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const result = await query(`
      SELECT c.*, cc.name as category_name
      FROM customers c
      LEFT JOIN customer_categories cc ON c.category_id = cc.id
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    // Get customer's orders
    const ordersResult = await query('SELECT id FROM orders WHERE customer_id = $1', [id]);
    const orderIds = ordersResult.rows.map(order => order.id.toString());
    
    return {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp || row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      category: row.category_name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      orders: orderIds
    };
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    throw error;
  }
}

// Create a new customer
export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'orders'>): Promise<Customer> {
  try {
    // Get category ID from name if provided
    let categoryId = null;
    if (customer.category) {
      const categoryResult = await query('SELECT id FROM customer_categories WHERE name = $1', [customer.category]);
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      }
    }
    
    const result = await query(`
      INSERT INTO customers (
        name, email, phone, whatsapp, address, city, state, pincode, category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      customer.name,
      customer.email || null,
      customer.phone,
      customer.whatsapp || customer.phone,
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      categoryId
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp || row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      category: customer.category,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      orders: []
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// Update a customer
export async function updateCustomer(id: string, customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'orders'>): Promise<Customer | null> {
  try {
    // Get category ID from name if provided
    let categoryId = null;
    if (customer.category) {
      const categoryResult = await query('SELECT id FROM customer_categories WHERE name = $1', [customer.category]);
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      }
    }
    
    const result = await query(`
      UPDATE customers
      SET name = $1, email = $2, phone = $3, whatsapp = $4, address = $5, 
          city = $6, state = $7, pincode = $8, category_id = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [
      customer.name,
      customer.email || null,
      customer.phone,
      customer.whatsapp || customer.phone,
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      categoryId,
      id
    ]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Get customer's orders
    const ordersResult = await query('SELECT id FROM orders WHERE customer_id = $1', [id]);
    const orderIds = ordersResult.rows.map(order => order.id.toString());
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp || row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      category: customer.category,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      orders: orderIds
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

// Delete a customer
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    // Check if customer has orders
    const ordersResult = await query('SELECT COUNT(*) FROM orders WHERE customer_id = $1', [id]);
    if (parseInt(ordersResult.rows[0].count) > 0) {
      throw new Error('Cannot delete customer with existing orders');
    }
    
    const result = await query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

// API HANDLERS FOR ORDERS

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersResult = await query(`
      SELECT o.*
      FROM orders o
      ORDER BY o.order_date DESC
    `);
    
    const orders: Order[] = [];
    
    for (const orderRow of ordersResult.rows) {
      // Get customer details
      const customerResult = await query(`
        SELECT c.*, cc.name as category_name
        FROM customers c
        LEFT JOIN customer_categories cc ON c.category_id = cc.id
        WHERE c.id = $1
      `, [orderRow.customer_id]);
      
      if (customerResult.rows.length === 0) {
        continue;
      }
      
      const customerRow = customerResult.rows[0];
      const customer: Customer = {
        id: customerRow.id.toString(),
        name: customerRow.name,
        email: customerRow.email,
        phone: customerRow.phone,
        whatsapp: customerRow.whatsapp || customerRow.phone,
        address: customerRow.address,
        city: customerRow.city,
        state: customerRow.state,
        pincode: customerRow.pincode,
        category: customerRow.category_name,
        createdAt: new Date(customerRow.created_at),
        updatedAt: new Date(customerRow.updated_at),
        orders: []
      };
      
      // Get order items
      const itemsResult = await query(`
        SELECT oi.*, p.*
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [orderRow.id]);
      
      const items: OrderItem[] = itemsResult.rows.map(itemRow => {
        const product: Product = {
          id: itemRow.product_id.toString(),
          name: itemRow.product_name,
          description: itemRow.description,
          price: parseFloat(itemRow.price),
          imageUrl: itemRow.image_url,
          category: itemRow.category,
          stock: itemRow.stock,
          sku: itemRow.sku,
          isAvailable: itemRow.is_available,
          sales: itemRow.sales || 0,
          taxPercentage: itemRow.tax_percentage ? parseFloat(itemRow.tax_percentage) : undefined,
          createdAt: new Date(itemRow.created_at),
          updatedAt: new Date(itemRow.updated_at)
        };
        
        return {
          id: itemRow.id.toString(),
          productId: itemRow.product_id.toString(),
          product,
          quantity: itemRow.quantity,
          price: parseFloat(itemRow.unit_price),
          discount: itemRow.discount ? parseFloat(itemRow.discount) : undefined,
          taxAmount: itemRow.tax_amount ? parseFloat(itemRow.tax_amount) : undefined
        };
      });
      
      const order: Order = {
        id: orderRow.id.toString(),
        customerId: orderRow.customer_id.toString(),
        customer,
        items,
        totalAmount: parseFloat(orderRow.total_amount),
        subtotal: orderRow.subtotal ? parseFloat(orderRow.subtotal) : undefined,
        discountTotal: orderRow.discount_total ? parseFloat(orderRow.discount_total) : undefined,
        taxTotal: orderRow.tax_total ? parseFloat(orderRow.tax_total) : undefined,
        applyTax: orderRow.apply_tax,
        transactionId: orderRow.transaction_id,
        status: orderRow.status as OrderStatus,
        trackingId: orderRow.tracking_id,
        trackingUrl: orderRow.tracking_url,
        dispatchImage: orderRow.dispatch_image,
        notes: orderRow.notes,
        createdAt: new Date(orderRow.created_at),
        updatedAt: new Date(orderRow.updated_at),
        createdBy: orderRow.created_by ? orderRow.created_by.toString() : undefined
      };
      
      orders.push(order);
    }
    
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

// Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const orderRow = orderResult.rows[0];
    
    // Get customer details
    const customerResult = await query(`
      SELECT c.*, cc.name as category_name
      FROM customers c
      LEFT JOIN customer_categories cc ON c.category_id = cc.id
      WHERE c.id = $1
    `, [orderRow.customer_id]);
    
    if (customerResult.rows.length === 0) {
      return null;
    }
    
    const customerRow = customerResult.rows[0];
    const customer: Customer = {
      id: customerRow.id.toString(),
      name: customerRow.name,
      email: customerRow.email,
      phone: customerRow.phone,
      whatsapp: customerRow.whatsapp || customerRow.phone,
      address: customerRow.address,
      city: customerRow.city,
      state: customerRow.state,
      pincode: customerRow.pincode,
      category: customerRow.category_name,
      createdAt: new Date(customerRow.created_at),
      updatedAt: new Date(customerRow.updated_at),
      orders: []
    };
    
    // Get order items
    const itemsResult = await query(`
      SELECT oi.*, p.*
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderRow.id]);
    
    const items: OrderItem[] = itemsResult.rows.map(itemRow => {
      const product: Product = {
        id: itemRow.product_id.toString(),
        name: itemRow.product_name,
        description: itemRow.description,
        price: parseFloat(itemRow.price),
        imageUrl: itemRow.image_url,
        category: itemRow.category,
        stock: itemRow.stock,
        sku: itemRow.sku,
        isAvailable: itemRow.is_available,
        sales: itemRow.sales || 0,
        taxPercentage: itemRow.tax_percentage ? parseFloat(itemRow.tax_percentage) : undefined,
        createdAt: new Date(itemRow.created_at),
        updatedAt: new Date(itemRow.updated_at)
      };
      
      return {
        id: itemRow.id.toString(),
        productId: itemRow.product_id.toString(),
        product,
        quantity: itemRow.quantity,
        price: parseFloat(itemRow.unit_price),
        discount: itemRow.discount ? parseFloat(itemRow.discount) : undefined,
        taxAmount: itemRow.tax_amount ? parseFloat(itemRow.tax_amount) : undefined
      };
    });
    
    return {
      id: orderRow.id.toString(),
      customerId: orderRow.customer_id.toString(),
      customer,
      items,
      totalAmount: parseFloat(orderRow.total_amount),
      subtotal: orderRow.subtotal ? parseFloat(orderRow.subtotal) : undefined,
      discountTotal: orderRow.discount_total ? parseFloat(orderRow.discount_total) : undefined,
      taxTotal: orderRow.tax_total ? parseFloat(orderRow.tax_total) : undefined,
      applyTax: orderRow.apply_tax,
      transactionId: orderRow.transaction_id,
      status: orderRow.status as OrderStatus,
      trackingId: orderRow.tracking_id,
      trackingUrl: orderRow.tracking_url,
      dispatchImage: orderRow.dispatch_image,
      notes: orderRow.notes,
      createdAt: new Date(orderRow.created_at),
      updatedAt: new Date(orderRow.updated_at),
      createdBy: orderRow.created_by ? orderRow.created_by.toString() : undefined
    };
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
}

// Create a new order
export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert order
    const orderResult = await client.query(`
      INSERT INTO orders (
        customer_id, status, total_amount, subtotal, tax_total, discount_total,
        apply_tax, transaction_id, tracking_id, tracking_url, dispatch_image, notes,
        shipping_address, payment_method, payment_status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      order.customerId,
      order.status,
      order.totalAmount,
      order.subtotal || null,
      order.taxTotal || null,
      order.discountTotal || null,
      order.applyTax || false,
      order.transactionId || null,
      order.trackingId || null,
      order.trackingUrl || null,
      order.dispatchImage || null,
      order.notes || null,
      order.customer.address, // Using customer address as shipping address
      'cash', // Default payment method
      'unpaid', // Default payment status
      order.createdBy || null
    ]);
    
    const newOrderId = orderResult.rows[0].id;
    
    // Insert order items
    for (const item of order.items) {
      await client.query(`
        INSERT INTO order_items (
          order_id, product_id, product_name, quantity, unit_price, discount, tax_amount, total_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        newOrderId,
        item.productId,
        item.product.name,
        item.quantity,
        item.price,
        item.discount || null,
        item.taxAmount || null,
        (item.price * item.quantity) - (item.discount || 0) + (item.taxAmount || 0)
      ]);
      
      // Update product stock and sales
      await client.query(`
        UPDATE products
        SET stock = stock - $1, sales = sales + $1, updated_at = NOW()
        WHERE id = $2
      `, [item.quantity, item.productId]);
    }
    
    await client.query('COMMIT');
    
    // Return the complete order
    return await getOrderById(newOrderId.toString()) as Order;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Update an order
export async function updateOrder(id: string, order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the original order to compare items
    const originalOrderResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    const originalItems = originalOrderResult.rows;
    
    // Update order
    const orderResult = await client.query(`
      UPDATE orders
      SET customer_id = $1, status = $2, total_amount = $3, subtotal = $4, tax_total = $5,
          discount_total = $6, apply_tax = $7, transaction_id = $8, tracking_id = $9,
          tracking_url = $10, dispatch_image = $11, notes = $12, updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `, [
      order.customerId,
      order.status,
      order.totalAmount,
      order.subtotal || null,
      order.taxTotal || null,
      order.discountTotal || null,
      order.applyTax || false,
      order.transactionId || null,
      order.trackingId || null,
      order.trackingUrl || null,
      order.dispatchImage || null,
      order.notes || null,
      id
    ]);
    
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    
    // Delete existing order items
    await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Insert updated order items
    for (const item of order.items) {
      await client.query(`
        INSERT INTO order_items (
          order_id, product_id, product_name, quantity, unit_price, discount, tax_amount, total_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        id,
        item.productId,
        item.product.name,
        item.quantity,
        item.price,
        item.discount || null,
        item.taxAmount || null,
        (item.price * item.quantity) - (item.discount || 0) + (item.taxAmount || 0)
      ]);
    }
    
    await client.query('COMMIT');
    
    // Return the updated order
    return await getOrderById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Update order status
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  try {
    const result = await query(`
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return await getOrderById(id);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Delete an order
export async function deleteOrder(id: string): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get order items to restore stock
    const itemsResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    
    // Restore product stock for each item
    for (const item of itemsResult.rows) {
      await client.query(`
        UPDATE products
        SET stock = stock + $1, sales = sales - $1, updated_at = NOW()
        WHERE id = $2
      `, [item.quantity, item.product_id]);
    }
    
    // Delete order items
    await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    // Delete order
    const orderResult = await client.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    
    await client.query('COMMIT');
    
    return orderResult.rows.length > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting order:', error);
    throw error;
  } finally {
    client.release();
  }
}

// API HANDLERS FOR USERS

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await query(`
      SELECT * FROM users
      ORDER BY name ASC
    `);
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      active: row.active,
      phone: row.phone,
      permissions: row.permissions || getDefaultPermissions(row.role),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      active: row.active,
      phone: row.phone,
      permissions: row.permissions || getDefaultPermissions(row.role),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

// Create a new user
export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const result = await query(`
      INSERT INTO users (
        name, email, password, password_hash, role, active, permissions, phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      user.name,
      user.email,
      user.password,
      user.password, // In a real app, this would be hashed
      user.role,
      user.active,
      JSON.stringify(user.permissions),
      user.phone || null
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      active: row.active,
      phone: row.phone,
      permissions: row.permissions || getDefaultPermissions(row.role),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update a user
export async function updateUser(id: string, user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
  try {
    const result = await query(`
      UPDATE users
      SET name = $1, email = $2, password = $3, password_hash = $4, role = $5,
          active = $6, permissions = $7, phone = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `, [
      user.name,
      user.email,
      user.password,
      user.password, // In a real app, this would be hashed
      user.role,
      user.active,
      JSON.stringify(user.permissions),
      user.phone || null,
      id
    ]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      active: row.active,
      phone: row.phone,
      permissions: row.permissions || getDefaultPermissions(row.role),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// API HANDLERS FOR COMPANY SETTINGS

// Get company settings
export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const result = await query('SELECT * FROM company_settings LIMIT 1');
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      companyName: row.company_name,
      name: row.name || row.company_name,
      appName: row.app_name,
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      phone: row.phone || '',
      email: row.email || '',
      taxId: row.tax_id || '',
      logoUrl: row.logo_url || '',
      logo: row.logo || '',
      website: row.website || '',
      socialMedia: row.social_media || {},
      currency: row.currency || 'INR'
    };
  } catch (error) {
    console.error('Error getting company settings:', error);
    throw error;
  }
}

// Update company settings
export async function updateCompanySettings(settings: CompanySettings): Promise<CompanySettings | null> {
  try {
    // Check if settings exist
    const existingResult = await query('SELECT COUNT(*) FROM company_settings');
    const exists = parseInt(existingResult.rows[0].count) > 0;
    
    let result;
    if (exists) {
      result = await query(`
        UPDATE company_settings
        SET company_name = $1, name = $2, app_name = $3, address = $4, city = $5, state = $6,
            pincode = $7, phone = $8, email = $9, tax_id = $10, logo_url = $11, logo = $12,
            website = $13, social_media = $14, currency = $15, updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `, [
        settings.companyName,
        settings.name || settings.companyName,
        settings.appName || null,
        settings.address || '',
        settings.city || '',
        settings.state || '',
        settings.pincode || '',
        settings.phone || '',
        settings.email || '',
        settings.taxId || '',
        settings.logoUrl || '',
        settings.logo || '',
        settings.website || '',
        JSON.stringify(settings.socialMedia || {}),
        settings.currency || 'INR'
      ]);
    } else {
      result = await query(`
        INSERT INTO company_settings (
          id, company_name, name, app_name, address, city, state, pincode, phone, email,
          tax_id, logo_url, logo, website, social_media, currency
        )
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        settings.companyName,
        settings.name || settings.companyName,
        settings.appName || null,
        settings.address || '',
        settings.city || '',
        settings.state || '',
        settings.pincode || '',
        settings.phone || '',
        settings.email || '',
        settings.taxId || '',
        settings.logoUrl || '',
        settings.logo || '',
        settings.website || '',
        JSON.stringify(settings.socialMedia || {}),
        settings.currency || 'INR'
      ]);
    }
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      companyName: row.company_name,
      name: row.name || row.company_name,
      appName: row.app_name,
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      phone: row.phone || '',
      email: row.email || '',
      taxId: row.tax_id || '',
      logoUrl: row.logo_url || '',
      logo: row.logo || '',
      website: row.website || '',
      socialMedia: row.social_media || {},
      currency: row.currency || 'INR'
    };
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw error;
  }
}

// API HANDLERS FOR STOCK HISTORY

// Get stock history
export async function getStockHistory(): Promise<StockHistoryRecord[]> {
  try {
    const result = await query(`
      SELECT * FROM stock_history
      ORDER BY timestamp DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: row.product_name,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.user_id.toString(),
      userName: row.user_name,
      timestamp: new Date(row.timestamp),
      reason: row.reason,
      updatedBy: row.updated_by
    }));
  } catch (error) {
    console.error('Error getting stock history:', error);
    throw error;
  }
}

// Add stock history record
export async function addStockHistory(record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord> {
  try {
    const result = await query(`
      INSERT INTO stock_history (
        product_id, product_name, previous_stock, new_stock, change_amount,
        user_id, user_name, reason, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [
      record.productId,
      record.productName,
      record.previousStock,
      record.newStock,
      record.changeAmount,
      record.userId,
      record.userName,
      record.reason
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      productId: row.product_id.toString(),
      productName: row.product_name,
      previousStock: row.previous_stock,
      newStock: row.new_stock,
      changeAmount: row.change_amount,
      userId: row.user_id.toString(),
      userName: row.user_name,
      timestamp: new Date(row.timestamp),
      reason: row.reason,
      updatedBy: row.updated_by
    };
  } catch (error) {
    console.error('Error adding stock history record:', error);
    throw error;
  }
}

// API HANDLERS FOR ACTIVITY LOGS

// Add activity log
export async function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
  try {
    const result = await query(`
      INSERT INTO activity_logs (
        user_id, user_name, action, entity_type, entity_id, details, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [
      log.userId,
      log.userName,
      log.action,
      log.entityType,
      log.entityId || null,
      log.details || null
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id.toString(),
      userId: row.user_id.toString(),
      userName: row.user_name,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      timestamp: new Date(row.timestamp)
    };
  } catch (error) {
    console.error('Error adding activity log:', error);
    throw error;
  }
}

// Get activity logs
export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const result = await query(`
      SELECT * FROM activity_logs
      ORDER BY timestamp DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      userName: row.user_name,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      timestamp: new Date(row.timestamp)
    }));
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  }
}

// Helper function to get default permissions based on role
function getDefaultPermissions(role: string) {
  switch (role) {
    case 'admin':
      return {
        canViewDashboard: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageCustomers: true,
        canManageUsers: true,
        canExportData: true,
        canSendMarketing: true,
        canViewReports: true
      };
    case 'manager':
      return {
        canViewDashboard: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageCustomers: true,
        canManageUsers: false,
        canExportData: true,
        canSendMarketing: true,
        canViewReports: true
      };
    case 'employee':
      return {
        canViewDashboard: true,
        canManageProducts: false,
        canManageOrders: true,
        canManageCustomers: true,
        canManageUsers: false,
        canExportData: false,
        canSendMarketing: false,
        canViewReports: false
      };
    default:
      return {
        canViewDashboard: false,
        canManageProducts: false,
        canManageOrders: false,
        canManageCustomers: false,
        canManageUsers: false,
        canExportData: false,
        canSendMarketing: false,
        canViewReports: false
      };
  }
}
