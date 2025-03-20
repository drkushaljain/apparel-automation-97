
import { Customer, Order, OrderItem, OrderStatus, Product, SalesStats, User, UserRole } from "@/types";

// Mock Products
export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Premium Cotton T-Shirt",
    description: "High-quality cotton t-shirt in various colors",
    price: 599,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-03-10"),
    stock: 45,
    sales: 120,
    category: "Clothing"
  },
  {
    id: "p2",
    name: "Slim Fit Jeans",
    description: "Comfortable slim fit jeans for casual wear",
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    createdAt: new Date("2023-02-18"),
    updatedAt: new Date("2023-04-05"),
    stock: 28,
    sales: 75,
    category: "Clothing"
  },
  {
    id: "p3",
    name: "Formal Shirt",
    description: "Classic formal shirt for business attire",
    price: 899,
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: false,
    createdAt: new Date("2023-01-25"),
    updatedAt: new Date("2023-05-12"),
    stock: 0,
    sales: 60,
    category: "Clothing"
  },
  {
    id: "p4",
    name: "Summer Dress",
    description: "Light and flowy summer dress",
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-05-15"),
    stock: 15,
    sales: 42,
    category: "Clothing"
  },
  {
    id: "p5",
    name: "Sports Jacket",
    description: "Lightweight jacket perfect for sports and outdoors",
    price: 1899,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    createdAt: new Date("2023-02-28"),
    updatedAt: new Date("2023-04-22"),
    stock: 22,
    sales: 30,
    category: "Outerwear"
  }
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Rahul Sharma",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "rahul.s@example.com",
    address: "123, Park Street, Sector 5",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10"),
    orders: []
  },
  {
    id: "c2",
    name: "Priya Patel",
    phone: "8765432109",
    whatsapp: "8765432109",
    email: "priya.p@example.com",
    address: "45, Lake View Apartments",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15"),
    orders: []
  },
  {
    id: "c3",
    name: "Amit Kumar",
    phone: "7654321098",
    whatsapp: "7654321098",
    address: "78, Green Valley, Near City Mall",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    createdAt: new Date("2023-03-22"),
    updatedAt: new Date("2023-03-22"),
    orders: []
  },
  {
    id: "c4",
    name: "Sneha Reddy",
    phone: "6543210987",
    whatsapp: "6543210987",
    email: "sneha.r@example.com",
    address: "56, Golden Heights, Road No.5",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05"),
    orders: []
  }
];

// Mock Order Items
const createOrderItems = (products: Product[]): OrderItem[] => {
  return [
    {
      id: "oi1",
      productId: products[0].id,
      product: products[0],
      quantity: 2,
      price: products[0].price
    },
    {
      id: "oi2",
      productId: products[1].id,
      product: products[1],
      quantity: 1,
      price: products[1].price
    }
  ];
};

