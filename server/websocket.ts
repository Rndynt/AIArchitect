import { WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";
import { CodingAgent } from "./ai/agent";
import { storage } from "./storage";

export function setupWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WebSocket] Client connected");
    let agent: CodingAgent | null = null;
    let currentSessionId: string | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`[WebSocket] Received message type: ${message.type}`);

        if (message.type === "start_session") {
          const session = await storage.createSession({
            userId: message.userId || null,
            status: "active",
            projectPath: message.projectPath || null
          });

          currentSessionId = session.id;
          agent = new CodingAgent(session.id);

          ws.send(JSON.stringify({
            type: "session_started",
            sessionId: session.id
          }));

          console.log(`[WebSocket] Session started: ${session.id}`);
        } else if (message.type === "resume_session") {
          if (!message.sessionId) {
            ws.send(JSON.stringify({
              type: "error",
              error: "Session ID required"
            }));
            return;
          }

          const session = await storage.getSession(message.sessionId);
          if (!session) {
            ws.send(JSON.stringify({
              type: "error",
              error: "Session not found"
            }));
            return;
          }

          currentSessionId = session.id;
          agent = new CodingAgent(session.id);
          await agent.loadFromSession();

          ws.send(JSON.stringify({
            type: "session_resumed",
            sessionId: session.id
          }));

          console.log(`[WebSocket] Session resumed: ${session.id}`);
        } else if (message.type === "user_message") {
          if (!agent) {
            ws.send(JSON.stringify({
              type: "error",
              error: "No active session. Please start a session first."
            }));
            return;
          }

          console.log(`[WebSocket] Processing user message in session ${currentSessionId}`);

          try {
            for await (const event of agent.processMessage(message.content)) {
              ws.send(JSON.stringify(event));
            }
          } catch (error: any) {
            console.error("[WebSocket] Error processing message:", error);
            ws.send(JSON.stringify({
              type: "error",
              error: error.message || "An error occurred while processing your message"
            }));
          }
        } else if (message.type === "get_sessions") {
          const sessions = await storage.getAllSessions();
          ws.send(JSON.stringify({
            type: "sessions_list",
            sessions
          }));
        } else if (message.type === "get_session_history") {
          if (!message.sessionId) {
            ws.send(JSON.stringify({
              type: "error",
              error: "Session ID required"
            }));
            return;
          }

          const messages = await storage.getMessages(message.sessionId);
          const toolExecutions = await storage.getToolExecutions(message.sessionId);

          ws.send(JSON.stringify({
            type: "session_history",
            sessionId: message.sessionId,
            messages,
            toolExecutions
          }));
        } else {
          ws.send(JSON.stringify({
            type: "error",
            error: `Unknown message type: ${message.type}`
          }));
        }
      } catch (error: any) {
        console.error("[WebSocket] Error handling message:", error);
        ws.send(JSON.stringify({
          type: "error",
          error: error.message || "An error occurred"
        }));
      }
    });

    ws.on("close", () => {
      console.log("[WebSocket] Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("[WebSocket] WebSocket error:", error);
    });
  });

  console.log("[WebSocket] WebSocket server initialized");
  return wss;
}
