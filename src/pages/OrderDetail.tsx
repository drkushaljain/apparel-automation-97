import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import StatusBadge from "@/components/StatusBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import DeliverySlip from "@/components/DeliverySlip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatus } from "@/types";
import { ArrowLeft, Edit, Truck, FileText, MessageSquare, Package, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateOrder, updateOrderStatus } = useAppContext();
  const { orders } = state;

  const order = orders.find(o => o.id === id);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status || "pending");
  const [trackingId, setTrackingId] = useState<string>(order?.trackingId || "");
  const [trackingUrl, setTrackingUrl] = useState<string>(order?.trackingUrl || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Order not found</h2>
            <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate("/orders")}>
              Back to Orders
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleStatusUpdate = () => {
    setIsUpdating(true);
    
    setTimeout(() => {
      updateOrderStatus(order.id, selectedStatus);
      setIsUpdating(false);
    }, 500);
  };

  const handleTrackingUpdate = () => {
    if (!trackingId) {
      toast.error("Tracking ID is required");
      return;
    }
    
    setIsUpdating(true);
    
    setTimeout(() => {
      const updatedOrder = {
        ...order,
        trackingId,
        trackingUrl: trackingUrl || undefined
      };
      
      updateOrder(updatedOrder);
      setIsUpdating(false);
    }, 500);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Order {order.id}</h1>
          <StatusBadge status={order.status} className="ml-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Order Details
                <Button variant="outline" size="sm" onClick={() => navigate(`/orders/edit/${order.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">₹{order.totalAmount}</p>
                </div>
                {order.transactionId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p>{order.transactionId}</p>
                  </div>
                )}
                {order.trackingId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking ID</p>
                    <p>{order.trackingId}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium mb-2">Items</h3>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                          Product
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{item.product.name}</td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">₹{item.price}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ₹{item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          Total
                        </td>
                        <td className="px-4 py-2 text-right font-bold">
                          ₹{order.totalAmount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Notes</h3>
                  <p className="text-sm bg-muted/30 p-3 rounded-md">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{order.customer.name}</h3>
                <p className="text-sm text-muted-foreground">Phone: {order.customer.phone}</p>
                <p className="text-sm text-muted-foreground">WhatsApp: {order.customer.whatsapp}</p>
                {order.customer.email && (
                  <p className="text-sm text-muted-foreground">Email: {order.customer.email}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Shipping Address</h3>
                <p className="text-sm">{order.customer.address}</p>
                <p className="text-sm">
                  {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                </p>
              </div>

              <div className="pt-2">
                <WhatsAppButton order={order} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              Update order status, tracking information, and generate shipping labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status">
              <TabsList className="mb-4">
                <TabsTrigger value="status">
                  <Package className="h-4 w-4 mr-2" />
                  Status
                </TabsTrigger>
                <TabsTrigger value="tracking">
                  <Truck className="h-4 w-4 mr-2" />
                  Tracking
                </TabsTrigger>
                <TabsTrigger value="shipping">
                  <FileText className="h-4 w-4 mr-2" />
                  Shipping
                </TabsTrigger>
                <TabsTrigger value="notify">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notify
                </TabsTrigger>
              </TabsList>
              
              {/* Status Tab */}
              <TabsContent value="status" className="space-y-4">
                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Update Order Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="packed">Packed</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={isUpdating || selectedStatus === order.status}
                >
                  Update Status
                </Button>
              </TabsContent>
              
              {/* Tracking Tab */}
              <TabsContent value="tracking" className="space-y-4">
                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Tracking ID</Label>
                  <Input
                    placeholder="Enter tracking ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Tracking URL (optional)</Label>
                  <Input
                    placeholder="Enter tracking URL"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTrackingUpdate} 
                  disabled={isUpdating || (!trackingId && !trackingUrl)}
                >
                  Update Tracking
                </Button>
              </TabsContent>
              
              {/* Shipping Tab */}
              <TabsContent value="shipping">
                <DeliverySlip order={order} />
              </TabsContent>
              
              {/* Notify Tab */}
              <TabsContent value="notify" className="space-y-4">
                <Card className="bg-muted/20">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Send Order Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Notify the customer about their order status via WhatsApp.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Order Confirmation */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Order Confirmation</p>
                        <WhatsAppButton 
                          order={order}
                          variant="outline"
                          size="sm"
                          message={`Hello ${order.customer.name}, your order #${order.id} has been confirmed. Thank you for your purchase!`}
                        />
                      </div>
                      
                      {/* Shipping Notification */}
                      {order.trackingId && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Shipping Notification</p>
                          <WhatsAppButton 
                            order={order}
                            variant="outline"
                            size="sm"
                            message={`Hello ${order.customer.name}, your order #${order.id} has been shipped! Tracking ID: ${order.trackingId}${order.trackingUrl ? `. Track your package here: ${order.trackingUrl}` : ''}`}
                          />
                        </div>
                      )}
                      
                      {/* Delivery Confirmation */}
                      {order.status === 'delivered' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Delivery Confirmation</p>
                          <WhatsAppButton 
                            order={order}
                            variant="outline"
                            size="sm"
                            message={`Hello ${order.customer.name}, your order #${order.id} has been delivered! Thank you for shopping with us.`}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OrderDetail;
