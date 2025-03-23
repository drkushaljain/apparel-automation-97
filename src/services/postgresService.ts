
import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';

// API endpoint base URL
const API_BASE_URL = '/api';

// Initialize the PostgreSQL connection
export const initPostgresConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/db-status`);
    const data = await response.json();
    
    if (data.connected) {
      console.log(`Connected to database: ${data.message}`);
      return { success: true, message: data.message };
    } else {
      console.error(`Database connection error: ${data.message}`);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    return { success: false, message: 'Failed to connect to PostgreSQL' };
  }
};

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) throw new Error('Failed to create product');
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (product: Product): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error updating product ${product.id}:`, error);
    return false;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
};

// Stock history operations
export const addStockHistory = async (record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    
    if (!response.ok) throw new Error('Failed to add stock history');
    return await response.json();
  } catch (error) {
    console.error('Error adding stock history:', error);
    return null;
  }
};

export const getStockHistoryByProduct = async (productId: string): Promise<StockHistoryRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock-history/product/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch stock history');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stock history for product ${productId}:`, error);
    return [];
  }
};

export const getAllStockHistory = async (): Promise<StockHistoryRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock-history`);
    if (!response.ok) throw new Error('Failed to fetch stock history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all stock history:', error);
    return [];
  }
};

// Customer operations
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const saveCustomers = async (customers: Customer[]): Promise<boolean> => {
  try {
    // This would be implemented differently in a real API
    // For now, we're just simulating batch update
    const response = await fetch(`${API_BASE_URL}/customers/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customers)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving customers:', error);
    return false;
  }
};

// Order operations
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const saveOrders = async (orders: Order[]): Promise<boolean> => {
  try {
    // This would be implemented differently in a real API
    // For now, we're just simulating batch update
    const response = await fetch(`${API_BASE_URL}/orders/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving orders:', error);
    return false;
  }
};

// User operations
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const saveUsers = async (users: User[]): Promise<boolean> => {
  try {
    // This would be implemented differently in a real API
    // For now, we're just simulating batch update
    const response = await fetch(`${API_BASE_URL}/users/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

// Company settings operations
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/company-settings`);
    if (!response.ok) throw new Error('Failed to fetch company settings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/company-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving company settings:', error);
    return false;
  }
};

// Default export
export default {
  initPostgresConnection,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addStockHistory,
  getStockHistoryByProduct,
  getAllStockHistory,
  getCustomers,
  getOrders,
  getUsers,
  getCompanySettings,
  saveCustomers,
  saveOrders,
  saveUsers,
  saveCompanySettings
};
