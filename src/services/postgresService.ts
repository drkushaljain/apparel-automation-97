import { CompanySettings, Customer, Order, Product, StockHistoryRecord, User } from '@/types';

const API_BASE_URL = '/api';

export const initPostgresConnection = async (): Promise<boolean> => {
  try {
    console.log("Checking database connection status...");
    const response = await fetch(`${API_BASE_URL}/db-status`);
    
    if (!response.ok) {
      console.error(`Database status check failed: ${response.status} ${response.statusText}`);
      throw new Error(`Status ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Expected JSON response but got ${contentType}`);
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    const data = await response.json();
    console.log("Database connection status:", data);
    return data.connected === true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching products from API...");
    const response = await fetch(`${API_BASE_URL}/products`);
    
    if (!response.ok) {
      console.error(`Products fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.json() as Product[];
    console.log(`Retrieved ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Fetching customers from API...");
    const response = await fetch(`${API_BASE_URL}/customers`);
    
    if (!response.ok) {
      console.error(`Customers fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const customers = await response.json() as Customer[];
    console.log(`Retrieved ${customers.length} customers`);
    return customers;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    console.log("Fetching orders from API...");
    const response = await fetch(`${API_BASE_URL}/orders`);
    
    if (!response.ok) {
      console.error(`Orders fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const orders = await response.json() as Order[];
    console.log(`Retrieved ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching users from API...");
    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
      console.error(`Users fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const users = await response.json() as User[];
    console.log(`Retrieved ${users.length} users`);
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  try {
    console.log("Fetching company settings from API...");
    const response = await fetch(`${API_BASE_URL}/company-settings`);
    
    if (!response.ok && response.status !== 404) {
      console.error(`Company settings fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    if (response.status === 404) {
      console.log("No company settings found (404)");
      return null;
    }
    
    const settings = await response.json() as CompanySettings;
    console.log("Retrieved company settings");
    return settings;
  } catch (error) {
    console.error("Failed to fetch company settings:", error);
    return null;
  }
};

export const getStockHistory = async (): Promise<StockHistoryRecord[]> => {
  try {
    console.log("Fetching stock history from API...");
    const response = await fetch(`${API_BASE_URL}/stock-history`);
    
    if (!response.ok) {
      console.error(`Stock history fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const history = await response.json() as StockHistoryRecord[];
    console.log(`Retrieved ${history.length} stock history records`);
    return history;
  } catch (error) {
    console.error("Failed to fetch stock history:", error);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    console.log("Creating product via API...");
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      console.error(`Product creation failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const newProduct = await response.json() as Product;
    console.log("Product created successfully:", newProduct.id);
    return newProduct;
  } catch (error) {
    console.error("Failed to create product:", error);
    return null;
  }
};

export const updateProduct = async (product: Product): Promise<Product | null> => {
  try {
    console.log("Updating product via API:", product.id);
    const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      console.error(`Product update failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const updatedProduct = await response.json() as Product;
    console.log("Product updated successfully");
    return updatedProduct;
  } catch (error) {
    console.error("Failed to update product:", error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    console.log("Deleting product via API:", id);
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.error(`Product deletion failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
    }
    
    return response.ok;
  } catch (error) {
    console.error("Failed to delete product:", error);
    return false;
  }
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Customer;
  } catch (error) {
    console.error("Failed to create customer:", error);
    return null;
  }
};

export const updateCustomer = async (customer: Customer): Promise<Customer | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Customer;
  } catch (error) {
    console.error("Failed to update customer:", error);
    return null;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return false;
  }
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<Order | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Order;
  } catch (error) {
    console.error("Failed to create order:", error);
    return null;
  }
};

export const updateOrder = async (order: Order): Promise<Order | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${order.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as Order;
  } catch (error) {
    console.error("Failed to update order:", error);
    return null;
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete order:", error);
    return false;
  }
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as User;
  } catch (error) {
    console.error("Failed to create user:", error);
    return null;
  }
};

export const updateUser = async (user: User): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as User;
  } catch (error) {
    console.error("Failed to update user:", error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
};

export const updateCompanySettings = async (settings: CompanySettings): Promise<CompanySettings | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/company-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as CompanySettings;
  } catch (error) {
    console.error("Failed to update company settings:", error);
    return null;
  }
};

export const addStockHistory = async (record: Omit<StockHistoryRecord, 'id'>): Promise<StockHistoryRecord | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as StockHistoryRecord;
  } catch (error) {
    console.error("Failed to add stock history record:", error);
    return null;
  }
};
