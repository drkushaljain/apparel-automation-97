
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import OrderForm from "@/components/OrderForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const EditOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateOrder } = useAppContext();
  const { orders } = state;
  const isMobile = useIsMobile();

  const order = orders.find(o => o.id === id);

  const handleSubmit = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!order) return;
    
    const updatedOrder: Order = {
      ...orderData,
      id: order.id,
      createdAt: order.createdAt,
      updatedAt: new Date()
    };
    
    updateOrder(updatedOrder);
    toast.success("Order updated successfully");
    navigate(`/orders/${order.id}`);
  };

  const handleCancel = () => {
    navigate(`/orders/${id}`);
  };

  if (!order) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Order not found</h2>
            <p className="text-muted-foreground">The order you're trying to edit doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate("/orders")}>
              Back to Orders
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 animate-fade-in max-w-full pb-16 md:pb-0">
        <div className="flex items-center gap-2 sticky top-0 bg-background z-10 pb-2">
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${id}`)} className="md:flex hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Edit Order {order.id}</h1>
        </div>
        
        <div className="px-0 md:px-4">
          <OrderForm
            initialData={order}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EditOrder;
