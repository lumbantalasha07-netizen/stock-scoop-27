export interface Product {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  created_at: string;
  updated_at: string;
}

export interface DailyRecord {
  id: string;
  product_id: string;
  date: string;
  opening_stock: number;
  added_stock: number;
  sold_stock: number;
  created_at: string;
  updated_at: string;
}

export interface DailyRecordWithProduct extends DailyRecord {
  products: Product;
}

export interface StockCalculations {
  total_stock: number;
  closing_stock: number;
  amount_sold: number;
  profit: number;
}
