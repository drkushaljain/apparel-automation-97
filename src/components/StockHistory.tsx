
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockHistoryRecord } from "@/types";

interface StockHistoryProps {
  history: StockHistoryRecord[];
}

const StockHistory = ({ history }: StockHistoryProps) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No stock history found
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
            <TableHead>By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record, index) => (
            <TableRow key={index}>
              <TableCell className="text-sm">
                {formatDate(record.timestamp)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={record.changeAmount > 0 ? "secondary" : "destructive"}
                  className={record.changeAmount > 0 ? "bg-green-100 text-green-800" : ""}
                >
                  {record.changeAmount > 0 
                    ? `+${record.changeAmount}` 
                    : record.changeAmount}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{record.reason}</TableCell>
              <TableCell className="text-sm">{record.updatedBy || record.userName || "System"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockHistory;
