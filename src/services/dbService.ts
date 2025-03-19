
import { Customer, Order, Product, User, CompanySettings } from "@/types";

// ========== LOCAL STORAGE IMPLEMENTATION ==========
// This is the current implementation that uses localStorage for data persistence
// In a production environment, this would be replaced with PostgreSQL queries

const DATABASE_KEYS = {
  PRODUCTS: 'apparel_products',
  CUSTOMERS: 'apparel_customers',
  ORDERS: 'apparel_orders',
  USERS: 'apparel_users',
  COMPANY_SETTINGS: 'company_settings',
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

// Helper function to fix dates in objects loaded from localStorage
const fixDates = <T extends object>(obj: T): T => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    const value = (newObj as any)[key];
    
    // Check if property is a Date string
    if (typeof value === 'string' && 
        (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) || 
         value.match(/^\w{3} \w{3} \d{2} \d{4}/))) {
      (newObj as any)[key] = new Date(value);
    } 
    // Recursively fix dates in nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (newObj as any)[key] = fixDates(value);
    }
    // Fix dates in arrays of objects
    else if (Array.isArray(value)) {
      (newObj as any)[key] = value.map(item => 
        typeof item === 'object' && item !== null ? fixDates(item) : item
      );
    }
  });
  return newObj;
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  // Simulating async database call
  return new Promise(resolve => {
    setTimeout(() => {
      const products = loadData<Product>(DATABASE_KEYS.PRODUCTS);
      resolve(products.map(product => fixDates(product)));
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
      const customers = loadData<Customer>(DATABASE_KEYS.CUSTOMERS);
      resolve(customers.map(customer => fixDates(customer)));
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
      const orders = loadData<Order>(DATABASE_KEYS.ORDERS);
      resolve(orders.map(order => fixDates(order)));
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
      const users = loadData<User>(DATABASE_KEYS.USERS);
      resolve(users.map(user => fixDates(user)));
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

// Company Settings
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem(DATABASE_KEYS.COMPANY_SETTINGS);
        if (data) {
          const settings = JSON.parse(data);
          resolve(fixDates(settings));
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error("Error loading company settings:", error);
        resolve(null);
      }
    }, 300);
  });
};

export const saveCompanySettings = async (settings: CompanySettings): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        localStorage.setItem(DATABASE_KEYS.COMPANY_SETTINGS, JSON.stringify(settings));
        resolve();
      } catch (error) {
        console.error("Error saving company settings:", error);
        resolve();
      }
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

