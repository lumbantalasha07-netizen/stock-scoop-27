import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Product, DailyRecordWithProduct, InsertProduct, InsertDailyRecord } from "@shared/schema";
import { DailyRecordTable } from "@/components/DailyRecordTable";
import { AddRecordDialog } from "@/components/AddRecordDialog";
import { ProductsManager } from "@/components/ProductsManager";
import { ProfitChart } from "@/components/ProfitChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, ShoppingBag, Calendar, Download, FileSpreadsheet, Printer, Plus, BarChart3, PieChart } from "lucide-react";
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
    let totalSoldItems = 0;

    records.forEach((record) => {
      totalSales += Number(record.amountSold);
      totalProfit += Number(record.profit);
      totalSoldItems += record.soldStock;
    });

    return { totalSales, totalProfit, totalSoldItems };
  };

  const { totalSales, totalProfit, totalSoldItems } = calculateDailySummary();

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

    const blob = new Blob([csv], { type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-stock-${selectedDate}.csv`;
    a.click();
    toast.success("Exported to CSV");
  };

  const exportToExcel = () => {
    toast.info("Excel export coming soon");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const profitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading tracking-tight" data-testid="text-dashboard-title">
                Stock Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-body">Manage inventory with ease</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded-2xl border border-border/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto border-0 bg-transparent font-body text-sm h-7 focus-visible:ring-0"
                data-testid="input-date-selector"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Sales Card */}
          <div className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-border/50 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground font-body uppercase tracking-wider">Total Sales</p>
                <p className="text-3xl font-bold text-foreground mt-2 font-mono" data-testid="text-total-sales">
                  ${totalSales.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-body">{totalSoldItems} items sold</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Total Profit Card */}
          <div className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-border/50 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground font-body uppercase tracking-wider">Total Profit</p>
                <p className={`text-3xl font-bold mt-2 font-mono ${totalProfit >= 0 ? 'text-positive' : 'text-negative'}`} data-testid="text-total-profit">
                  ${totalProfit.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-body">{profitMargin.toFixed(1)}% margin</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${totalProfit >= 0 ? 'bg-positive/10' : 'bg-negative/10'}`}>
                <TrendingUp className={`h-6 w-6 ${totalProfit >= 0 ? 'text-positive' : 'text-negative'}`} />
              </div>
            </div>
          </div>

          {/* Total Stock Sold Card */}
          <div className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-border/50 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground font-body uppercase tracking-wider">Stock Sold</p>
                <p className="text-3xl font-bold text-foreground mt-2 font-mono" data-testid="text-stock-sold">
                  {totalSoldItems}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-body">Units moved today</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="bg-muted/30 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="daily" className="rounded-lg font-body data-[state=active]:bg-card data-[state=active]:shadow-sm" data-testid="tab-daily-records">
              <BarChart3 className="h-4 w-4 mr-2" />
              Daily Records
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg font-body data-[state=active]:bg-card data-[state=active]:shadow-sm" data-testid="tab-products">
              <PieChart className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 font-heading">Profit by Product</h3>
                <ProfitChart records={records} />
              </div>
              
              <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 font-heading">Stock Overview</h3>
                <div className="h-64 flex items-center justify-center text-muted-foreground font-body">
                  <p>Pie chart coming soon</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 rounded-2xl p-4 border border-border/50">
              <h2 className="text-xl font-semibold text-foreground font-heading">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={records.length === 0}
                  className="rounded-xl font-body"
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  disabled={records.length === 0}
                  className="rounded-xl font-body"
                  data-testid="button-export-excel"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={records.length === 0}
                  className="rounded-xl font-body"
                  data-testid="button-print"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {/* Records Table */}
            {isLoading ? (
              <div className="bg-card rounded-2xl shadow-card p-12 text-center border border-border/50">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="text-muted-foreground mt-4 font-body">Loading records...</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
                <DailyRecordTable 
                  records={records} 
                  onDelete={(id) => deleteRecordMutation.mutate(id)} 
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsManager
              products={products}
              onAdd={(product) => addProductMutation.mutate(product)}
              onUpdate={(id, updates) => updateProductMutation.mutate({ id, updates })}
              onDelete={(id) => deleteProductMutation.mutate(id)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddRecordDialog
          products={products}
          selectedDate={selectedDate}
          onAdd={(record) => addRecordMutation.mutate(record)}
        />
      </div>
    </div>
  );
};

export default Index;
