import { CompanySettings, Customer, Order, Product, StockHistoryRecord, User } from '@/types';

const API_BASE_URL = '/api';

export const initPostgresConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/db-status`);
    
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }
    
    const data = await response.json();
    return data.connected === true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Product[];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Customer[];
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Order[];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as User[];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/company-settings`);
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.status === 404) {
      return null;
    }
    return await response.json() as CompanySettings;
  } catch (error) {
    console.error("Failed to fetch company settings:", error);
    return null;
  }
};

export const getStockHistory = async (): Promise<StockHistoryRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock-history`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as StockHistoryRecord[];
  } catch (error) {
    console.error("Failed to fetch stock history:", error);
    return [];
  }
};