// ========== POSTGRESQL INTEGRATION GUIDE ==========
/**
 * STEP 1: Setup PostgreSQL Database
 * 
 * 1. Install PostgreSQL on your server:
 *    - Linux: `sudo apt-get install postgresql postgresql-contrib`
 *    - macOS: `brew install postgresql`
 *    - Windows: Download installer from https://www.postgresql.org/download/windows/
 * 
 * 2. Create a new database:
 *    ```
 *    $ sudo -u postgres psql
 *    postgres=# CREATE DATABASE apparel_management;
 *    postgres=# CREATE USER apparel_user WITH ENCRYPTED PASSWORD 'your_secure_password';
 *    postgres=# GRANT ALL PRIVILEGES ON DATABASE apparel_management TO apparel_user;
 *    postgres=# \q
 *    ```
 * 
 * 3. Create tables (you can use this SQL script):
 *    ```sql
 *    CREATE TABLE IF NOT EXISTS users (
 *      id VARCHAR(100) PRIMARY KEY,
 *      name VARCHAR(255) NOT NULL,
 *      email VARCHAR(255) UNIQUE NOT NULL,
 *      role VARCHAR(50) NOT NULL,
 *      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      last_login TIMESTAMP,
 *      active BOOLEAN NOT NULL DEFAULT true,
 *      phone VARCHAR(50),
 *      permissions JSONB NOT NULL DEFAULT '{}'
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS products (
 *      id VARCHAR(100) PRIMARY KEY,
 *      name VARCHAR(255) NOT NULL,
 *      description TEXT,
 *      price DECIMAL(12, 2) NOT NULL,
 *      image_url VARCHAR(255),
 *      sku VARCHAR(100),
 *      stock INTEGER NOT NULL DEFAULT 0,
 *      is_available BOOLEAN NOT NULL DEFAULT true,
 *      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      sales INTEGER NOT NULL DEFAULT 0,
 *      category VARCHAR(100)
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS customers (
 *      id VARCHAR(100) PRIMARY KEY,
 *      name VARCHAR(255) NOT NULL,
 *      email VARCHAR(255),
 *      phone VARCHAR(50) NOT NULL,
 *      whatsapp VARCHAR(50) NOT NULL,
 *      address TEXT NOT NULL,
 *      city VARCHAR(100) NOT NULL,
 *      state VARCHAR(100) NOT NULL,
 *      pincode VARCHAR(20) NOT NULL,
 *      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS orders (
 *      id VARCHAR(100) PRIMARY KEY,
 *      customer_id VARCHAR(100) NOT NULL REFERENCES customers(id),
 *      total_amount DECIMAL(12, 2) NOT NULL,
 *      status VARCHAR(50) NOT NULL,
 *      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *      transaction_id VARCHAR(100),
 *      tracking_id VARCHAR(100),
 *      tracking_url VARCHAR(255),
 *      dispatch_image VARCHAR(255),
 *      notes TEXT,
 *      created_by VARCHAR(100) REFERENCES users(id)
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS order_items (
 *      id VARCHAR(100) PRIMARY KEY,
 *      order_id VARCHAR(100) NOT NULL REFERENCES orders(id),
 *      product_id VARCHAR(100) NOT NULL REFERENCES products(id),
 *      quantity INTEGER NOT NULL,
 *      price DECIMAL(12, 2) NOT NULL
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS company_settings (
 *      id VARCHAR(100) PRIMARY KEY DEFAULT 'default',
 *      name VARCHAR(255) NOT NULL,
 *      logo VARCHAR(255),
 *      email VARCHAR(255) NOT NULL,
 *      phone VARCHAR(50) NOT NULL,
 *      address TEXT NOT NULL,
 *      city VARCHAR(100) NOT NULL,
 *      state VARCHAR(100) NOT NULL,
 *      pincode VARCHAR(20) NOT NULL,
 *      website VARCHAR(255),
 *      tax_id VARCHAR(100),
 *      social_media JSONB
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS activity_logs (
 *      id VARCHAR(100) PRIMARY KEY,
 *      user_id VARCHAR(100) NOT NULL REFERENCES users(id),
 *      user_name VARCHAR(255) NOT NULL,
 *      action VARCHAR(255) NOT NULL,
 *      entity_type VARCHAR(50) NOT NULL,
 *      entity_id VARCHAR(100),
 *      details TEXT,
 *      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
 *    );
 *    
 *    CREATE TABLE IF NOT EXISTS marketing_campaigns (
 *      id VARCHAR(100) PRIMARY KEY,
 *      name VARCHAR(255) NOT NULL,
 *      message TEXT NOT NULL,
 *      target_type VARCHAR(50) NOT NULL,
 *      target_value TEXT,
 *      status VARCHAR(50) NOT NULL,
 *      scheduled_date TIMESTAMP,
 *      sent_date TIMESTAMP,
 *      created_by VARCHAR(100) NOT NULL REFERENCES users(id),
 *      created_at TIMESTAMP NOT NULL DEFAULT NOW()
 *    );
 *    ```
 */

/**
 * STEP 2: Install and Configure Required Node.js Packages
 * 
 * 1. Install the required packages:
 *    ```
 *    npm install pg pg-promise dotenv
 *    ```
 * 
 * 2. Create a `.env` file in the root of your project with the database connection details:
 *    ```
 *    DB_HOST=localhost
 *    DB_PORT=5432
 *    DB_NAME=apparel_management
 *    DB_USER=apparel_user
 *    DB_PASSWORD=your_secure_password
 *    ```
 * 
 * 3. Create a `db.ts` file to initialize the database connection:
 *    ```typescript
 *    import pgPromise from 'pg-promise';
 *    import dotenv from 'dotenv';
 *    
 *    dotenv.config();
 *    
 *    const pgp = pgPromise();
 *    
 *    const connection = {
 *      host: process.env.DB_HOST || 'localhost',
 *      port: parseInt(process.env.DB_PORT || '5432'),
 *      database: process.env.DB_NAME || 'apparel_management',
 *      user: process.env.DB_USER || 'apparel_user',
 *      password: process.env.DB_PASSWORD || 'your_secure_password',
 *      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
 *    };
 *    
 *    export const db = pgp(connection);
 *    ```
 */

