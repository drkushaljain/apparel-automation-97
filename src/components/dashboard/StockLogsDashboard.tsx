
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, RefreshCcw } from "lucide-react";
import * as dbService from '@/services/dbService';

const StockLogsDashboard = () => {
  const { state, formatDate } = useAppContext();
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get stock history from the database
        const history = await dbService.getStockHistory();
        
        if (!history || history.length === 0) {
          console.log("No stock history found");
        } else {
          console.log(`Found ${history.length} stock history records`);
        }
        
        // Take only the latest 10 entries, sorted by timestamp
        const recentHistory = [...history]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);
        
        setStockLogs(recentHistory);
      } catch (error) {
        console.error("Failed to fetch stock history:", error);
        setError("Failed to load stock history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockHistory();
  }, []);
  
  const getActionColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Stock Changes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCcw className="h-8 w-8 animate-spin mb-2 text-primary/70" />
            <p className="text-muted-foreground">Loading stock changes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 text-red-500/70" />
            <p>{error}</p>
          </div>
        ) : stockLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 opacity-40" />
            <p>No recent stock changes</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {stockLogs.map((log, index) => (
              <div key={log.id || index} className="border-b pb-3 last:border-0 hover:bg-muted/20 rounded-md p-2 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`
                        ${log.changeAmount > 0 ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}
                        transition-colors
                      `}>
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </Badge>
                      <p className={`${getActionColor(log.changeAmount)} text-sm`}>
                        {log.changeAmount > 0 ? 'Added to stock' : 'Removed from stock'}
                      </p>
                    </div>
                    {log.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {log.reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>
                    <p className="text-xs">By {log.userName || log.updatedBy || 'System'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockLogsDashboard;
