
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
import { User, UserCog, LogOut } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { state, setCurrentUser } = useAppContext();
  const { currentUser } = state;
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("Apparel Management");
  const [businessEmail, setBusinessEmail] = useState("contact@apparelmanagement.com");
  const [businessPhone, setBusinessPhone] = useState("9876543210");
  const [businessAddress, setBusinessAddress] = useState("123 Business Street, City, State - 123456");
  
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "Hello {{customerName}}, your order #{{orderId}} has been {{status}}. {{trackingInfo}}"
  );
  
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
                    Available variables: {{"{{"}}customerName{{"}}"}}, {{"{{"}}orderId{{"}}"}}, {{"{{"}}status{{"}}"}}, {{"{{"}}trackingInfo{{"}}"}}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveTemplates}>Save Templates</Button>
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
