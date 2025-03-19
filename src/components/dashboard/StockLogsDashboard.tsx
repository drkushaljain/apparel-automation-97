
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { ActivityLog } from "@/types";

const StockLogsDashboard = () => {
  const { state } = useAppContext();
  const [stockLogs, setStockLogs] = useState<ActivityLog[]>([]);
  
  useEffect(() => {
    // Load stock-related activity logs
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]')
      .filter((log: ActivityLog) => 
        log.entityType === 'product' && 
        (log.action === 'stock_increased' || log.action === 'stock_decreased')
      )
      .sort((a: ActivityLog, b: ActivityLog) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
    
    // Match with product names
    const logsWithProductNames = logs.map((log: ActivityLog) => {
      const product = state.products.find(p => p.id === log.entityId);
      return {
        ...log,
        productName: product ? product.name : 'Unknown Product'
      };
    });
    
    setStockLogs(logsWithProductNames);
  }, [state.products]);
  
  const getActionColor = (action: string) => {
    return action === 'stock_increased' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Stock Changes</CardTitle>
      </CardHeader>
      <CardContent>
        {stockLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent stock changes</p>
        ) : (
          <div className="space-y-4">
            {stockLogs.map((log: any) => (
              <div key={log.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.productName}</p>
                    <p className={`${getActionColor(log.action)} text-sm`}>
                      {log.action === 'stock_increased' ? 'Increased' : 'Decreased'}
                    </p>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
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
