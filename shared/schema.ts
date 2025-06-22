import {
  sqliteTable,
  text,
  integer,
  blob,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey(),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  checkedAt: integer("checked_at", { mode: "number" }),
  completedAt: integer("completed_at", { mode: "number" }),
  createdAt: integer("created_at", { mode: "number" }).notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,  
  createdAt: true,
}).partial();

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
