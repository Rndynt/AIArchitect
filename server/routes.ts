import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCodingSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session routes
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertCodingSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const messages = await storage.getMessages(req.params.id);
      const toolExecutions = await storage.getToolExecutions(req.params.id);
      
      res.json({
        session,
        messages,
        toolExecutions,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
