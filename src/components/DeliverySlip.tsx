
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
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Unable to open print window. Please check your popup blocker settings.");
        return;
      }
      
      // Add necessary styles
      printWindow.document.write(`
        <html>
          <head>
            <title>Delivery Slip - Order #${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .slip-container { max-width: 400px; margin: 0 auto; border: 2px solid #000; padding: 16px; }
              .text-center { text-align: center; }
              .border-b { border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 12px; }
              .space-y-1 > * { margin-bottom: 8px; }
              .font-bold { font-weight: bold; }
              .text-sm { font-size: 0.875rem; }
              .uppercase { text-transform: uppercase; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .border-t { border-top: 1px solid #ddd; padding-top: 12px; margin-top: 12px; }
              .pt-2 { padding-top: 8px; }
              .mt-2 { margin-top: 8px; }
              @media print {
                body { margin: 0; padding: 0; }
                .slip-container { border: none; max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="slip-container">
              ${content.innerHTML}
            </div>
            <script>
              // Auto print
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      // Log the user who printed the slip
      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
      if (currentUser?.name) {
        console.log(`Delivery slip for order #${order.id} printed by ${currentUser.name}`);
        
        // Store print log in localStorage
        const printLogs = JSON.parse(localStorage.getItem('print_logs') || '[]');
        printLogs.push({
          action: 'print_delivery_slip',
          orderId: order.id,
          user: currentUser.name,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('print_logs', JSON.stringify(printLogs));
      }
      
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
