import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Orders from "@/pages/Orders";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NewProduct from "@/pages/NewProduct";
import ProductDetail from "@/pages/ProductDetail";
import EditProduct from "@/pages/EditProduct";
import NewCustomer from "@/pages/NewCustomer";
import CustomerDetail from "@/pages/CustomerDetail";
import NewOrder from "@/pages/NewOrder";
import OrderDetail from "@/pages/OrderDetail";
import Users from "@/pages/Users";
import NewUser from "@/pages/NewUser";
import EditUser from "@/pages/EditUser";
import CompanySettings from "@/pages/CompanySettings";
import CustomerCategories from "@/pages/CustomerCategories";
import EditCustomer from "@/pages/EditCustomer";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/products/new" element={<MainLayout><NewProduct /></MainLayout>} />
          <Route path="/products/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
          <Route path="/products/:id/edit" element={<MainLayout><EditProduct /></MainLayout>} />
          <Route path="/customers" element={<MainLayout><Customers /></MainLayout>} />
          <Route path="/customers/new" element={<MainLayout><NewCustomer /></MainLayout>} />
          <Route path="/customers/:id" element={<MainLayout><CustomerDetail /></MainLayout>} />
          <Route path="/customers/:id/edit" element={<MainLayout><EditCustomer /></MainLayout>} />
          <Route path="/orders" element={<MainLayout><Orders /></MainLayout>} />
          <Route path="/orders/new" element={<MainLayout><NewOrder /></MainLayout>} />
          <Route path="/orders/:id" element={<MainLayout><OrderDetail /></MainLayout>} />
          <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
          <Route path="/users/new" element={<MainLayout><NewUser /></MainLayout>} />
          <Route path="/users/:id/edit" element={<MainLayout><EditUser /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="/company-settings" element={<MainLayout><CompanySettings /></MainLayout>} />
          <Route path="/customer-categories" element={<MainLayout><CustomerCategories /></MainLayout>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
