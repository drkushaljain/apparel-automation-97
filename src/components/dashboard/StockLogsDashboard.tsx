
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { ActivityLog } from "@/types";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Stock Changes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-4">Loading stock history...</p>
        ) : stockLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent stock changes</p>
        ) : (
          <div className="space-y-4">
            {stockLogs.map((log) => (
              <div key={log.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <p className={`${getActionColor(log.changeAmount)} text-sm`}>
                      {log.changeAmount > 0 ? 'Increased' : 'Decreased'} by {Math.abs(log.changeAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">{log.reason}</p>
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
