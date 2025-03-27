
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { User, UserRole } from "@/types";
import { toast } from "sonner";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateUser } = useAppContext();
  const { users, currentUser } = state;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [isActive, setIsActive] = useState(true);
  
  // Permissions
  const [canViewDashboard, setCanViewDashboard] = useState(false);
  const [canManageProducts, setCanManageProducts] = useState(false);
  const [canManageOrders, setCanManageOrders] = useState(true);
  const [canManageCustomers, setCanManageCustomers] = useState(true);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canExportData, setCanExportData] = useState(false);
  const [canSendMarketing, setCanSendMarketing] = useState(false);
  const [canViewReports, setCanViewReports] = useState(false);

  // Load user data
  useEffect(() => {
    if (id) {
      const foundUser = users.find(u => u.id === id);
      if (foundUser) {
        setUser(foundUser);
        setName(foundUser.name);
        setEmail(foundUser.email);
        setRole(foundUser.role);
        setIsActive(foundUser.active !== false);
        
        // Set permissions
        const permissions = foundUser.permissions || {
          canViewDashboard: foundUser.role === "admin",
          canManageProducts: foundUser.role !== "employee",
          canManageOrders: true,
          canManageCustomers: true,
          canManageUsers: foundUser.role === "admin",
          canExportData: foundUser.role !== "employee",
          canSendMarketing: foundUser.role !== "employee",
          canViewReports: foundUser.role !== "employee",
        };
        
        setCanViewDashboard(permissions.canViewDashboard);
        setCanManageProducts(permissions.canManageProducts);
        setCanManageOrders(permissions.canManageOrders);
        setCanManageCustomers(permissions.canManageCustomers);
        setCanManageUsers(permissions.canManageUsers);
        setCanExportData(permissions.canExportData);
        setCanSendMarketing(permissions.canSendMarketing);
        setCanViewReports(permissions.canViewReports);
      }
    }
  }, [id, users]);

  // Handle role change - preset permissions based on role
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    
    if (newRole === "admin") {
      setCanViewDashboard(true);
      setCanManageProducts(true);
      setCanManageOrders(true);
      setCanManageCustomers(true);
      setCanManageUsers(true);
      setCanExportData(true);
      setCanSendMarketing(true);
      setCanViewReports(true);
    } else if (newRole === "manager") {
      setCanViewDashboard(true);
      setCanManageProducts(true);
      setCanManageOrders(true);
      setCanManageCustomers(true);
      setCanManageUsers(false);
      setCanExportData(true);
      setCanSendMarketing(true);
      setCanViewReports(true);
    } else {
      setCanViewDashboard(false);
      setCanManageProducts(false);
      setCanManageOrders(true);
      setCanManageCustomers(true);
      setCanManageUsers(false);
      setCanExportData(false);
      setCanSendMarketing(false);
      setCanViewReports(false);
    }
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check for valid email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Check for duplicate email (excluding current user)
    const existingUser = users.find(
      u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }
    
    setIsLoading(true);
    
    // Update user
    const updatedUser = {
      ...user,
      name,
      email,
      ...(password ? { password } : {}), // Only update password if provided
      role,
      active: isActive,
      permissions: {
        canViewDashboard,
        canManageProducts,
        canManageOrders,
        canManageCustomers,
        canManageUsers,
        canExportData,
        canSendMarketing,
        canViewReports,
      },
      updatedAt: new Date()
    };
    
    updateUser(updatedUser);
    toast.success("User updated successfully");
    setIsLoading(false);
    navigate("/users");
  };

  // Only admin can access this page
  if (currentUser?.role !== "admin") {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this page.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Can't edit your own user
  if (id === currentUser.id) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Action Not Allowed</h2>
            <p className="text-muted-foreground">You cannot edit your own user account.</p>
            <Button className="mt-4" onClick={() => navigate("/users")}>
              Back to Users
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">User not found</h2>
            <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate("/users")}>
              Back to Users
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password (leave empty to keep current)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value: UserRole) => handleRoleChange(value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active">Active Account</Label>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">User Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="dashboard"
                      checked={canViewDashboard}
                      onCheckedChange={(checked) => setCanViewDashboard(!!checked)}
                    />
                    <Label htmlFor="dashboard" className="leading-none pt-0.5">Dashboard Access</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="products"
                      checked={canManageProducts}
                      onCheckedChange={(checked) => setCanManageProducts(!!checked)}
                    />
                    <Label htmlFor="products" className="leading-none pt-0.5">Manage Products</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="orders"
                      checked={canManageOrders}
                      onCheckedChange={(checked) => setCanManageOrders(!!checked)}
                    />
                    <Label htmlFor="orders" className="leading-none pt-0.5">Manage Orders</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="customers"
                      checked={canManageCustomers}
                      onCheckedChange={(checked) => setCanManageCustomers(!!checked)}
                    />
                    <Label htmlFor="customers" className="leading-none pt-0.5">Manage Customers</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="users"
                      checked={canManageUsers}
                      onCheckedChange={(checked) => setCanManageUsers(!!checked)}
                    />
                    <Label htmlFor="users" className="leading-none pt-0.5">Manage Users</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="export"
                      checked={canExportData}
                      onCheckedChange={(checked) => setCanExportData(!!checked)}
                    />
                    <Label htmlFor="export" className="leading-none pt-0.5">Export Data</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={canSendMarketing}
                      onCheckedChange={(checked) => setCanSendMarketing(!!checked)}
                    />
                    <Label htmlFor="marketing" className="leading-none pt-0.5">Send Marketing</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="reports"
                      checked={canViewReports}
                      onCheckedChange={(checked) => setCanViewReports(!!checked)}
                    />
                    <Label htmlFor="reports" className="leading-none pt-0.5">View Reports</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditUser;
