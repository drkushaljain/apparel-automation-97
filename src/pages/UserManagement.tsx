
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserPlus, Settings, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { User as UserType, UserRole, UserPermissions } from "@/types";
import NoContent from "@/components/NoContent";

const UserManagement = () => {
  const { state, dispatch } = useAppContext();
  const { users, currentUser } = state;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canViewDashboard: false,
    canManageProducts: false,
    canManageOrders: false,
    canManageCustomers: false,
    canManageUsers: false,
    canExportData: false,
    canSendMarketing: false,
    canViewReports: false,
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("employee");
    setActive(true);
    setPermissions({
      canViewDashboard: false,
      canManageProducts: false,
      canManageOrders: false,
      canManageCustomers: false,
      canManageUsers: false,
      canExportData: false,
      canSendMarketing: false,
      canViewReports: false,
    });
    setEditingUser(null);
  };

  const handleOpenDialog = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setRole(user.role);
      setActive(user.active);
      setPermissions(user.permissions || {
        canViewDashboard: user.role === "admin",
        canManageProducts: user.role !== "employee",
        canManageOrders: true,
        canManageCustomers: true,
        canManageUsers: user.role === "admin",
        canExportData: user.role !== "employee",
        canSendMarketing: user.role !== "employee",
        canViewReports: user.role !== "employee",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    
    if (!editingUser) {
      // Add new user
      const newUser: UserType = {
        id: `u${users.length + 1}`,
        name,
        email,
        phone,
        role,
        active,
        permissions,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_USER', payload: newUser });
      toast.success("User added successfully");
    } else {
      // Update existing user
      const updatedUser = {
        ...editingUser,
        name,
        email,
        phone,
        role,
        active,
        permissions,
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      toast.success("User updated successfully");
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteUser = (user: UserType) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      dispatch({ type: 'DELETE_USER', payload: user.id });
      toast.success("User deleted successfully");
    }
  };

  // Set all permissions for a role
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setPermissions({
      canViewDashboard: newRole === "admin",
      canManageProducts: newRole !== "employee",
      canManageOrders: true,
      canManageCustomers: true,
      canManageUsers: newRole === "admin",
      canExportData: newRole !== "employee",
      canSendMarketing: newRole !== "employee", 
      canViewReports: newRole !== "employee",
    });
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
          <Button onClick={() => handleOpenDialog()}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <NoContent
                title="No users found"
                description="You haven't added any users yet."
                actionText="Add User"
                actionLink="#"
                icon={<User className="h-12 w-12 text-primary/20" />}
                onAction={() => handleOpenDialog()}
              />
            ) : (
              <div className="rounded-md border">
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
                          <span className={`px-2 py-1 rounded-full text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user details and permissions' 
                  : 'Add a new user to the system with specific roles and permissions'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(val: UserRole) => handleRoleChange(val)}>
                  <SelectTrigger>
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
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="bg-muted/20 p-3 rounded-md space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-dashboard" 
                      checked={permissions.canViewDashboard}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canViewDashboard: !!checked})
                      }
                    />
                    <Label htmlFor="perm-dashboard">View Dashboard</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-products" 
                      checked={permissions.canManageProducts}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canManageProducts: !!checked})
                      }
                    />
                    <Label htmlFor="perm-products">Manage Products</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-orders" 
                      checked={permissions.canManageOrders}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canManageOrders: !!checked})
                      }
                    />
                    <Label htmlFor="perm-orders">Manage Orders</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-customers" 
                      checked={permissions.canManageCustomers}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canManageCustomers: !!checked})
                      }
                    />
                    <Label htmlFor="perm-customers">Manage Customers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-users" 
                      checked={permissions.canManageUsers}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canManageUsers: !!checked})
                      }
                    />
                    <Label htmlFor="perm-users">Manage Users</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-export" 
                      checked={permissions.canExportData}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canExportData: !!checked})
                      }
                    />
                    <Label htmlFor="perm-export">Export Data</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-marketing" 
                      checked={permissions.canSendMarketing}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canSendMarketing: !!checked})
                      }
                    />
                    <Label htmlFor="perm-marketing">Send Marketing Messages</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="perm-reports" 
                      checked={permissions.canViewReports}
                      onCheckedChange={(checked) => 
                        setPermissions({...permissions, canViewReports: !!checked})
                      }
                    />
                    <Label htmlFor="perm-reports">View Reports</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Add User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
