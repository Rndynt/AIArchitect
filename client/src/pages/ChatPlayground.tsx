import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, PlusCircle, Loader2, Bot } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWebSocket, ModelProvider } from "@/hooks/useWebSocket";

interface DisplayMessage {
  id: string;
  type: "user" | "thinking" | "tool_use" | "tool_result" | "response" | "error" | "model_info";
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
  error?: string;
  modelProvider?: string;
  modelName?: string;
}

export default function ChatPlayground() {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelProvider>("anthropic");
  const [currentModelName, setCurrentModelName] = useState<string>("Claude 3.5 Sonnet");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedIndexRef = useRef(0);
  
  const {
    isConnected,
    messages: wsMessages,
    sessionId,
    startSession,
    sendUserMessage,
    clearMessages,
    changeModel
  } = useWebSocket();

  useEffect(() => {
    if (isConnected && !sessionId) {
      console.log("[ChatPlayground] Starting new session");
      startSession(undefined, undefined, currentModel);
    }
  }, [isConnected, sessionId, startSession, currentModel]);

  useEffect(() => {
    // If messages array is smaller than last processed index, reset (e.g., after clearMessages)
    if (wsMessages.length < lastProcessedIndexRef.current) {
      lastProcessedIndexRef.current = 0;
    }
    
    // Only process new messages from the last processed index
    const newMessages = wsMessages.slice(lastProcessedIndexRef.current);
    
    newMessages.forEach((wsMsg) => {
      if (wsMsg.type === "session_started" || wsMsg.type === "session_resumed") {
        return;
      }

      if (wsMsg.type === "model_info") {
        setCurrentModel(wsMsg.modelProvider);
        setCurrentModelName(wsMsg.modelName);
        return;
      }

      if (wsMsg.type === "model_changed") {
        setCurrentModel(wsMsg.modelProvider);
        setCurrentModelName(wsMsg.modelName);
        return;
      }

      if (wsMsg.type === "complete") {
        setIsProcessing(false);
        return;
      }

      const msgId = `${wsMsg.type}-${Date.now()}-${Math.random()}`;

      setDisplayMessages((prev) => {
        const newMsg: DisplayMessage = {
          id: msgId,
          type: wsMsg.type as any,
          content: wsMsg.content,
          tool: wsMsg.tool,
          input: wsMsg.input,
          result: wsMsg.result,
          error: wsMsg.error,
          modelProvider: wsMsg.modelProvider,
          modelName: wsMsg.modelName
        };
        return [...prev, newMsg];
      });

      if (wsMsg.type === "error") {
        setIsProcessing(false);
      }
    });
    
    // Update the last processed index
    lastProcessedIndexRef.current = wsMessages.length;
  }, [wsMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSend = () => {
    if (!input.trim() || !sessionId || isProcessing) return;

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input
    };

    setDisplayMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    sendUserMessage(input);
    setInput("");
  };

  const handleNewSession = () => {
    setDisplayMessages([]);
    clearMessages();
    setIsProcessing(false);
    startSession(undefined, undefined, currentModel);
  };

  const handleModelChange = (newModel: ModelProvider) => {
    if (sessionId && !isProcessing) {
      changeModel(newModel);
      setCurrentModel(newModel);
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">Chat Playground</h1>
              <Badge variant="outline" data-testid="badge-model-name" className="gap-1">
                <Bot className="h-3 w-3" />
                {currentModelName}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={currentModel} 
                onValueChange={(value) => handleModelChange(value as ModelProvider)}
                disabled={isProcessing}
              >
                <SelectTrigger className="w-48" data-testid="select-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="openai">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                data-testid="badge-connection-status"
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {sessionId && (
                <Badge variant="outline" data-testid="badge-session-id">
                  Session: {sessionId.slice(0, 8)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {displayMessages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Welcome to the Coding Agent Chat</p>
                <p className="text-sm">Send a message to get started</p>
              </div>
            </div>
          )}
          {displayMessages
            .filter((message): message is Omit<DisplayMessage, "type"> & { type: Exclude<DisplayMessage["type"], "model_info"> } => 
              message.type !== "model_info"
            )
            .map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))
          }
          {isProcessing && displayMessages.length > 0 && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0">
                <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
              </div>
              <div className="text-sm text-muted-foreground">Processing...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="resize-none"
              rows={3}
              disabled={!isConnected || !sessionId || isProcessing}
              data-testid="input-message"
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              disabled={!isConnected || !sessionId || isProcessing || !input.trim()}
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNewSession}
              disabled={!isConnected}
              data-testid="button-new-session"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Connection:</span>
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                className="text-xs"
                data-testid="badge-connection-status-detail"
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Session:</span>
              <span className="font-mono text-xs" data-testid="text-session-status">
                {sessionId ? "Active" : "None"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Messages:</span>
              <span className="font-mono" data-testid="text-message-count">{displayMessages.length}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Processing:</span>
              <Badge 
                variant={isProcessing ? "default" : "secondary"} 
                className="text-xs"
                data-testid="badge-processing-status"
              >
                {isProcessing ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
