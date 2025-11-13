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
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold font-heading text-foreground">Item Name</TableHead>
            <TableHead className="text-center font-bold font-heading text-foreground">Opening</TableHead>
            <TableHead className="text-center font-bold font-heading text-foreground">Added</TableHead>
            <TableHead className="text-center font-bold font-heading text-foreground">Total</TableHead>
            <TableHead className="text-center font-bold font-heading text-foreground">Sold</TableHead>
            <TableHead className="text-right font-bold font-heading text-foreground">Amount Sold</TableHead>
            <TableHead className="text-center font-bold font-heading text-foreground">Closing</TableHead>
            <TableHead className="text-right font-bold font-heading text-foreground">Profit</TableHead>
            <TableHead className="text-center font-bold font-heading text-foreground">Action</TableHead>
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
              
              return (
                <TableRow 
                  key={record.id} 
                  className={`${isLowStock ? "bg-warning/5 border-l-4 border-warning" : ""} hover:bg-muted/30 transition-colors`}
                  data-testid={`row-record-${record.id}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {isLowStock && <AlertTriangle className="h-4 w-4 text-warning" />}
                      <div>
                        <div className="text-foreground font-body font-medium">{record.product.name}</div>
                        <div className="text-sm text-muted-foreground font-body">{record.product.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground">{record.openingStock}</TableCell>
                  <TableCell className="text-center font-mono text-foreground font-medium">{record.addedStock}</TableCell>
                  <TableCell className="text-center font-mono text-foreground font-bold">{totalStock}</TableCell>
                  <TableCell className="text-center font-mono text-foreground font-medium">{record.soldStock}</TableCell>
                  <TableCell className="text-right font-mono text-foreground font-bold">
                    ${Number(record.amountSold).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {isLowStock ? (
                      <Badge variant="destructive" className="font-mono font-bold">
                        {record.closingStock}
                      </Badge>
                    ) : (
                      <span className="font-mono font-bold text-foreground">{record.closingStock}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-bold ${hasProfit ? "text-success" : "text-muted-foreground"}`}>
                      ${Number(record.profit).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(record.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
