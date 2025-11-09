import { type CodingSession, type InsertCodingSession, type Message, type InsertMessage, type ToolExecution, type InsertToolExecution } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export const storage = new MemStorage();
