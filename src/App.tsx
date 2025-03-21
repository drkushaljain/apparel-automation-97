
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import NewProduct from "@/pages/NewProduct";
import ProductDetail from "@/pages/ProductDetail";
import EditProduct from "@/pages/EditProduct";
import Customers from "@/pages/Customers";
import CustomerCategories from "@/pages/CustomerCategories";
import NewCustomer from "@/pages/NewCustomer";
import CustomerDetail from "@/pages/CustomerDetail";
import Orders from "@/pages/Orders";
import NewOrder from "@/pages/NewOrder";
import OrderDetail from "@/pages/OrderDetail";
import EditOrder from "@/pages/EditOrder";
import RevenueReport from "@/pages/RevenueReport";
import UserManagement from "@/pages/UserManagement";
import MarketingCampaigns from "@/pages/MarketingCampaigns";
import Settings from "@/pages/Settings";
import CompanySettings from "@/pages/CompanySettings";
import NotFound from "@/pages/NotFound";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="apparel-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<NewProduct />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customer-categories" element={<CustomerCategories />} />
          <Route path="customers/new" element={<NewCustomer />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="orders/:id/edit" element={<EditOrder />} />
          <Route path="reports/revenue" element={<RevenueReport />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="marketing" element={<MarketingCampaigns />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/company" element={<CompanySettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="top-right" closeButton />
    </ThemeProvider>
  );
}

export default App;
