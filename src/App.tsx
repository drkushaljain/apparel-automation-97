
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
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
import MainLayout from "@/components/layout/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { Navigate } from "react-router-dom";
import "./App.css";

// Auth guard component to protect routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAppContext();
  const { currentUser, isLoading } = state;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="apparel-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes with MainLayout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <MainLayout>
              <Products />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <MainLayout>
              <NewProduct />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <MainLayout>
              <EditProduct />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <MainLayout>
              <Customers />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/customer-categories" element={
          <ProtectedRoute>
            <MainLayout>
              <CustomerCategories />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/customers/new" element={
          <ProtectedRoute>
            <MainLayout>
              <NewCustomer />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/customers/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <CustomerDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <MainLayout>
              <Orders />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/new" element={
          <ProtectedRoute>
            <MainLayout>
              <NewOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <OrderDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id/edit" element={
          <ProtectedRoute>
            <MainLayout>
              <EditOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports/revenue" element={
          <ProtectedRoute>
            <MainLayout>
              <RevenueReport />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/marketing" element={
          <ProtectedRoute>
            <MainLayout>
              <MarketingCampaigns />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings/company" element={
          <ProtectedRoute>
            <MainLayout>
              <CompanySettings />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" closeButton />
    </ThemeProvider>
  );
}

export default App;
