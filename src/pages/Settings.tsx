
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, UserCog, LogOut, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const { state, setCurrentUser } = useAppContext();
  const { currentUser, customers, products } = state;
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("Apparel Management");
  const [businessEmail, setBusinessEmail] = useState("contact@apparelmanagement.com");
  const [businessPhone, setBusinessPhone] = useState("9876543210");
  const [businessAddress, setBusinessAddress] = useState("123 Business Street, City, State - 123456");
  
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "Hello {{customerName}}, your order #{{orderId}} has been {{status}}. {{trackingInfo}}"
  );
  
  // Bulk message states
  const [bulkMessageType, setBulkMessageType] = useState<"all" | "category" | "product">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [bulkMessageText, setBulkMessageText] = useState<string>("Hello {{customerName}}, we have exciting news about our products!");
  const [isSending, setIsSending] = useState(false);
  
  const handleSaveBusinessInfo = () => {
    toast.success("Business information saved successfully");
  };
  
  const handleSaveTemplates = () => {
    toast.success("Message templates saved successfully");
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  // Filter customers based on selection
  const getEligibleCustomers = () => {
    if (bulkMessageType === "all") {
      return customers;
    } else if (bulkMessageType === "category" && selectedCategory) {
      // Find customers who purchased products from this category
      const orderIdsWithCategory = state.orders
        .filter(order => 
          order.items.some(item => 
            products.find(p => p.id === item.productId)?.category === selectedCategory
          )
        )
        .map(order => order.id);
      
      return customers.filter(customer => 
        state.orders.some(order => 
          order.customerId === customer.id && orderIdsWithCategory.includes(order.id)
        )
      );
    } else if (bulkMessageType === "product" && selectedProduct) {
      // Find customers who purchased this specific product
      const orderIdsWithProduct = state.orders
        .filter(order => 
          order.items.some(item => item.productId === selectedProduct)
        )
        .map(order => order.id);
      
      return customers.filter(customer => 
        state.orders.some(order => 
          order.customerId === customer.id && orderIdsWithProduct.includes(order.id)
        )
      );
    }
    return [];
  };

  const handleSendBulkMessage = () => {
    const eligibleCustomers = getEligibleCustomers();
    
    if (eligibleCustomers.length === 0) {
      toast.error("No customers found matching the selected criteria");
      return;
    }
    
    setIsSending(true);
    
    // Simulate sending messages to all eligible customers
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Bulk message sent to ${eligibleCustomers.length} customers`);
    }, 2000);
    
    // In a real implementation, you would send messages to each customer here
    console.log(`Sending message to ${eligibleCustomers.length} customers`);
    console.log("Message:", bulkMessageText);
    console.log("Customers:", eligibleCustomers);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList>
            <TabsTrigger value="business">
              <User className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="templates">
              <UserCog className="h-4 w-4 mr-2" />
              Message Templates
            </TabsTrigger>
            <TabsTrigger value="bulkMessage">
              <MessageSquare className="h-4 w-4 mr-2" />
              Bulk Messaging
            </TabsTrigger>
            <TabsTrigger value="account">
              <UserCog className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Business Information */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details that will appear on invoices and delivery slips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Address</Label>
                  <Textarea
                    id="business-address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveBusinessInfo}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Message Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Message Templates</CardTitle>
                <CardDescription>
                  Customize the messages that are sent to customers via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-template">Order Status Update Template</Label>
                  <Textarea
                    id="whatsapp-template"
                    value={whatsappTemplate}
                    onChange={(e) => setWhatsappTemplate(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {"{{"} customerName {"}}"},  {"{{"} orderId {"}}"},  {"{{"} status {"}}"},  {"{{"} trackingInfo {"}}"}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveTemplates}>Save Templates</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Bulk Messaging */}
          <TabsContent value="bulkMessage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk WhatsApp Marketing</CardTitle>
                <CardDescription>
                  Send marketing messages to multiple customers based on products or categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-message-type">Message Recipients</Label>
                  <Select 
                    value={bulkMessageType} 
                    onValueChange={(value: "all" | "category" | "product") => setBulkMessageType(value)}
                  >
                    <SelectTrigger id="bulk-message-type">
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="category">By Product Category</SelectItem>
                      <SelectItem value="product">By Specific Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bulkMessageType === "category" && (
                  <div className="space-y-2">
                    <Label htmlFor="selected-category">Select Category</Label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger id="selected-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category, index) => (
                          <SelectItem key={index} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bulkMessageType === "product" && (
                  <div className="space-y-2">
                    <Label htmlFor="selected-product">Select Product</Label>
                    <Select 
                      value={selectedProduct} 
                      onValueChange={setSelectedProduct}
                    >
                      <SelectTrigger id="selected-product">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bulk-message-text">Message Text</Label>
                  <Textarea
                    id="bulk-message-text"
                    value={bulkMessageText}
                    onChange={(e) => setBulkMessageText(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {"{{"} customerName {"}}"}
                  </p>
                </div>

                <div className="mt-4 py-3 px-4 bg-muted/40 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      {getEligibleCustomers().length} customers will receive this message
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSendBulkMessage} 
                  disabled={isSending || !bulkMessageText || getEligibleCustomers().length === 0}
                >
                  {isSending ? "Sending..." : "Send Bulk Message"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <div className="p-2 bg-muted/30 rounded-md">{currentUser.name}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="p-2 bg-muted/30 rounded-md">{currentUser.email}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="p-2 bg-muted/30 rounded-md capitalize">{currentUser.role}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
