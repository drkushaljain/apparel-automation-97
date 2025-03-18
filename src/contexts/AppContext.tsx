import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Customer, Order, OrderStatus, Product, User, CompanySettings } from '@/types';
import { generateMockOrders, mockCustomers, mockProducts, mockUsers } from '@/data/mockData';
import { toast } from 'sonner';
import * as dbService from '@/services/dbService';
import { format } from 'date-fns';

interface AppState {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  companySettings: CompanySettings | null;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_COMPANY_SETTINGS'; payload: CompanySettings }
  | { type: 'SET_LOADING'; payload: boolean };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'orders'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  setCurrentUser: (user: User | null) => void;
  setCompanySettings: (settings: CompanySettings) => void;
  logActivity: (action: string, entityType: "order" | "product" | "customer" | "user" | "system", entityId?: string, details?: string) => void;
  formatDate: (date: Date | string) => string;
}

const initialState: AppState = {
  products: [],
  customers: [],
  orders: [],
  users: [],
  currentUser: null,
  companySettings: null,
  isLoading: true
};

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.id ? action.payload : order
        )
      };
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload)
      };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.orderId 
            ? { ...order, status: action.payload.status, updatedAt: new Date() } 
            : order
        )
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_COMPANY_SETTINGS':
      return { ...state, companySettings: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize database and load data
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Initialize database with mock data if it's empty
        dbService.initializeDatabase(
          mockProducts,
          mockCustomers,
          generateMockOrders(),
          mockUsers
        );
        
        // Load data from database (localStorage in this mock implementation)
        const products = await dbService.getProducts();
        const customers = await dbService.getCustomers();
        const orders = await dbService.getOrders();
        const users = await dbService.getUsers();
        const companySettings = await dbService.getCompanySettings();
        
        // Update state with loaded data
        dispatch({ type: 'SET_PRODUCTS', payload: products.length ? products : mockProducts });
        dispatch({ type: 'SET_CUSTOMERS', payload: customers.length ? customers : mockCustomers });
        dispatch({ type: 'SET_ORDERS', payload: orders.length ? orders : generateMockOrders() });
        
        // Initialize user permissions for existing users if they don't have them
        const updatedUsers = (users.length ? users : mockUsers).map(user => {
          if (!user.permissions) {
            return {
              ...user,
              active: user.active !== undefined ? user.active : true,
              permissions: {
                canViewDashboard: user.role === "admin",
                canManageProducts: user.role !== "employee",
                canManageOrders: true,
                canManageCustomers: true,
                canManageUsers: user.role === "admin",
                canExportData: user.role !== "employee",
                canSendMarketing: user.role !== "employee",
                canViewReports: user.role !== "employee",
              }
            };
          }
          return user;
        });
        
        dispatch({ type: 'SET_USERS', payload: updatedUsers });
        dispatch({ type: 'SET_CURRENT_USER', payload: updatedUsers[0] });
        
        if (companySettings) {
          dispatch({ type: 'SET_COMPANY_SETTINGS', payload: companySettings });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data from the database");
        
        // Fallback to mock data on error
        dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
        dispatch({ type: 'SET_CUSTOMERS', payload: mockCustomers });
        dispatch({ type: 'SET_ORDERS', payload: generateMockOrders() });
        
        const updatedMockUsers = mockUsers.map(user => ({
          ...user,
          active: true,
          permissions: {
            canViewDashboard: user.role === "admin",
            canManageProducts: user.role !== "employee",
            canManageOrders: true,
            canManageCustomers: true,
            canManageUsers: user.role === "admin",
            canExportData: user.role !== "employee",
            canSendMarketing: user.role !== "employee",
            canViewReports: user.role !== "employee",
          }
        }));
        
        dispatch({ type: 'SET_USERS', payload: updatedMockUsers });
        dispatch({ type: 'SET_CURRENT_USER', payload: updatedMockUsers[0] });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, []);
  
  // Save state changes to database
  useEffect(() => {
    if (!state.isLoading) {
      dbService.saveProducts(state.products);
      dbService.saveCustomers(state.customers);
      dbService.saveOrders(state.orders);
      dbService.saveUsers(state.users);
      
      if (state.companySettings) {
        dbService.saveCompanySettings(state.companySettings);
      }
    }
  }, [state.products, state.customers, state.orders, state.users, state.companySettings, state.isLoading]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p${state.products.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    toast.success('Product added successfully');
  };

  const updateProduct = (product: Product) => {
    const updatedProduct = {
      ...product,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    toast.success('Product updated successfully');
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'orders'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c${state.customers.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      orders: []
    };
    
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    toast.success('Customer added successfully');
  };

  const updateCustomer = (customer: Customer) => {
    const updatedCustomer = {
      ...customer,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
    toast.success('Customer updated successfully');
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `o${state.orders.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_ORDER', payload: newOrder });
    toast.success('Order added successfully');
  };

  const updateOrder = (order: Order) => {
    const updatedOrder = {
      ...order,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    toast.success('Order updated successfully');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
    toast.success(`Order status updated to ${status}`);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: `u${state.users.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_USER', payload: newUser });
    logActivity('user_created', 'user', newUser.id, `New user ${newUser.name} created`);
    toast.success('User added successfully');
  };

  const updateUser = (user: User) => {
    const updatedUser = {
      ...user,
      updatedAt: new Date()
    };
    
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    logActivity('user_updated', 'user', user.id, `User ${user.name} updated`);
    toast.success('User updated successfully');
  };

  const deleteUser = (userId: string) => {
    // Don't delete the current user
    if (state.currentUser?.id === userId) {
      toast.error("You cannot delete your own account");
      return;
    }
    
    const user = state.users.find(u => u.id === userId);
    if (user) {
      dispatch({ type: 'DELETE_USER', payload: userId });
      logActivity('user_deleted', 'user', userId, `User ${user.name} deleted`);
      toast.success('User deleted successfully');
    }
  };

  const deleteProduct = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      logActivity('product_deleted', 'product', productId, `Product ${product.name} deleted`);
      toast.success('Product deleted successfully');
    }
  };

  const deleteCustomer = (customerId: string) => {
    const customer = state.customers.find(c => c.id === customerId);
    if (customer) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: customerId });
      logActivity('customer_deleted', 'customer', customerId, `Customer ${customer.name} deleted`);
      toast.success('Customer deleted successfully');
    }
  };

  const deleteOrder = (orderId: string) => {
    dispatch({ type: 'DELETE_ORDER', payload: orderId });
    logActivity('order_deleted', 'order', orderId, `Order #${orderId} deleted`);
    toast.success('Order deleted successfully');
  };

  const setCompanySettings = (settings: CompanySettings) => {
    dispatch({ type: 'SET_COMPANY_SETTINGS', payload: settings });
    toast.success('Company settings updated successfully');
  };

  const logActivity = (action: string, entityType: "order" | "product" | "customer" | "user" | "system", entityId?: string, details?: string) => {
    if (!state.currentUser) return;
    
    const activityLog = {
      id: `log${Date.now()}`,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date()
    };
    
    // Save to local storage
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push(activityLog);
    localStorage.setItem('activity_logs', JSON.stringify(logs));
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return format(dateObj, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    addUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    setCompanySettings,
    logActivity,
    formatDate
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
