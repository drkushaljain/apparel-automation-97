import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';
import postgresService from './postgresService';

// Set PostgreSQL as the default data store
let usePostgres = true;

export const initializeDatabase = async (
  initialProducts: Product[] = [],
  initialCustomers: Customer[] = [],
  initialOrders: Order[] = [],
  initialUsers: User[] = []
) => {
  // In browser environments, we'll need to use a server API
  if (typeof window !== 'undefined') {
    console.log('Browser environment detected. Will use API calls to PostgreSQL database');
    usePostgres = true;
    return;
  }
  
  // Below code will only run in Node.js environment
  try {
    await postgresService.initPostgresConnection();
    console.log('Using PostgreSQL database');
    
    // Check if we need to seed the database
    const products = await getProducts();
    if (products.length === 0) {
      console.log('Seeding PostgreSQL database with initial data');
      
      // Seed products
      for (const product of initialProducts) {
        await postgresService.createProduct(product);
      }
      
      // Seed customers
      for (const customer of initialCustomers) {
        // Implementation for creating customers would go here
      }
      
      // Seed orders
      for (const order of initialOrders) {
        // Implementation for creating orders would go here
      }
      
      // Seed users
      for (const user of initialUsers) {
        // Implementation for creating users would go here
      }
    }
    
    return;
  } catch (error) {
    console.error('Failed to initialize PostgreSQL', error);
    throw new Error('Database connection failed');
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  return postgresService.getProducts();
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  // In a real implementation, this would update products in PostgreSQL
  console.log('Updating products in PostgreSQL');
  
  // Loop through products and call update for each
  for (const product of products) {
    await postgresService.updateProduct(product);
  }
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  return postgresService.getCustomers();
};

export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  console.log('Updating customers in PostgreSQL');
  
  // This would be implemented with actual PostgreSQL queries
  await postgresService.saveCustomers(customers);
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  return postgresService.getOrders();
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  console.log('Updating orders in PostgreSQL');
  
  // This would be implemented with actual PostgreSQL queries
  await postgresService.saveOrders(orders);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  return postgresService.getUsers();
};

export const saveUsers = async (users: User[]): Promise<void> => {
  console.log('Updating users in PostgreSQL');
  
  // This would be implemented with actual PostgreSQL queries
  await postgresService.saveUsers(users);
};

// Company Settings
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  return postgresService.getCompanySettings();
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<void> => {
  console.log('Updating company settings in PostgreSQL');
  
  // This would be implemented with actual PostgreSQL queries
  await postgresService.saveCompanySettings(settings);
};

// Stock History
export const getStockHistory = async (productId?: string): Promise<StockHistoryRecord[]> => {
  if (productId) {
    return postgresService.getStockHistoryByProduct(productId);
  }
  
  // This would get all stock history from PostgreSQL
  const allHistory = await postgresService.getAllStockHistory();
  return allHistory;
};

export const updateProductStock = async (
  productId: string, 
  newStock: number,
  reason: string,
  userId: string,
  userName: string
): Promise<boolean> => {
  // Get current product to determine previous stock
  const product = await postgresService.getProductById(productId);
  if (!product) return false;
  
  const previousStock = product.stock;
  
  // Update product stock in database
  const updatedProduct = { ...product, stock: newStock, updatedAt: new Date() };
  const success = await postgresService.updateProduct(updatedProduct);
  
  if (!success) return false;
  
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
};
