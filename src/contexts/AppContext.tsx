
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Customer, Order, OrderStatus, Product, User } from '@/types';
import { generateMockOrders, mockCustomers, mockProducts, mockUsers } from '@/data/mockData';
import { toast } from 'sonner';
import * as dbService from '@/services/dbService';

interface AppState {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'orders'>) => void;
  updateCustomer: (customer: Customer) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setCurrentUser: (user: User | null) => void;
}

const initialState: AppState = {
  products: [],
  customers: [],
  orders: [],
  users: [],
  currentUser: null,
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
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
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
        
        // Update state with loaded data
        dispatch({ type: 'SET_PRODUCTS', payload: products.length ? products : mockProducts });
        dispatch({ type: 'SET_CUSTOMERS', payload: customers.length ? customers : mockCustomers });
        dispatch({ type: 'SET_ORDERS', payload: orders.length ? orders : generateMockOrders() });
        dispatch({ type: 'SET_USERS', payload: users.length ? users : mockUsers });
        
        // Set default admin user as current user
        dispatch({ type: 'SET_CURRENT_USER', payload: users[0] || mockUsers[0] });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data from the database");
        
        // Fallback to mock data on error
        dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
        dispatch({ type: 'SET_CUSTOMERS', payload: mockCustomers });
        dispatch({ type: 'SET_ORDERS', payload: generateMockOrders() });
        dispatch({ type: 'SET_USERS', payload: mockUsers });
        dispatch({ type: 'SET_CURRENT_USER', payload: mockUsers[0] });
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
    }
  }, [state.products, state.customers, state.orders, state.users, state.isLoading]);

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

  const setCurrentUser = (user: User | null) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    addProduct,
    updateProduct,
    addCustomer,
    updateCustomer,
    addOrder,
    updateOrder,
    updateOrderStatus,
    setCurrentUser
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
