import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CompanySettings } from "@/types";
import { Check, Copy, Facebook, Instagram, Loader2, Twitter, Upload, X } from "lucide-react";

const CompanySettingsPage = () => {
  const { state, setCompanySettings, updateCompanySettings } = useAppContext();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [appName, setAppName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [website, setWebsite] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  useEffect(() => {
    if (state.companySettings) {
      setSettings(state.companySettings);
      setCompanyName(state.companySettings.companyName);
      setName(state.companySettings.name || "");
      setAppName(state.companySettings.appName || "");
      setAddress(state.companySettings.address);
      setCity(state.companySettings.city || "");
      setStateName(state.companySettings.state || "");
      setPincode(state.companySettings.pincode || "");
      setPhone(state.companySettings.phone);
      setEmail(state.companySettings.email);
      setTaxId(state.companySettings.taxId);
      setLogoUrl(state.companySettings.logoUrl);
      if (state.companySettings.logoUrl) {
        setLogoPreview(state.companySettings.logoUrl);
      }
      setWebsite(state.companySettings.website || "");
      setCurrency(state.companySettings.currency);
      setFacebook(state.companySettings.socialMedia?.facebook || "");
      setInstagram(state.companySettings.socialMedia?.instagram || "");
      setTwitter(state.companySettings.socialMedia?.twitter || "");
    } else {
      setIsLoading(true);
      // Initialize with default settings if none exist
      const defaultSettings: CompanySettings = {
        id: "1",
        companyName: "",
        appName: "",
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        email: "",
        taxId: "",
        logoUrl: "",
        logo: "",
        website: "",
        currency: "INR",
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: ""
        }
      };
      setSettings(defaultSettings);
      setCompanyName("");
      setAppName("");
      setName("");
      setAddress("");
      setCity("");
      setStateName("");
      setPincode("");
      setPhone("");
      setEmail("");
      setTaxId("");
      setLogoUrl("");
      setWebsite("");
      setCurrency("INR");
      setFacebook("");
      setInstagram("");
      setTwitter("");
      setIsLoading(false);
    }
  }, [state.companySettings]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    if (settings) {
      setCompanyName(settings.companyName);
      setName(settings.name || "");
      setAppName(settings.appName || "");
      setAddress(settings.address);
      setCity(settings.city || "");
      setStateName(settings.state || "");
      setPincode(settings.pincode || "");
      setPhone(settings.phone);
      setEmail(settings.email);
      setTaxId(settings.taxId);
      setLogoUrl(settings.logoUrl);
      setLogoFile(null);
      setLogoPreview(settings.logoUrl);
      setWebsite(settings.website || "");
      setCurrency(settings.currency);
      setFacebook(settings.socialMedia?.facebook || "");
      setInstagram(settings.socialMedia?.instagram || "");
      setTwitter(settings.socialMedia?.twitter || "");
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a local preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(logoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    
    let finalLogoUrl = logoUrl;
    
    // If a new logo file was selected, generate a data URL for it
    if (logoFile) {
      try {
        const reader = new FileReader();
        finalLogoUrl = await new Promise<string>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(logoFile);
        });
      } catch (error) {
        console.error("Error reading logo file:", error);
        toast.error("Failed to process logo image.");
        setIsSaving(false);
        return;
      }
    }
    
    const updatedSettings: CompanySettings = {
      id: settings?.id || "1",
      companyName,
      name,
      appName,
      address,
      city,
      state: stateName,
      pincode,
      phone,
      email,
      taxId,
      logoUrl: finalLogoUrl,
      logo: finalLogoUrl,
      website,
      currency,
      socialMedia: {
        facebook,
        instagram,
        twitter
      }
    };
    
    try {
      if (settings) {
        await updateCompanySettings(updatedSettings);
      } else {
        await setCompanySettings(updatedSettings);
      }
      toast.success("Company settings updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating company settings:", error);
      toast.error("Failed to update company settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${fieldName} copied to clipboard!`);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error(`Failed to copy ${fieldName}.`);
      });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
        {!isEditMode ? (
          <Button onClick={handleEditClick}>Edit Settings</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Logo */}
          <div className="mb-6">
            <Label htmlFor="logo" className="block mb-2">Company Logo</Label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Company Logo Preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-gray-400 text-center p-4">
                    No logo uploaded
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                {isEditMode ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {logoFile ? "Change Logo" : "Upload Logo"}
                      </Button>
                      {logoFile && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={clearLogoSelection}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload your company logo. Recommended size: 200x200 pixels.
                    </p>
                    {logoFile && (
                      <p className="text-xs">
                        Selected file: <span className="font-medium">{logoFile.name}</span> ({Math.round(logoFile.size / 1024)} KB)
                      </p>
                    )}
                  </>
                ) : logoUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleCopyToClipboard(logoUrl, "Logo URL")}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Logo URL
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="relative">
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Your Company Name"
                />
                {companyName && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(companyName, "Company Name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* App Name */}
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <div className="relative">
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="App Name"
                />
                {appName && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(appName, "App Name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Contact Name"
                />
                {name && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(name, "Contact Name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Address"
                />
                {address && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(address, "Address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="City"
                />
                {city && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(city, "City")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <div className="relative">
                <Input
                  id="state"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="State"
                />
                {stateName && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(stateName, "State")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <div className="relative">
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Pincode"
                />
                {pincode && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(pincode, "Pincode")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Phone"
                />
                {phone && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(phone, "Phone")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Email"
                />
                {email && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(email, "Email")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <div className="relative">
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Tax ID"
                />
                {taxId && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(taxId, "Tax ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <div className="relative">
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Logo URL"
                />
                {logoUrl && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(logoUrl, "Logo URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Website"
                />
                {website && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(website, "Website")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={!isEditMode}
                placeholder="Currency"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <div className="relative">
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Facebook"
                />
                {facebook && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(facebook, "Facebook")}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Instagram"
                />
                {instagram && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(instagram, "Instagram")}
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <div className="relative">
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Twitter"
                />
                {twitter && !isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => handleCopyToClipboard(twitter, "Twitter")}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettingsPage;
