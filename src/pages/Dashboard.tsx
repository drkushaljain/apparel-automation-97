
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ShoppingBag, Users, DollarSign, Clock, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StockLogsDashboard from "@/components/dashboard/StockLogsDashboard";

const Dashboard = () => {
  const { state } = useAppContext();
  const { orders, customers, products } = state;
  const navigate = useNavigate();

  // Calculate statistics
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Status counts
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
  const packedOrders = orders.filter(order => order.status === 'packed').length;
  const dispatchedOrders = orders.filter(order => order.status === 'dispatched').length;
  const outForDeliveryOrders = orders.filter(order => order.status === 'out-for-delivery').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  // Organize orders by date for chart
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const ordersByDate = last30Days.map(date => {
    // Ensure we're working with proper Date objects by checking createdAt type
    const ordersOnDate = orders.filter(order => {
      // Ensure order.createdAt is a Date object
      const createdAt = order.createdAt instanceof Date ? 
        order.createdAt : 
        new Date(order.createdAt);
      
      return createdAt.toISOString().split('T')[0] === date;
    });
    
    return {
      date,
      displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: ordersOnDate.length,
      revenue: ordersOnDate.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  });

  // For status distribution chart
  const statusDistribution = [
    { name: 'Pending', value: pendingOrders, color: '#FBBF24' },
    { name: 'Confirmed', value: confirmedOrders, color: '#3B82F6' },
    { name: 'Packed', value: packedOrders, color: '#6366F1' },
    { name: 'Dispatched', value: dispatchedOrders, color: '#A855F7' },
    { name: 'Out for Delivery', value: outForDeliveryOrders, color: '#F97316' },
    { name: 'Delivered', value: deliveredOrders, color: '#10B981' },
  ];

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => {
      // Ensure both are Date objects for comparison
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={() => navigate("/orders/new")}>New Order</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingBag}
            colorClass="bg-blue-100 text-blue-700"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            colorClass="bg-green-100 text-green-700"
          />
          <StatCard
            title="Average Order"
            value={`₹${avgOrderValue.toLocaleString()}`}
            icon={TrendingUp}
            colorClass="bg-indigo-100 text-indigo-700"
          />
          <StatCard
            title="Customers"
            value={totalCustomers}
            icon={Users}
            colorClass="bg-purple-100 text-purple-700"
          />
        </div>

        {/* Charts & Tables */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Sales Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Order count and revenue for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersByDate}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 12 }}
                      interval={Math.floor(ordersByDate.length / 10)}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `₹${value}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span>{status.name}</span>
                      </div>
                    </div>
                    <div className="w-full max-w-[60%]">
                      <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${totalOrders > 0 ? (status.value / totalOrders) * 100 : 0}%`,
                            backgroundColor: status.color 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right ml-2">{status.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent orders</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{order.customer.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="mr-2">₹{order.totalAmount}</span>
                          <span className="text-xs">•</span>
                          <span className="ml-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  ))
                )}
              </div>
              {recentOrders.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-4"
                  onClick={() => navigate("/orders")}
                >
                  View All Orders
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stock Changes */}
          <div className="col-span-12 md:col-span-4">
            <StockLogsDashboard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
