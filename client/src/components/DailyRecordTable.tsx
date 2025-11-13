import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DailyRecordWithProduct } from "@shared/schema";
import { Trash2, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyRecordTableProps {
  records: DailyRecordWithProduct[];
  onDelete: (id: string) => void;
}

export const DailyRecordTable = ({ records, onDelete }: DailyRecordTableProps) => {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-2 border-border">
            <TableHead className="font-semibold font-heading text-foreground py-4">Item Name</TableHead>
            <TableHead className="text-center font-semibold font-heading text-foreground py-4">Opening</TableHead>
            <TableHead className="text-center font-semibold font-heading text-foreground py-4">Added</TableHead>
            <TableHead className="text-center font-semibold font-heading text-foreground py-4">Total</TableHead>
            <TableHead className="text-center font-semibold font-heading text-foreground py-4">Sold</TableHead>
            <TableHead className="text-right font-semibold font-heading text-foreground py-4">Amount Sold</TableHead>
            <TableHead className="text-center font-semibold font-heading text-foreground py-4">Closing</TableHead>
            <TableHead className="text-right font-semibold font-heading text-foreground py-4">Profit</TableHead>
            <TableHead className="text-center font-semibold font-heading text-foreground py-4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={9} className="text-center text-muted-foreground py-16 font-body">
                <div className="flex flex-col items-center gap-3">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg">No records for this date</p>
                  <p className="text-sm">Add a new record to get started</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const totalStock = record.openingStock + record.addedStock;
              const isLowStock = record.closingStock < 10;
              const hasProfit = Number(record.profit) > 0;
              
              const profit = Number(record.profit);
              
              return (
                <TableRow 
                  key={record.id} 
                  className={`${isLowStock ? "bg-warning/10 border-l-2 border-warning" : ""} hover:bg-muted/20 transition-all duration-200`}
                  data-testid={`row-record-${record.id}`}
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-2">
                      {isLowStock && <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />}
                      <div>
                        <div className="text-foreground font-body font-medium">{record.product.name}</div>
                        <div className="text-xs text-muted-foreground font-body mt-0.5">{record.product.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground py-4">{record.openingStock}</TableCell>
                  <TableCell className="text-center font-mono text-foreground py-4">{record.addedStock}</TableCell>
                  <TableCell className="text-center font-mono text-foreground font-semibold py-4">{totalStock}</TableCell>
                  <TableCell className="text-center font-mono text-foreground py-4">{record.soldStock}</TableCell>
                  <TableCell className="text-right font-mono text-foreground font-semibold py-4">
                    ${Number(record.amountSold).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    {isLowStock ? (
                      <Badge variant="outline" className="font-mono font-semibold bg-warning/10 text-warning border-warning/30 rounded-lg">
                        {record.closingStock}
                      </Badge>
                    ) : (
                      <span className="font-mono font-semibold text-foreground">{record.closingStock}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className={`font-mono font-bold ${profit > 0 ? "text-positive" : profit < 0 ? "text-negative" : "text-muted-foreground"}`}>
                      {profit > 0 ? "+" : ""}${profit.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(record.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8"
                      data-testid={`button-delete-${record.id}`}
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
