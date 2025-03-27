
import { Customer, Order, Product, User, CompanySettings, StockHistoryRecord } from '@/types';
import { 
  initPostgresConnection, 
  getCustomers as postgresGetCustomers, 
  getOrders as postgresGetOrders, 
  getProducts as postgresGetProducts,
  getUsers as postgresGetUsers,
  getCompanySettings as postgresGetCompanySettings,
  getStockHistory as postgresGetStockHistory,
  createProduct,
  updateProduct,
  deleteProduct,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createOrder,
  updateOrder,
  deleteOrder,
  createUser,
  updateUser,
  deleteUser,
  updateCompanySettings,
  addStockHistory
} from '@/services/postgresService';

// Initialize the database
export async function initDatabase(): Promise<boolean> {
  try {
    // Connect to the database
    const dbConnected = await initPostgresConnection();
    
    if (dbConnected) {
      console.log("Database connected successfully");
      return true;
    }
    
    console.error("Database connection failed");
    return false;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// PRODUCTS
export async function getProducts(): Promise<Product[]> {
  try {
    await initPostgresConnection();
    return await postgresGetProducts();
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    await initPostgresConnection();
    return await createProduct(product);
  } catch (error) {
    console.error("Error adding product:", error);
    return null;
  }
}

export async function modifyProduct(product: Product): Promise<Product | null> {
  try {
    await initPostgresConnection();
    return await updateProduct(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
}

export async function removeProduct(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    return await deleteProduct(id);
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

// CUSTOMERS
export async function getCustomers(): Promise<Customer[]> {
  try {
    await initPostgresConnection();
    return await postgresGetCustomers();
  } catch (error) {
    console.error("Error getting customers:", error);
    return [];
  }
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer | null> {
  try {
    await initPostgresConnection();
    return await createCustomer(customer);
  } catch (error) {
    console.error("Error adding customer:", error);
    return null;
  }
}

export async function modifyCustomer(customer: Customer): Promise<Customer | null> {
  try {
    await initPostgresConnection();
    return await updateCustomer(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return null;
  }
}

export async function removeCustomer(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    return await deleteCustomer(id);
  } catch (error) {
    console.error("Error deleting customer:", error);
    return false;
  }
}

// ORDERS
export async function getOrders(): Promise<Order[]> {
  try {
    await initPostgresConnection();
    return await postgresGetOrders();
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order | null> {
  try {
    await initPostgresConnection();
    return await createOrder(order);
  } catch (error) {
    console.error("Error adding order:", error);
    return null;
  }
}

export async function modifyOrder(order: Order): Promise<Order | null> {
  try {
    await initPostgresConnection();
    return await updateOrder(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
}

export async function removeOrder(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    return await deleteOrder(id);
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
}

// USERS
export async function getUsers(): Promise<User[]> {
  try {
    await initPostgresConnection();
    return await postgresGetUsers();
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

export async function addUser(user: Omit<User, 'id'>): Promise<User | null> {
  try {
    await initPostgresConnection();
    return await createUser(user);
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
}

export async function modifyUser(user: User): Promise<User | null> {
  try {
    await initPostgresConnection();
    return await updateUser(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function removeUser(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    return await deleteUser(id);
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

// COMPANY SETTINGS
export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    await initPostgresConnection();
    return await postgresGetCompanySettings();
  } catch (error) {
    console.error("Error getting company settings:", error);
    return null;
  }
}

export async function saveCompanySettings(settings: CompanySettings): Promise<CompanySettings | null> {
  try {
    await initPostgresConnection();
    return await updateCompanySettings(settings);
  } catch (error) {
    console.error("Error updating company settings:", error);
    return null;
  }
}

// STOCK HISTORY
export async function getStockHistory(): Promise<StockHistoryRecord[]> {
  try {
    await initPostgresConnection();
    return await postgresGetStockHistory();
  } catch (error) {
    console.error("Error getting stock history:", error);
    return [];
  }
}

export async function addStockRecord(record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> {
  try {
    await initPostgresConnection();
    return await addStockHistory(record);
  } catch (error) {
    console.error("Error adding stock history record:", error);
    return null;
  }
}

// Load data on app startup
export async function loadInitialData(): Promise<{
  products: Product[];
  customers: Customer[];
  orders: Order[];
  users: User[];
  companySettings: CompanySettings | null;
  stockHistory: StockHistoryRecord[];
}> {
  try {
    // Make sure database is connected
    const dbConnected = await initPostgresConnection();
    
    if (!dbConnected) {
      console.error("Failed to connect to database during initial data load");
      return {
        products: [],
        customers: [],
        orders: [],
        users: [],
        companySettings: null,
        stockHistory: []
      };
    }
    
    // Load all data from PostgreSQL
    const products = await getProducts();
    const customers = await getCustomers();
    const orders = await getOrders();
    const users = await getUsers();
    const companySettings = await getCompanySettings();
    const stockHistory = await getStockHistory();
    
    return { products, customers, orders, users, companySettings, stockHistory };
  } catch (error) {
    console.error("Error loading initial data:", error);
    // Return empty state if error occurs
    return {
      products: [],
      customers: [],
      orders: [],
      users: [],
      companySettings: null,
      stockHistory: []
    };
  }
}
