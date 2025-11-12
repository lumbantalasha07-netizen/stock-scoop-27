import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, DailyRecordWithProduct } from "@/types/stock";
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

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<DailyRecordWithProduct[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchRecords(selectedDate);
  }, [selectedDate]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
  };

  const fetchRecords = async (date: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_records")
      .select("*, products(*)")
      .eq("date", date);

    if (error) {
      toast.error("Failed to fetch records");
      console.error(error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleAddRecord = async (record: any) => {
    const { error } = await supabase.from("daily_records").insert(record);

    if (error) {
      if (error.code === "23505") {
        toast.error("Record already exists for this product and date");
      } else {
        toast.error("Failed to add record");
      }
      console.error(error);
    } else {
      toast.success("Record added successfully");
      fetchRecords(selectedDate);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    const { error } = await supabase.from("daily_records").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete record");
      console.error(error);
    } else {
      toast.success("Record deleted successfully");
      fetchRecords(selectedDate);
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("products").insert(product);

    if (error) {
      toast.error("Failed to add product");
      console.error(error);
    } else {
      toast.success("Product added successfully");
      fetchProducts();
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from("products").update(updates).eq("id", id);

    if (error) {
      toast.error("Failed to update product");
      console.error(error);
    } else {
      toast.success("Product updated successfully");
      fetchProducts();
      fetchRecords(selectedDate);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } else {
      toast.success("Product deleted successfully");
      fetchProducts();
    }
  };

  const calculateDailySummary = () => {
    let totalSales = 0;
    let totalProfit = 0;
    let totalAdded = 0;

    records.forEach((record) => {
      totalSales += Number(record.amount_sold);
      totalProfit += Number(record.profit);
      totalAdded += record.added_stock;
    });

    return { totalSales, totalProfit, totalAdded };
  };

  const { totalSales, totalProfit, totalAdded } = calculateDailySummary();

  const exportToCSV = () => {
    const headers = ["Item Name", "Category", "Opening Stock", "Added Stock", "Total Stock", "Sold Stock", "Amount Sold", "Closing Stock", "Profit"];
    const rows = records.map(record => {
      const totalStock = record.opening_stock + record.added_stock;
      
      return [
        record.products.name,
        record.products.category,
        record.opening_stock,
        record.added_stock,
        totalStock,
        record.sold_stock,
        Number(record.amount_sold).toFixed(2),
        record.closing_stock,
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
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
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
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
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

        {/* Tabs */}
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="bg-card">
            <TabsTrigger value="daily">Daily Records</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
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
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <AddRecordDialog
                  products={products}
                  selectedDate={selectedDate}
                  onAdd={handleAddRecord}
                />
              </div>
            </div>

            {/* Profit Chart */}
            <ProfitChart records={records} />

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <DailyRecordTable records={records} onDelete={handleDeleteRecord} />
            )}
          </TabsContent>

          <TabsContent value="products">
            <ProductsManager
              products={products}
              onAdd={handleAddProduct}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
