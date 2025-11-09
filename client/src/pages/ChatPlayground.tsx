import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { FileViewer, FileOperation } from "@/components/FileViewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, PlusCircle, Loader2, Bot, Menu, X, AlertCircle } from "lucide-react";
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

interface ApiError {
  type: 'auth' | 'quota' | 'not_found' | 'general';
  message: string;
  originalError: string;
}

export default function ChatPlayground() {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelProvider>("anthropic");
  const [currentModelName, setCurrentModelName] = useState<string>("Claude 3.5 Sonnet");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [fileOperations, setFileOperations] = useState<FileOperation[]>([]);
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

  const parseError = (errorMessage: string): ApiError => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('401') || lowerError.includes('unauthorized') || 
        lowerError.includes('invalid api key') || lowerError.includes('authentication') ||
        lowerError.includes('api key')) {
      return {
        type: 'auth',
        message: 'Authentication failed. Please check your API keys in environment variables.',
        originalError: errorMessage
      };
    }
    
    if (lowerError.includes('429') || lowerError.includes('quota') || 
        lowerError.includes('rate limit') || lowerError.includes('exceeded')) {
      return {
        type: 'quota',
        message: 'API quota exceeded or rate limit reached. Please check your usage limits or try again later.',
        originalError: errorMessage
      };
    }
    
    if (lowerError.includes('404') || lowerError.includes('not found') || 
        lowerError.includes('model not found')) {
      return {
        type: 'not_found',
        message: 'Model not found. Please verify your model configuration and availability.',
        originalError: errorMessage
      };
    }
    
    return {
      type: 'general',
      message: 'An API error occurred. Please check your configuration and try again.',
      originalError: errorMessage
    };
  };

  const dismissError = () => {
    setApiError(null);
  };

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

      // Track file operations from tool results
      if (wsMsg.type === "tool_result" && wsMsg.tool && wsMsg.input) {
        const tool = wsMsg.tool;
        const input = wsMsg.input;
        
        if (tool === "write_file" && input.file_path) {
          setFileOperations((prev) => {
            // Check if this file already exists in the list
            const existingIndex = prev.findIndex(f => f.path === input.file_path);
            const operation: FileOperation = {
              path: input.file_path,
              operation: existingIndex >= 0 ? "modified" : "created",
              timestamp: Date.now(),
              tool: "write_file"
            };
            
            if (existingIndex >= 0) {
              // Update existing file operation
              const newOps = [...prev];
              newOps[existingIndex] = operation;
              return newOps;
            }
            return [...prev, operation];
          });
        } else if (tool === "edit_file" && input.file_path) {
          setFileOperations((prev) => {
            const existingIndex = prev.findIndex(f => f.path === input.file_path);
            const operation: FileOperation = {
              path: input.file_path,
              operation: "modified",
              timestamp: Date.now(),
              tool: "edit_file"
            };
            
            if (existingIndex >= 0) {
              const newOps = [...prev];
              newOps[existingIndex] = operation;
              return newOps;
            }
            return [...prev, operation];
          });
        } else if (tool === "delete_file" && input.file_path) {
          setFileOperations((prev) => {
            const existingIndex = prev.findIndex(f => f.path === input.file_path);
            const operation: FileOperation = {
              path: input.file_path,
              operation: "deleted",
              timestamp: Date.now(),
              tool: "delete_file"
            };
            
            if (existingIndex >= 0) {
              const newOps = [...prev];
              newOps[existingIndex] = operation;
              return newOps;
            }
            return [...prev, operation];
          });
        }
      }

      if (wsMsg.type === "error") {
        setIsProcessing(false);
        if (wsMsg.error) {
          const parsedError = parseError(wsMsg.error);
          setApiError(parsedError);
        }
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
    setFileOperations([]);
    setIsProcessing(false);
    setApiError(null);
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
              <Button
                size="icon"
                variant="outline"
                className="lg:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
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
                className="hidden sm:inline-flex"
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {sessionId && (
                <Badge variant="outline" data-testid="badge-session-id" className="hidden md:inline-flex">
                  Session: {sessionId.slice(0, 8)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {apiError && (
          <Alert variant="destructive" className="m-4" data-testid="alert-api-error">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle data-testid="text-error-title">
              {apiError.type === 'auth' && 'Authentication Error'}
              {apiError.type === 'quota' && 'API Quota Exceeded'}
              {apiError.type === 'not_found' && 'Model Not Found'}
              {apiError.type === 'general' && 'API Error'}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p data-testid="text-error-message">{apiError.message}</p>
              <div className="text-xs mt-2 space-y-1">
                <p className="font-medium">Troubleshooting steps:</p>
                {apiError.type === 'auth' && (
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Verify your API key is correctly set in environment variables</li>
                    <li>Check that the API key has not expired</li>
                    <li>Ensure you're using the correct API key for the selected provider</li>
                  </ul>
                )}
                {apiError.type === 'quota' && (
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Check your API usage limits in your provider dashboard</li>
                    <li>Verify your billing information is up to date</li>
                    <li>Consider upgrading your plan or waiting for quota reset</li>
                  </ul>
                )}
                {apiError.type === 'not_found' && (
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Verify the model name is correct for your API provider</li>
                    <li>Check if you have access to this model with your current plan</li>
                    <li>Try selecting a different model from the dropdown</li>
                  </ul>
                )}
                {apiError.type === 'general' && (
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Check your internet connection</li>
                    <li>Verify your API configuration in environment variables</li>
                    <li>Review the error details below</li>
                  </ul>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer hover-elevate rounded px-2 py-1">Error details</summary>
                  <pre className="text-xs mt-1 p-2 bg-background rounded overflow-x-auto" data-testid="text-error-details">
                    {apiError.originalError}
                  </pre>
                </details>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={dismissError}
                className="mt-2"
                data-testid="button-dismiss-error"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

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

      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          data-testid="overlay-mobile-sidebar"
        />
      )}

      <div className={`
        ${isMobileSidebarOpen ? 'fixed inset-y-0 right-0 z-50 w-80' : 'hidden'}
        lg:block lg:relative lg:w-80
        border-l overflow-y-auto bg-background
      `}>
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="font-semibold">Menu</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMobileSidebarOpen(false)}
            data-testid="button-close-mobile-sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="session" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="session" data-testid="tab-session">Session</TabsTrigger>
            <TabsTrigger value="status" data-testid="tab-status">Status</TabsTrigger>
            <TabsTrigger value="files" data-testid="tab-files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="p-4 space-y-4">
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
          </TabsContent>

          <TabsContent value="status" className="p-4 space-y-4">
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
          </TabsContent>

          <TabsContent value="files" className="p-4 space-y-4" data-testid="tab-content-files">
            <FileViewer files={fileOperations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
