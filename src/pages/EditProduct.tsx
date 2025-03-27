import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureCurrencyPrecision } from "@/lib/utils";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { state, updateProduct } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [sku, setSku] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("url");

  useEffect(() => {
    if (id) {
      const product = state.products.find(p => p.id === id);
      if (product) {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(ensureCurrencyPrecision(product.price));
        setImageUrl(product.imageUrl || "");
        if (product.imageUrl) {
          if (product.imageUrl.startsWith('data:')) {
            setActiveTab("upload");
            setImagePreview(product.imageUrl);
          } else {
            setActiveTab("url");
          }
        }
        setCategory(product.category || "");
        setStock(product.stock);
        setSku(product.sku || "");
        setIsAvailable(product.isAvailable);
        setTaxPercentage(ensureCurrencyPrecision(product.taxPercentage || 0));
      } else {
        toast.error("Product not found");
        navigate("/products");
      }
    }
  }, [id, state.products, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error("Product ID is missing");
      return;
    }
    
    const product = state.products.find(p => p.id === id);
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    setIsLoading(true);
    
    let finalImageUrl = imageUrl;
    
    if (activeTab === "upload") {
      if (imageFile) {
        const reader = new FileReader();
        finalImageUrl = await new Promise<string>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(imageFile);
        });
      } else if (imagePreview) {
        finalImageUrl = imagePreview;
      }
    }
    
    const roundedPrice = ensureCurrencyPrecision(price);
    const roundedTaxPercentage = ensureCurrencyPrecision(taxPercentage);
    
    updateProduct({
      ...product,
      name,
      description,
      price: roundedPrice,
      imageUrl: finalImageUrl,
      category,
      stock,
      sku,
      isAvailable,
      taxPercentage: roundedTaxPercentage,
    });
    
    setIsLoading(false);
    toast.success("Product updated successfully");
    navigate(`/products/${id}`);
  };

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPrice(numValue);
    } else if (value === '') {
      setPrice(0);
    }
  };

  const handleTaxChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setTaxPercentage(numValue);
    } else if (value === '') {
      setTaxPercentage(0);
    }
  };

  if (!id) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Product ID is missing</h2>
          <Button className="mt-4" onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight ml-2">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Enter SKU"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter product category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Product Image</Label>
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                  />
                  {imageUrl && (
                    <div className="mt-2 border rounded-md p-2 max-w-xs">
                      <img 
                        src={imageUrl} 
                        alt="Product Preview" 
                        className="max-h-40 object-contain mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/300x300?text=Invalid+Image";
                        }}
                      />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image File
                    </Button>
                  </div>
                  {(imagePreview || imageFile) && (
                    <div className="mt-2 border rounded-md p-2 max-w-xs">
                      <img 
                        src={imagePreview} 
                        alt="Product Preview" 
                        className="max-h-40 object-contain mx-auto"
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
              <Input
                id="taxPercentage"
                type="number"
                value={taxPercentage}
                onChange={(e) => handleTaxChange(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
              <Label htmlFor="isAvailable">Available for ordering</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(`/products/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || price <= 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditProduct;
