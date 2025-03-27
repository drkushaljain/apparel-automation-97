
import { Customer, Order, Product, User, CompanySettings } from '@/types';
import { initPostgresConnection, getCustomers, getOrders, getProducts, getUsers, getCompanySettings } from '@/services/postgresService';

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
