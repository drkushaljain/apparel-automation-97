
const express = require('express');
const api = require('./api');

const router = express.Router();

// Database status endpoint
router.get('/db-status', async (req, res) => {
  try {
    const connected = await api.checkDatabaseConnection();
    res.json({ connected });
  } catch (error) {
    console.error('Error checking database connection:', error);
    res.status(500).json({ error: 'Failed to check database connection' });
  }
});

// PRODUCT ENDPOINTS
router.get('/products', async (req, res) => {
  try {
    const products = await api.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await api.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const product = await api.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await api.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await api.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// CUSTOMER ENDPOINTS
router.get('/customers', async (req, res) => {
  try {
    const customers = await api.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await api.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const customer = await api.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.put('/customers/:id', async (req, res) => {
  try {
    const customer = await api.updateCustomer(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    const deleted = await api.deleteCustomer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found or has orders' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// ORDER ENDPOINTS
router.get('/orders', async (req, res) => {
  try {
    const orders = await api.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await api.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const order = await api.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const order = await api.updateOrder(req.params.id, req.body);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const order = await api.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const deleted = await api.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// USER ENDPOINTS
router.get('/users', async (req, res) => {
  try {
    const users = await api.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await api.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = await api.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await api.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await api.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// COMPANY SETTINGS ENDPOINTS
router.get('/company-settings', async (req, res) => {
  try {
    const settings = await api.getCompanySettings();
    if (!settings) {
      return res.status(404).json({ error: 'Company settings not found' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error getting company settings:', error);
    res.status(500).json({ error: 'Failed to get company settings' });
  }
});

router.put('/company-settings', async (req, res) => {
  try {
    const settings = await api.updateCompanySettings(req.body);
    if (!settings) {
      return res.status(404).json({ error: 'Failed to update company settings' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ error: 'Failed to update company settings' });
  }
});

// STOCK HISTORY ENDPOINTS
router.get('/stock-history', async (req, res) => {
  try {
    const history = await api.getStockHistory();
    res.json(history);
  } catch (error) {
    console.error('Error getting stock history:', error);
    res.status(500).json({ error: 'Failed to get stock history' });
  }
});

router.post('/stock-history', async (req, res) => {
  try {
    const record = await api.addStockHistory(req.body);
    res.status(201).json(record);
  } catch (error) {
    console.error('Error adding stock history record:', error);
    res.status(500).json({ error: 'Failed to add stock history record' });
  }
});

// ACTIVITY LOGS ENDPOINTS
router.get('/activity-logs', async (req, res) => {
  try {
    const logs = await api.getActivityLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({ error: 'Failed to get activity logs' });
  }
});

router.post('/activity-logs', async (req, res) => {
  try {
    const log = await api.addActivityLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error adding activity log:', error);
    res.status(500).json({ error: 'Failed to add activity log' });
  }
});

module.exports = router;
