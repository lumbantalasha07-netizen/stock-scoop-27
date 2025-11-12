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

    records.forEach((record) => {
      totalSales += Number(record.amountSold);
      totalProfit += Number(record.profit);
      totalAdded += record.addedStock;
    });

    return { totalSales, totalProfit, totalAdded };
  };

  const { totalSales, totalProfit, totalAdded } = calculateDailySummary();

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Restaurant Daily Stock Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Track your inventory and profits</p>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
                data-testid="input-date-selector"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Sales"
            value={`$${totalSales.toFixed(2)}`}
            icon={DollarSign}
            trend={`${records.length} items sold`}
          />
          <StatsCard
            title="Total Profit"
            value={`$${totalProfit.toFixed(2)}`}
            icon={TrendingUp}
            trend={`${((totalProfit / totalSales) * 100 || 0).toFixed(1)}% margin`}
          />
          <StatsCard
            title="Total Stock Added"
            value={totalAdded.toString()}
            icon={Package}
            trend="Units added today"
          />
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="bg-card">
            <TabsTrigger value="daily" data-testid="tab-daily-records">Daily Records</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Stock Records for {new Date(selectedDate).toLocaleDateString()}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={records.length === 0}
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

            <ProfitChart records={records} />

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <DailyRecordTable 
                records={records} 
                onDelete={(id) => deleteRecordMutation.mutate(id)} 
              />
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
