import { useState } from "react";
import type { Product, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ProductFormState = z.input<typeof insertProductSchema>;

interface ProductsManagerProps {
  products: Product[];
  onAdd: (product: InsertProduct) => void;
  onUpdate: (id: string, product: Partial<InsertProduct>) => void;
  onDelete: (id: string) => void;
}

export const ProductsManager = ({ products, onAdd, onUpdate, onDelete }: ProductsManagerProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = insertProductSchema.parse(formData);
    onAdd(parsed);
    setFormData({ name: "", category: "", costPrice: "", sellingPrice: "" });
    setAddOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const parsed = insertProductSchema.parse(formData);
      onUpdate(editingProduct.id, parsed);
      setEditOpen(false);
      setEditingProduct(null);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
    });
    setEditOpen(true);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Products Catalog</h2>
          <p className="text-muted-foreground font-body mt-1">
            Manage your product inventory and pricing
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="default" className="font-body" data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Add New Product</DialogTitle>
              <DialogDescription className="font-body">
                Enter the details for the new product in your catalog.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body font-medium">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Coca-Cola"
                  className="font-body"
                  required
                  data-testid="input-product-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="font-body font-medium">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Drinks, Snacks, Meat & Protein"
                  className="font-body"
                  required
                  data-testid="input-product-category"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost" className="font-body font-medium">Cost Price ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="0.00"
                    className="font-mono"
                    required
                    data-testid="input-cost-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling" className="font-body font-medium">Selling Price ($)</Label>
                  <Input
                    id="selling"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    className="font-mono"
                    required
                    data-testid="input-selling-price"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="font-body">
                  Cancel
                </Button>
                <Button type="submit" className="font-body" data-testid="button-submit-product">Add Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="font-body">
              {category}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full bg-card rounded-xl shadow-card p-12 text-center border border-border">
            <Package2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground font-heading mb-2">No products yet</h3>
            <p className="text-muted-foreground font-body mb-6">
              Add your first product to start tracking inventory
            </p>
            <Button onClick={() => setAddOpen(true)} className="font-body">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          products.map((product) => {
            const costPrice = parseFloat(product.costPrice);
            const sellingPrice = parseFloat(product.sellingPrice);
            const profit = sellingPrice - costPrice;
            const margin = ((profit / costPrice) * 100).toFixed(1);

            return (
              <div
                key={product.id}
                className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all p-6 border border-border"
                data-testid={`card-product-${product.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground font-heading mb-1">
                      {product.name}
                    </h3>
                    <Badge variant="secondary" className="font-body text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(product)}
                      className="h-8 w-8 hover:bg-primary/10"
                      data-testid={`button-edit-${product.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-body">Cost</span>
                    <span className="text-lg font-mono font-bold text-foreground">
                      ${costPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-body">Selling</span>
                    <span className="text-lg font-mono font-bold text-primary">
                      ${sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground font-body">Profit Margin</span>
                      <span className="text-lg font-mono font-bold text-success">
                        {margin}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Edit Product</DialogTitle>
            <DialogDescription className="font-body">
              Update the product details and pricing information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-body font-medium">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="font-body"
                required
                data-testid="input-edit-product-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="font-body font-medium">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="font-body"
                required
                data-testid="input-edit-category"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cost" className="font-body font-medium">Cost Price ($)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="font-mono"
                  required
                  data-testid="input-edit-cost-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-selling" className="font-body font-medium">Selling Price ($)</Label>
                <Input
                  id="edit-selling"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="font-mono"
                  required
                  data-testid="input-edit-selling-price"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="font-body">
                Cancel
              </Button>
              <Button type="submit" className="font-body" data-testid="button-update-product">Update Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
