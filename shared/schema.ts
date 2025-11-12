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

const baseInsertProductSchema = createInsertSchema(products);
export const insertProductSchema = baseInsertProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const baseInsertDailyRecordSchema = createInsertSchema(dailyRecords);
export const insertDailyRecordSchema = baseInsertDailyRecordSchema
  .omit({
    id: true,
    closingStock: true,
    amountSold: true,
    profit: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    productId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type DailyRecord = typeof dailyRecords.$inferSelect;
export type InsertDailyRecord = z.infer<typeof insertDailyRecordSchema>;

export type DailyRecordWithProduct = DailyRecord & {
  product: Product;
};
