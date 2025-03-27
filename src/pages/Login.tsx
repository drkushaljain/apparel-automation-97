
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { initPostgresConnection } from "@/services/postgresService";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const { state, login } = useAppContext();
  const { users } = state;
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDb, setIsCheckingDb] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  
  // Check database connection with improved UX
  const checkDbConnection = async () => {
    setIsCheckingDb(true);
    try {
      const connected = await initPostgresConnection();
      setDbConnected(connected);
      if (!connected) {
        toast.warning("Using local storage for data persistence", {
          description: "Database connection unavailable",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error checking database connection:", error);
      setDbConnected(false);
      toast.warning("Using local storage for data persistence", {
        description: "Database connection failed",
        duration: 5000,
      });
    } finally {
      setIsCheckingDb(false);
    }
  };
  
  // Check database connection on component mount
  useEffect(() => {
    checkDbConnection();
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (!email.trim()) {
      toast.error("Email is required");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
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

    // Simulate a short delay for better UX
    setTimeout(() => {
      // Successful login
      login(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/");
      setIsLoading(false);
    }, 500);
  };

  // Create a default admin user if no users exist
  const createDefaultAdmin = () => {
    setIsLoading(true);
    
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
      
      // Simulate a short delay for better UX
      setTimeout(() => {
        login(defaultAdmin);
        navigate("/");
        toast.success("Logged in as default admin user");
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-muted/40">
      <div className="max-w-md w-full px-4">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Apparel Management</CardTitle>
            <CardDescription>Enter your credentials to sign in</CardDescription>
            
            {/* Database connection status with better UI */}
            {isCheckingDb ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking database connection...</span>
              </div>
            ) : dbConnected === false ? (
              <Alert variant="warning" className="mt-2 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700 text-xs">
                  Database connection unavailable. Using local storage instead.
                </AlertDescription>
              </Alert>
            ) : null}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            {users.length === 0 && (
              <div className="w-full mb-4">
                <Alert className="bg-primary/5 border-primary/20 mb-3">
                  <AlertDescription className="text-sm">
                    <p className="font-medium">No users found in the system</p>
                    <p className="text-muted-foreground mt-1">Create and login as default admin</p>
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={createDefaultAdmin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Admin...
                    </>
                  ) : "Create Default Admin"}
                </Button>
              </div>
            )}
            <div className="text-center text-sm text-muted-foreground w-full p-2 bg-muted/50 rounded-md">
              <p>Demo credentials: admin@example.com / admin123</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
