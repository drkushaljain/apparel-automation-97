
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building, Save, Upload } from "lucide-react";
import { CompanySettings as CompanySettingsType } from "@/types";

const CompanySettings = () => {
  const { state, dispatch } = useAppContext();
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

  useEffect(() => {
    // Load company settings from localStorage
    const savedSettings = localStorage.getItem('company_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        if (parsedSettings.logo) {
          setLogoPreview(parsedSettings.logo);
        }
      } catch (error) {
        console.error("Error parsing company settings:", error);
      }
    }
  }, []);

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
      
      // Save to localStorage (in a real app this would be to database)
      localStorage.setItem('company_settings', JSON.stringify(updatedSettings));
      
      // Update application state
      dispatch({ type: 'SET_COMPANY_SETTINGS', payload: updatedSettings });
      
      toast.success("Company settings saved successfully");
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast.error("Failed to save company settings");
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
          <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
        </div>

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
      </div>
    </MainLayout>
  );
};

export default CompanySettings;
