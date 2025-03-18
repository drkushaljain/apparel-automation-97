
import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Customer, Order, OrderItem, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, Plus, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface OrderFormProps {
  initialData?: Order;
  onSubmit: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const OrderForm = ({ initialData, onSubmit, onCancel }: OrderFormProps) => {
  const { state } = useAppContext();
  const { products, customers } = state;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialData?.customerId || "");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>(
    initialData?.items.map(item => ({
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      price: item.price
    })) || []
  );
  const [transactionId, setTransactionId] = useState<string>(initialData?.transactionId || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [totalAmount, setTotalAmount] = useState<number>(initialData?.totalAmount || 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Set selected customer when customer ID changes
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  // Calculate total amount when items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  }, [items]);

  const handleAddItem = () => {
    if (products.length === 0) {
      toast.error("No products available");
      return;
    }
    
    // Find first available product
    const availableProduct = products.find(p => p.isAvailable);
    
    if (!availableProduct) {
      toast.error("No available products");
      return;
    }
    
    const newItem: Omit<OrderItem, 'id'> = {
      productId: availableProduct.id,
      product: availableProduct,
      quantity: 1,
      price: availableProduct.price
    };
    
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId,
      product,
      price: product.price
    };
    
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity
    };
    
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    
    setIsLoading(true);
    
    // Prepare order data
    const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: selectedCustomerId,
      customer: selectedCustomer!,
      items: items.map((item, index) => ({
        ...item,
        id: initialData?.items[index]?.id || `tempId${index}`
      })),
      totalAmount,
      transactionId: transactionId || undefined,
      status: initialData?.status || 'pending',
      trackingId: initialData?.trackingId,
      trackingUrl: initialData?.trackingUrl,
      dispatchImage: initialData?.dispatchImage,
      notes: notes || undefined
    };
    
    // Submit order
    onSubmit(orderData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Order' : 'New Order'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Customer Details */}
          {selectedCustomer && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p>Phone: {selectedCustomer.phone}</p>
                    <p>WhatsApp: {selectedCustomer.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{selectedCustomer.address}</p>
                    <p className="text-muted-foreground">
                      {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Order Items</Label>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            {items.length === 0 ? (
              <div className="bg-muted/50 rounded-md p-6 text-center">
                <p className="text-muted-foreground">No items added yet</p>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleAddItem}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
                    <div className="flex-1">
                      <Select
                        value={item.productId}
                        onValueChange={(value) => handleProductChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem 
                              key={product.id} 
                              value={product.id}
                              disabled={!product.isAvailable}
                            >
                              {product.name} - ₹{product.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="text-right"
                      />
                    </div>
                    <div className="w-24 text-right">
                      <p className="py-2">₹{item.price * item.quantity}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-md">
                  <p className="font-medium">Total</p>
                  <p className="font-medium">₹{totalAmount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID (optional)</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this order"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || items.length === 0 || !selectedCustomerId}>
            {initialData ? 'Update Order' : 'Create Order'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default OrderForm;
