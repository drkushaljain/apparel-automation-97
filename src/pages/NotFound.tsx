
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const getBackLink = () => {
    // Check if the URL includes specific patterns to provide better navigation
    if (location.pathname.includes('/customers/')) {
      return '/customers';
    } else if (location.pathname.includes('/orders/')) {
      return '/orders';
    } else if (location.pathname.includes('/products/')) {
      return '/products';
    } else {
      return '/dashboard';
    }
  };

  const getBackLinkLabel = () => {
    if (location.pathname.includes('/customers/')) {
      return 'Back to Customers';
    } else if (location.pathname.includes('/orders/')) {
      return 'Back to Orders';
    } else if (location.pathname.includes('/products/')) {
      return 'Back to Products';
    } else {
      return 'Return to Dashboard';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-6">
            <Search className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-primary mt-6">404</h1>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h2>
        <p className="mt-2 text-base text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Button 
            onClick={() => navigate(getBackLink())} 
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getBackLinkLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
