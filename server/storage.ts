import type { Product, InsertProduct, DailyRecord, InsertDailyRecord, DailyRecordWithProduct } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  getDailyRecords(date?: string): Promise<DailyRecordWithProduct[]>;
  getDailyRecordById(id: string): Promise<DailyRecordWithProduct | null>;
  createDailyRecord(record: InsertDailyRecord): Promise<DailyRecord>;
  updateDailyRecord(id: string, updates: Partial<InsertDailyRecord>): Promise<DailyRecord>;
  deleteDailyRecord(id: string): Promise<void>;
  getPreviousClosingStock(productId: string, date: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product> = new Map();
  private dailyRecords: Map<string, DailyRecord> = new Map();
  private productIdCounter = 1;
  private recordIdCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    const sampleProducts: Array<Omit<Product, "id" | "createdAt" | "updatedAt">> = [
      { name: 'Coca-Cola', category: 'Drinks', costPrice: '0.80', sellingPrice: '1.50' },
      { name: 'Water', category: 'Drinks', costPrice: '0.30', sellingPrice: '0.80' },
      { name: 'Fanta', category: 'Drinks', costPrice: '0.80', sellingPrice: '1.50' },
      { name: 'Sprite', category: 'Drinks', costPrice: '0.80', sellingPrice: '1.50' },
      { name: 'Chicken', category: 'Meat & Protein', costPrice: '5.00', sellingPrice: '8.00' },
      { name: 'Fish', category: 'Meat & Protein', costPrice: '6.00', sellingPrice: '10.00' },
      { name: 'Pork', category: 'Meat & Protein', costPrice: '4.50', sellingPrice: '7.50' },
      { name: 'Sausage', category: 'Meat & Protein', costPrice: '3.00', sellingPrice: '5.00' },
      { name: 'Meatballs', category: 'Meat & Protein', costPrice: '3.50', sellingPrice: '6.00' },
      { name: 'Beans', category: 'Meat & Protein', costPrice: '1.00', sellingPrice: '2.50' },
      { name: 'Samosas', category: 'Snacks', costPrice: '0.50', sellingPrice: '1.20' },
      { name: 'Scones', category: 'Snacks', costPrice: '0.40', sellingPrice: '1.00' },
      { name: 'Fritters', category: 'Snacks', costPrice: '0.45', sellingPrice: '1.10' },
      { name: 'Crackers', category: 'Snacks', costPrice: '1.00', sellingPrice: '2.00' },
      { name: 'Two-Crunch', category: 'Snacks', costPrice: '0.60', sellingPrice: '1.50' },
      { name: "Lay's", category: 'Snacks', costPrice: '1.20', sellingPrice: '2.50' },
      { name: 'Popcorn', category: 'Snacks', costPrice: '0.80', sellingPrice: '2.00' },
    ];

    sampleProducts.forEach((p) => {
      const id = this.generateUUID();
      const now = new Date();
      this.products.set(id, {
        id,
        ...p,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private calculateRecordValues(
    record: InsertDailyRecord,
    product: Product
  ): { closingStock: number; amountSold: string; profit: string } {
    const closingStock = record.openingStock + record.addedStock - record.soldStock;
    const amountSold = (record.soldStock * parseFloat(product.sellingPrice)).toFixed(2);
    const profit = (record.soldStock * (parseFloat(product.sellingPrice) - parseFloat(product.costPrice))).toFixed(2);
    
    return { closingStock, amountSold, profit };
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.generateUUID();
    const now = new Date();
    const newProduct: Product = {
      id,
      ...product,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error("Product not found");
    }
    const updated: Product = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
    for (const [recordId, record] of this.dailyRecords.entries()) {
      if (record.productId === id) {
        this.dailyRecords.delete(recordId);
      }
    }
  }

  async getDailyRecords(date?: string): Promise<DailyRecordWithProduct[]> {
    const records = Array.from(this.dailyRecords.values());
    const filtered = date ? records.filter((r) => r.date === date) : records;
    
    return filtered.map((record) => {
      const product = this.products.get(record.productId);
      if (!product) {
        throw new Error(`Product not found for record ${record.id}`);
      }
      return {
        ...record,
        product,
      };
    });
  }

  async getDailyRecordById(id: string): Promise<DailyRecordWithProduct | null> {
    const record = this.dailyRecords.get(id);
    if (!record) return null;
    
    const product = this.products.get(record.productId);
    if (!product) {
      throw new Error(`Product not found for record ${id}`);
    }
    
    return {
      ...record,
      product,
    };
  }

  async createDailyRecord(record: InsertDailyRecord): Promise<DailyRecord> {
    const product = await this.getProductById(record.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existing = Array.from(this.dailyRecords.values()).find(
      (r) => r.productId === record.productId && r.date === record.date
    );
    if (existing) {
      throw new Error("Record already exists for this product and date");
    }

    const { closingStock, amountSold, profit } = this.calculateRecordValues(record, product);
    
    const id = this.generateUUID();
    const now = new Date();
    const newRecord: DailyRecord = {
      id,
      ...record,
      closingStock,
      amountSold,
      profit,
      createdAt: now,
      updatedAt: now,
    };
    
    this.dailyRecords.set(id, newRecord);
    return newRecord;
  }

  async updateDailyRecord(id: string, updates: Partial<InsertDailyRecord>): Promise<DailyRecord> {
    const record = this.dailyRecords.get(id);
    if (!record) {
      throw new Error("Record not found");
    }

    const productId = updates.productId || record.productId;
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const updatedInput: InsertDailyRecord = {
      productId,
      date: updates.date || record.date,
      openingStock: updates.openingStock !== undefined ? updates.openingStock : record.openingStock,
      addedStock: updates.addedStock !== undefined ? updates.addedStock : record.addedStock,
      soldStock: updates.soldStock !== undefined ? updates.soldStock : record.soldStock,
    };

    const { closingStock, amountSold, profit } = this.calculateRecordValues(updatedInput, product);

    const updated: DailyRecord = {
      ...record,
      ...updatedInput,
      closingStock,
      amountSold,
      profit,
      updatedAt: new Date(),
    };
    
    this.dailyRecords.set(id, updated);
    return updated;
  }

  async deleteDailyRecord(id: string): Promise<void> {
    this.dailyRecords.delete(id);
  }

  async getPreviousClosingStock(productId: string, date: string): Promise<number> {
    const records = Array.from(this.dailyRecords.values())
      .filter((r) => r.productId === productId && r.date < date)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    return records.length > 0 ? records[0].closingStock : 0;
  }
}
