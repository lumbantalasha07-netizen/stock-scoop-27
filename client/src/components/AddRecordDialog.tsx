import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, InsertDailyRecord } from "@shared/schema";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddRecordDialogProps {
  products: Product[];
  selectedDate: string;
  onAdd: (record: InsertDailyRecord) => void;
}

export const AddRecordDialog = ({ products, selectedDate, onAdd }: AddRecordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    openingStock: 0,
    addedStock: 0,
    soldStock: 0,
  });
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    if (!formData.productId || !open) return;

    const fetchPreviousClosing = async () => {
      setLoadingPrevious(true);
      setAutoFilled(false);

      try {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        const previousDate = currentDate.toISOString().split("T")[0];

        const res = await fetch(`/api/daily-records/previous-stock/${formData.productId}?date=${selectedDate}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const { closingStock } = await res.json();
        
        if (closingStock > 0) {
          setFormData(prev => ({ ...prev, openingStock: closingStock }));
          setAutoFilled(true);
          toast.success(`Opening stock auto-filled from previous day: ${closingStock}`);
        } else {
          setFormData(prev => ({ ...prev, openingStock: 0 }));
        }
      } catch (error) {
        console.error("Error fetching previous closing:", error);
      } finally {
        setLoadingPrevious(false);
      }
    };

    fetchPreviousClosing();
  }, [formData.productId, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return;

    onAdd({
      productId: formData.productId,
      date: selectedDate,
      openingStock: formData.openingStock,
      addedStock: formData.addedStock,
      soldStock: formData.soldStock,
    });
    
    setFormData({
      productId: "",
      openingStock: 0,
      addedStock: 0,
      soldStock: 0,
    });
    setAutoFilled(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Daily Stock Record</DialogTitle>
          <DialogDescription>
            Opening stock will be auto-filled from yesterday's closing stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => setFormData({ ...formData, productId: value })}
            >
              <SelectTrigger id="product" data-testid="select-product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening" className="flex items-center gap-2">
                Opening Stock
                {autoFilled && (
                  <span className="text-xs text-success">(auto)</span>
                )}
              </Label>
              <Input
                id="opening"
                type="number"
                min="0"
                value={formData.openingStock}
                onChange={(e) => {
                  setFormData({ ...formData, openingStock: parseInt(e.target.value) || 0 });
                  setAutoFilled(false);
                }}
                disabled={loadingPrevious}
                className={autoFilled ? "border-success" : ""}
                data-testid="input-opening-stock"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="added">Added Stock</Label>
              <Input
                id="added"
                type="number"
                min="0"
                value={formData.addedStock}
                onChange={(e) => setFormData({ ...formData, addedStock: parseInt(e.target.value) || 0 })}
                data-testid="input-added-stock"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sold">Sold Stock</Label>
              <Input
                id="sold"
                type="number"
                min="0"
                value={formData.soldStock}
                onChange={(e) => setFormData({ ...formData, soldStock: parseInt(e.target.value) || 0 })}
                data-testid="input-sold-stock"
              />
            </div>
          </div>

          {formData.productId && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="font-semibold mb-1">Preview:</div>
              <div className="text-muted-foreground">
                Total Stock: {formData.openingStock + formData.addedStock} |
                Closing Stock: {(formData.openingStock + formData.addedStock) - formData.soldStock}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.productId} data-testid="button-submit-record">
              Add Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
