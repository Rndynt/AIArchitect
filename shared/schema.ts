import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const codingSessions = pgTable("coding_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").notNull().default("active"),
  projectPath: text("project_path"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => codingSessions.id).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  tokens: integer("tokens"),
});

export const toolExecutions = pgTable("tool_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => codingSessions.id).notNull(),
  toolName: text("tool_name").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  duration: integer("duration"),
  success: boolean("success").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertCodingSessionSchema = createInsertSchema(codingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertToolExecutionSchema = createInsertSchema(toolExecutions).omit({
  id: true,
  timestamp: true,
});

export type InsertCodingSession = z.infer<typeof insertCodingSessionSchema>;
export type CodingSession = typeof codingSessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertToolExecution = z.infer<typeof insertToolExecutionSchema>;
export type ToolExecution = typeof toolExecutions.$inferSelect;
