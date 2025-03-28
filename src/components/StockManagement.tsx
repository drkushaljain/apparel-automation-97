
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types";
import StockUpdateForm from "@/components/StockUpdateForm";
import StockHistory from "@/components/StockHistory";
import { Plus, Minus } from "lucide-react";

interface StockManagementProps {
  product: Product;
}

const StockManagement = ({ product }: StockManagementProps) => {
  const { state, updateProductStock } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "remove">("add");
  
  // Filter stock history for this product
  const productStockHistory = state.stockHistory
    .filter(record => record.productId === product.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const handleStockUpdate = (product: Product, changeAmount: number, reason: string) => {
    updateProductStock(product.id, changeAmount, reason);
    setDialogOpen(false);
  };
  
  const openAddDialog = () => {
    setDialogType("add");
    setDialogOpen(true);
  };
  
  const openRemoveDialog = () => {
    setDialogType("remove");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Dialog open={dialogOpen && dialogType === "add"} onOpenChange={(open) => {
          if (dialogType === "add") setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogDescription id="add-stock-description" className="sr-only">
              Form to update the stock level for {product.name}
            </DialogDescription>
            <StockUpdateForm 
              product={product} 
              onSubmit={handleStockUpdate}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={dialogOpen && dialogType === "remove"} onOpenChange={(open) => {
          if (dialogType === "remove") setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={openRemoveDialog} 
              variant="outline" 
              className="gap-1"
              disabled={product.stock === 0}
            >
              <Minus className="h-4 w-4" />
              Remove Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogDescription id="remove-stock-description" className="sr-only">
              Form to remove stock from {product.name}
            </DialogDescription>
            <StockUpdateForm 
              product={product} 
              onSubmit={(product, amount, reason) => handleStockUpdate(product, -Math.abs(amount), reason)}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {productStockHistory.length > 0 && (
        <StockHistory history={productStockHistory} />
      )}
    </div>
  );
};

export default StockManagement;
