import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { Plus, UserPlus, Trash2, UserCog } from "lucide-react";

const UserManagement = () => {
  const { state, addUser, updateUser, deleteUser } = useAppContext();
  const { users, currentUser } = state;
  
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form fields
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
  
  // Reset form fields
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("employee");
    setIsActive(true);
    
    setCanViewDashboard(false);
    setCanManageProducts(false);
    setCanManageOrders(true);
    setCanManageCustomers(true);
    setCanManageUsers(false);
    setCanExportData(false);
    setCanSendMarketing(false);
    setCanViewReports(false);
  };
  
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
  
  // Open edit user dialog
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Don't populate password
    setRole(user.role);
    setIsActive(user.active !== undefined ? user.active : true);
    
    const permissions = user.permissions || {
      canViewDashboard: user.role === "admin",
      canManageProducts: user.role !== "employee",
      canManageOrders: true,
      canManageCustomers: true,
      canManageUsers: user.role === "admin",
      canExportData: user.role !== "employee",
      canSendMarketing: user.role !== "employee",
      canViewReports: user.role !== "employee",
    };
    
    setCanViewDashboard(permissions.canViewDashboard);
    setCanManageProducts(permissions.canManageProducts);
    setCanManageOrders(permissions.canManageOrders);
    setCanManageCustomers(permissions.canManageCustomers);
    setCanManageUsers(permissions.canManageUsers);
    setCanExportData(permissions.canExportData);
    setCanSendMarketing(permissions.canSendMarketing);
    setCanViewReports(permissions.canViewReports);
    
    setEditUserDialog(true);
  };
  
  // Submit handler for creating new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check for duplicate email
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }
    
    const newUser = {
      name,
      email,
      password,
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
      }
    };
    
    addUser(newUser);
    resetForm();
    setNewUserDialog(false);
  };
  
  // Submit handler for updating user
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    if (!name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check for duplicate email (excluding current user)
    const existingUser = users.find(
      u => u.id !== selectedUser.id && u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }
    
    const updatedUser = {
      ...selectedUser,
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
    resetForm();
    setEditUserDialog(false);
    setSelectedUser(null);
  };
  
  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
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

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
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
                  
                  <div className="pt-2 border-t">
                    <h3 className="font-medium mb-2">Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="dashboard"
                          checked={canViewDashboard}
                          onCheckedChange={(checked) => setCanViewDashboard(!!checked)}
                        />
                        <Label htmlFor="dashboard" className="leading-none">Dashboard</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="products"
                          checked={canManageProducts}
                          onCheckedChange={(checked) => setCanManageProducts(!!checked)}
                        />
                        <Label htmlFor="products" className="leading-none">Manage Products</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="orders"
                          checked={canManageOrders}
                          onCheckedChange={(checked) => setCanManageOrders(!!checked)}
                        />
                        <Label htmlFor="orders" className="leading-none">Manage Orders</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="customers"
                          checked={canManageCustomers}
                          onCheckedChange={(checked) => setCanManageCustomers(!!checked)}
                        />
                        <Label htmlFor="customers" className="leading-none">Manage Customers</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="users"
                          checked={canManageUsers}
                          onCheckedChange={(checked) => setCanManageUsers(!!checked)}
                        />
                        <Label htmlFor="users" className="leading-none">Manage Users</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="export"
                          checked={canExportData}
                          onCheckedChange={(checked) => setCanExportData(!!checked)}
                        />
                        <Label htmlFor="export" className="leading-none">Export Data</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketing"
                          checked={canSendMarketing}
                          onCheckedChange={(checked) => setCanSendMarketing(!!checked)}
                        />
                        <Label htmlFor="marketing" className="leading-none">Send Marketing</Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="reports"
                          checked={canViewReports}
                          onCheckedChange={(checked) => setCanViewReports(!!checked)}
                        />
                        <Label htmlFor="reports" className="leading-none">View Reports</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        {user.active !== false ? (
                          <span className="text-green-600 text-sm">Active</span>
                        ) : (
                          <span className="text-red-600 text-sm">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            disabled={user.id === currentUser?.id} // Prevent editing own user
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id} // Prevent deleting own user
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onOpenChange={setEditUserDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value: UserRole) => handleRoleChange(value)}
                >
                  <SelectTrigger id="edit-role">
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
                  id="edit-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="edit-active">Active Account</Label>
              </div>
              
              <div className="pt-2 border-t">
                <h3 className="font-medium mb-2">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-dashboard"
                      checked={canViewDashboard}
                      onCheckedChange={(checked) => setCanViewDashboard(!!checked)}
                    />
                    <Label htmlFor="edit-dashboard" className="leading-none">Dashboard</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-products"
                      checked={canManageProducts}
                      onCheckedChange={(checked) => setCanManageProducts(!!checked)}
                    />
                    <Label htmlFor="edit-products" className="leading-none">Manage Products</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-orders"
                      checked={canManageOrders}
                      onCheckedChange={(checked) => setCanManageOrders(!!checked)}
                    />
                    <Label htmlFor="edit-orders" className="leading-none">Manage Orders</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-customers"
                      checked={canManageCustomers}
                      onCheckedChange={(checked) => setCanManageCustomers(!!checked)}
                    />
                    <Label htmlFor="edit-customers" className="leading-none">Manage Customers</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-users"
                      checked={canManageUsers}
                      onCheckedChange={(checked) => setCanManageUsers(!!checked)}
                    />
                    <Label htmlFor="edit-users" className="leading-none">Manage Users</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-export"
                      checked={canExportData}
                      onCheckedChange={(checked) => setCanExportData(!!checked)}
                    />
                    <Label htmlFor="edit-export" className="leading-none">Export Data</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-marketing"
                      checked={canSendMarketing}
                      onCheckedChange={(checked) => setCanSendMarketing(!!checked)}
                    />
                    <Label htmlFor="edit-marketing" className="leading-none">Send Marketing</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="edit-reports"
                      checked={canViewReports}
                      onCheckedChange={(checked) => setCanViewReports(!!checked)}
                    />
                    <Label htmlFor="edit-reports" className="leading-none">View Reports</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UserManagement;
