import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertToolSchema } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/genai";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Agent routes
  app.get("/api/agents", async (_req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ error: "Invalid agent data" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.updateAgent(req.params.id, req.body);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(400).json({ error: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const success = await storage.deleteAgent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // Tool routes
  app.get("/api/tools", async (_req, res) => {
    try {
      const tools = await storage.getAllTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tool" });
    }
  });

  app.post("/api/tools", async (req, res) => {
    try {
      const validatedData = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(validatedData);
      res.status(201).json(tool);
    } catch (error) {
      res.status(400).json({ error: "Invalid tool data" });
    }
  });

  app.patch("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.updateTool(req.params.id, req.body);
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(400).json({ error: "Failed to update tool" });
    }
  });

  app.delete("/api/tools/:id", async (req, res) => {
    try {
      const success = await storage.deleteTool(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tool" });
    }
  });

  // Chat endpoint - handles messages to agents
  app.post("/api/chat", async (req, res) => {
    try {
      const { agentId, message, conversationId } = req.body;

      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Get or create conversation
      let conversation = conversationId
        ? await storage.getConversation(conversationId)
        : await storage.createConversation(agentId);

      if (!conversation) {
        conversation = await storage.createConversation(agentId);
      }

      const messages = [...(conversation.messages as any[]), { role: "user", content: message }];

      // Call the appropriate LLM based on provider
      let response: string;
      let toolCalls: any[] = [];

      if (agent.provider === "openai") {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: agent.model,
          messages: [
            { role: "system", content: agent.systemPrompt },
            ...messages,
          ],
          temperature: parseFloat(agent.temperature || "0.7"),
        });
        response = completion.choices[0].message.content || "";
      } else if (agent.provider === "anthropic") {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const completion = await anthropic.messages.create({
          model: agent.model,
          max_tokens: 1024,
          system: agent.systemPrompt,
          messages: messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          temperature: parseFloat(agent.temperature || "0.7"),
        });
        response = completion.content[0].type === "text" ? completion.content[0].text : "";
      } else if (agent.provider === "google") {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: agent.model });
        const chat = model.startChat({
          history: messages.slice(0, -1).map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        });
        const result = await chat.sendMessage(message);
        response = result.response.text();
      } else {
        return res.status(400).json({ error: "Unsupported provider" });
      }

      // Update conversation with new messages
      const updatedMessages = [
        ...messages,
        { role: "assistant", content: response },
      ];

      await storage.updateConversation(
        conversation.id,
        updatedMessages,
        String(updatedMessages.length * 100) // Simple token estimation
      );

      res.json({
        response,
        conversationId: conversation.id,
        toolCalls,
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Conversation routes
  app.get("/api/conversations/:agentId", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByAgent(req.params.agentId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const success = await storage.deleteConversation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
