
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, AlertCircle, LucideWifi, WifiOff, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRole } from "@/types";
import * as postgresService from "@/services/postgresService";

const Login = () => {
  const { state, setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [apiCheckLoading, setApiCheckLoading] = useState(true);

  const checkApiStatus = async () => {
    try {
      setApiCheckLoading(true);
      setApiErrorMessage("");
      
      // Try connecting to database first
      const dbConnection = await postgresService.initPostgresConnection();
      
      if (dbConnection.success) {
        setApiError(false);
        console.log("Database connection successful");
      } else {
        console.error('Database connection failed:', dbConnection.message);
        setApiError(true);
        setApiErrorMessage(dbConnection.message);
        
        // Try general API health check as fallback
        try {
          const response = await fetch('/api/health', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          });
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              // API is working but database isn't
              console.log('API is working but database connection failed');
              setApiErrorMessage(`API is working but ${data.databaseConfigured ? 'database connection failed' : 'DATABASE_URL not configured'}`);
            } else {
              console.error('API returned non-JSON response');
              setApiErrorMessage('API returned non-JSON response. Is the server running?');
            }
          } else {
            console.error('API health check failed:', response.status);
            setApiErrorMessage(`API health check failed with status ${response.status}`);
          }
        } catch (error) {
          console.error('API connection error:', error);
          setApiErrorMessage(`Cannot connect to server: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('API status check error:', error);
      setApiError(true);
      setApiErrorMessage(`Error checking API status: ${error.message}`);
    } finally {
      setApiCheckLoading(false);
    }
  };

  useEffect(() => {
    // Check if API is accessible
    checkApiStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      setIsLoading(false);
      return;
    }
    
    try {
      if (apiError) {
        // Fallback to local check if API is unavailable
        const defaultUsers = [
          { id: 'u1', email: 'admin@example.com', password: 'password', name: 'Admin User', role: 'admin' as UserRole, active: true },
          { id: 'u2', email: 'manager@example.com', password: 'password', name: 'Manager User', role: 'manager' as UserRole, active: true }
        ];
        
        const user = defaultUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (user) {
          const fullUser = {
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: {
              canViewDashboard: user.role === "admin",
              canManageProducts: user.role !== "employee",
              canManageOrders: true,
              canManageCustomers: true,
              canManageUsers: user.role === "admin",
              canExportData: user.role !== "employee",
              canSendMarketing: user.role !== "employee",
              canViewReports: user.role !== "employee",
            }
          };
          
          setCurrentUser(fullUser);
          toast.success(`Welcome back, ${user.name}! (Local Mode)`);
          navigate("/dashboard");
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        // Try API login
        const userData = await postgresService.loginUser(email, password);
        
        if (userData) {
          setCurrentUser(userData);
          toast.success(`Welcome back, ${userData.name}!`);
          navigate("/dashboard");
        } else {
          // Fallback to checking against existing users in state
          const user = state.users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
          );
          
          if (user) {
            setCurrentUser(user);
            toast.success(`Welcome back, ${user.name}!`);
            navigate("/dashboard");
          } else {
            toast.error("Invalid email or password");
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-primary">Apparel Management</h1>
          <p className="text-muted-foreground mt-2">Your complete solution for apparel inventory and sales</p>
        </div>
        
        {apiCheckLoading ? (
          <div className="flex justify-center items-center mb-4 animate-pulse">
            <LucideWifi className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Checking server connection...</span>
          </div>
        ) : apiError ? (
          <Alert variant="destructive" className="mb-4 animate-slide-up">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <div>API server error: {apiErrorMessage}</div>
              <div className="text-xs">Login will use local authentication. Click to retry:</div>
              <Button variant="outline" size="sm" className="mt-1 self-start" onClick={checkApiStatus}>
                <RefreshCw className="h-3 w-3 mr-2" /> Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="mb-4 animate-slide-up bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
            <LucideWifi className="h-4 w-4" />
            <AlertDescription>
              Connected to server. Using database authentication.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 animate-slide-up">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="text-sm mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-md">
                <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Demo credentials:</p>
                <p className="text-muted-foreground">Admin: admin@example.com / password</p>
                <p className="text-muted-foreground">Manager: manager@example.com / password</p>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Sign In
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground animate-slide-up delay-100">
          <p>&copy; {new Date().getFullYear()} Apparel Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
