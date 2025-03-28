import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { CustomerCategory } from "@/types";
import { toast } from "sonner";

const API_BASE_URL = '/api/customers';

const NewCustomer = () => {
  const { addCustomer } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [category, setCategory] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CustomerCategory[]>([]);

  useEffect(() => {
    fetch('/api/customer-categories')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch categories');
      })
      .then(data => {
        setCategories(data || []);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        const savedCategories = localStorage.getItem("customer_categories");
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const customerData = {
      name,
      email,
      phone,
      whatsapp: whatsapp || phone,
      address,
      city,
      state,
      pincode,
      category_id: category !== "default" ? category : null
    };
    
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (response.ok) {
        const newCustomer = await response.json();
        toast.success("Customer added successfully!");
        navigate("/customers");
      } else {
        const errorText = await response.text();
        console.error('Error from API:', errorText);
        throw new Error('Failed to create customer via API');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      addCustomer(customerData);
      toast.success("Customer added to local storage (API failed)");
      navigate("/customers");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight ml-2">Add New Customer</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number (if different from phone)</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Enter WhatsApp number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Customer Category</Label>
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => navigate("/customer-categories")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter PIN code"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/customers")} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || !phone || !address} className="w-full sm:w-auto">
              Add Customer
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NewCustomer;
