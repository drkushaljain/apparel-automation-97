
import { Customer, Order, Product, User, CompanySettings, StockHistoryRecord } from '@/types';
import { initPostgresConnection, getCustomers as postgresGetCustomers, getOrders as postgresGetOrders, getProducts as postgresGetProducts, getUsers as postgresGetUsers, getCompanySettings as postgresGetCompanySettings, getStockHistory as postgresGetStockHistory } from '@/services/postgresService';

// Initialize the database
export async function initDatabase(): Promise<boolean> {
  try {
    // First try to connect to the database
    const dbConnected = await initPostgresConnection();
    
    // If successful, return true
    if (dbConnected) {
      console.log("Database connected successfully");
      return true;
    }
    
    // If database connection failed, log the error and use localStorage
    console.warn("Database connection failed. Using localStorage instead.");
    return false;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// These functions are required by the AppContext and other components
export async function getProducts(): Promise<Product[]> {
  try {
    const dbConnected = await initPostgresConnection();
    if (dbConnected) {
      return await postgresGetProducts();
    } else {
      const localProducts = localStorage.getItem('products');
      return localProducts ? JSON.parse(localProducts) : [];
    }
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const dbConnected = await initPostgresConnection();
    if (dbConnected) {
      return await postgresGetCustomers();
    } else {
      const localCustomers = localStorage.getItem('customers');
      return localCustomers ? JSON.parse(localCustomers) : [];
    }
  } catch (error) {
    console.error("Error getting customers:", error);
    return [];
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const dbConnected = await initPostgresConnection();
    if (dbConnected) {
      return await postgresGetOrders();
    } else {
      const localOrders = localStorage.getItem('orders');
      return localOrders ? JSON.parse(localOrders) : [];
    }
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const dbConnected = await initPostgresConnection();
    if (dbConnected) {
      return await postgresGetUsers();
    } else {
      const localUsers = localStorage.getItem('users');
      return localUsers ? JSON.parse(localUsers) : [];
    }
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const dbConnected = await initPostgresConnection();
    if (dbConnected) {
      return await postgresGetCompanySettings();
    } else {
      const localCompanySettings = localStorage.getItem('company_settings');
      return localCompanySettings ? JSON.parse(localCompanySettings) : null;
    }
  } catch (error) {
    console.error("Error getting company settings:", error);
    return null;
  }
}

export async function getStockHistory(): Promise<StockHistoryRecord[]> {
  try {
    const dbConnected = await initPostgresConnection();
    if (dbConnected) {
      return await postgresGetStockHistory();
    } else {
      const localStockHistory = localStorage.getItem('stock_history');
      return localStockHistory ? JSON.parse(localStockHistory) : [];
    }
  } catch (error) {
    console.error("Error getting stock history:", error);
    return [];
  }
}

// Load data on app startup
export async function loadInitialData(): Promise<{
  products: Product[];
  customers: Customer[];
  orders: Order[];
  users: User[];
  companySettings: CompanySettings | null;
}> {
  // Try to load data from storage
  let products: Product[] = [];
  let customers: Customer[] = [];
  let orders: Order[] = [];
  let users: User[] = [];
  let companySettings: CompanySettings | null = null;
  
  try {
    // Try to load from database first
    const dbConnected = await initPostgresConnection();
    
    if (dbConnected) {
      // If connected to database, load from there
      products = await getProducts();
      customers = await getCustomers();
      orders = await getOrders();
      users = await getUsers();
      companySettings = await getCompanySettings();
    } else {
      // If not connected, load from localStorage
      const localProducts = localStorage.getItem('products');
      const localCustomers = localStorage.getItem('customers');
      const localOrders = localStorage.getItem('orders');
      const localUsers = localStorage.getItem('users');
      const localCompanySettings = localStorage.getItem('company_settings');
      
      if (localProducts) products = JSON.parse(localProducts);
      if (localCustomers) customers = JSON.parse(localCustomers);
      if (localOrders) orders = JSON.parse(localOrders);
      if (localUsers) users = JSON.parse(localUsers);
      if (localCompanySettings) companySettings = JSON.parse(localCompanySettings);
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
    // Fallback to empty arrays if everything fails
  }
  
  return { products, customers, orders, users, companySettings };
}
