
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { currentUser, isLoading } = state;

  useEffect(() => {
    // If loading, wait
    if (isLoading) return;
    
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate("/login");
    } else {
      // Redirect to dashboard
      navigate("/dashboard");
    }
  }, [currentUser, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default Index;
