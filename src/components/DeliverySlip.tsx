
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order, CompanySettings } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Printer, ArrowLeft } from "lucide-react";

interface DeliverySlipProps {
  order: Order;
  onClose: () => void;
  companySettings?: CompanySettings | null;
}

const DeliverySlip: React.FC<DeliverySlipProps> = ({ order, onClose, companySettings }) => {
  const printSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = document.getElementById('delivery-slip');
    if (!printContent) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Delivery Slip - Order #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .slip-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo-container { width: 120px; height: 80px; display: flex; align-items: center; }
            .logo { max-width: 100%; max-height: 100%; object-fit: contain; }
            .company-info { text-align: right; }
            .order-info { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { text-align: right; margin-top: 20px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="slip-container">
            ${printContent.innerHTML}
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>${companySettings?.companyName || 'Apparel Management System'} - ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button variant="default" size="sm" onClick={printSlip}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
        
        <CardContent className="p-6" id="delivery-slip">
          <div className="flex justify-between items-start mb-8">
            <div className="logo-container" style={{ width: '120px', height: '80px', display: 'flex', alignItems: 'center' }}>
              {companySettings?.logoUrl ? (
                <img 
                  src={companySettings.logoUrl} 
                  alt="Company Logo" 
                  className="logo"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                <div className="text-lg font-bold">{companySettings?.companyName || 'Apparel Management System'}</div>
              )}
            </div>
            
            <div className="company-info text-right">
              <h3 className="text-lg font-bold">{companySettings?.companyName || 'Apparel Management System'}</h3>
              <p className="text-sm text-gray-600">{companySettings?.address || '123 Business Street'}</p>
              <p className="text-sm text-gray-600">{companySettings?.phone || '+91 9876543210'}</p>
              <p className="text-sm text-gray-600">{companySettings?.email || 'contact@example.com'}</p>
              {companySettings?.taxId && <p className="text-sm text-gray-600">TAX ID: {companySettings.taxId}</p>}
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">DELIVERY SLIP</h3>
                <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">Status: {order.status}</p>
                {order.trackingId && <p className="text-sm text-gray-600">Tracking: {order.trackingId}</p>}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <p className="text-sm">Name: {order.customer?.name || 'N/A'}</p>
          </div>
          
          <div className="mb-6 overflow-x-auto">
            <h4 className="font-semibold mb-2">Order Items</h4>
            <table className="w-full min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id || index} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.product?.imageUrl && (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product?.name} 
                            className="w-10 h-10 object-cover rounded mr-3" 
                          />
                        )}
                        <span>{item.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-right">Total:</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-8 pt-8 border-t">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-2">Shipping Information</h4>
                <p className="text-sm">Customer will be notified when the order is shipped.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm italic">Thank you for your business!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySlip;
