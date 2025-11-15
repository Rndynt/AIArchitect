import { useState, useEffect, useRef, useCallback } from "react";

export type ModelProvider = "anthropic" | "openai" | "gemini";
export type ModelName = string;

interface WebSocketMessage {
  type: "session_started" | "session_resumed" | "thinking" | "tool_use" | "tool_result" | "response" | "complete" | "error" | "sessions_list" | "session_history" | "model_changed" | "model_info";
  [key: string]: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/agent-ws`;
    
    console.log('[WebSocket] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Received:', data);
        
        if (data.type === "session_started" || data.type === "session_resumed") {
          setSessionId(data.sessionId);
        }
        
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('[WebSocket] Cannot send message - not connected');
    }
  }, []);

  const startSession = useCallback((userId?: string, projectPath?: string, modelProvider?: ModelProvider, modelName?: ModelName) => {
    sendMessage({
      type: "start_session",
      userId,
      projectPath,
      modelProvider: modelProvider || "anthropic",
      modelName
    });
  }, [sendMessage]);

  const resumeSession = useCallback((sessionId: string, modelProvider?: ModelProvider) => {
    sendMessage({
      type: "resume_session",
      sessionId,
      modelProvider: modelProvider || "anthropic"
    });
  }, [sendMessage]);

  const changeModel = useCallback((modelProvider: ModelProvider, modelName?: ModelName) => {
    sendMessage({
      type: "change_model",
      modelProvider,
      modelName
    });
  }, [sendMessage]);

  const sendUserMessage = useCallback((content: string) => {
    if (!sessionId) {
      console.error('[WebSocket] No active session');
      return;
    }
    sendMessage({
      type: "user_message",
      content
    });
  }, [sessionId, sendMessage]);

  const getSessions = useCallback(() => {
    sendMessage({
      type: "get_sessions"
    });
  }, [sendMessage]);

  const getSessionHistory = useCallback((sessionId: string) => {
    sendMessage({
      type: "get_session_history",
      sessionId
    });
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    sessionId,
    sendMessage,
    startSession,
    resumeSession,
    sendUserMessage,
    getSessions,
    getSessionHistory,
    clearMessages,
    changeModel
  };
}
