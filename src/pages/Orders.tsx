import { useState, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatus } from "@/types";
import { Search, Plus, FileDown, Printer, MoreHorizontal, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NoContent from "@/components/NoContent";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Orders = () => {
  const { state } = useAppContext();
  const { orders, isLoading } = state;
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.transactionId && order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Export orders to CSV
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Total Amount",
      "Status",
      "Transaction ID",
      "Tracking ID",
      "Date Created"
    ];
    
    // Convert orders to CSV rows
    const rows = filteredOrders.map(order => [
      order.id,
      order.customer.name,
      order.totalAmount,
      order.status,
      order.transactionId || "",
      order.trackingId || "",
      new Date(order.createdAt).toLocaleDateString()
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
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Orders exported to CSV");
  };
  
  // Print bill function
  const printBill = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error("Order not found");
      return;
    }
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Unable to open print window. Please check your popup blocker settings.");
        return;
      }
      
      const { companySettings } = state;
      
      // Add necessary styles and content
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - Order #${order.id}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .border-b { border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px; }
              .font-bold { font-weight: bold; }
              .text-sm { font-size: 0.875rem; }
              .text-lg { font-size: 1.125rem; }
              .text-xl { font-size: 1.25rem; }
              .uppercase { text-transform: uppercase; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .border-t { border-top: 1px solid #ddd; padding-top: 15px; margin-top: 15px; }
              .pt-2 { padding-top: 10px; }
              .mt-2 { margin-top: 10px; }
              .mt-4 { margin-top: 20px; }
              .mb-4 { margin-bottom: 20px; }
              .company-logo { max-width: 150px; max-height: 80px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              table th, table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              table th { background-color: #f5f5f5; }
              .invoice-header { display: flex; justify-content: space-between; }
              .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }
              .invoice-meta { margin-bottom: 30px; }
              .invoice-meta-item { margin-bottom: 5px; }
              .invoice-total { font-size: 20px; font-weight: bold; }
              @media print {
                body { margin: 0; padding: 0; }
                .invoice-container { border: none; max-width: 100%; padding: 10px; }
                .no-print { display: none; }
              }
              @media (max-width: 600px) {
                .grid { grid-template-columns: 1fr; }
                .invoice-header { flex-direction: column; }
                table { font-size: 0.8rem; }
                .invoice-container { padding: 10px; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="invoice-header border-b">
                <div>
                  ${companySettings?.logo ? 
                    `<img src="${companySettings.logo}" alt="${companySettings.name}" class="company-logo" />` : ''}
                  <h1 class="invoice-title">${companySettings?.name || "INVOICE"}</h1>
                </div>
                <div class="text-right">
                  <div class="invoice-meta-item">Invoice #: ${order.id}</div>
                  <div class="invoice-meta-item">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
                  ${order.transactionId ? `<div class="invoice-meta-item">Transaction ID: ${order.transactionId}</div>` : ''}
                </div>
              </div>
              
              <div class="grid mt-4 mb-4">
                <div>
                  <h3>Billed From:</h3>
                  <div>${companySettings?.name || "Company Name"}</div>
                  <div>${companySettings?.address || ""}</div>
                  <div>${companySettings?.city || ""}, ${companySettings?.state || ""} - ${companySettings?.pincode || ""}</div>
                  <div>Phone: ${companySettings?.phone || ""}</div>
                  <div>Email: ${companySettings?.email || ""}</div>
                  ${companySettings?.taxId ? `<div>GST/Tax ID: ${companySettings.taxId}</div>` : ''}
                </div>
                <div>
                  <h3>Billed To:</h3>
                  <div class="font-bold">${order.customer.name}</div>
                  <div>${order.customer.address}</div>
                  <div>${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</div>
                  <div>Phone: ${order.customer.phone}</div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Tax</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>${item.product.name}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.price.toFixed(2)}</td>
                      <td>${item.discount ? `₹${item.discount.toFixed(2)}` : '-'}</td>
                      <td>${item.taxAmount ? `₹${item.taxAmount.toFixed(2)}` : '-'}</td>
                      <td class="text-right">₹${((item.price * item.quantity) - (item.discount || 0) + (item.taxAmount || 0)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="border-t">
                <div class="flex justify-between">
                  <div>Subtotal:</div>
                  <div>₹${order.subtotal.toFixed(2)}</div>
                </div>
                <div class="flex justify-between">
                  <div>Discount:</div>
                  <div>-₹${order.discountTotal.toFixed(2)}</div>
                </div>
                <div class="flex justify-between">
                  <div>Tax:</div>
                  <div>+₹${order.taxTotal.toFixed(2)}</div>
                </div>
                <div class="flex justify-between border-t pt-2 mt-2 invoice-total">
                  <div>Total:</div>
                  <div>₹${order.totalAmount.toFixed(2)}</div>
                </div>
              </div>
              
              ${order.notes ? `
                <div class="border-t pt-2 mt-4">
                  <h3>Notes:</h3>
                  <p>${order.notes}</p>
                </div>
              ` : ''}
              
              <div class="text-center border-t pt-2 mt-4 text-sm">
                <p>Thank you for your business!</p>
                ${companySettings?.website ? `<p>${companySettings.website}</p>` : ''}
              </div>
            </div>
            
            <script>
              // Auto print
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      // Log the print event
      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
      if (currentUser?.name) {
        console.log(`Invoice for order #${order.id} printed by ${currentUser.name}`);
      }
      
      toast.success("Printing invoice");
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Failed to print invoice");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse">Loading orders...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Orders</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={exportToCSV}
              disabled={filteredOrders.length === 0}
              className="hidden md:flex"
              title="Export to CSV"
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/orders/new")} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Orders List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <NoContent
                title="No orders found"
                description={
                  orders.length === 0
                    ? "You haven't created any orders yet."
                    : "No orders match your current filters."
                }
                actionText={orders.length === 0 ? "Create Order" : undefined}
                actionLink={orders.length === 0 ? "/orders/new" : undefined}
                icon={<ShoppingBag className="h-12 w-12 text-primary/20" />}
              />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="rounded-md border overflow-x-auto hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/orders/${order.id}`)}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer.name}</TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  printBill(order.id);
                                }}
                                title="Print Bill"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/orders/${order.id}`);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{order.id}</p>
                            <p className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm truncate max-w-[180px]">{order.customer.name}</p>
                          <p className="font-semibold text-sm">₹{order.totalAmount.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${order.id}`);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-xs cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  printBill(order.id);
                                }}
                              >
                                <Printer className="h-3.5 w-3.5 mr-2" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-xs cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/orders/edit/${order.id}`);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Edit Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Mobile Export Button */}
                  <div className="fixed bottom-4 right-4 z-10 md:hidden">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-full shadow-lg"
                      onClick={exportToCSV}
                      disabled={filteredOrders.length === 0}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Orders;
