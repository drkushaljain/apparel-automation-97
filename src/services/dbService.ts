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
    // Always try to connect to PostgreSQL first
    console.log("Initializing database connection to PostgreSQL...");
    const dbConnected = await initPostgresConnection();
    
    if (dbConnected) {
      console.log("PostgreSQL connected successfully");
      return true;
    }
    
    console.error("PostgreSQL connection failed");
    return false;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// PRODUCTS
export async function getProducts(): Promise<Product[]> {
  try {
    console.log("Getting products from database...");
    // Always try PostgreSQL first
    await initPostgresConnection();
    const products = await postgresGetProducts();
    
    if (products && products.length > 0) {
      console.log(`Retrieved ${products.length} products from PostgreSQL`);
      return products;
    } else {
      console.warn("No products found in PostgreSQL database");
      return [];
    }
  } catch (error) {
    console.error("Error getting products from PostgreSQL:", error);
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    await initPostgresConnection();
    console.log("Sending product to database:", JSON.stringify(product));
    const newProduct = await createProduct(product);
    if (newProduct) {
      console.log("Product added successfully:", newProduct.id);
    } else {
      console.error("Failed to add product - no response from API");
    }
    return newProduct;
  } catch (error) {
    console.error("Error adding product:", error);
    return null;
  }
}

