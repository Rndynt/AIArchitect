import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Wrench, Brain, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "thinking" | "tool_use" | "tool_result" | "response" | "error";
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
  error?: string;
}

export function ChatMessage({ type, content, tool, input, result, error }: ChatMessageProps) {
  if (type === "user") {
    return (
      <div className="flex gap-3 justify-end" data-testid="message-user">
        <div className="max-w-2xl rounded-lg p-4 bg-primary text-primary-foreground" data-testid="text-message-content">
          {content}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary shrink-0">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      </div>
    );
  }

  if (type === "thinking") {
    return (
      <div className="flex gap-3 justify-start" data-testid="message-thinking">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="max-w-2xl rounded-lg p-4 bg-card border" data-testid="text-thinking-content">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs" data-testid="badge-thinking">Thinking</Badge>
          </div>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    );
  }

  if (type === "tool_use") {
    return (
      <Card className="p-4 bg-accent/30" data-testid="card-tool-use">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent shrink-0">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" data-testid="badge-tool-name">{tool}</Badge>
              <Badge variant="secondary" className="text-xs">Executing</Badge>
            </div>
            {input && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Input:</div>
                <pre className="text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto" data-testid="text-tool-input">
                  {JSON.stringify(input, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (type === "tool_result") {
    const isSuccess = result?.success !== false && !result?.error;
    
    return (
      <Card className={`p-4 ${isSuccess ? 'bg-green-500/10' : 'bg-red-500/10'}`} data-testid="card-tool-result">
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-md shrink-0 ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" data-testid="badge-tool-result-name">{tool}</Badge>
              <Badge variant={isSuccess ? "default" : "destructive"} className="text-xs" data-testid="badge-tool-status">
                {isSuccess ? "Success" : "Error"}
              </Badge>
            </div>
            {result && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Result:</div>
                <pre className="text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto max-h-60 overflow-y-auto" data-testid="text-tool-result">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (type === "response") {
    return (
      <div className="flex gap-3 justify-start" data-testid="message-response">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shrink-0">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="max-w-2xl rounded-lg p-4 bg-card border" data-testid="text-response-content">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <Card className="p-4 bg-destructive/10 border-destructive/50" data-testid="card-error">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/20 shrink-0">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive" data-testid="badge-error">Error</Badge>
            </div>
            <div className="text-sm text-destructive" data-testid="text-error-content">{error || content}</div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
