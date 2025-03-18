
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppButtonProps {
  order: Order;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  message?: string;
  className?: string;
}

const WhatsAppButton = ({
  order,
  variant = "default",
  size = "default",
  message,
  className,
}: WhatsAppButtonProps) => {
  const customer = order.customer;
  
  // Default message if not provided
  const defaultMessage = `Hello ${customer.name}, your order #${order.id} has been confirmed. ${
    order.status === 'dispatched' || order.status === 'out-for-delivery' || order.status === 'delivered'
      ? `Tracking ID: ${order.trackingId}. Track your package here: ${order.trackingUrl}`
      : 'We will send you the tracking details soon.'
  }`;
  
  const whatsappMessage = message || defaultMessage;
  
  const handleSendWhatsApp = () => {
    try {
      // Format phone number (remove non-numeric characters)
      const phone = customer.whatsapp.replace(/\D/g, '');
      
      // Create WhatsApp URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      toast.success("WhatsApp message prepared");
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast.error("Failed to open WhatsApp");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSendWhatsApp}
      className={className}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Send WhatsApp
    </Button>
  );
};

export default WhatsAppButton;