export async function modifyProduct(product: Product): Promise<Product | null> {
  try {
    await initPostgresConnection();
    console.log("Updating product in database:", product.id);
    const updatedProduct = await updateProduct(product);
    if (updatedProduct) {
      console.log("Product updated successfully");
    } else {
      console.error("Failed to update product - no response from API");
    }
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
}

export async function removeProduct(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    console.log("Deleting product from database:", id);
    return await deleteProduct(id);
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

// CUSTOMERS
export async function getCustomers(): Promise<Customer[]> {
  try {
    console.log("Getting customers from database...");
    // Always try PostgreSQL first
    await initPostgresConnection();
    const customers = await postgresGetCustomers();
    
    if (customers && customers.length > 0) {
      console.log(`Retrieved ${customers.length} customers from PostgreSQL`);
      return customers;
    } else {
      console.warn("No customers found in PostgreSQL database");
      return [];
    }
  } catch (error) {
    console.error("Error getting customers from PostgreSQL:", error);
    return [];
  }
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer | null> {
  try {
    await initPostgresConnection();
    console.log("Sending customer to database:", JSON.stringify(customer));
    const newCustomer = await createCustomer(customer);
    if (newCustomer) {
      console.log("Customer added successfully:", newCustomer.id);
    } else {
      console.error("Failed to add customer - no response from API");
    }
    return newCustomer;
  } catch (error) {
    console.error("Error adding customer:", error);
    return null;
  }
}

export async function modifyCustomer(customer: Customer): Promise<Customer | null> {
  try {
    await initPostgresConnection();
    console.log("Updating customer in database:", customer.id);
    const updatedCustomer = await updateCustomer(customer);
    if (updatedCustomer) {
      console.log("Customer updated successfully");
    } else {
      console.error("Failed to update customer - no response from API");
    }
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer:", error);
    return null;
  }
}

export async function removeCustomer(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    console.log("Deleting customer from database:", id);
    return await deleteCustomer(id);
  } catch (error) {
    console.error("Error deleting customer:", error);
    return false;
  }
}

// ORDERS
export async function getOrders(): Promise<Order[]> {
  try {
    console.log("Getting orders from database...");
    // Always try PostgreSQL first
    await initPostgresConnection();
    const orders = await postgresGetOrders();
    
    if (orders && orders.length > 0) {
      console.log(`Retrieved ${orders.length} orders from PostgreSQL`);
      return orders;
    } else {
      console.warn("No orders found in PostgreSQL database");
      return [];
    }
  } catch (error) {
    console.error("Error getting orders from PostgreSQL:", error);
    return [];
  }
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order | null> {
  try {
    await initPostgresConnection();
    console.log("Sending order to database:", JSON.stringify(order));
    const newOrder = await createOrder(order);
    if (newOrder) {
      console.log("Order added successfully:", newOrder.id);
    } else {
      console.error("Failed to add order - no response from API");
    }
    return newOrder;
  } catch (error) {
    console.error("Error adding order:", error);
    return null;
  }
}

export async function modifyOrder(order: Order): Promise<Order | null> {
  try {
    await initPostgresConnection();
    console.log("Updating order in database:", order.id);
    const updatedOrder = await updateOrder(order);
    if (updatedOrder) {
      console.log("Order updated successfully");
    } else {
      console.error("Failed to update order - no response from API");
    }
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
}

export async function removeOrder(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    console.log("Deleting order from database:", id);
    return await deleteOrder(id);
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
}

// USERS
export async function getUsers(): Promise<User[]> {
  try {
    console.log("Getting users from database...");
    // Always try PostgreSQL first
    await initPostgresConnection();
    const users = await postgresGetUsers();
    
    if (users && users.length > 0) {
      console.log(`Retrieved ${users.length} users from PostgreSQL`);
      return users;
    } else {
      console.warn("No users found in PostgreSQL database");
      return [];
    }
  } catch (error) {
    console.error("Error getting users from PostgreSQL:", error);
    return [];
  }
}

export async function addUser(user: Omit<User, 'id'>): Promise<User | null> {
  try {
    await initPostgresConnection();
    console.log("Sending user to database:", JSON.stringify(user));
    const newUser = await createUser(user);
    if (newUser) {
      console.log("User added successfully:", newUser.id);
    } else {
      console.error("Failed to add user - no response from API");
    }
    return newUser;
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
}

export async function modifyUser(user: User): Promise<User | null> {
  try {
    await initPostgresConnection();
    console.log("Updating user in database:", user.id);
    const updatedUser = await updateUser(user);
    if (updatedUser) {
      console.log("User updated successfully");
    } else {
      console.error("Failed to update user - no response from API");
    }
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function removeUser(id: string): Promise<boolean> {
  try {
    await initPostgresConnection();
    console.log("Deleting user from database:", id);
    return await deleteUser(id);
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

// COMPANY SETTINGS
export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    console.log("Getting company settings from database...");
    // Always try PostgreSQL first
    await initPostgresConnection();
    const settings = await postgresGetCompanySettings();
    
    if (settings) {
      console.log("Retrieved company settings from PostgreSQL");
      return settings;
    } else {
      console.warn("No company settings found in PostgreSQL database");
      return null;
    }
  } catch (error) {
    console.error("Error getting company settings from PostgreSQL:", error);
    return null;
  }
}

export async function saveCompanySettings(settings: CompanySettings): Promise<CompanySettings | null> {
  try {
    await initPostgresConnection();
    console.log("Updating company settings in database");
    const updatedSettings = await updateCompanySettings(settings);
    if (updatedSettings) {
      console.log("Company settings updated successfully");
    } else {
      console.error("Failed to update company settings - no response from API");
    }
    return updatedSettings;
  } catch (error) {
    console.error("Error updating company settings:", error);
    return null;
  }
}

// STOCK HISTORY
export async function getStockHistory(): Promise<StockHistoryRecord[]> {
  try {
    console.log("Getting stock history from database...");
    // Always try PostgreSQL first
    await initPostgresConnection();
    const history = await postgresGetStockHistory();
    
    if (history && history.length > 0) {
      console.log(`Retrieved ${history.length} stock history records from PostgreSQL`);
      return history;
    } else {
      console.warn("No stock history found in PostgreSQL database");
      return [];
    }
  } catch (error) {
    console.error("Error getting stock history from PostgreSQL:", error);
    return [];
  }
}

export async function addStockRecord(record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> {
  try {
    await initPostgresConnection();
    console.log("Adding stock history record to database:", JSON.stringify(record));
    const newRecord = await addStockHistory(record);
    if (newRecord) {
      console.log("Stock history record added successfully:", newRecord.id);
    } else {
      console.error("Failed to add stock history record - no response from API");
    }
    return newRecord;
  } catch (error) {
    console.error("Error adding stock history record:", error);
    return null;
  }
}

// Load data on app startup - always try PostgreSQL first
export async function loadInitialData(): Promise<{
  products: Product[];
  customers: Customer[];
  orders: Order[];
  users: User[];
  companySettings: CompanySettings | null;
  stockHistory: StockHistoryRecord[];
}> {
  try {
    console.log("Loading initial data...");
    
    // Make sure database is connected
    const dbConnected = await initDatabase();
    
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
    
    console.log("Database connected, loading initial data from PostgreSQL...");
    
    // Load all data from PostgreSQL
    const products = await getProducts();
    const customers = await getCustomers();
    const orders = await getOrders();
    const users = await getUsers();
    const companySettings = await getCompanySettings();
    const stockHistory = await getStockHistory();
    
    console.log("Initial data loaded successfully from PostgreSQL");
    
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
