
import { Product, Customer, Order, User, CompanySettings, StockHistoryRecord } from '@/types';
import postgresService from './postgresService';
import { toast } from 'sonner';

// Default to use PostgreSQL if available
let usePostgres = true;
let connectionChecked = false;

/**
 * Checks if the PostgreSQL database is accessible
 */
const checkPostgresConnection = async (): Promise<boolean> => {
  try {
    const result = await postgresService.initPostgresConnection();
    return result.success;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    return false;
  }
};

export const initializeDatabase = async (
  initialProducts: Product[] = [],
  initialCustomers: Customer[] = [],
  initialOrders: Order[] = [],
  initialUsers: User[] = []
) => {
  // Check if we can connect to PostgreSQL
  if (!connectionChecked) {
    usePostgres = await checkPostgresConnection();
    connectionChecked = true;
    
    if (!usePostgres) {
      console.warn('PostgreSQL connection failed. Using localStorage as fallback.');
      toast.warning('Database connection failed. Using local storage as fallback.');
      
      // Initialize localStorage if it's empty and we're using it as fallback
      if (typeof window !== 'undefined') {
        const hasProducts = localStorage.getItem('products');
        if (!hasProducts && initialProducts.length > 0) {
          localStorage.setItem('products', JSON.stringify(initialProducts));
        }
        
        const hasCustomers = localStorage.getItem('customers');
        if (!hasCustomers && initialCustomers.length > 0) {
          localStorage.setItem('customers', JSON.stringify(initialCustomers));
        }
        
        const hasOrders = localStorage.getItem('orders');
        if (!hasOrders && initialOrders.length > 0) {
          localStorage.setItem('orders', JSON.stringify(initialOrders));
        }
        
        const hasUsers = localStorage.getItem('users');
        if (!hasUsers && initialUsers.length > 0) {
          localStorage.setItem('users', JSON.stringify(initialUsers));
        }
      }
    } else {
      console.log('Using PostgreSQL database');
    }
  }
  
  return usePostgres;
};

// Local storage fallback functions
const getLocalStorageData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveLocalStorageData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (usePostgres) {
    try {
      return await postgresService.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        return getLocalStorageData<Product>('products');
      }
      return [];
    }
  }
  return getLocalStorageData<Product>('products');
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  if (usePostgres) {
    try {
      // In a real implementation, this would update products in PostgreSQL
      console.log('Updating products in PostgreSQL');
      
      // Loop through products and call update for each
      for (const product of products) {
        await postgresService.updateProduct(product);
      }
    } catch (error) {
      console.error('Error saving products to PostgreSQL:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        saveLocalStorageData('products', products);
      }
    }
  } else {
    saveLocalStorageData('products', products);
  }
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  if (usePostgres) {
    try {
      return await postgresService.getCustomers();
    } catch (error) {
      console.error('Error fetching customers:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        return getLocalStorageData<Customer>('customers');
      }
      return [];
    }
  }
  return getLocalStorageData<Customer>('customers');
};

export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  if (usePostgres) {
    try {
      console.log('Updating customers in PostgreSQL');
      await postgresService.saveCustomers(customers);
    } catch (error) {
      console.error('Error saving customers to PostgreSQL:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        saveLocalStorageData('customers', customers);
      }
    }
  } else {
    saveLocalStorageData('customers', customers);
  }
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  if (usePostgres) {
    try {
      return await postgresService.getOrders();
    } catch (error) {
      console.error('Error fetching orders:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        return getLocalStorageData<Order>('orders');
      }
      return [];
    }
  }
  return getLocalStorageData<Order>('orders');
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  if (usePostgres) {
    try {
      console.log('Updating orders in PostgreSQL');
      await postgresService.saveOrders(orders);
    } catch (error) {
      console.error('Error saving orders to PostgreSQL:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        saveLocalStorageData('orders', orders);
      }
    }
  } else {
    saveLocalStorageData('orders', orders);
  }
};

// Users
export const getUsers = async (): Promise<User[]> => {
  if (usePostgres) {
    try {
      return await postgresService.getUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        return getLocalStorageData<User>('users');
      }
      return [];
    }
  }
  return getLocalStorageData<User>('users');
};

