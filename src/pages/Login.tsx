
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { initPostgresConnection } from "@/services/postgresService";

const Login = () => {
  const { state, login } = useAppContext();
  const { users } = state;
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  
  // Check database connection
  const checkDbConnection = async () => {
    try {
      const connected = await initPostgresConnection();
      setDbConnected(connected);
      if (!connected) {
        toast.warning("Database connection failed. System will use local storage for data persistence.", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error checking database connection:", error);
      setDbConnected(false);
      toast.warning("Database connection failed. System will use local storage for data persistence.", {
        duration: 5000,
      });
    }
  };
  
  // Check database connection on component mount
  useState(() => {
    checkDbConnection();
  });
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      toast.error("Invalid email or password");
      setIsLoading(false);
      return;
    }

    // Check password
    if (user.password !== password) {
      toast.error("Invalid email or password");
      setIsLoading(false);
      return;
    }

    // Check if user is active
    if (user.active === false) {
      toast.error("Your account is inactive. Please contact an administrator.");
      setIsLoading(false);
      return;
    }

    // Successful login
    login(user);
    
    // Store current user in localStorage for persistence
    localStorage.setItem('current_user', JSON.stringify(user));
    
    toast.success(`Welcome back, ${user.name}!`);
    navigate("/");
    setIsLoading(false);
  };

  // Create a default admin user if no users exist
  const createDefaultAdmin = () => {
    if (users.length === 0) {
      const defaultAdmin = {
        id: "user_1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin" as const,
        active: true,
        permissions: {
          canViewDashboard: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageCustomers: true,
          canManageUsers: true,
          canExportData: true,
          canSendMarketing: true,
          canViewReports: true,
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      login(defaultAdmin);
      navigate("/");
      toast.success("Logged in as default admin user");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-muted/40">
      <div className="max-w-md w-full px-4">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Apparel Management</CardTitle>
            <CardDescription>Enter your credentials to sign in</CardDescription>
            {dbConnected === false && (
              <div className="text-amber-500 text-sm mt-2 bg-amber-50 py-1 px-2 rounded-md">
                <p>Database connection failed. Using local storage instead.</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            {users.length === 0 && (
              <div className="w-full mb-4">
                <div className="bg-muted p-3 rounded-md text-sm text-center">
                  <p className="font-medium">No users found in the system</p>
                  <p className="text-muted-foreground mt-1">Click below to create and login as default admin</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={createDefaultAdmin}
                >
                  Create Default Admin
                </Button>
              </div>
            )}
            <div className="text-center text-sm text-muted-foreground w-full">
              <p>Demo credentials: admin@example.com / admin123</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
