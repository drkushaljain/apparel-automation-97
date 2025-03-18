
import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NoContent from "@/components/NoContent";
import { Users } from "lucide-react";

const Customers = () => {
  const { state } = useAppContext();
  const { customers, isLoading } = state;
  const navigate = useNavigate();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.whatsapp.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  // Export customers to CSV
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = [
      "ID",
      "Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Address",
      "City",
      "State",
      "Pincode",
      "Orders Count"
    ];
    
    // Convert customers to CSV rows
    const rows = filteredCustomers.map(customer => [
      customer.id,
      customer.name,
      customer.phone,
      customer.whatsapp,
      customer.email || "",
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      customer.orders.length
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
    <MainLayout>
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
            <Button onClick={() => navigate("/customers/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
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
                      <TableHead>Name</TableHead>
                      <TableHead>Phone/WhatsApp</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
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
                        <TableCell className="text-right">{customer.orders.length}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/customers/${customer.id}`)}
                          >
                            View
                          </Button>
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
    </MainLayout>
  );
};

export default Customers;
