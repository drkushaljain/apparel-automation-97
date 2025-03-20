
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Product } from "@/types";

interface StockUpdateFormProps {
  product?: Product;
  onClose?: () => void;
  onSubmit: (product: Product, changeAmount: number, reason: string) => void;
}

const StockUpdateForm = ({ product, onClose, onSubmit }: StockUpdateFormProps) => {
  const { state } = useAppContext();
  const { products } = state;
  
  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || "");
  const [changeType, setChangeType] = useState<"add" | "remove">("add");
  const [changeAmount, setChangeAmount] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId) 
    : null;
    
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    
    if (changeAmount <= 0) {
      toast.error("Change amount must be positive");
      return;
    }
    
    if (changeType === "remove" && changeAmount > selectedProduct.stock) {
      toast.error(`Cannot remove more than the available stock (${selectedProduct.stock})`);
      return;
    }
    
    if (!reason) {
      toast.error("Please provide a reason for the stock change");
      return;
    }
    
    setIsLoading(true);
    
    // Calculate the actual change amount (negative if removing)
    const actualChangeAmount = changeType === "add" ? changeAmount : -changeAmount;
    
    onSubmit(selectedProduct, actualChangeAmount, reason);
    
    // Reset form
    if (!product) {
      setSelectedProductId("");
    }
    setChangeType("add");
    setChangeAmount(1);
    setReason("");
    setIsLoading(false);
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Update Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!product && (
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {(selectedProduct || product) && (
            <>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium">{selectedProduct?.name || product?.name}</p>
                <p className="text-sm">Current Stock: {selectedProduct?.stock || product?.stock}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="changeType">Change Type</Label>
                <Select value={changeType} onValueChange={(value: "add" | "remove") => setChangeType(value)}>
                  <SelectTrigger id="changeType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add to Stock</SelectItem>
                    <SelectItem value="remove">Remove from Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="changeAmount">Quantity</Label>
                <Input
                  id="changeAmount"
                  type="number"
                  min="1"
                  max={changeType === "remove" ? (selectedProduct?.stock || product?.stock) : undefined}
                  value={changeAmount}
                  onChange={e => setChangeAmount(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for stock change"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading || !selectedProductId || changeAmount <= 0 || !reason}
          >
            {isLoading ? "Updating..." : "Update Stock"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StockUpdateForm;
