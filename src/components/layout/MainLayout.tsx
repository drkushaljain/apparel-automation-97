
import { ReactNode, useState } from "react";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      current: location.pathname === "/",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingBag,
      current: location.pathname.startsWith("/orders"),
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      current: location.pathname.startsWith("/products"),
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      current: location.pathname.startsWith("/customers"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location.pathname.startsWith("/settings"),
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl font-bold">Apparel Management</h1>
          </div>

          {/* User info */}
          {currentUser && (
            <div className="flex items-center px-6 py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
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
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Logout section */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => navigate("/login")}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
        <footer className="p-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Apparel Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
