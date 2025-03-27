
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import postgresService from '@/services/postgresService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking database connection...'
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check database connection status on component mount
    const checkDatabase = async () => {
      try {
        const result = await postgresService.initPostgresConnection();
        setDbStatus({ 
          connected: result.success, 
          message: result.message 
        });
        
        if (result.success) {
          // If DB is connected, check if it's properly initialized
          const validateResult = await postgresService.validateDatabaseConnection();
          
          if (!validateResult.success) {
            console.log('Database needs initialization:', validateResult.message);
            // Try to initialize the database if validation fails
            const initResult = await postgresService.initializeDatabase();
            if (initResult.success) {
              toast({
                title: "Database Initialized",
                description: initResult.message,
                duration: 5000
              });
            } else {
              toast({
                title: "Database Setup Issue",
                description: initResult.message,
                variant: "destructive",
                duration: 5000
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking database:', error);
        setDbStatus({ 
          connected: false, 
          message: `Database error: ${error.message}` 
        });
      }
    };
    
    checkDatabase();
  }, [toast]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // First try to login using the PostgreSQL database
      if (dbStatus.connected) {
        const user = await postgresService.loginUser(email, password);
        
        if (user) {
          // Store the user in localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          toast({
            title: "Login Successful",
            description: `Welcome back, ${user.name}!`,
          });
          navigate('/dashboard');
          return;
        }
      }
      
      // If PostgreSQL login fails or is not available, try local storage fallback
      const usersJSON = localStorage.getItem('users');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      const user = users.find((u: any) => 
        u.email === email && u.password === password && u.active
      );
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast({
          title: "Login Successful (Local Mode)",
          description: `Welcome back, ${user.name}!`,
        });
        navigate('/dashboard');
        return;
      }
      
      // If we get here, login failed
      setError('Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const retryConnection = async () => {
    setDbStatus({ connected: false, message: 'Reconnecting...' });
    try {
      const result = await postgresService.initPostgresConnection();
      setDbStatus({ 
        connected: result.success, 
        message: result.message 
      });
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the database.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
      setDbStatus({ 
        connected: false, 
        message: `Reconnection error: ${error.message}` 
      });
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Apparel Management System
          </h1>
          <p className="text-gray-600 mt-1">Please sign in to continue</p>
          
          {/* Database connection status */}
          <div className={`mt-4 p-2 rounded text-sm ${dbStatus.connected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <p className="font-semibold">Database Status:</p>
            <p>{dbStatus.message}</p>
            {!dbStatus.connected && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryConnection} 
                className="mt-2"
              >
                Retry Connection
              </Button>
            )}
            {!dbStatus.connected && (
              <p className="text-xs mt-2">
                You can still log in using local data. Default credentials are:<br />
                Email: admin@example.com<br />
                Password: password
              </p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help setting up the database?</p>
          <p className="mt-1">
            Make sure the <code>DATABASE_URL</code> environment variable is set correctly.
          </p>
          <p className="mt-1">
            Check the <a href="/setup" className="text-blue-600 hover:underline">Setup Guide</a> for more information.
          </p>
        </div>
      </Card>
    </div>
  );
}
