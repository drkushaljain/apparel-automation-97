
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureCurrencyPrecision } from "@/lib/utils";
import { toast } from "sonner";

const NewProduct = () => {
  const { addProduct } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [category, setCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [sku, setSku] = useState("");
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");

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

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview("");
    // Reset the file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      if (activeTab === "upload" && imageFile) {
        // Convert file to data URL for storage
        const reader = new FileReader();
        finalImageUrl = await new Promise<string>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(imageFile);
        });
      }
      
      if (!finalImageUrl && activeTab === "url" && !imageUrl) {
        toast.error("Please provide an image URL or upload an image");
        setIsLoading(false);
        return;
      }
      
      const roundedPrice = ensureCurrencyPrecision(price);
      const roundedTaxPercentage = ensureCurrencyPrecision(taxPercentage);
      
      addProduct({
        name,
        description,
        price: roundedPrice,
        imageUrl: finalImageUrl,
        category,
        isAvailable,
        sku,
        taxPercentage: roundedTaxPercentage,
        stock: 0,
        sales: 0
      });
      
      toast.success("Product added successfully");
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight ml-2">Add New Product</h1>
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
            </div>
            
            <div className="space-y-2">
              <Label>Product Image</Label>
              <Tabs 
                defaultValue="upload" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Product Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-sm text-gray-400 text-center p-4">
                          No image selected
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {imageFile ? "Change Image" : "Select Image"}
                        </Button>
                        
                        {imageFile && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={clearImageSelection}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Upload a product image. Recommended size: 800x800 pixels.
                      </p>
                      
                      {imageFile && (
                        <p className="text-xs">
                          Selected file: <span className="font-medium">{imageFile.name}</span> ({Math.round(imageFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
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
              </Tabs>
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
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || price <= 0}>
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NewProduct;
