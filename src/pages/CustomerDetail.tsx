
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, Tag, Edit } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { CustomerCategory } from "@/types";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { customers, orders, currentUser } = state;
  const [category, setCategory] = useState<CustomerCategory | null>(null);

  // Find the customer
  const customer = customers.find(c => c.id === id);
  
  // Find customer's orders
  const customerOrders = orders.filter(order => order.customerId === id);
  
  // Calculate total purchase value
  const totalPurchaseValue = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Check if user has permission to edit customers
  const canEditCustomer = currentUser?.permissions.canManageCustomers;

  useEffect(() => {
    if (customer?.category) {
      const savedCategories = JSON.parse(localStorage.getItem("customer_categories") || "[]");
      const foundCategory = savedCategories.find((cat: CustomerCategory) => cat.id === customer.category);
      if (foundCategory) {
        setCategory(foundCategory);
      }
    }
  }, [customer]);

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
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          </div>
          
          {canEditCustomer && (
            <Button onClick={() => navigate(`/customers/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Profile */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category && (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Tag className="h-3 w-3 mr-1" />
                  {category.name}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>Phone: {customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>WhatsApp: {customer.whatsapp}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email: {customer.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{customer.address}</p>
                    <p>
                      {customer.city}, {customer.state} - {customer.pincode}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{customerOrders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Purchase</p>
                    <p className="text-2xl font-bold">₹{totalPurchaseValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer's Orders */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No orders found for this customer.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate("/orders/new", { state: { customerId: customer.id } })}
                  >
                    Create New Order
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>₹{order.totalAmount}</TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
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
      </div>
    </MainLayout>
  );
};

export default CustomerDetail;
