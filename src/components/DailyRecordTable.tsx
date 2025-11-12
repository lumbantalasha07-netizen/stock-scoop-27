import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DailyRecordWithProduct, StockCalculations } from "@/types/stock";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyRecordTableProps {
  records: DailyRecordWithProduct[];
  onDelete: (id: string) => void;
}

export const DailyRecordTable = ({ records, onDelete }: DailyRecordTableProps) => {
  const calculateStats = (record: DailyRecordWithProduct): StockCalculations => {
    const total_stock = record.opening_stock + record.added_stock;
    const closing_stock = total_stock - record.sold_stock;
    const amount_sold = record.sold_stock * record.products.selling_price;
    const profit = record.sold_stock * (record.products.selling_price - record.products.cost_price);
    
    return { total_stock, closing_stock, amount_sold, profit };
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary">
            <TableHead className="font-semibold">Item Name</TableHead>
            <TableHead className="text-center font-semibold">Opening</TableHead>
            <TableHead className="text-center font-semibold">Added</TableHead>
            <TableHead className="text-center font-semibold">Total</TableHead>
            <TableHead className="text-center font-semibold">Sold</TableHead>
            <TableHead className="text-right font-semibold">Amount Sold</TableHead>
            <TableHead className="text-center font-semibold">Closing</TableHead>
            <TableHead className="text-right font-semibold">Profit</TableHead>
            <TableHead className="text-center font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No records for this date. Add a new record to get started.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const stats = calculateStats(record);
              const isLowStock = stats.closing_stock < 10;
              
              return (
                <TableRow key={record.id} className={isLowStock ? "bg-warning/10" : ""}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-foreground">{record.products.name}</div>
                      <div className="text-xs text-muted-foreground">{record.products.category}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{record.opening_stock}</TableCell>
                  <TableCell className="text-center">{record.added_stock}</TableCell>
                  <TableCell className="text-center font-semibold">{stats.total_stock}</TableCell>
                  <TableCell className="text-center">{record.sold_stock}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${stats.amount_sold.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {isLowStock ? (
                      <Badge variant="destructive">{stats.closing_stock}</Badge>
                    ) : (
                      <span className="font-semibold">{stats.closing_stock}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={stats.profit > 0 ? "text-success font-semibold" : ""}>
                      ${stats.profit.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(record.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
