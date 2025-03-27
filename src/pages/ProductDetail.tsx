
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Package, Tag, Truck, AlertCircle, Plus, Minus, IndianRupee, Percent } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActivityLog } from "@/types";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateProduct } = useAppContext();
  const { products, orders } = state;
  
  const product = products.find(p => p.id === id);
  const [productOrders, setProductOrders] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Stock management state
  const [customStockValue, setCustomStockValue] = useState<number>(1);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isReduceStockDialogOpen, setIsReduceStockDialogOpen] = useState(false);
  const [stockNote, setStockNote] = useState("");
  
  useEffect(() => {
    if (product) {
      // Find orders containing this product
      const relatedOrders = orders.filter(order => 
        order.items.some(item => item.productId === product.id)
      ).slice(0, 5); // Limit to 5 most recent
      
      setProductOrders(relatedOrders);
      
      // Load activity logs for this product
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]')
        .filter((log: ActivityLog) => 
          log.entityType === 'product' && log.entityId === product.id
        )
        .sort((a: ActivityLog, b: ActivityLog) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10);
      
      setActivityLogs(logs);
    }
  }, [product, orders]);
  
  const handleStockUpdate = (change: number, note: string = "") => {
    if (!product) return;
    
    const newStock = Math.max(0, product.stock + change);
    const updatedProduct = {
      ...product,
      stock: newStock,
      isAvailable: newStock > 0
    };
    
    updateProduct(updatedProduct);
    
    // Log activity
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (currentUser?.name) {
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: `log${Date.now()}`,
        userId: currentUser.id || 'unknown',
        userName: currentUser.name,
        action: change > 0 ? 'stock_increased' : 'stock_decreased',
        entityType: 'product',
        entityId: product.id,
        details: `${note ? note + ': ' : ''}Stock ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} units`,
        timestamp: new Date()
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    }
    
    toast.success(`Stock updated to ${newStock} units`);
    
    // Reset state
    setCustomStockValue(1);
    setStockNote("");
    setIsAddStockDialogOpen(false);
    setIsReduceStockDialogOpen(false);
  };

  const confirmAddStock = () => {
    if (customStockValue <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    handleStockUpdate(customStockValue, stockNote);
  };

  const confirmReduceStock = () => {
    if (customStockValue <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (product && customStockValue > product.stock) {
      toast.error(`Cannot reduce more than current stock (${product.stock})`);
      return;
    }
    handleStockUpdate(-customStockValue, stockNote);
  };

  if (!product) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Product not found</h2>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate("/products")}>
              Back to Products
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight ml-2">{product.name}</h1>
          <Badge 
            variant={product.isAvailable ? "default" : "destructive"}
            className="ml-2"
          >
            {product.isAvailable ? "Available" : "Not Available"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Product Details
                <Button variant="outline" size="sm" onClick={() => navigate(`/products/edit/${product.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {product.imageUrl ? (
                  <div className="w-full md:w-1/3">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-auto rounded-md object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-1/3 bg-muted/30 rounded-md flex items-center justify-center h-48">
                    <Package className="h-12 w-12 text-muted" />
                  </div>
                )}
                
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                    <p className="mt-1">{product.description || "No description provided."}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Price</h3>
                      <p className="text-lg font-bold">₹{product.price}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">SKU</h3>
                      <p>{product.sku || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Category</h3>
                      <p>{product.category || "Uncategorized"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Total Sales</h3>
                      <p>{product.sales} units</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Tax Percentage</h3>
                      <p>{product.taxPercentage || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stock Management */}
              <Card className="bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold">Current Stock</h3>
                      <p className={`text-2xl font-bold ${product.stock <= 5 ? 'text-destructive' : ''}`}>
                        {product.stock} units
                      </p>
                      {product.stock <= 5 && (
                        <div className="flex items-center text-destructive text-sm mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Low stock
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsReduceStockDialogOpen(true)}
                        disabled={product.stock <= 0}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Reduce Stock
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setIsAddStockDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Stock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Recent Orders & Activity */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Recent Orders</h3>
                {productOrders.length > 0 ? (
                  <div className="space-y-2">
                    {productOrders.map(order => (
                      <div 
                        key={order.id} 
                        className="p-2 border rounded-md flex justify-between items-center cursor-pointer hover:bg-muted/20"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent orders for this product.</p>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">Activity Log</h3>
                {activityLogs.length > 0 ? (
                  <div className="space-y-2">
                    {activityLogs.map(log => (
                      <div key={log.id} className="text-sm">
                        <p className="flex justify-between">
                          <span>{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">By {log.userName}</p>
                        {log.details && <p className="text-xs">{log.details}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity logs for this product.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Back to All Products
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-amount">Quantity to Add</Label>
              <Input
                id="stock-amount"
                type="number"
                min="1"
                value={customStockValue}
                onChange={(e) => setCustomStockValue(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-note">Note (Optional)</Label>
              <Input
                id="stock-note"
                placeholder="New shipment, restock, etc."
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddStock}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reduce Stock Dialog */}
      <Dialog open={isReduceStockDialogOpen} onOpenChange={setIsReduceStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reduce Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-amount">Quantity to Reduce</Label>
              <Input
                id="stock-amount"
                type="number"
                min="1"
                max={product.stock}
                value={customStockValue}
                onChange={(e) => setCustomStockValue(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-note">Reason (Optional)</Label>
              <Input
                id="stock-note"
                placeholder="Damaged items, internal use, etc."
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReduceStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReduceStock}>
              <Minus className="h-4 w-4 mr-2" />
              Reduce Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDetail;
