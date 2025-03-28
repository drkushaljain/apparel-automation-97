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
import { User, Building, UserCog, LogOut, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const { state, setCurrentUser, updateCompanySettings } = useAppContext();
  const { currentUser, customers, products, companySettings } = state;
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState(companySettings?.name || "Apparel Management");
  const [businessEmail, setBusinessEmail] = useState(companySettings?.email || "contact@apparelmanagement.com");
  const [businessPhone, setBusinessPhone] = useState(companySettings?.phone || "9876543210");
  const [businessAddress, setBusinessAddress] = useState(companySettings?.address || "123 Business Street, City, State - 123456");
  const [businessCity, setBusinessCity] = useState(companySettings?.city || "City");
  const [businessState, setBusinessState] = useState(companySettings?.state || "State");
  const [businessPincode, setBusinessPincode] = useState(companySettings?.pincode || "123456");
  const [businessWebsite, setBusinessWebsite] = useState(companySettings?.website || "www.apparelmanagement.com");
  const [businessTaxId, setBusinessTaxId] = useState(companySettings?.taxId || "");

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "Hello {{customerName}}, your order #{{orderId}} has been {{status}}. {{trackingInfo}}"
  );
  
  const [bulkMessageType, setBulkMessageType] = useState<"all" | "category" | "product">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [bulkMessageText, setBulkMessageText] = useState<string>("Hello {{customerName}}, we have exciting news about our products!");
  const [isSending, setIsSending] = useState(false);
  
  const handleSaveBusinessInfo = () => {
    const updatedSettings = {
      ...companySettings,
      name: businessName,
      email: businessEmail,
      phone: businessPhone,
      address: businessAddress,
      city: businessCity,
      state: businessState,
      pincode: businessPincode,
      website: businessWebsite,
      taxId: businessTaxId,
      logo: companySettings?.logo || ""
    };
    
    updateCompanySettings(updatedSettings);
    toast.success("Business information saved successfully");
  };
  
  const handleSaveTemplates = () => {
    toast.success("Message templates saved successfully");
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  const categories = [...new Set(products.map(product => product.category))];

  const getEligibleCustomers = () => {
    if (bulkMessageType === "all") {
      return customers;
    } else if (bulkMessageType === "category" && selectedCategory) {
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
    
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Bulk message sent to ${eligibleCustomers.length} customers`);
    }, 2000);
    
    console.log(`Sending message to ${eligibleCustomers.length} customers`);
    console.log("Message:", bulkMessageText);
    console.log("Customers:", eligibleCustomers);
  };

  const handleGoToCompanySettings = () => {
    navigate("/settings/company");
  };

  return (
    <>
      <div className="page-container space-y-4 animate-fade-in">
        <div className="page-header flex justify-between items-center">
          <h1 className="page-title">Settings</h1>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <TabsList className="flex w-full mb-4">
              <TabsTrigger value="business" className="flex-1 min-w-[100px]">
                <User className="h-4 w-4 mr-2" />
                <span className="truncate">Business</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-1 min-w-[140px]">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="truncate">Message Templates</span>
              </TabsTrigger>
              <TabsTrigger value="bulkMessage" className="flex-1 min-w-[120px]">
                <Users className="h-4 w-4 mr-2" />
                <span className="truncate">Bulk Messaging</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1 min-w-[100px]">
                <UserCog className="h-4 w-4 mr-2" />
                <span className="truncate">Account</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="business" className="mt-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details that will appear on invoices and delivery slips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pt-0">
                <Button 
                  onClick={handleGoToCompanySettings}
                  variant="outline"
                  className="w-full"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Manage Company Details & Logo
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-city">City</Label>
                    <Input
                      id="business-city"
                      value={businessCity}
                      onChange={(e) => setBusinessCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-state">State</Label>
                    <Input
                      id="business-state"
                      value={businessState}
                      onChange={(e) => setBusinessState(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-pincode">Pin Code</Label>
                    <Input
                      id="business-pincode"
                      value={businessPincode}
                      onChange={(e) => setBusinessPincode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-website">Website</Label>
                    <Input
                      id="business-website"
                      value={businessWebsite}
                      onChange={(e) => setBusinessWebsite(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-taxid">GST/Tax ID</Label>
                    <Input
                      id="business-taxid"
                      value={businessTaxId}
                      onChange={(e) => setBusinessTaxId(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveBusinessInfo}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>WhatsApp Message Templates</CardTitle>
                <CardDescription>
                  Customize the messages that are sent to customers via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pt-0">
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

          <TabsContent value="bulkMessage" className="mt-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Bulk WhatsApp Marketing</CardTitle>
                <CardDescription>
                  Send marketing messages to multiple customers based on products or categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pt-0">
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

          <TabsContent value="account" className="mt-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto pt-0">
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
    </>
  );
};

export default Settings;
