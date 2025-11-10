import { type CodingSession, type InsertCodingSession, type Message, type InsertMessage, type ToolExecution, type InsertToolExecution, codingSessions, messages, toolExecutions } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc, count } from "drizzle-orm";
import type { Database } from "./db";

export interface IStorage {
  // Session operations
  getSession(id: string): Promise<CodingSession | undefined>;
  getAllSessions(): Promise<CodingSession[]>;
  createSession(session: InsertCodingSession): Promise<CodingSession>;
  updateSession(id: string, session: Partial<InsertCodingSession>): Promise<CodingSession | undefined>;

  // Message operations
  addMessage(message: InsertMessage): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;

  // Tool execution operations
  logToolExecution(execution: InsertToolExecution): Promise<ToolExecution>;
  getToolExecutions(sessionId: string): Promise<ToolExecution[]>;
  
  // Statistics
  getSessionStats(): Promise<{
    totalSessions: number;
    totalMessages: number;
    totalToolExecutions: number;
  }>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, CodingSession>;
  private messages: Map<string, Message>;
  private toolExecutions: Map<string, ToolExecution>;

  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.toolExecutions = new Map();
  }

  // Session operations
  async getSession(id: string): Promise<CodingSession | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<CodingSession[]> {
    return Array.from(this.sessions.values());
  }

  async createSession(insertSession: InsertCodingSession): Promise<CodingSession> {
    const id = randomUUID();
    const session: CodingSession = {
      id,
      userId: insertSession.userId || null,
      createdAt: new Date(),
      status: insertSession.status || "active",
      projectPath: insertSession.projectPath || null,
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<InsertCodingSession>): Promise<CodingSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Message operations
  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      sessionId: insertMessage.sessionId,
      role: insertMessage.role,
      content: insertMessage.content,
      timestamp: new Date(),
      tokens: insertMessage.tokens || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  // Tool execution operations
  async logToolExecution(insertExecution: InsertToolExecution): Promise<ToolExecution> {
    const id = randomUUID();
    const execution: ToolExecution = {
      id,
      sessionId: insertExecution.sessionId,
      toolName: insertExecution.toolName,
      input: insertExecution.input || null,
      output: insertExecution.output || null,
      duration: insertExecution.duration || null,
      success: insertExecution.success,
      timestamp: new Date(),
    };
    this.toolExecutions.set(id, execution);
    return execution;
  }

  async getToolExecutions(sessionId: string): Promise<ToolExecution[]> {
    return Array.from(this.toolExecutions.values())
      .filter(exec => exec.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async getSessionStats() {
    return {
      totalSessions: this.sessions.size,
      totalMessages: this.messages.size,
      totalToolExecutions: this.toolExecutions.size,
    };
  }
}

export class DatabaseStorage implements IStorage {
  private dbPromise: Promise<Database>;

  constructor() {
    this.dbPromise = import("./db")
      .then(module => module.db)
      .catch(error => {
        console.error('[DatabaseStorage] Failed to load database module:', error);
        throw error;
      });
  }

  private async getDb(): Promise<Database> {
    return await this.dbPromise;
  }

  async getSession(id: string): Promise<CodingSession | undefined> {
    try {
      const db = await this.getDb();
      const result = await db.select().from(codingSessions).where(eq(codingSessions.id, id));
      return result[0];
    } catch (error: any) {
      console.error('[DatabaseStorage] Error getting session:', error);
      throw error;
    }
  }

  async getAllSessions(): Promise<CodingSession[]> {
    try {
      const db = await this.getDb();
      return await db.select().from(codingSessions).orderBy(desc(codingSessions.createdAt));
    } catch (error: any) {
      console.error('[DatabaseStorage] Error getting all sessions:', error);
      throw error;
    }
  }

  async createSession(insertSession: InsertCodingSession): Promise<CodingSession> {
    try {
      const db = await this.getDb();
      const result = await db.insert(codingSessions).values(insertSession).returning();
      return result[0];
    } catch (error: any) {
      console.error('[DatabaseStorage] Error creating session:', error);
      throw error;
    }
  }

  async updateSession(id: string, updates: Partial<InsertCodingSession>): Promise<CodingSession | undefined> {
    try {
      const db = await this.getDb();
      const result = await db.update(codingSessions)
        .set(updates)
        .where(eq(codingSessions.id, id))
        .returning();
      return result[0];
    } catch (error: any) {
      console.error('[DatabaseStorage] Error updating session:', error);
      throw error;
    }
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const db = await this.getDb();
      const result = await db.insert(messages).values(insertMessage).returning();
      return result[0];
    } catch (error: any) {
      console.error('[DatabaseStorage] Error adding message:', error);
      throw error;
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const db = await this.getDb();
      return await db.select().from(messages)
        .where(eq(messages.sessionId, sessionId))
        .orderBy(messages.timestamp);
    } catch (error: any) {
      console.error('[DatabaseStorage] Error getting messages:', error);
      throw error;
    }
  }

  async logToolExecution(insertExecution: InsertToolExecution): Promise<ToolExecution> {
    try {
      const db = await this.getDb();
      const result = await db.insert(toolExecutions).values(insertExecution).returning();
      return result[0];
    } catch (error: any) {
      console.error('[DatabaseStorage] Error logging tool execution:', error);
      throw error;
    }
  }

  async getToolExecutions(sessionId: string): Promise<ToolExecution[]> {
    try {
      const db = await this.getDb();
      return await db.select().from(toolExecutions)
        .where(eq(toolExecutions.sessionId, sessionId))
        .orderBy(toolExecutions.timestamp);
    } catch (error: any) {
      console.error('[DatabaseStorage] Error getting tool executions:', error);
      throw error;
    }
  }

  async getSessionStats() {
    try {
      const db = await this.getDb();
      const [sessionCountResult, messageCountResult, toolExecutionCountResult] = await Promise.all([
        db.select({ value: count() }).from(codingSessions),
        db.select({ value: count() }).from(messages),
        db.select({ value: count() }).from(toolExecutions),
      ]);

      return {
        totalSessions: Number(sessionCountResult[0]?.value || 0),
        totalMessages: Number(messageCountResult[0]?.value || 0),
        totalToolExecutions: Number(toolExecutionCountResult[0]?.value || 0),
      };
    } catch (error: any) {
      console.error('[DatabaseStorage] Error getting session stats:', error);
      throw error;
    }
  }
}

function createStorage(): IStorage {
  const useDatabase = process.env.USE_DATABASE !== 'false';
  
  if (useDatabase) {
    console.log('[Storage] Using DatabaseStorage (PostgreSQL)');
    return new DatabaseStorage();
  } else {
    console.log('[Storage] Using MemStorage (in-memory)');
    return new MemStorage();
  }
}

export const storage = createStorage();
