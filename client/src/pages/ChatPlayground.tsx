import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolParams?: Record<string, unknown>;
}

export default function ChatPlayground() {
  const [messages, setMessages] = useState<Message[]>([
    //todo: remove mock functionality
    {
      role: "assistant",
      content: "Hello! I'm your AI agent. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("1");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    //todo: remove mock functionality - simulate AI response
    const assistantMessage: Message = {
      role: "assistant",
      content: "This is a mock response. In the full application, this will connect to your configured agent.",
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation reset. How can I help you?",
      },
    ]);
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Chat Playground</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
        </div>

        <div className="p-4 border-t">
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
              data-testid="input-message"
            />
            <Button onClick={handleSend} size="icon" data-testid="button-send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-80 border-l p-4 space-y-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger data-testid="select-agent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Customer Support Agent</SelectItem>
                  <SelectItem value="2">Code Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleReset}
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Conversation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages:</span>
              <span className="font-mono" data-testid="text-message-count">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tokens:</span>
              <span className="font-mono" data-testid="text-token-count">~1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latency:</span>
              <span className="font-mono" data-testid="text-latency">1.2s</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
