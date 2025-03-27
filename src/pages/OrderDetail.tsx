
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
import { ArrowLeft, Edit, Truck, FileText, MessageSquare, Package, Printer } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [showDeliverySlip, setShowDeliverySlip] = useState(false);

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
      toast.success(`Order status updated to ${selectedStatus}`);
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
      toast.success("Tracking information updated");
      setIsUpdating(false);
    }, 500);
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 sticky top-0 bg-background z-10 pb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="md:flex hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Order {order.id}</h1>
            <StatusBadge status={order.status} className="ml-0 md:ml-2" />
          </div>
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => navigate(`/orders/edit/${order.id}`)}
            >
              <Edit className="h-3 w-3" />
              <span className="hidden md:inline">Edit</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Order Details */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Order Date</p>
                  <p className="text-sm md:text-base">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-sm md:text-base font-medium">₹{order.totalAmount}</p>
                </div>
                {order.transactionId && (
                  <div className="col-span-2">
                    <p className="text-xs md:text-sm text-muted-foreground">Transaction ID</p>
                    <p className="text-sm md:text-base break-words">{order.transactionId}</p>
                  </div>
                )}
                {order.trackingId && (
                  <div className="col-span-2">
                    <p className="text-xs md:text-sm text-muted-foreground">Tracking ID</p>
                    <p className="text-sm md:text-base break-words">{order.trackingId}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium mb-2">Items</h3>
                <div className="overflow-x-auto -mx-4 px-4">
                  <div className="rounded-md border overflow-hidden min-w-full">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 md:px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Product
                          </th>
                          <th className="px-2 md:px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                            Qty
                          </th>
                          <th className="px-2 md:px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                            Price
                          </th>
                          <th className="px-2 md:px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 md:px-4 py-2 text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                              {item.product.name}
                            </td>
                            <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-right">
                              {item.quantity}
                            </td>
                            <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-right">
                              ₹{item.price}
                            </td>
                            <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-right font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted/30">
                          <td colSpan={3} className="px-3 md:px-4 py-2 text-right text-xs md:text-sm font-medium">
                            Total
                          </td>
                          <td className="px-2 md:px-4 py-2 text-right text-xs md:text-sm font-bold">
                            ₹{order.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm md:text-base">{order.customer.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Phone: {order.customer.phone}</p>
                <p className="text-xs md:text-sm text-muted-foreground">WhatsApp: {order.customer.whatsapp}</p>
                {order.customer.email && (
                  <p className="text-xs md:text-sm text-muted-foreground break-words">Email: {order.customer.email}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-xs md:text-sm font-medium mb-1">Shipping Address</h3>
                <p className="text-xs md:text-sm">{order.customer.address}</p>
                <p className="text-xs md:text-sm">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Management</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Update order status, tracking information, and generate shipping labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="mb-4 w-full flex overflow-x-auto scrollbar-none">
                <TabsTrigger value="status" className="flex-1 min-w-max">
                  <Package className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">Status</span>
                </TabsTrigger>
                <TabsTrigger value="tracking" className="flex-1 min-w-max">
                  <Truck className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">Tracking</span>
                </TabsTrigger>
                <TabsTrigger value="shipping" className="flex-1 min-w-max">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">Shipping</span>
                </TabsTrigger>
                <TabsTrigger value="notify" className="flex-1 min-w-max">
                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="text-xs md:text-sm">Notify</span>
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
                    <SelectTrigger className="text-sm">
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
                  className="w-full md:w-auto"
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
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block text-sm font-medium">Tracking URL (optional)</Label>
                  <Input
                    placeholder="Enter tracking URL"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button 
                  onClick={handleTrackingUpdate} 
                  disabled={isUpdating || (!trackingId && !trackingUrl)}
                  className="w-full md:w-auto"
                >
                  Update Tracking
                </Button>
              </TabsContent>
              
              {/* Shipping Tab */}
              <TabsContent value="shipping">
                <DeliverySlip 
                  order={order} 
                  onClose={() => setShowDeliverySlip(false)} 
                />
              </TabsContent>
              
              {/* Notify Tab */}
              <TabsContent value="notify" className="space-y-4">
                <Card className="bg-muted/20">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="text-sm font-medium">Send Order Updates</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Notify the customer about their order status via WhatsApp.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Order Confirmation */}
                      <div className="space-y-2">
                        <p className="text-xs md:text-sm font-medium">Order Confirmation</p>
                        <WhatsAppButton 
                          order={order}
                          variant="outline"
                          size="sm"
                          message={`Hello ${order.customer.name}, your order #${order.id} has been confirmed. Thank you for your purchase!`}
                          className="w-full md:w-auto text-xs md:text-sm"
                        />
                      </div>
                      
                      {/* Shipping Notification */}
                      {order.trackingId && (
                        <div className="space-y-2">
                          <p className="text-xs md:text-sm font-medium">Shipping Notification</p>
                          <WhatsAppButton 
                            order={order}
                            variant="outline"
                            size="sm"
                            message={`Hello ${order.customer.name}, your order #${order.id} has been shipped! Tracking ID: ${order.trackingId}${order.trackingUrl ? `. Track your package here: ${order.trackingUrl}` : ''}`}
                            className="w-full md:w-auto text-xs md:text-sm"
                          />
                        </div>
                      )}
                      
                      {/* Delivery Confirmation */}
                      {order.status === 'delivered' && (
                        <div className="space-y-2">
                          <p className="text-xs md:text-sm font-medium">Delivery Confirmation</p>
                          <WhatsAppButton 
                            order={order}
                            variant="outline"
                            size="sm"
                            message={`Hello ${order.customer.name}, your order #${order.id} has been delivered! Thank you for shopping with us.`}
                            className="w-full md:w-auto text-xs md:text-sm"
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
