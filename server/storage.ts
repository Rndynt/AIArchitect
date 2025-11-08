import { type Agent, type InsertAgent, type Tool, type InsertTool, type Conversation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Agent operations
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Tool operations
  getTool(id: string): Promise<Tool | undefined>;
  getAllTools(): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: string): Promise<boolean>;

  // Conversation operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByAgent(agentId: string): Promise<Conversation[]>;
  createConversation(agentId: string): Promise<Conversation>;
  updateConversation(id: string, messages: any[], tokenCount: string): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private agents: Map<string, Agent>;
  private tools: Map<string, Tool>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.agents = new Map();
    this.tools = new Map();
    this.conversations = new Map();
  }

  // Agent operations
  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = {
      id,
      name: insertAgent.name,
      description: insertAgent.description || null,
      systemPrompt: insertAgent.systemPrompt,
      provider: insertAgent.provider,
      model: insertAgent.model,
      temperature: insertAgent.temperature || null,
      tools: insertAgent.tools || [],
      createdAt: new Date(),
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;

    const updatedAgent = { ...agent, ...updates };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  // Tool operations
  async getTool(id: string): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async getAllTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = randomUUID();
    const tool: Tool = {
      id,
      name: insertTool.name,
      description: insertTool.description,
      parameters: insertTool.parameters || {},
      implementation: insertTool.implementation || null,
      createdAt: new Date(),
    };
    this.tools.set(id, tool);
    return tool;
  }

  async updateTool(id: string, updates: Partial<InsertTool>): Promise<Tool | undefined> {
    const tool = this.tools.get(id);
    if (!tool) return undefined;

    const updatedTool = { ...tool, ...updates };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }

  async deleteTool(id: string): Promise<boolean> {
    return this.tools.delete(id);
  }

  // Conversation operations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByAgent(agentId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conv) => conv.agentId === agentId
    );
  }

  async createConversation(agentId: string): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      id,
      agentId,
      messages: [],
      tokenCount: "0",
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(
    id: string,
    messages: any[],
    tokenCount: string
  ): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const updated = { ...conversation, messages, tokenCount };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }
}

export const storage = new MemStorage();
