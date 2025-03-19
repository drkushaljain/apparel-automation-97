
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import NewOrder from "./pages/NewOrder";
import EditOrder from "./pages/EditOrder";
import Customers from "./pages/Customers";
import NewCustomer from "./pages/NewCustomer";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import NewProduct from "./pages/NewProduct";
import EditProduct from "./pages/EditProduct";
import Settings from "./pages/Settings";
import MarketingCampaigns from "./pages/MarketingCampaigns";
import RevenueReport from "./pages/RevenueReport";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/new" element={<NewOrder />} />
            <Route path="/orders/edit/:id" element={<EditOrder />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<NewCustomer />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/new" element={<NewProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/marketing" element={<MarketingCampaigns />} />
            <Route path="/revenue" element={<RevenueReport />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
