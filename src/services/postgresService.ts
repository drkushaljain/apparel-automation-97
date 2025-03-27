
import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';

// API endpoint base URL - Add a proper base path with version number
const API_BASE_URL = '/api';

// Initialize the PostgreSQL connection
export const initPostgresConnection = async () => {
  try {
    // Add proper error handling with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/db-status`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Database connection error: Status ${response.status}`);
      return { success: false, message: `Failed to connect (Status: ${response.status})` };
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Server returned non-JSON response:', contentType);
      return { success: false, message: 'Server returned invalid response format' };
    }
    
    const data = await response.json();
    
    if (data.connected) {
      console.log(`Connected to database: ${data.message}`);
      return { success: true, message: data.message };
    } else {
      console.error(`Database connection error: ${data.message}`);
      return { success: false, message: data.message };
    }
  } catch (error) {
    // Handle AbortError differently
    if (error.name === 'AbortError') {
      console.error('PostgreSQL connection timeout');
      return { success: false, message: 'Connection timeout' };
    }
    
    console.error('Error connecting to PostgreSQL:', error);
    return { success: false, message: `Failed to connect: ${error.message}` };
  }
};

// Helper function to make API calls with proper error handling
const fetchApi = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Merge default headers with any provided headers
    const mergedOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };
    
    const response = await fetch(url, mergedOptions);
    
    clearTimeout(timeoutId);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  try {
    return await fetchApi(`${API_BASE_URL}/products`);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await fetchApi(`${API_BASE_URL}/products/${id}`);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  try {
    return await fetchApi(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(product)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (product: Product): Promise<boolean> => {
  try {
    await fetchApi(`${API_BASE_URL}/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating product ${product.id}:`, error);
    return false;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await fetchApi(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
};

// Stock history operations
export const addStockHistory = async (record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> => {
  try {
    return await fetchApi(`${API_BASE_URL}/stock-history`, {
      method: 'POST',
      body: JSON.stringify(record)
    });
  } catch (error) {
    console.error('Error adding stock history:', error);
    return null;
  }
};

export const getStockHistoryByProduct = async (productId: string): Promise<StockHistoryRecord[]> => {
  try {
    return await fetchApi(`${API_BASE_URL}/stock-history/product/${productId}`);
  } catch (error) {
    console.error(`Error fetching stock history for product ${productId}:`, error);
    return [];
  }
};

export const getAllStockHistory = async (): Promise<StockHistoryRecord[]> => {
  try {
    return await fetchApi(`${API_BASE_URL}/stock-history`);
  } catch (error) {
    console.error('Error fetching all stock history:', error);
    return [];
  }
};

// Customer operations
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    return await fetchApi(`${API_BASE_URL}/customers`);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const saveCustomers = async (customers: Customer[]): Promise<boolean> => {
  try {
    await fetchApi(`${API_BASE_URL}/customers/batch`, {
      method: 'PUT',
      body: JSON.stringify(customers)
    });
    
    return true;
  } catch (error) {
    console.error('Error saving customers:', error);
    return false;
  }
};

// Order operations
export const getOrders = async (): Promise<Order[]> => {
  try {
    return await fetchApi(`${API_BASE_URL}/orders`);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const saveOrders = async (orders: Order[]): Promise<boolean> => {
  try {
    await fetchApi(`${API_BASE_URL}/orders/batch`, {
      method: 'PUT',
      body: JSON.stringify(orders)
    });
    
    return true;
  } catch (error) {
    console.error('Error saving orders:', error);
    return false;
  }
};

// User operations
export const getUsers = async (): Promise<User[]> => {
  try {
    return await fetchApi(`${API_BASE_URL}/users`);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const saveUsers = async (users: User[]): Promise<boolean> => {
  try {
    await fetchApi(`${API_BASE_URL}/users/batch`, {
      method: 'PUT',
      body: JSON.stringify(users)
    });
    
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

// Company settings operations
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  try {
    return await fetchApi(`${API_BASE_URL}/company-settings`);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<boolean> => {
  try {
    await fetchApi(`${API_BASE_URL}/company-settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    
    return true;
  } catch (error) {
    console.error('Error saving company settings:', error);
    return false;
  }
};

// Login function
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userData = await fetchApi(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    return null;
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
  saveCompanySettings,
  loginUser
};
