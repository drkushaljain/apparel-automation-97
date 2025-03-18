
import { Customer } from "@/types";
import { toast } from "sonner";

/**
 * Send a WhatsApp message to a single customer
 */
export const sendWhatsAppMessage = async (
  customer: Customer,
  message: string
): Promise<boolean> => {
  try {
    // Format phone number (remove non-numeric characters)
    const phone = customer.whatsapp.replace(/\D/g, '');
    
    // Replace template variables with actual values
    const finalMessage = message.replace(/{{customerName}}/g, customer.name);
    
    // Create WhatsApp URL
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    toast.error("Failed to send WhatsApp message");
    return false;
  }
};

/**
 * Send WhatsApp messages to multiple customers (one after another)
 */
export const sendBulkWhatsAppMessages = async (
  customers: Customer[],
  messageTemplate: string,
  delayBetweenMessages: number = 1000 // Default delay of 1 second
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;
  
  for (const customer of customers) {
    try {
      // Replace template variables with actual values
      const message = messageTemplate.replace(/{{customerName}}/g, customer.name);
      
      // Format phone number (remove non-numeric characters)
      const phone = customer.whatsapp.replace(/\D/g, '');
      
      // Create WhatsApp URL
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      success++;
      
      // Wait before opening the next message
      if (customers.length > 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
      }
    } catch (error) {
      console.error(`Error sending WhatsApp message to ${customer.name}:`, error);
      failed++;
    }
  }
  
  return { success, failed };
};