// Helper function to generate random status
const getRandomStatus = (): OrderStatus => {
  const statuses: OrderStatus[] = ['pending', 'confirmed', 'packed', 'dispatched', 'out-for-delivery', 'delivered'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Mock Orders
export const generateMockOrders = (): Order[] => {
  return [
    {
      id: "o1",
      customerId: mockCustomers[0].id,
      customer: mockCustomers[0],
      items: createOrderItems(mockProducts),
      totalAmount: 2497, // 2 t-shirts + 1 jeans
      transactionId: "TXN123456789",
      status: 'delivered',
      trackingId: "TRACK123456",
      trackingUrl: "https://example.com/track/TRACK123456",
      dispatchImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      createdAt: new Date("2023-05-01"),
      updatedAt: new Date("2023-05-05"),
      createdBy: "u1" // Admin user
    },
    {
      id: "o2",
      customerId: mockCustomers[1].id,
      customer: mockCustomers[1],
      items: [
        {
          id: "oi3",
          productId: mockProducts[2].id,
          product: mockProducts[2],
          quantity: 1,
          price: mockProducts[2].price
        },
        {
          id: "oi4",
          productId: mockProducts[3].id,
          product: mockProducts[3],
          quantity: 1,
          price: mockProducts[3].price
        }
      ],
      totalAmount: 2398, // 1 formal shirt + 1 summer dress
      transactionId: "TXN987654321",
      status: 'dispatched',
      trackingId: "TRACK654321",
      trackingUrl: "https://example.com/track/TRACK654321",
      dispatchImage: "https://images.unsplash.com/photo-1573521193826-58c7dc2e13e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      createdAt: new Date("2023-05-10"),
      updatedAt: new Date("2023-05-12"),
      createdBy: "u2" // Manager user
    },
    {
      id: "o3",
      customerId: mockCustomers[2].id,
      customer: mockCustomers[2],
      items: [
        {
          id: "oi5",
          productId: mockProducts[4].id,
          product: mockProducts[4],
          quantity: 1,
          price: mockProducts[4].price
        }
      ],
      totalAmount: 1899, // 1 sports jacket
      transactionId: "TXN567891234",
      status: 'confirmed',
      createdAt: new Date("2023-05-15"),
      updatedAt: new Date("2023-05-15"),
      createdBy: "u3" // Employee user
    },
    {
      id: "o4",
      customerId: mockCustomers[3].id,
      customer: mockCustomers[3],
      items: [
        {
          id: "oi6",
          productId: mockProducts[0].id,
          product: mockProducts[0],
          quantity: 3,
          price: mockProducts[0].price
        },
        {
          id: "oi7",
          productId: mockProducts[3].id,
          product: mockProducts[3],
          quantity: 1,
          price: mockProducts[3].price
        }
      ],
      totalAmount: 3296, // 3 t-shirts + 1 summer dress
      transactionId: "TXN345678912",
      status: 'packed',
      createdAt: new Date("2023-05-18"),
      updatedAt: new Date("2023-05-19"),
      createdBy: "u1" // Admin user
    },
    {
      id: "o5",
      customerId: mockCustomers[0].id,
      customer: mockCustomers[0],
      items: [
        {
          id: "oi8",
          productId: mockProducts[1].id,
          product: mockProducts[1],
          quantity: 2,
          price: mockProducts[1].price
        }
      ],
      totalAmount: 2598, // 2 slim fit jeans
      status: 'pending',
      createdAt: new Date("2023-05-20"),
      updatedAt: new Date("2023-05-20"),
      createdBy: "u2" // Manager user
    }
  ];
};

export const mockOrders = generateMockOrders();

// Update customer orders with order IDs only, not the full orders
mockCustomers.forEach(customer => {
  customer.orders = mockOrders
    .filter(order => order.customerId === customer.id)
    .map(order => order.id);
});

// Default permissions for different roles
const getDefaultPermissions = (role: UserRole) => ({
  canViewDashboard: role === "admin",
  canManageProducts: role !== "employee",
  canManageOrders: true,
  canManageCustomers: true,
  canManageUsers: role === "admin",
  canExportData: role !== "employee",
  canSendMarketing: role !== "employee",
  canViewReports: role !== "employee",
});

// Mock Users with correct types and permissions
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    password: "password", // Added missing password field
    createdAt: new Date("2022-12-01"),
    updatedAt: new Date("2022-12-01"),
    active: true,
    permissions: getDefaultPermissions("admin")
  },
  {
    id: "u2",
    name: "Manager User",
    email: "manager@example.com",
    role: "manager",
    password: "password", // Added missing password field
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
    active: true,
    permissions: getDefaultPermissions("manager")
  },
  {
    id: "u3",
    name: "Staff User",
    email: "staff@example.com",
    role: "employee", // Employee role (corrected from "staff")
    password: "password", // Added missing password field
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10"),
    active: true,
    permissions: getDefaultPermissions("employee")
  }
];

// Mock Sales Statistics
export const mockSalesStats: SalesStats = {
  totalOrders: mockOrders.length,
  totalRevenue: mockOrders.reduce((sum, order) => sum + order.totalAmount, 0),
  avgOrderValue: Math.round(mockOrders.reduce((sum, order) => sum + order.totalAmount, 0) / mockOrders.length),
  pendingOrders: mockOrders.filter(order => order.status === 'pending').length,
  dispatchedOrders: mockOrders.filter(order => ['dispatched', 'out-for-delivery'].includes(order.status)).length,
  deliveredOrders: mockOrders.filter(order => order.status === 'delivered').length,
  dailySales: [
    { date: "2023-05-01", orders: 1, revenue: 2497 },
    { date: "2023-05-02", orders: 0, revenue: 0 },
    { date: "2023-05-03", orders: 0, revenue: 0 },
    { date: "2023-05-04", orders: 0, revenue: 0 },
    { date: "2023-05-05", orders: 0, revenue: 0 },
    { date: "2023-05-06", orders: 0, revenue: 0 },
    { date: "2023-05-07", orders: 0, revenue: 0 },
    { date: "2023-05-08", orders: 0, revenue: 0 },
    { date: "2023-05-09", orders: 0, revenue: 0 },
    { date: "2023-05-10", orders: 1, revenue: 2398 },
    { date: "2023-05-11", orders: 0, revenue: 0 },
    { date: "2023-05-12", orders: 0, revenue: 0 },
    { date: "2023-05-13", orders: 0, revenue: 0 },
    { date: "2023-05-14", orders: 0, revenue: 0 },
    { date: "2023-05-15", orders: 1, revenue: 1899 },
    { date: "2023-05-16", orders: 0, revenue: 0 },
    { date: "2023-05-17", orders: 0, revenue: 0 },
    { date: "2023-05-18", orders: 1, revenue: 3296 },
    { date: "2023-05-19", orders: 0, revenue: 0 },
    { date: "2023-05-20", orders: 1, revenue: 2598 },
    { date: "2023-05-21", orders: 0, revenue: 0 },
    { date: "2023-05-22", orders: 0, revenue: 0 },
    { date: "2023-05-23", orders: 0, revenue: 0 },
    { date: "2023-05-24", orders: 0, revenue: 0 },
    { date: "2023-05-25", orders: 0, revenue: 0 },
    { date: "2023-05-26", orders: 0, revenue: 0 },
    { date: "2023-05-27", orders: 0, revenue: 0 },
    { date: "2023-05-28", orders: 0, revenue: 0 },
    { date: "2023-05-29", orders: 0, revenue: 0 },
    { date: "2023-05-30", orders: 0, revenue: 0 }
  ]
};
