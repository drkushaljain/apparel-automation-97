
// User roles
export type UserRole = "admin" | "manager" | "employee";

// User permissions
export interface UserPermissions {
  canViewDashboard: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageCustomers: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canSendMarketing: boolean;
  canViewReports: boolean;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  active: boolean;
  phone?: string;
  permissions: UserPermissions;
}

// Product
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  sku?: string;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  sales: number;
  category?: string;
}

// Customer
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: Date;
  updatedAt: Date;
  orders: string[]; // Array of order IDs
}

// Order Item
export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

// Order Status
export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "packed" 
  | "dispatched" 
  | "out-for-delivery" 
  | "delivered" 
  | "cancelled";

// Order
export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  transactionId?: string;
  trackingId?: string;
  trackingUrl?: string;
  dispatchImage?: string;
  notes?: string;
  createdBy?: string; // User who created the order
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: "order" | "product" | "customer" | "user" | "system";
  entityId?: string;
  details?: string;
  timestamp: Date;
}

// Sales Data
export interface SalesData {
  day: string;
  amount: number;
}

// Product Category
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  productsCount: number;
}

// Marketing Campaign Status
export type CampaignStatus = "draft" | "scheduled" | "sent" | "cancelled";

// Marketing Campaign
export interface MarketingCampaign {
  id: string;
  name: string;
  message: string;
  targetType: "all" | "category" | "specific";
  targetValue?: string; // Category name or specific customer IDs
  status: CampaignStatus;
  scheduledDate?: Date;
  sentDate?: Date;
  createdBy: string;
  createdAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  topProducts: Product[];
  recentActivity: ActivityLog[];
  salesByDay: SalesData[];
}

// Sales Statistics
export interface SalesStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  dailySales: { date: string; orders: number; revenue: number }[];
}

// Company Settings
export interface CompanySettings {
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website?: string;
  taxId?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}
