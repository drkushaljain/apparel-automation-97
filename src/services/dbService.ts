
import { Customer, Order, Product, User } from "@/types";

// This file would handle actual PostgreSQL integration in a real application
// For now, we'll mock it with localStorage persistence

const DATABASE_KEYS = {
  PRODUCTS: 'apparel_products',
  CUSTOMERS: 'apparel_customers',
  ORDERS: 'apparel_orders',
  USERS: 'apparel_users',
};

// Load data from localStorage
const loadData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return [];
  }
};

// Save data to localStorage
const saveData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  // Simulating async database call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(loadData<Product>(DATABASE_KEYS.PRODUCTS));
    }, 300);
  });
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  // Simulating async database call
  return new Promise(resolve => {
    setTimeout(() => {
      saveData(DATABASE_KEYS.PRODUCTS, products);
      resolve();
    }, 300);
  });
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(loadData<Customer>(DATABASE_KEYS.CUSTOMERS));
    }, 300);
  });
};

export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      saveData(DATABASE_KEYS.CUSTOMERS, customers);
      resolve();
    }, 300);
  });
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(loadData<Order>(DATABASE_KEYS.ORDERS));
    }, 300);
  });
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      saveData(DATABASE_KEYS.ORDERS, orders);
      resolve();
    }, 300);
  });
};

// Users
export const getUsers = async (): Promise<User[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(loadData<User>(DATABASE_KEYS.USERS));
    }, 300);
  });
};

export const saveUsers = async (users: User[]): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      saveData(DATABASE_KEYS.USERS, users);
      resolve();
    }, 300);
  });
};

// Initialize database with mock data if empty
export const initializeDatabase = (mockProducts: Product[], mockCustomers: Customer[], mockOrders: Order[], mockUsers: User[]) => {
  const products = loadData<Product>(DATABASE_KEYS.PRODUCTS);
  const customers = loadData<Customer>(DATABASE_KEYS.CUSTOMERS);
  const orders = loadData<Order>(DATABASE_KEYS.ORDERS);
  const users = loadData<User>(DATABASE_KEYS.USERS);
  
  if (products.length === 0) {
    saveData(DATABASE_KEYS.PRODUCTS, mockProducts);
  }
  
  if (customers.length === 0) {
    saveData(DATABASE_KEYS.CUSTOMERS, mockCustomers);
  }
  
  if (orders.length === 0) {
    saveData(DATABASE_KEYS.ORDERS, mockOrders);
  }
  
  if (users.length === 0) {
    saveData(DATABASE_KEYS.USERS, mockUsers);
  }
};
