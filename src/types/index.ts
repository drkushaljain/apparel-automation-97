
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  transactionId?: string;
  status: OrderStatus;
  trackingId?: string;
  trackingUrl?: string;
  dispatchImage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  dailySales: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}
