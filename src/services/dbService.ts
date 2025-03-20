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
  
  // Fall back to localStorage if PostgreSQL is not available
  console.log('Using localStorage for data storage');
  
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
    // This would be implemented in postgresService
    return []; // Placeholder
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
    // This would be implemented in postgresService
    return []; // Placeholder
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
    // This would be implemented in postgresService
    return []; // Placeholder
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
    // This would be implemented in postgresService
    return null; // Placeholder
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
    return postgresService.getStockHistoryByProduct(productId);
  } else if (usePostgres) {
    // Get all stock history - this would be implemented in postgresService
    return []; // Placeholder
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
    const product = await postgresService.getProductById(productId);
    if (!product) return false;
    
    const previousStock = product.stock;
    product.stock = newStock;
    
    const updated = await postgresService.updateProduct(product);
    if (!updated) return false;
    
    // Record stock history
    await postgresService.addStockHistory({
      productId,
      productName: product.name,
      previousStock,
      newStock,
      changeAmount: newStock - previousStock,
      userId,
      userName,
      timestamp: new Date(),
      reason
    });
    
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
