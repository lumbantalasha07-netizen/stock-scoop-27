import type { Express } from "express";
import { z } from "zod";
import { insertProductSchema, insertDailyRecordSchema } from "@shared/schema";
import type { IStorage } from "./storage";

export function registerRoutes(app: Express, storage: IStorage) {
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const created = await storage.createProduct(product);
      res.status(201).json(created);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(req.params.id, updates);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error.message === "Product not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/daily-records", async (req, res) => {
    try {
      const date = req.query.date as string | undefined;
      const records = await storage.getDailyRecords(date);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/daily-records", async (req, res) => {
    try {
      const record = insertDailyRecordSchema.parse(req.body);
      const created = await storage.createDailyRecord(record);
      res.status(201).json(created);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error.message === "Record already exists for this product and date") {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.patch("/api/daily-records/:id", async (req, res) => {
    try {
      const updates = insertDailyRecordSchema.partial().parse(req.body);
      const updated = await storage.updateDailyRecord(req.params.id, updates);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error.message === "Record not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete("/api/daily-records/:id", async (req, res) => {
    try {
      await storage.deleteDailyRecord(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/daily-records/previous-stock/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const date = req.query.date as string;
      if (!date) {
        res.status(400).json({ error: "Date parameter is required" });
        return;
      }
      const stock = await storage.getPreviousClosingStock(productId, date);
      res.json({ closingStock: stock });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
