
import { OrderStatus, SalesStats } from "@/types";

// This file previously contained mock data.
// Now it only contains utility functions as we're using PostgreSQL for real data.

// Helper function to generate random status - may still be useful for testing
export const getRandomStatus = (): OrderStatus => {
  const statuses: OrderStatus[] = ['pending', 'confirmed', 'packed', 'dispatched', 'out-for-delivery', 'delivered'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Empty mock functions to maintain compatibility with existing code
export const mockProducts = [];
export const mockCustomers = [];
export const mockOrders = [];
export const mockUsers = [];

// Generate empty mock sales stats for testing
export const mockSalesStats: SalesStats = {
  totalOrders: 0,
  totalRevenue: 0,
  avgOrderValue: 0,
  pendingOrders: 0,
  dispatchedOrders: 0,
  deliveredOrders: 0,
  dailySales: []
};

// For backwards compatibility
export const generateMockOrders = () => [];
