
import { useRef } from "react";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Printer } from "lucide-react";

interface DeliverySlipProps {
  order: Order;
}

const DeliverySlip = ({ order }: DeliverySlipProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    try {
      const content = printRef.current;
      if (!content) return;
      
      const originalDisplay = document.body.style.display;
      const originalOverflow = document.body.style.overflow;
      
      // Hide everything else except the print content
      document.body.style.display = 'none';
      
      // Clone the content to print
      const printSection = document.createElement('div');
      printSection.className = 'print-section';
      printSection.appendChild(content.cloneNode(true));
      document.body.appendChild(printSection);
      
      // Print
      window.print();
      
      // Cleanup
      document.body.removeChild(printSection);
      document.body.style.display = originalDisplay;
      document.body.style.overflow = originalOverflow;
      
      toast.success("Printing delivery slip");
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Failed to print");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrint} className="no-print">
          <Printer className="h-4 w-4 mr-2" />
          Print Delivery Slip
        </Button>
      </div>
      
      <Card className="border-2 p-0 max-w-md mx-auto">
        <CardContent ref={printRef} className="p-6 space-y-4">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">DELIVERY SLIP</h2>
            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
          </div>
          
          {/* Customer Details */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase">Deliver To:</h3>
            <p className="font-bold">{order.customer.name}</p>
            <p className="text-sm">{order.customer.address}</p>
            <p className="text-sm">
              {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </p>
            <p className="text-sm">Phone: {order.customer.phone}</p>
          </div>
          
          {/* Order Details */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-semibold uppercase">Order Summary:</h3>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <p>
                    {item.product.name} x {item.quantity}
                  </p>
                  <p>₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <p>Total</p>
              <p>₹{order.totalAmount}</p>
            </div>
          </div>
          
          {/* Tracking Details */}
          {order.trackingId && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold uppercase">Tracking ID:</p>
              <p className="text-lg">{order.trackingId}</p>
            </div>
          )}
          
          {/* Notes */}
          {order.notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold uppercase">Notes:</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
          
          {/* Thank You Message */}
          <div className="text-center border-t pt-4">
            <p className="text-sm">Thank you for your order!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySlip;
