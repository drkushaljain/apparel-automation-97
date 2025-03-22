
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DateRange } from "react-day-picker";
import { addDays, format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { toast } from "sonner";
import { ArrowLeft, Download, FileText, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { UserRole } from "@/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]).join(',');
  const csvData = data.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${csvData}`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const RevenueReport = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { orders, products } = state;
  const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const [chartType, setChartType] = useState<"daily" | "category" | "product">("daily");
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingProduct: "",
    topSellingCategory: ""
  });
  
  useEffect(() => {
    if (currentUser.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }
    
    if (currentUser?.name) {
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: `log${Date.now()}`,
        userId: currentUser.id || 'unknown',
        userName: currentUser.name,
        action: 'viewed_revenue_report',
        entityType: 'system',
        details: `Viewed revenue report`,
        timestamp: new Date()
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    }
  }, [currentUser, navigate]);
  
  useEffect(() => {
    if (!date?.from || !date?.to) return;
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isWithinInterval(orderDate, {
        start: startOfDay(date.from!),
        end: endOfDay(date.to || date.from)
      });
    });
    
    const dailyMap = new Map();
    filteredOrders.forEach(order => {
      const dateStr = format(new Date(order.createdAt), 'yyyy-MM-dd');
      const currentAmount = dailyMap.get(dateStr) || 0;
      dailyMap.set(dateStr, currentAmount + order.totalAmount);
    });
    
    const dailySales = Array.from(dailyMap.entries()).map(([date, amount]) => ({
      date: format(new Date(date), 'MMM dd'),
      amount: amount
    }));
    
    dailySales.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    setSalesData(dailySales);
    
    const categoryMap = new Map();
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product.category || "Uncategorized";
        const currentAmount = categoryMap.get(category) || 0;
        categoryMap.set(category, currentAmount + (item.price * item.quantity));
      });
    });
    
    const categorySales = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
    
    setCategoryData(categorySales);
    
    const productMap = new Map();
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const currentAmount = productMap.get(item.product.name) || 0;
        productMap.set(item.product.name, currentAmount + (item.price * item.quantity));
      });
    });
    
    const productSales = Array.from(productMap.entries())
      .map(([product, amount]) => ({
        name: product,
        value: amount
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    setProductData(productSales);
    
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    let topProduct = { name: "None", sales: 0 };
    let topCategory = { name: "None", sales: 0 };
    
    productMap.forEach((sales, product) => {
      if (sales > topProduct.sales) {
        topProduct = { name: product, sales };
      }
    });
    
    categoryMap.forEach((sales, category) => {
      if (sales > topCategory.sales) {
        topCategory = { name: category, sales };
      }
    });
    
    setSummary({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topSellingProduct: topProduct.name,
      topSellingCategory: topCategory.name
    });
  }, [date, orders]);
  
  const handleExportCSV = () => {
    if (!date?.from || !date?.to) return;
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isWithinInterval(orderDate, {
        start: startOfDay(date.from!),
        end: endOfDay(date.to || date.from)
      });
    });
    
    const csvData = filteredOrders.map(order => ({
      OrderID: order.id,
      CustomerName: order.customer.name,
      OrderDate: format(new Date(order.createdAt), 'yyyy-MM-dd'),
      Status: order.status,
      TotalAmount: order.totalAmount,
      Items: order.items.length,
      TrackingID: order.trackingId || 'N/A'
    }));
    
    exportToCSV(
      csvData, 
      `revenue-report-${format(date.from!, 'yyyy-MM-dd')}-to-${format(date.to || date.from!, 'yyyy-MM-dd')}.csv`
    );
    
    toast.success("Report exported successfully");
    
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (currentUser?.name) {
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: `log${Date.now()}`,
        userId: currentUser.id || 'unknown',
        userName: currentUser.name,
        action: 'exported_revenue_report',
        entityType: 'system',
        details: `Exported revenue report from ${format(date.from!, 'yyyy-MM-dd')} to ${format(date.to || date.from!, 'yyyy-MM-dd')}`,
        timestamp: new Date()
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight ml-2">Revenue Report</h1>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <DatePickerWithRange date={date} setDate={setDate} />
        
        <div className="flex flex-wrap gap-2">
          <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
            <SelectTrigger className="w-[150px] sm:w-40">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Sales</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="product">Top Products</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportCSV} className="whitespace-nowrap">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h2 className="text-2xl font-bold">₹{summary.totalRevenue.toLocaleString()}</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <h2 className="text-2xl font-bold">{summary.totalOrders}</h2>
              </div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <h2 className="text-2xl font-bold">
                  ₹{summary.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h2>
              </div>
              <PieChartIcon className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Top Category</p>
              <h2 className="text-xl font-bold truncate">{summary.topSellingCategory}</h2>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>
            {chartType === "daily" ? "Daily Sales" : 
             chartType === "category" ? "Sales by Category" : 
             "Top Selling Products"}
          </CardTitle>
          <CardDescription>
            {date?.from && date?.to 
              ? `${format(date.from, 'PPP')} to ${format(date.to, 'PPP')}`
              : "Please select a date range"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px]">
            {chartType === "daily" && (
              <ChartContainer
                config={{
                  amount: { theme: { light: "#8884d8", dark: "#a5b4fc" } },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={Math.min(5, Math.floor(salesData.length / 5) || 0)}
                    />
                    <YAxis width={60} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`₹${(value as number).toLocaleString()}`, "Revenue"]}
                        />
                      }
                    />
                    <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
            
            {chartType === "category" && (
              <ResponsiveContainer width="100%" height="100%" className="mx-auto max-w-[600px]">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Revenue']} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {chartType === "product" && (
              <ChartContainer
                config={{
                  value: { theme: { light: "#82ca9d", dark: "#6ee7b7" } },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={productData} 
                    layout="vertical"
                    margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={90}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`₹${(value as number).toLocaleString()}`, "Revenue"]}
                        />
                      }
                    />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueReport;
