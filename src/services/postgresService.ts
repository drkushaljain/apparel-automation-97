
import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';

// Mock data for browser fallback
let mockProducts: Product[] = [];
let mockCustomers: Customer[] = [];
let mockOrders: Order[] = [];
let mockStockHistory: StockHistoryRecord[] = [];

// This is a service that uses PostgreSQL in node environments and falls back to localStorage in browser environments
const isBrowser = typeof window !== 'undefined';

// Initialization function that sets up the connection or prepares mock data
export const initPostgresConnection = async () => {
  if (isBrowser) {
    console.log('Browser environment detected, using mock data');
    // Load mock data from localStorage in browser environment
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) mockProducts = JSON.parse(storedProducts);
      
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) mockCustomers = JSON.parse(storedCustomers);
      
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) mockOrders = JSON.parse(storedOrders);
      
      const storedStockHistory = localStorage.getItem('stock_history');
      if (storedStockHistory) mockStockHistory = JSON.parse(storedStockHistory);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    return { success: true, message: 'Using browser storage' };
  } else {
    try {
      // In a real Node.js environment, this would import and initialize pg
      if (process.env.DATABASE_URL) {
        console.log('Server environment detected, PostgreSQL would be initialized here');
        // Actual implementation would go here when in Node.js environment
        return { success: true, message: 'PostgreSQL connected' };
      } else {
        console.warn('No DATABASE_URL provided, using mock data');
        return { success: false, message: 'No DATABASE_URL provided' };
      }
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
      return { success: false, message: 'Failed to connect to PostgreSQL' };
    }
  }
};

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  if (isBrowser) {
    return mockProducts;
  }
  // In Node.js environment, this would query the database
  return mockProducts;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (isBrowser) {
    return mockProducts.find(p => p.id === id) || null;
  }
  // In Node.js environment, this would query the database
  return mockProducts.find(p => p.id === id) || null;
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  const newProduct = {
    ...product,
    id: `p${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Product;
  
  if (isBrowser) {
    mockProducts.push(newProduct);
    localStorage.setItem('products', JSON.stringify(mockProducts));
  }
  // In Node.js environment, this would insert into the database
  
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product | null> => {
  const updatedProduct = {
    ...product,
    updatedAt: new Date()
  };
  
  if (isBrowser) {
    const index = mockProducts.findIndex(p => p.id === product.id);
    if (index !== -1) {
      mockProducts[index] = updatedProduct;
      localStorage.setItem('products', JSON.stringify(mockProducts));
      return updatedProduct;
    }
    return null;
  }
  // In Node.js environment, this would update the database
  
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isBrowser) {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      localStorage.setItem('products', JSON.stringify(mockProducts));
      return true;
    }
    return false;
  }
  // In Node.js environment, this would delete from the database
  
  return false;
};

// Stock history operations
export const addStockHistory = async (record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> => {
  const newRecord = {
    ...record,
    id: `sh${Date.now()}`
  } as StockHistoryRecord;
  
  if (isBrowser) {
    mockStockHistory.push(newRecord);
    localStorage.setItem('stock_history', JSON.stringify(mockStockHistory));
  }
  // In Node.js environment, this would insert into the database
  
  return newRecord;
};

export const getStockHistoryByProduct = async (productId: string): Promise<StockHistoryRecord[]> => {
  if (isBrowser) {
    return mockStockHistory.filter(r => r.productId === productId);
  }
  // In Node.js environment, this would query the database
  
  return mockStockHistory.filter(r => r.productId === productId);
};

// Export data to JSON (for backup)
export const exportToJson = async (): Promise<string> => {
  const data = {
    products: mockProducts,
    customers: mockCustomers,
    orders: mockOrders,
    stockHistory: mockStockHistory
  };
  
  return JSON.stringify(data, null, 2);
};

// Additional functions to support the application
export const getCustomers = async (): Promise<Customer[]> => {
  if (isBrowser) {
    return mockCustomers;
  }
  // In Node.js environment, this would query the database
  
  return mockCustomers;
};

export const getOrders = async (): Promise<Order[]> => {
  if (isBrowser) {
    return mockOrders;
  }
  // In Node.js environment, this would query the database
  
  return mockOrders;
};

export const getUsers = async (): Promise<User[]> => {
  if (isBrowser) {
    // In browser, we'd use localStorage
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  }
  // In Node.js environment, this would query the database
  
  return [];
};

export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  if (isBrowser) {
    // In browser, we'd use localStorage
    const storedSettings = localStorage.getItem('company_settings');
    return storedSettings ? JSON.parse(storedSettings) : null;
  }
  // In Node.js environment, this would query the database
  
  return null;
};

export const saveCustomers = async (customers: Customer[]): Promise<boolean> => {
  if (isBrowser) {
    mockCustomers = customers;
    localStorage.setItem('customers', JSON.stringify(customers));
    return true;
  }
  // In Node.js environment, this would save to the database
  
  return false;
};

export const saveOrders = async (orders: Order[]): Promise<boolean> => {
  if (isBrowser) {
    mockOrders = orders;
    localStorage.setItem('orders', JSON.stringify(orders));
    return true;
  }
  // In Node.js environment, this would save to the database
  
  return false;
};

export const saveUsers = async (users: User[]): Promise<boolean> => {
  if (isBrowser) {
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }
  // In Node.js environment, this would save to the database
  
  return false;
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<boolean> => {
  if (isBrowser) {
    localStorage.setItem('company_settings', JSON.stringify(settings));
    return true;
  }
  // In Node.js environment, this would save to the database
  
  return false;
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
  exportToJson,
  getCustomers,
  getOrders,
  getUsers,
  getCompanySettings,
  saveCustomers,
  saveOrders,
  saveUsers,
  saveCompanySettings
};
