
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, User } from "@/types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StockChange {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  userId: string;
  userName: string;
  timestamp: Date;
  reason: string;
}

interface StockHistoryProps {
  history: StockChange[];
  products?: Product[];
  users?: User[];
}

const StockHistory = ({ history, products, users }: StockHistoryProps) => {
  const [productFilter, setProductFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  
  const filteredHistory = history.filter(record => {
    const matchesProduct = productFilter === "all" || record.productId === productFilter;
    const matchesUser = userFilter === "all" || record.userId === userFilter;
    return matchesProduct && matchesUser;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Change History</CardTitle>
        <CardDescription>Record of all stock modifications</CardDescription>
        
        {(products || users) && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            {products && (
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {users && (
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No stock change records found
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Modified By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{record.productName}</TableCell>
                    <TableCell>
                      <Badge variant={record.changeAmount > 0 ? "success" : "destructive"}>
                        {record.changeAmount > 0 ? (
                          <ArrowUp className="h-3 w-3 mr-1 inline" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1 inline" />
                        )}
                        {Math.abs(record.changeAmount)}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.previousStock}</TableCell>
                    <TableCell>{record.newStock}</TableCell>
                    <TableCell>{record.userName}</TableCell>
                    <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{record.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockHistory;
