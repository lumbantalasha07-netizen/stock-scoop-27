import { useState } from "react";
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
            Enter the stock information for the selected product and date.
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
              <Label htmlFor="opening">Opening Stock</Label>
              <Input
                id="opening"
                type="number"
                min="0"
                value={formData.opening_stock}
                onChange={(e) => setFormData({ ...formData, opening_stock: parseInt(e.target.value) || 0 })}
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
