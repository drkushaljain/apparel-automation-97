
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      return '/';
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
      return 'Return to Home';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate(getBackLink())} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {getBackLinkLabel()}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
