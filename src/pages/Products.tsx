
import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NoContent from "@/components/NoContent";
import { Package } from "lucide-react";

const Products = () => {
  const { state, updateProduct } = useAppContext();
  const { products, isLoading } = state;
  const navigate = useNavigate();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(true);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAvailability = showUnavailable || product.isAvailable;
      
      return matchesSearch && matchesAvailability;
    });
  }, [products, searchTerm, showUnavailable]);

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

  // Export products to CSV
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = [
      "ID",
      "Name",
      "Description",
      "Price",
      "Available",
      "Created At",
      "Updated At"
    ];
    
    // Convert products to CSV rows
    const rows = filteredProducts.map(product => [
      product.id,
      product.name,
      product.description || "",
      product.price,
      product.isAvailable ? "Yes" : "No",
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
            <CardTitle>Products List</CardTitle>
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
                actionText={products.length === 0 ? "Add Product" : undefined}
                actionLink={products.length === 0 ? "/products/new" : undefined}
                icon={<Package className="h-12 w-12 text-primary/20" />}
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Availability</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">₹{product.price}</TableCell>
                        <TableCell className="text-center">
                          <Switch 
                            checked={product.isAvailable}
                            onCheckedChange={(checked) => handleToggleAvailability(product.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            View
                          </Button>
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
