import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Wrench } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolParams?: Record<string, unknown>;
}

export function ChatMessage({ role, content, toolName, toolParams }: ChatMessageProps) {
  if (role === "tool") {
    return (
      <Card className="p-4 bg-accent/50" data-testid="card-tool-call">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" data-testid="badge-tool-name">{toolName}</Badge>
            </div>
            {toolParams && (
              <pre className="text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto" data-testid="text-tool-params">
                {JSON.stringify(toolParams, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div
      className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}
      data-testid={`message-${role}`}
    >
      {role === "assistant" && (
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-2xl rounded-lg p-4 ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-card border"
        }`}
        data-testid="text-message-content"
      >
        {content}
      </div>
      {role === "user" && (
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