/**
 * STEP 3: Update Repository Functions to Use PostgreSQL
 * 
 * You would update the repository functions in this file to use PostgreSQL instead of localStorage.
 * Below is an example implementation for the users repository:
 * 
 * ```typescript
 * import { db } from './db';
 * import { User, UserRole, UserPermissions } from '@/types';
 * 
 * export const getUsersFromDB = async (): Promise<User[]> => {
 *   try {
 *     const users = await db.any(
 *       `SELECT id, name, email, role, created_at, updated_at, last_login, 
 *        active, phone, permissions FROM users ORDER BY name`
 *     );
 *     
 *     return users.map(user => ({
 *       ...user,
 *       createdAt: user.created_at,
 *       updatedAt: user.updated_at,
 *       lastLogin: user.last_login,
 *       permissions: user.permissions || {
 *         canViewDashboard: user.role === "admin",
 *         canManageProducts: user.role !== "employee",
 *         canManageOrders: true,
 *         canManageCustomers: true,
 *         canManageUsers: user.role === "admin",
 *         canExportData: user.role !== "employee",
 *         canSendMarketing: user.role !== "employee",
 *         canViewReports: user.role !== "employee",
 *       }
 *     }));
 *   } catch (error) {
 *     console.error('Error fetching users from database:', error);
 *     return [];
 *   }
 * };
 * 
 * export const saveUserToDB = async (user: User): Promise<boolean> => {
 *   try {
 *     await db.none(
 *       `INSERT INTO users (id, name, email, role, created_at, updated_at, active, phone, permissions)
 *        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
 *        ON CONFLICT (id) DO UPDATE SET
 *        name = $2, email = $3, role = $4, updated_at = $6, active = $7,
 *        phone = $8, permissions = $9`,
 *       [
 *         user.id,
 *         user.name,
 *         user.email,
 *         user.role,
 *         user.createdAt,
 *         user.updatedAt,
 *         user.active,
 *         user.phone || null,
 *         JSON.stringify(user.permissions)
 *       ]
 *     );
 *     return true;
 *   } catch (error) {
 *     console.error('Error saving user to database:', error);
 *     return false;
 *   }
 * };
 * 
 * export const deleteUserFromDB = async (userId: string): Promise<boolean> => {
 *   try {
 *     await db.none('DELETE FROM users WHERE id = $1', [userId]);
 *     return true;
 *   } catch (error) {
 *     console.error('Error deleting user from database:', error);
 *     return false;
 *   }
 * };
 * ```
 * 
 * Similar functions would be implemented for products, customers, orders, etc.
 */

/**
 * STEP 4: Update the Frontend to Use the New Database Service
 * 
 * Once you've implemented the PostgreSQL repository functions, you'll need to:
 * 
 * 1. Create a backend API (using Express, NestJS, etc.) to expose endpoints for the repository functions
 * 2. Update the frontend to make API calls to these endpoints instead of using the current functions
 * 
 * Alternatively, if you're using a framework like Next.js, you could use API routes to directly access the database.
 */

/**
 * STEP 5: Data Migration
 * 
 * To migrate your existing data from localStorage to PostgreSQL:
 * 
 * 1. Fetch all data from localStorage using the current functions
 * 2. For each entity type, convert the data to the new PostgreSQL format if needed
 * 3. Insert the data into the appropriate PostgreSQL tables
 */

// Helper functions for PostgreSQL integration (would be implemented in a real app)
export const connectToPostgreSQL = () => {
  console.log("Connecting to PostgreSQL database...");
  // In a real implementation, this would connect to a PostgreSQL database
  // using a library like node-postgres, pg-promise, or Prisma
  return {
    connected: true,
    message: "Connected to PostgreSQL (simulated)"
  };
};

export const migrateDataToPostgreSQL = async () => {
  console.log("Migrating data to PostgreSQL...");
  // In a real implementation, this would:
  // 1. Create tables in PostgreSQL if they don't exist
  // 2. Load data from localStorage
  // 3. Insert/update data in PostgreSQL
  // 4. Handle relationships, constraints, etc.
  
  // For now, just simulate a successful migration
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    message: "Data migrated successfully (simulated)"
  };
};

// Below is what the function signatures would look like when updated to use PostgreSQL
// These are commented out since they would only be implemented when actually switching to PostgreSQL

/*
export const getUsersFromDB = async (): Promise<User[]> => {
  // Implement PostgreSQL query
};

export const saveUserToDB = async (user: User): Promise<boolean> => {
  // Implement PostgreSQL insert/update
};

export const getProductsFromDB = async (): Promise<Product[]> => {
  // Implement PostgreSQL query
};

export const saveProductToDB = async (product: Product): Promise<boolean> => {
  // Implement PostgreSQL insert/update
};

export const getCustomersFromDB = async (): Promise<Customer[]> => {
  // Implement PostgreSQL query
};

export const saveCustomerToDB = async (customer: Customer): Promise<boolean> => {
  // Implement PostgreSQL insert/update
};

export const getOrdersFromDB = async (): Promise<Order[]> => {
  // Implement PostgreSQL query
};

export const saveOrderToDB = async (order: Order): Promise<boolean> => {
  // Implement PostgreSQL insert/update
};

export const getCompanySettingsFromDB = async (): Promise<CompanySettings | null> => {
  // Implement PostgreSQL query
};

export const saveCompanySettingsToDB = async (settings: CompanySettings): Promise<boolean> => {
  // Implement PostgreSQL insert/update
};
*/
