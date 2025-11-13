import { pgTable, uuid, text, decimal, integer, date, timestamp } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyRecords = pgTable("daily_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  openingStock: integer("opening_stock").notNull().default(0),
  addedStock: integer("added_stock").notNull().default(0),
  soldStock: integer("sold_stock").notNull().default(0),
  closingStock: integer("closing_stock").notNull(),
  amountSold: decimal("amount_sold", { precision: 10, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ many }) => ({
  dailyRecords: many(dailyRecords),
}));

export const dailyRecordsRelations = relations(dailyRecords, ({ one }) => ({
  product: one(products, {
    fields: [dailyRecords.productId],
    references: [products.id],
  }),
}));

export const insertProductSchema = createInsertSchema(products, {
  name: (schema) => schema.min(1),
  category: (schema) => schema.min(1),
  costPrice: (schema) => schema.refine((val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
    message: "Cost price must be a positive decimal number"
  }),
  sellingPrice: (schema) => schema.refine((val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0, {
    message: "Selling price must be a positive decimal number"
  }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyRecordSchema = createInsertSchema(dailyRecords, {
  productId: (schema) => schema,
  date: (schema) => schema.regex(/^\d{4}-\d{2}-\d{2}$/),
  openingStock: (schema) => schema.refine((val) => /^\d+$/.test(val) && parseInt(val) >= 0, {
    message: "Opening stock must be a non-negative integer"
  }),
  addedStock: (schema) => schema.refine((val) => /^\d+$/.test(val) && parseInt(val) >= 0, {
    message: "Added stock must be a non-negative integer"
  }),
  soldStock: (schema) => schema.refine((val) => /^\d+$/.test(val) && parseInt(val) >= 0, {
    message: "Sold stock must be a non-negative integer"
  }),
}).omit({
  id: true,
  closingStock: true,
  amountSold: true,
  profit: true,
  createdAt: true,
  updatedAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type DailyRecord = typeof dailyRecords.$inferSelect;
export type InsertDailyRecord = z.infer<typeof insertDailyRecordSchema>;

export type DailyRecordWithProduct = DailyRecord & {
  product: Product;
};
