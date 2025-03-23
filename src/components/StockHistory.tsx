
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockHistoryRecord } from "@/types";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";

interface StockHistoryProps {
  history: StockHistoryRecord[];
  isLoading?: boolean;
}

const StockHistory = ({ history, isLoading = false }: StockHistoryProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
        <RefreshCcw className="h-10 w-10 mb-2 animate-spin opacity-40" />
        <p>Loading stock history...</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
        <AlertCircle className="h-10 w-10 mb-2 opacity-40" />
        <p>No stock history found</p>
      </div>
    );
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Updated By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record, index) => (
            <TableRow key={index} className="hover:bg-muted/20 transition-colors">
              <TableCell className="text-sm">
                {formatDate(record.timestamp)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {record.changeAmount > 0 ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge 
                    variant={record.changeAmount > 0 ? "outline" : "destructive"}
                    className={record.changeAmount > 0 ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}
                  >
                    {record.changeAmount > 0 
                      ? `+${record.changeAmount}` 
                      : record.changeAmount}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {record.reason || "No reason provided"}
              </TableCell>
              <TableCell className="text-sm">
                {record.updatedBy || record.userName || "System"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockHistory;
