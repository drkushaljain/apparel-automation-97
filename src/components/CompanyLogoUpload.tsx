
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X } from "lucide-react";

interface CompanyLogoUploadProps {
  initialLogo?: string;
  onLogoChange: (logo: string) => void;
}

const CompanyLogoUpload = ({ initialLogo, onLogoChange }: CompanyLogoUploadProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialLogo?.startsWith("data:") || !initialLogo ? "upload" : "url");
  const [logoUrl, setLogoUrl] = useState<string>(initialLogo?.startsWith("data:") || initialLogo?.startsWith("/uploads") ? "" : (initialLogo || ""));
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(
    initialLogo?.startsWith("data:") ? initialLogo : 
    initialLogo?.startsWith("/uploads") ? initialLogo : ""
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const preview = event.target.result as string;
          setLogoPreview(preview);
          onLogoChange(preview);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setLogoUrl(url);
    onLogoChange(url);
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview("");
    onLogoChange("");
    
    // Reset the file input
    const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>Company Logo</Label>
      <Tabs 
        value={activeTab} 
        onValueChange={(val) => {
          setActiveTab(val);
          if (val === "url") {
            onLogoChange(logoUrl);
          } else {
            onLogoChange(logoPreview);
          }
        }}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="upload">Upload Logo</TabsTrigger>
          <TabsTrigger value="url">Logo URL</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-sm text-gray-400 text-center p-4">
                  No logo selected
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {logoFile ? "Change Logo" : "Select Logo"}
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
                Upload a company logo. Recommended size: 400x400 pixels.
              </p>
              
              {logoFile && (
                <p className="text-xs">
                  Selected file: <span className="font-medium">{logoFile.name}</span> ({Math.round(logoFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="url" className="space-y-2">
          <Input
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter logo URL"
          />
          {logoUrl && (
            <div className="mt-2 border rounded-md p-2 max-w-xs">
              <img 
                src={logoUrl} 
                alt="Logo Preview" 
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
  );
};

export default CompanyLogoUpload;
