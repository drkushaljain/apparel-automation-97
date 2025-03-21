
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building, Save, Upload, User } from "lucide-react";
import { CompanySettings as CompanySettingsType } from "@/types";
import * as dbService from "@/services/dbService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CompanySettings = () => {
  const { state, setCompanySettings, updateUser } = useAppContext();
  const { currentUser } = state;
  
  const [settings, setSettings] = useState<CompanySettingsType>({
    name: "Apparel Management",
    email: "contact@apparelmanagement.com",
    phone: "9876543210",
    address: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    website: "",
    taxId: "",
    appName: "Apparel Management",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: ""
    }
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // User profile state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");

  useEffect(() => {
    // Load company settings from database service
    const loadCompanySettings = async () => {
      try {
        const savedSettings = await dbService.getCompanySettings();
        if (savedSettings) {
          setSettings({
            ...savedSettings,
            // Set default appName if not present in saved settings
            appName: savedSettings.appName || "Apparel Management"
          });
          
          if (savedSettings.logo) {
            setLogoPreview(savedSettings.logo);
          }
        }
      } catch (error) {
        console.error("Error loading company settings:", error);
        toast.error("Failed to load company settings");
      }
    };
    
    loadCompanySettings();

    // Load current user information
    if (currentUser) {
      setUserName(currentUser.name);
      setUserEmail(currentUser.email);
      setUserPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // In a real application, this would upload to a server/cloud storage
      // For this example, we'll use base64 encoding to store the image
      let logoUrl = settings.logo;
      
      if (logoFile) {
        const reader = new FileReader();
        logoUrl = await new Promise<string>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(logoFile);
        });
      }
      
      const updatedSettings: CompanySettingsType = {
        ...settings,
        logo: logoUrl
      };
      
      // Save to database service
      await dbService.saveCompanySettings(updatedSettings);
      
      // Update application state
      setCompanySettings(updatedSettings);
      
      toast.success("Company settings saved successfully");
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast.error("Failed to save company settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUserProfile = () => {
    if (!currentUser) {
      toast.error("No user logged in");
      return;
    }
    
    if (userPassword && userPassword !== userConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedUser = {
        ...currentUser,
        name: userName,
        email: userEmail,
        phone: userPhone,
        ...(userPassword ? { password: userPassword } : {})
      };
      
      updateUser(updatedUser);
      setUserPassword("");
      setUserConfirmPassword("");
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Only admin can access this page
  if (currentUser?.role !== "admin") {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this page.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 w-full max-w-md">
            <TabsTrigger value="company">Company Settings</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    This information will be used on invoices, delivery slips, and other printed materials.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-name">Application Name</Label>
                    <Input
                      id="app-name"
                      value={settings.appName || ""}
                      onChange={(e) => setSettings({...settings, appName: e.target.value})}
                      placeholder="Enter application name"
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will appear on the login page and in the header.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        placeholder="Enter company email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Phone</Label>
                      <Input
                        id="company-phone"
                        value={settings.phone}
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        placeholder="Enter company phone"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Textarea
                      id="company-address"
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      placeholder="Enter company address"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-city">City</Label>
                      <Input
                        id="company-city"
                        value={settings.city}
                        onChange={(e) => setSettings({...settings, city: e.target.value})}
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-state">State</Label>
                      <Input
                        id="company-state"
                        value={settings.state}
                        onChange={(e) => setSettings({...settings, state: e.target.value})}
                        placeholder="Enter state"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-pincode">Pincode</Label>
                      <Input
                        id="company-pincode"
                        value={settings.pincode}
                        onChange={(e) => setSettings({...settings, pincode: e.target.value})}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-website">Website</Label>
                      <Input
                        id="company-website"
                        value={settings.website || ""}
                        onChange={(e) => setSettings({...settings, website: e.target.value})}
                        placeholder="Enter website URL"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company-taxid">Tax ID / GST Number</Label>
                      <Input
                        id="company-taxid"
                        value={settings.taxId || ""}
                        onChange={(e) => setSettings({...settings, taxId: e.target.value})}
                        placeholder="Enter tax ID"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>
                    Upload your company logo to use on invoices and delivery slips.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    {logoPreview ? (
                      <div className="w-40 h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gray-100 rounded-md flex items-center justify-center">
                        <Building className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="w-full">
                      <Label htmlFor="logo-upload" className="block mb-2">Upload New Logo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <Button 
                          variant="outline"
                          onClick={() => document.getElementById("logo-upload")?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended size: 400x400 pixels. Max file size: 2MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Label htmlFor="social-media">Social Media</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Facebook URL"
                        value={settings.socialMedia?.facebook || ""}
                        onChange={(e) => setSettings({
                          ...settings, 
                          socialMedia: {...settings.socialMedia, facebook: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="Instagram URL"
                        value={settings.socialMedia?.instagram || ""}
                        onChange={(e) => setSettings({
                          ...settings, 
                          socialMedia: {...settings.socialMedia, instagram: e.target.value}
                        })}
                      />
                      <Input
                        placeholder="Twitter URL"
                        value={settings.socialMedia?.twitter || ""}
                        onChange={(e) => setSettings({
                          ...settings, 
                          socialMedia: {...settings.socialMedia, twitter: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                  <CardDescription>
                    Update your personal information and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="user-phone">Phone</Label>
                      <Input
                        id="user-phone"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-md font-medium mb-2">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-password">New Password</Label>
                        <Input
                          id="user-password"
                          type="password"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="user-confirm-password">Confirm Password</Label>
                        <Input
                          id="user-confirm-password"
                          type="password"
                          value={userConfirmPassword}
                          onChange={(e) => setUserConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveUserProfile} 
                    disabled={isLoading || !userName || !userEmail}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CompanySettings;
