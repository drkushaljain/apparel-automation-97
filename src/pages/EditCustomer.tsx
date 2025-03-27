import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { CustomerCategory, Customer } from "@/types";
import { toast } from "sonner";

const API_BASE_URL = '/api/customer-categories';

const EditCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateCustomer } = useAppContext();
  const { customers } = state;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [pincode, setPincode] = useState("");
  const [category, setCategory] = useState("");

  // Load customer data
  useEffect(() => {
    if (id) {
      const foundCustomer = customers.find(c => c.id === id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setName(foundCustomer.name);
        setEmail(foundCustomer.email || "");
        setPhone(foundCustomer.phone);
        setWhatsapp(foundCustomer.whatsapp);
        setAddress(foundCustomer.address);
        setCity(foundCustomer.city);
        setStateValue(foundCustomer.state);
        setPincode(foundCustomer.pincode);
        setCategory(foundCustomer.category || "no_category");
      }
    }

    // Fetch categories from API
    fetchCategories();
  }, [id, customers]);

  const fetchCategories = async () => {
    try {
      setIsFetchingCategories(true);
      const response = await fetch(API_BASE_URL);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', response.statusText);
        toast.error("Failed to load customer categories");
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Could not connect to the server");
    } finally {
      setIsFetchingCategories(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) return;
    
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setIsLoading(true);
    
    const updatedCustomer: Customer = {
      ...customer,
      name,
      email: email || undefined,
      phone,
      whatsapp,
      address,
      city,
      state: stateValue,
      pincode,
      category: category === "no_category" ? undefined : category,
    };
    
    updateCustomer(updatedCustomer);
    setIsLoading(false);
    navigate(`/customers/${id}`);
  };

  if (!customer) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Customer not found</h2>
            <p className="text-muted-foreground">The customer you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate("/customers")}>
              Back to Customers
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/customers/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="WhatsApp Number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value)}
                    placeholder="State"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode/ZIP"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Customer Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isFetchingCategories}>
                    <SelectTrigger>
                      <SelectValue placeholder={isFetchingCategories ? "Loading categories..." : "Select Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_category">No Category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/customers/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditCustomer;
