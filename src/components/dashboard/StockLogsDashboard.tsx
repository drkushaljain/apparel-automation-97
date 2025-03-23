
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle } from "lucide-react";
import * as dbService from '@/services/dbService';

const StockLogsDashboard = () => {
  const { state, formatDate } = useAppContext();
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        setLoading(true);
        // Get stock history from the database
        const history = await dbService.getStockHistory();
        
        // Take only the latest 10 entries
        const recentHistory = history.slice(0, 10);
        
        setStockLogs(recentHistory);
      } catch (error) {
        console.error("Failed to fetch stock history:", error);
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
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : stockLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 opacity-40" />
            <p>No recent stock changes</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {stockLogs.map((log) => (
              <div key={log.id} className="border-b pb-3 last:border-0 hover:bg-muted/20 rounded-md p-2 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={log.changeAmount > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
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
                    <p className="text-xs">By {log.userName}</p>
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
