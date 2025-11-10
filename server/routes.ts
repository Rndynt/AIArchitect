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

  // Stats endpoint for dashboard
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getSessionStats();
      
      // Calculate files modified from tool executions
      const allSessions = await storage.getAllSessions();
      let filesModifiedCount = 0;
      let totalDuration = 0;
      let sessionsWithMessages = 0;

      for (const session of allSessions) {
        try {
          const toolExecutions = await storage.getToolExecutions(session.id);
          const messages = await storage.getMessages(session.id);
          
          // Count unique files modified
          const filesSet = new Set<string>();
          if (Array.isArray(toolExecutions)) {
            for (const exec of toolExecutions) {
              if (exec.toolName === "write_file" || exec.toolName === "edit_file") {
                const input = exec.input as any;
                if (input?.file_path) {
                  filesSet.add(input.file_path);
                }
              }
            }
          }
          filesModifiedCount += filesSet.size;

          // Calculate session duration
          if (Array.isArray(messages)) {
            const firstTimestamp = messages[0]?.timestamp;
            const lastTimestamp = messages[messages.length - 1]?.timestamp;
            if (messages.length >= 2 && firstTimestamp && lastTimestamp) {
              const duration = lastTimestamp.getTime() - firstTimestamp.getTime();
              totalDuration += duration;
              sessionsWithMessages++;
            }
          }
        } catch (sessionError: any) {
          console.error(`[API] Error processing session ${session.id}:`, sessionError);
          // Continue with next session
        }
      }

      const avgDuration = sessionsWithMessages > 0 ? Math.floor(totalDuration / sessionsWithMessages / 1000) : 0;

      res.json({
        ...stats,
        filesModified: filesModifiedCount,
        avgDuration, // in seconds
      });
    } catch (error) {
      console.error("[API] Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
