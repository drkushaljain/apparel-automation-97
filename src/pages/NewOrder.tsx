
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import OrderForm from "@/components/OrderForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";

const NewOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useAppContext();

  const handleSubmit = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    addOrder(orderData);
    toast.success("Order created successfully");
    navigate("/orders");
  };

  const handleCancel = () => {
    navigate("/orders");
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-full">
        <div className="flex items-center gap-2 sticky top-0 bg-background z-10 pb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="md:flex hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">New Order</h1>
        </div>
        
        <OrderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
};

export default NewOrder;