export const saveUsers = async (users: User[]): Promise<void> => {
  if (usePostgres) {
    try {
      console.log('Updating users in PostgreSQL');
      await postgresService.saveUsers(users);
    } catch (error) {
      console.error('Error saving users to PostgreSQL:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        saveLocalStorageData('users', users);
      }
    }
  } else {
    saveLocalStorageData('users', users);
  }
};

// Company Settings
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  if (usePostgres) {
    try {
      return await postgresService.getCompanySettings();
    } catch (error) {
      console.error('Error fetching company settings:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        const settings = localStorage.getItem('companySettings');
        return settings ? JSON.parse(settings) : null;
      }
      return null;
    }
  }
  const settings = localStorage.getItem('companySettings');
  return settings ? JSON.parse(settings) : null;
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<void> => {
  if (usePostgres) {
    try {
      console.log('Updating company settings in PostgreSQL');
      await postgresService.saveCompanySettings(settings);
    } catch (error) {
      console.error('Error saving company settings to PostgreSQL:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        localStorage.setItem('companySettings', JSON.stringify(settings));
      }
    }
  } else {
    localStorage.setItem('companySettings', JSON.stringify(settings));
  }
};

// Stock History
export const getStockHistory = async (productId?: string): Promise<StockHistoryRecord[]> => {
  if (usePostgres) {
    try {
      if (productId) {
        return await postgresService.getStockHistoryByProduct(productId);
      }
      
      // This would get all stock history from PostgreSQL
      return await postgresService.getAllStockHistory();
    } catch (error) {
      console.error('Error fetching stock history:', error);
      usePostgres = await checkPostgresConnection();
      if (!usePostgres) {
        const history = localStorage.getItem('stockHistory');
        const allHistory = history ? JSON.parse(history) : [];
        
        if (productId) {
          return allHistory.filter((record: StockHistoryRecord) => record.productId === productId);
        }
        return allHistory;
      }
      return [];
    }
  }
  
  const history = localStorage.getItem('stockHistory');
  const allHistory = history ? JSON.parse(history) : [];
  
  if (productId) {
    return allHistory.filter((record: StockHistoryRecord) => record.productId === productId);
  }
  return allHistory;
};

export const updateProductStock = async (
  productId: string, 
  newStock: number,
  reason: string,
  userId: string,
  userName: string
): Promise<boolean> => {
  if (usePostgres) {
    try {
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
    } catch (error) {
      console.error('Error updating product stock in PostgreSQL:', error);
      usePostgres = await checkPostgresConnection();
      
      if (!usePostgres) {
        // Fallback to localStorage
        const products = getLocalStorageData<Product>('products');
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) return false;
        
        const previousStock = products[productIndex].stock;
        products[productIndex].stock = newStock;
        products[productIndex].updatedAt = new Date();
        
        saveLocalStorageData('products', products);
        
        // Record stock history
        const stockHistory = getLocalStorageData<StockHistoryRecord>('stockHistory');
        stockHistory.push({
          id: `sh_${Date.now()}`,
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
        
        saveLocalStorageData('stockHistory', stockHistory);
        return true;
      }
      
      return false;
    }
  } else {
    // Use localStorage
    const products = getLocalStorageData<Product>('products');
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) return false;
    
    const previousStock = products[productIndex].stock;
    products[productIndex].stock = newStock;
    products[productIndex].updatedAt = new Date();
    
    saveLocalStorageData('products', products);
    
    // Record stock history
    const stockHistory = getLocalStorageData<StockHistoryRecord>('stockHistory');
    stockHistory.push({
      id: `sh_${Date.now()}`,
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
    
    saveLocalStorageData('stockHistory', stockHistory);
    return true;
  }
};

export default {
  initializeDatabase,
  getProducts,
  saveProducts,
  getCustomers,
  saveCustomers,
  getOrders,
  saveOrders,
  getUsers,
  saveUsers,
  getCompanySettings,
  saveCompanySettings,
  getStockHistory,
  updateProductStock
};
