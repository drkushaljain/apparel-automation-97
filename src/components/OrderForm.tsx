
import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Customer, Order, OrderItem, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, Plus, X, ChevronDown, Percent, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

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
      price: item.price,
      discount: item.discount || 0,
      taxAmount: item.taxAmount || 0
    })) || []
  );
  const [transactionId, setTransactionId] = useState<string>(initialData?.transactionId || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discountTotal, setDiscountTotal] = useState<number>(initialData?.discountTotal || 0);
  const [taxTotal, setTaxTotal] = useState<number>(initialData?.taxTotal || 0);
  const [totalAmount, setTotalAmount] = useState<number>(initialData?.totalAmount || 0);
  const [applyTax, setApplyTax] = useState<boolean>(initialData?.applyTax !== false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stockErrors, setStockErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    let subTotal = 0;
    let discountSum = 0;
    let taxSum = 0;
    
    items.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = item.discount || 0;
      subTotal += itemSubtotal;
      discountSum += itemDiscount;
      
      if (applyTax && item.product.taxPercentage) {
        const taxableAmount = itemSubtotal - itemDiscount;
        const taxAmount = (taxableAmount * item.product.taxPercentage) / 100;
        taxSum += taxAmount;
        
        item.taxAmount = taxAmount;
      } else {
        item.taxAmount = 0;
      }
    });
    
    setSubtotal(subTotal);
    setDiscountTotal(discountSum);
    setTaxTotal(taxSum);
    setTotalAmount(subTotal - discountSum + taxSum);
  }, [items, applyTax]);

  const handleAddItem = () => {
    if (products.length === 0) {
      toast.error("No products available");
      return;
    }
    
    const availableProduct = products.find(p => p.isAvailable && p.stock > 0);
    
    if (!availableProduct) {
      toast.error("No available products with stock");
      return;
    }
    
    const newItem: Omit<OrderItem, 'id'> = {
      productId: availableProduct.id,
      product: availableProduct,
      quantity: 1,
      price: availableProduct.price,
      discount: 0,
      taxAmount: applyTax && availableProduct.taxPercentage ? (availableProduct.price * availableProduct.taxPercentage) / 100 : 0
    };
    
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    
    // Also clear any stock errors for this item
    const newStockErrors = {...stockErrors};
    delete newStockErrors[`item-${index}`];
    setStockErrors(newStockErrors);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newItems = [...items];
    const quantity = 1; // Reset quantity to 1 when product changes
    
    newItems[index] = {
      ...newItems[index],
      productId,
      product,
      quantity,
      price: product.price,
      discount: 0,
      taxAmount: applyTax && product.taxPercentage ? (product.price * product.taxPercentage) / 100 : 0
    };
    
    setItems(newItems);
    validateStockForItem(index, product, quantity);
  };

  const validateStockForItem = (index: number, product: Product, quantity: number) => {
    const newStockErrors = {...stockErrors};
    
    if (quantity > product.stock) {
      newStockErrors[`item-${index}`] = `Only ${product.stock} available in stock`;
    } else {
      delete newStockErrors[`item-${index}`];
    }
    
    setStockErrors(newStockErrors);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const newItems = [...items];
    const product = newItems[index].product;
    
    // Strict stock validation - Don't allow entering more than available stock
    if (quantity > product.stock) {
      // Show error message
      const newStockErrors = {...stockErrors};
      newStockErrors[`item-${index}`] = `Only ${product.stock} available in stock`;
      setStockErrors(newStockErrors);
      
      // Limit quantity to available stock
      quantity = product.stock;
      toast.warning(`Quantity adjusted to maximum available stock (${product.stock})`);
    } else {
      // Clear stock error if it exists
      const newStockErrors = {...stockErrors};
      delete newStockErrors[`item-${index}`];
      setStockErrors(newStockErrors);
    }
    
    newItems[index] = {
      ...newItems[index],
      quantity
    };
    
    setItems(newItems);
  };
  
  const handleDiscountChange = (index: number, discountValue: number) => {
    if (discountValue < 0) return;
    
    const item = items[index];
    const itemTotal = item.price * item.quantity;
    
    if (discountValue > itemTotal) {
      toast.error("Discount cannot exceed item total");
      return;
    }
    
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      discount: discountValue
    };
    
    setItems(newItems);
  };

  const handleTaxToggle = (checked: boolean) => {
    setApplyTax(checked);
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
    
    // Final stock validation check before submission
    let hasStockIssues = false;
    
    items.forEach((item, index) => {
      if (item.quantity > item.product.stock) {
        const newStockErrors = {...stockErrors};
        newStockErrors[`item-${index}`] = `Only ${item.product.stock} available in stock`;
        setStockErrors(newStockErrors);
        hasStockIssues = true;
      }
    });
    
    if (hasStockIssues || Object.keys(stockErrors).length > 0) {
      toast.error("Please fix stock quantity issues before continuing");
      return;
    }
    
    setIsLoading(true);
    
    // Create the order data and submit
    const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: selectedCustomerId,
      customer: selectedCustomer!,
      items: items.map((item, index) => ({
        ...item,
        id: initialData?.items[index]?.id || `tempId${index}`
      })),
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount,
      applyTax,
      transactionId: transactionId || undefined,
      status: initialData?.status || 'pending',
      trackingId: initialData?.trackingId,
      trackingUrl: initialData?.trackingUrl,
      dispatchImage: initialData?.dispatchImage,
      notes: notes || undefined,
      createdBy: state.currentUser?.id
    };
    
    onSubmit(orderData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Order' : 'New Order'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
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
                <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground px-3">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Discount</div>
                  <div className="col-span-1 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md">
                    <div className="col-span-4">
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
                              disabled={!product.isAvailable || product.stock === 0}
                            >
                              {product.name} - ₹{product.price} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {stockErrors[`item-${index}`] && (
                        <p className="text-xs text-red-500 mt-1">{stockErrors[`item-${index}`]}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <p>₹{item.price}</p>
                      {item.product.taxPercentage && applyTax ? (
                        <p className="text-xs text-muted-foreground">+{item.product.taxPercentage}% tax</p>
                      ) : null}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount || 0}
                        onChange={(e) => handleDiscountChange(index, parseFloat(e.target.value) || 0)}
                        className="text-center"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <p>₹{(item.price * item.quantity) - (item.discount || 0)}</p>
                    </div>
                    <div className="col-span-1 text-right">
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
                  </div>
                ))}

                <Card className="bg-muted/20">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Discount</span>
                        <span>-₹{discountTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Tax</span>
                          <Switch 
                            id="applyTax" 
                            checked={applyTax} 
                            onCheckedChange={handleTaxToggle}
                            className="scale-75" 
                          />
                        </div>
                        <span>+₹{taxTotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="border-t pt-2 flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID (optional)</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
            />
          </div>

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
          <Button type="submit" disabled={isLoading || items.length === 0 || !selectedCustomerId || Object.keys(stockErrors).length > 0}>
            {initialData ? 'Update Order' : 'Create Order'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default OrderForm;
