
import { Customer } from "@/types";

export const sendWhatsAppMessage = async (
  customer: Customer,
  message: string
): Promise<boolean> => {
  try {
    // Replace template variables in message
    const processedMessage = message
      .replace(/{{name}}/g, customer.name)
      .replace(/{{phone}}/g, customer.phone);
    
    // Format phone number (remove spaces, +, etc)
    const phone = customer.whatsapp.replace(/\s+/g, "").replace(/^\+/, "");
    
    // Create WhatsApp URL
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(processedMessage)}`;
    
    // Open WhatsApp in a new tab
    window.open(url, "_blank");
    
    // Log activity
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (currentUser?.name) {
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: `log${Date.now()}`,
        userId: currentUser.id || 'unknown',
        userName: currentUser.name,
        action: 'sent_whatsapp',
        entityType: 'customer',
        entityId: customer.id,
        details: `WhatsApp message sent to ${customer.name}`,
        timestamp: new Date()
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    }
    
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

export const sendWhatsAppBulkMessage = async (
  customers: Customer[],
  message: string
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;
  
  // Process in small batches to avoid overwhelming the browser
  const batchSize = 5;
  const totalBatches = Math.ceil(customers.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const batch = customers.slice(i * batchSize, (i + 1) * batchSize);
    
    for (const customer of batch) {
      const sent = await sendWhatsAppMessage(customer, message);
      if (sent) {
        success++;
      } else {
        failed++;
      }
      
      // Small delay to prevent rate limiting
      if (batch.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  return { success, failed };
};
