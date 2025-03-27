
import { useState, useMemo, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileDown, Filter, Tag, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NoContent from "@/components/NoContent";
import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CustomerCategory } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const Customers = () => {
  const { state } = useAppContext();
  const { customers, orders, isLoading, currentUser } = state;
  const navigate = useNavigate();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<CustomerCategory[]>([]);

  // Check if user has permission to edit customers
  const canEditCustomer = currentUser?.permissions.canManageCustomers;

  // Load categories
  useEffect(() => {
    const savedCategories = localStorage.getItem("customer_categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Default";
  };

  // Calculate total purchase value per customer
  const customersPurchaseValues = useMemo(() => {
    return customers.reduce((result, customer) => {
      const customerOrders = orders.filter(order => order.customerId === customer.id);
      const totalValue = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      result[customer.id] = totalValue;
      return result;
    }, {} as Record<string, number>);
  }, [customers, orders]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // First filter by category if selected
      if (selectedCategory && selectedCategory !== "all" && customer.category !== selectedCategory) {
        return false;
      }
      
      // Then filter by search term
      return (
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.whatsapp.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [customers, searchTerm, selectedCategory]);

  // Export customers to CSV
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = [
      "SN",
      "ID",
      "Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Address",
      "City",
      "State",
      "Pincode",
      "Category",
      "Orders Count",
      "Total Purchase Value"
    ];
    
    // Convert customers to CSV rows
    const rows = filteredCustomers.map((customer, index) => [
      index + 1,
      customer.id,
      customer.name,
      customer.phone,
      customer.whatsapp,
      customer.email || "",
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      getCategoryName(customer.category || ""),
      customer.orders.length,
      customersPurchaseValues[customer.id] || 0
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse">Loading customers...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={exportToCSV}
              disabled={filteredCustomers.length === 0}
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/customer-categories")} variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
            <Button onClick={() => navigate("/customers/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="w-full sm:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Customers List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <NoContent
                title="No customers found"
                description={
                  customers.length === 0
                    ? "You haven't added any customers yet."
                    : "No customers match your search."
                }
                actionText={customers.length === 0 ? "Add Customer" : undefined}
                actionLink={customers.length === 0 ? "/customers/new" : undefined}
                icon={<Users className="h-12 w-12 text-primary/20" />}
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">SN</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone/WhatsApp</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">📞 {customer.phone}</p>
                            <p className="text-sm">📱 {customer.whatsapp}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.city}, {customer.state}
                        </TableCell>
                        <TableCell>
                          {customer.category ? (
                            <Badge variant="outline" className="bg-primary/10">
                              {getCategoryName(customer.category)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Default</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{customer.orders.length}</TableCell>
                        <TableCell className="text-right">₹{(customersPurchaseValues[customer.id] || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {canEditCustomer ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/customers/${customer.id}`)}
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Customers;
