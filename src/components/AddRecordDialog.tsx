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
import { Product } from "@/types/stock";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddRecordDialogProps {
  products: Product[];
  selectedDate: string;
  onAdd: (record: {
    product_id: string;
    date: string;
    opening_stock: number;
    added_stock: number;
    sold_stock: number;
  }) => void;
}

export const AddRecordDialog = ({ products, selectedDate, onAdd }: AddRecordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    opening_stock: 0,
    added_stock: 0,
    sold_stock: 0,
  });
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Fetch previous day's closing stock when product changes
  useEffect(() => {
    if (!formData.product_id || !open) return;

    const fetchPreviousClosing = async () => {
      setLoadingPrevious(true);
      setAutoFilled(false);

      try {
        // Get the date before selectedDate
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        const previousDate = currentDate.toISOString().split("T")[0];

        // Fetch yesterday's record for this product
        const { data, error } = await supabase
          .from("daily_records")
          .select("closing_stock")
          .eq("product_id", formData.product_id)
          .eq("date", previousDate)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData(prev => ({ ...prev, opening_stock: data.closing_stock }));
          setAutoFilled(true);
          toast.success(`Opening stock auto-filled from previous day: ${data.closing_stock}`);
        } else {
          setFormData(prev => ({ ...prev, opening_stock: 0 }));
        }
      } catch (error) {
        console.error("Error fetching previous closing:", error);
      } finally {
        setLoadingPrevious(false);
      }
    };

    fetchPreviousClosing();
  }, [formData.product_id, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) return;

    onAdd({
      ...formData,
      date: selectedDate,
    });
    
    setFormData({
      product_id: "",
      opening_stock: 0,
      added_stock: 0,
      sold_stock: 0,
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
              value={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
            >
              <SelectTrigger id="product">
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
                value={formData.opening_stock}
                onChange={(e) => {
                  setFormData({ ...formData, opening_stock: parseInt(e.target.value) || 0 });
                  setAutoFilled(false);
                }}
                disabled={loadingPrevious}
                className={autoFilled ? "border-success" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="added">Added Stock</Label>
              <Input
                id="added"
                type="number"
                min="0"
                value={formData.added_stock}
                onChange={(e) => setFormData({ ...formData, added_stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sold">Sold Stock</Label>
              <Input
                id="sold"
                type="number"
                min="0"
                value={formData.sold_stock}
                onChange={(e) => setFormData({ ...formData, sold_stock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {formData.product_id && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="font-semibold mb-1">Preview:</div>
              <div className="text-muted-foreground">
                Total Stock: {formData.opening_stock + formData.added_stock} |
                Closing Stock: {(formData.opening_stock + formData.added_stock) - formData.sold_stock}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.product_id}>
              Add Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
