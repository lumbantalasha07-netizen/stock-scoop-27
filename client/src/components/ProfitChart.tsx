import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyRecordWithProduct } from "@shared/schema";
import { BarChart3 } from "lucide-react";

interface ProfitChartProps {
  records: DailyRecordWithProduct[];
}

export const ProfitChart = ({ records }: ProfitChartProps) => {
  // Sort by profit descending
  const sortedRecords = [...records]
    .filter(r => Number(r.profit) > 0)
    .sort((a, b) => Number(b.profit) - Number(a.profit));

  const maxProfit = sortedRecords.length > 0 
    ? Number(sortedRecords[0].profit) 
    : 0;

  if (sortedRecords.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Profit by Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No profitable items for this date
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Profit by Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRecords.map((record) => {
            const profit = Number(record.profit);
            const percentage = (profit / maxProfit) * 100;
            
            return (
              <div key={record.id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground">
                    {record.product.name}
                  </span>
                  <span className="font-semibold text-success">
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
