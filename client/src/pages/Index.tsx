import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Product, DailyRecordWithProduct, InsertProduct, InsertDailyRecord } from "@shared/schema";
import { StatsCard } from "@/components/StatsCard";
import { DailyRecordTable } from "@/components/DailyRecordTable";
import { AddRecordDialog } from "@/components/AddRecordDialog";
import { ProductsManager } from "@/components/ProductsManager";
import { ProfitChart } from "@/components/ProfitChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Package, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { queryClient, apiRequest } from "@/lib/queryClient";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: records = [], isLoading } = useQuery<DailyRecordWithProduct[]>({
    queryKey: ["/api/daily-records", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/daily-records?date=${selectedDate}`);
      if (!res.ok) throw new Error("Failed to fetch records");
      return res.json();
    },
  });

  const addRecordMutation = useMutation({
    mutationFn: (record: InsertDailyRecord) =>
      apiRequest("/api/daily-records", "POST", record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-records"] });
      toast.success("Record added successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("409")) {
        toast.error("Record already exists for this product and date");
      } else {
        toast.error("Failed to add record");
      }
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/daily-records/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-records"] });
      toast.success("Record deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  const addProductMutation = useMutation({
    mutationFn: (product: InsertProduct) =>
      apiRequest("/api/products", "POST", product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast.success("Product added successfully");
    },
    onError: () => {
      toast.error("Failed to add product");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertProduct> }) =>
      apiRequest(`/api/products/${id}`, "PATCH", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-records"] });
      toast.success("Product updated successfully");
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/products/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const calculateDailySummary = () => {
    let totalSales = 0;
    let totalProfit = 0;
    let totalAdded = 0;
    let totalSoldItems = 0;

    records.forEach((record) => {
      totalSales += Number(record.amountSold);
      totalProfit += Number(record.profit);
      totalAdded += record.addedStock;
      totalSoldItems += record.soldStock;
    });

    return { totalSales, totalProfit, totalAdded, totalSoldItems };
  };

  const { totalSales, totalProfit, totalAdded, totalSoldItems } = calculateDailySummary();

  const exportToCSV = () => {
    const headers = ["Item Name", "Category", "Opening Stock", "Added Stock", "Total Stock", "Sold Stock", "Amount Sold", "Closing Stock", "Profit"];
    const rows = records.map(record => {
      const totalStock = record.openingStock + record.addedStock;
      
      return [
        record.product.name,
        record.product.category,
        record.openingStock,
        record.addedStock,
        totalStock,
        record.soldStock,
        Number(record.amountSold).toFixed(2),
        record.closingStock,
        Number(record.profit).toFixed(2)
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-stock-${selectedDate}.csv`;
    a.click();
    toast.success("Data exported successfully");
  };

  const profitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-heading" data-testid="text-dashboard-title">
                Daily Stock Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 font-body">Track your inventory and profits</p>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl">
              <Calendar className="h-5 w-5 text-primary" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto border-0 bg-transparent font-body"
                data-testid="input-date-selector"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground font-body uppercase tracking-wide">Total Sales</p>
                <p className="text-4xl font-bold text-foreground mt-3 font-mono" data-testid="text-total-sales">${totalSales.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2 font-body">{totalSoldItems} items sold</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground font-body uppercase tracking-wide">Total Profit</p>
                <p className="text-4xl font-bold text-success mt-3 font-mono" data-testid="text-total-profit">${totalProfit.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2 font-body">{profitMargin.toFixed(1)}% margin</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground font-body uppercase tracking-wide">Stock Added</p>
                <p className="text-4xl font-bold text-foreground mt-3 font-mono" data-testid="text-stock-added">{totalAdded}</p>
                <p className="text-sm text-muted-foreground mt-2 font-body">Units added today</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground font-body uppercase tracking-wide">Active Products</p>
                <p className="text-4xl font-bold text-foreground mt-3 font-mono" data-testid="text-active-products">{products.length}</p>
                <p className="text-sm text-muted-foreground mt-2 font-body">In catalog</p>
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="bg-card shadow-sm p-1 rounded-lg">
            <TabsTrigger value="daily" className="font-body" data-testid="tab-daily-records">Daily Records</TabsTrigger>
            <TabsTrigger value="products" className="font-body" data-testid="tab-products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground font-heading">
                Stock Records for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={records.length === 0}
                  className="font-body"
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <AddRecordDialog
                  products={products}
                  selectedDate={selectedDate}
                  onAdd={(record) => addRecordMutation.mutate(record)}
                />
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 font-heading">Profit by Product</h3>
              <ProfitChart records={records} />
            </div>

            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground font-body">Loading records...</div>
            ) : (
              <div className="bg-card rounded-xl shadow-card overflow-hidden border border-border">
                <DailyRecordTable 
                  records={records} 
                  onDelete={(id) => deleteRecordMutation.mutate(id)} 
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            <ProductsManager
              products={products}
              onAdd={(product) => addProductMutation.mutate(product)}
              onUpdate={(id, updates) => updateProductMutation.mutate({ id, updates })}
              onDelete={(id) => deleteProductMutation.mutate(id)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
