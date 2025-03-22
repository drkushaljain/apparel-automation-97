import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileDown, Eye, Edit, Trash, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NoContent from "@/components/NoContent";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Products = () => {
  const { state, updateProduct, deleteProduct } = useAppContext();
  const { products, isLoading, currentUser } = state;
  const navigate = useNavigate();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all"); // Changed from empty string to "all"

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = products.filter(p => p.category).map(p => p.category as string);
    return [...new Set(allCategories)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAvailability = showUnavailable || product.isAvailable;
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter; // Updated condition
      
      return matchesSearch && matchesAvailability && matchesCategory;
    });
  }, [products, searchTerm, showUnavailable, categoryFilter]);

  // Toggle product availability
  const handleToggleAvailability = (productId: string, isAvailable: boolean) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedProduct = {
      ...product,
      isAvailable,
    };
    
    updateProduct(updatedProduct);
  };

  // Handle product deletion
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(productId);
    }
  };

  // Export products to CSV
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = [
      "ID",
      "Name",
      "Description",
      "Price",
      "Stock",
      "Available",
      "Category",
      "SKU",
      "Sales",
      "Created At",
      "Updated At"
    ];
    
    // Convert products to CSV rows
    const rows = filteredProducts.map(product => [
      product.id,
      product.name,
      product.description || "",
      product.price,
      product.stock,
      product.isAvailable ? "Yes" : "No",
      product.category || "",
      product.sku || "",
      product.sales,
      new Date(product.createdAt).toLocaleDateString(),
      new Date(product.updatedAt).toLocaleDateString()
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if user has permission to manage products
  const canManageProducts = currentUser?.permissions?.canManageProducts || false;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse">Loading products...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <div className="flex gap-2">
            {canManageProducts && (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={exportToCSV}
                  disabled={filteredProducts.length === 0}
                >
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button onClick={() => navigate("/products/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Product
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="w-full md:w-1/4">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem> {/* Changed value from "" to "all" */}
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-unavailable" 
                  checked={showUnavailable}
                  onCheckedChange={setShowUnavailable}
                />
                <label htmlFor="show-unavailable" className="text-sm">
                  Show Unavailable
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-center">
              <span>Products List</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredProducts.length} products found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <NoContent
                title="No products found"
                description={
                  products.length === 0
                    ? "You haven't added any products yet."
                    : "No products match your current filters."
                }
                actionText={products.length === 0 && canManageProducts ? "Add Product" : undefined}
                onAction={products.length === 0 && canManageProducts ? () => navigate("/products/new") : undefined}
                icon={<Package className="h-12 w-12 text-primary/20" />}
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-muted/40">
                        <TableCell 
                          className="font-medium"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          {product.name}
                          {product.sku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          )}
                        </TableCell>
                        <TableCell onClick={() => navigate(`/products/${product.id}`)}>
                          {product.category || "Uncategorized"}
                        </TableCell>
                        <TableCell 
                          className="text-right"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          ₹{product.price}
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          <div className="flex flex-col items-center">
                            <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                              {product.stock}
                            </span>
                            {product.stock <= 5 && (
                              <span className="flex items-center text-xs text-red-500">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Low
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {canManageProducts ? (
                            <Switch 
                              checked={product.isAvailable}
                              onCheckedChange={(checked) => handleToggleAvailability(product.id, checked)}
                            />
                          ) : (
                            <Badge variant={product.isAvailable ? "outline" : "secondary"}>
                              {product.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/products/${product.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {canManageProducts && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/products/edit/${product.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product.id);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Products;
