
import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';
import postgresService from './postgresService';

// Add PostgreSQL support
let usePostgres = false;

export const initializeDatabase = async (
  initialProducts: Product[] = [],
  initialCustomers: Customer[] = [],
  initialOrders: Order[] = [],
  initialUsers: User[] = []
) => {
  // In browser environments, always use localStorage
  if (typeof window !== 'undefined') {
    console.log('Browser environment detected. Using localStorage for data storage');
    usePostgres = false;
    
    // Initialize localStorage with initial data if empty
    if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(initialProducts));
    }
    
    if (!localStorage.getItem('customers')) {
      localStorage.setItem('customers', JSON.stringify(initialCustomers));
    }
    
    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify(initialOrders));
    }
    
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    return;
  }
  
  // Below code will only run in Node.js environment
  // Try to connect to PostgreSQL if environment variables are set
  if (typeof process !== 'undefined' && process.env && process.env.DB_HOST) {
    try {
      await postgresService.initPostgresConnection();
      usePostgres = true;
      console.log('Using PostgreSQL database');
      
      // Check if we need to seed the database
      const products = await getProducts();
      if (products.length === 0) {
        console.log('Seeding PostgreSQL database with initial data');
        
        // Seed products
        for (const product of initialProducts) {
          await postgresService.createProduct(product);
        }
        
        // Seed other data similarly
        // ...
      }
      
      return;
    } catch (error) {
      console.error('Failed to initialize PostgreSQL, falling back to localStorage', error);
      usePostgres = false;
    }
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (usePostgres) {
    return postgresService.getProducts();
  }
  
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  if (usePostgres) {
    // In a real implementation, this would bulk update products in PostgreSQL
    // For simplicity, we'll just log that it would update
    console.log('Would update products in PostgreSQL');
    return;
  }
  
  localStorage.setItem('products', JSON.stringify(products));
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  if (usePostgres) {
    return []; // This would be implemented in postgresService
  }
  
  const customers = localStorage.getItem('customers');
  return customers ? JSON.parse(customers) : [];
};

export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  if (usePostgres) {
    console.log('Would update customers in PostgreSQL');
    return;
  }
  
  localStorage.setItem('customers', JSON.stringify(customers));
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  if (usePostgres) {
    return []; // This would be implemented in postgresService
  }
  
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  if (usePostgres) {
    console.log('Would update orders in PostgreSQL');
    return;
  }
  
  localStorage.setItem('orders', JSON.stringify(orders));
};

// Users
export const getUsers = async (): Promise<User[]> => {
  if (usePostgres) {
    return []; // This would be implemented in postgresService
  }
  
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const saveUsers = async (users: User[]): Promise<void> => {
  if (usePostgres) {
    console.log('Would update users in PostgreSQL');
    return;
  }
  
  localStorage.setItem('users', JSON.stringify(users));
};

// Company Settings
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  if (usePostgres) {
    return null; // This would be implemented in postgresService
  }
  
  const settings = localStorage.getItem('company_settings');
  return settings ? JSON.parse(settings) : null;
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<void> => {
  if (usePostgres) {
    console.log('Would update company settings in PostgreSQL');
    return;
  }
  
  localStorage.setItem('company_settings', JSON.stringify(settings));
};

// Stock History
export const getStockHistory = async (productId?: string): Promise<StockHistoryRecord[]> => {
  if (usePostgres && productId) {
    return []; // This would call postgresService.getStockHistoryByProduct(productId)
  } else if (usePostgres) {
    return []; // This would get all stock history from PostgreSQL
  }
  
  const history = localStorage.getItem('stock_history');
  const records = history ? JSON.parse(history) : [];
  
  if (productId) {
    return records.filter((record: StockHistoryRecord) => record.productId === productId);
  }
  
  return records;
};

export const updateProductStock = async (
  productId: string, 
  newStock: number,
  reason: string,
  userId: string,
  userName: string
): Promise<boolean> => {
  if (usePostgres) {
    // This would call PostgreSQL functions
    console.log('Would update product stock in PostgreSQL');
    return true;
  }
  
  // For localStorage implementation
  const productsStr = localStorage.getItem('products');
  if (!productsStr) return false;
  
  const products = JSON.parse(productsStr);
  const productIndex = products.findIndex((p: Product) => p.id === productId);
  
  if (productIndex === -1) return false;
  
  const previousStock = products[productIndex].stock;
  products[productIndex].stock = newStock;
  products[productIndex].updatedAt = new Date();
  
  localStorage.setItem('products', JSON.stringify(products));
  
  // Record stock history
  const stockHistory = JSON.parse(localStorage.getItem('stock_history') || '[]');
  stockHistory.unshift({
    id: `sc${Date.now()}`,
    productId,
    productName: products[productIndex].name,
    previousStock,
    newStock,
    changeAmount: newStock - previousStock,
    userId,
    userName,
    timestamp: new Date(),
    reason
  });
  
  localStorage.setItem('stock_history', JSON.stringify(stockHistory));
  
  return true;
};
