
import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  LogOut,
  Menu,
  Settings,
  X,
  User,
  MessageSquare,
  FileText,
  UserCog,
  ChevronLeft,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserRole } from "@/types";
import { toast } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { state } = useAppContext();
  const { currentUser } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [userRole, setUserRole] = useState<UserRole>("employee");
  
  useEffect(() => {
    // Get current user from localStorage (this would be set during login in a real app)
    const storedUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (storedUser && storedUser.role) {
      setUserRole(storedUser.role as UserRole);
    } else if (currentUser) {
      // Use context user as fallback
      setUserRole(currentUser.role as UserRole);
      // Store in localStorage
      localStorage.setItem('current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Close sidebar automatically when in mobile view and route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: location.pathname === "/" || location.pathname === "/dashboard",
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingBag,
      current: location.pathname.startsWith("/orders"),
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      current: location.pathname.startsWith("/products"),
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      current: location.pathname.startsWith("/customers"),
      roles: ["admin", "manager", "employee"],
    },
    {
      name: "Marketing",
      href: "/marketing",
      icon: MessageSquare,
      current: location.pathname.startsWith("/marketing"),
      roles: ["admin", "manager"],
    },
    {
      name: "Revenue",
      href: "/reports/revenue",
      icon: FileText,
      current: location.pathname.startsWith("/reports/revenue"),
      roles: ["admin"],
    },
    {
      name: "User Management",
      href: "/users",
      icon: UserCog,
      current: location.pathname.startsWith("/users"),
      roles: ["admin"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location.pathname.startsWith("/settings"),
      roles: ["admin", "manager"],
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-full">
      {/* Mobile sidebar toggle and back button */}
      <div className="fixed top-4 left-4 z-40 flex gap-2 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full shadow-md"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        {location.pathname !== "/" && location.pathname !== "/dashboard" && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackNavigation}
            className="rounded-full shadow-md"
            aria-label="Go Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sidebar backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-card border-r shadow-md transform transition-transform duration-200 ease-in-out overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:h-screen"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl font-bold truncate">Apparel Management</h1>
          </div>

          {/* User info */}
          {currentUser && (
            <div className="flex items-center px-6 py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {navigation
              .filter(item => item.roles.includes(userRole)) // Filter navigation items by user role
              .map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm h-10 mb-1",
                    item.current ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Button>
              ))}
          </nav>

          {/* Logout section */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => {
                toast.success("Logged out successfully");
                navigate("/login");
              }}
            >
              <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in pt-16 md:pt-6">
          {children}
        </main>
        <footer className="py-4 px-6 border-t text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Apparel Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
