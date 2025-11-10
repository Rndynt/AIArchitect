import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChatMessage } from "@/components/ChatMessage";
import { ArrowLeft, Play, Calendar, FolderOpen, Hash, AlertCircle, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { CodingSession, Message, ToolExecution } from "@shared/schema";

interface SessionDetailData {
  session: CodingSession;
  messages: Message[];
  toolExecutions: ToolExecution[];
}

interface DisplayMessage {
  id: string;
  type: "user" | "thinking" | "tool_use" | "tool_result" | "response" | "error";
  content?: string;
  tool?: string;
  input?: any;
  result?: any;
  error?: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "error":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export default function SessionDetail() {
  const [match, params] = useRoute("/session/:id");
  const [, setLocation] = useLocation();
  const sessionId = params?.id;

  const { data, isLoading, error } = useQuery<SessionDetailData>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  if (!match || !sessionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Session</AlertTitle>
          <AlertDescription>No session ID provided</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-session">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md" data-testid="error-session">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Session</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load session details"}
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setLocation("/")}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Alert>
      </div>
    );
  }

  const { session, messages, toolExecutions } = data;

  // Convert messages to display format
  const displayMessages: DisplayMessage[] = messages.map((msg) => {
    // Determine message type based on role and content
    if (msg.role === "user") {
      return {
        id: msg.id,
        type: "user",
        content: msg.content,
      };
    } else if (msg.role === "assistant") {
      return {
        id: msg.id,
        type: "response",
        content: msg.content,
      };
    }
    // Default to response for any other role
    return {
      id: msg.id,
      type: "response",
      content: msg.content,
    };
  });

  const handleResumeSession = () => {
    setLocation(`/chat?sessionId=${sessionId}`);
  };

  const successfulTools = toolExecutions.filter(t => t.success).length;
  const failedTools = toolExecutions.filter(t => !t.success).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-semibold" data-testid="text-page-title">Session Details</h1>
            </div>
            <p className="text-muted-foreground">
              View session information and conversation history
            </p>
          </div>
          <Button onClick={handleResumeSession} data-testid="button-resume-session">
            <Play className="h-4 w-4 mr-2" />
            Resume Session
          </Button>
        </div>

        {/* Session Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-lg">Session Information</CardTitle>
              <Badge
                variant="outline"
                className={getStatusColor(session.status)}
                data-testid="badge-session-status"
              >
                {session.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Session ID</p>
                    <p className="text-sm font-mono break-all" data-testid="text-session-id">
                      {session.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm" data-testid="text-session-created">
                      {session.createdAt
                        ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
                        : "Unknown"}
                    </p>
                    {session.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.createdAt), "PPpp")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {session.projectPath && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-start gap-2">
                    <FolderOpen className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Project Path</p>
                      <p className="text-sm font-mono break-all" data-testid="text-project-path">
                        {session.projectPath}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-semibold" data-testid="text-message-count">
                  {messages.length}
                </p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold" data-testid="text-tool-count">
                  {toolExecutions.length}
                </p>
                <p className="text-sm text-muted-foreground">Tool Calls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400" data-testid="text-successful-tools">
                  {successfulTools}
                </p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400" data-testid="text-failed-tools">
                  {failedTools}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="messages" data-testid="tab-messages">
              Messages ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">
              Tool Executions ({toolExecutions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4 mt-6" data-testid="tab-content-messages">
            {displayMessages.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center" data-testid="text-no-messages">
                    No messages in this session
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayMessages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-6" data-testid="tab-content-tools">
            {toolExecutions.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center" data-testid="text-no-tools">
                    No tool executions in this session
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {toolExecutions
                  .sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                  })
                  .map((tool, index) => (
                    <Card
                      key={tool.id}
                      className={tool.success ? "border-green-500/20" : "border-red-500/20"}
                      data-testid={`card-tool-${index}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {tool.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <CardTitle className="text-base" data-testid={`text-tool-name-${index}`}>
                              {tool.toolName}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={tool.success ? "default" : "destructive"}
                              className="text-xs"
                              data-testid={`badge-tool-status-${index}`}
                            >
                              {tool.success ? "Success" : "Failed"}
                            </Badge>
                            {tool.duration && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(tool.duration)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {tool.timestamp && (
                          <CardDescription className="text-xs">
                            {formatDistanceToNow(new Date(tool.timestamp), { addSuffix: true })}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tool.input && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Input:</p>
                            <pre
                              className="text-xs font-mono bg-muted/50 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto"
                              data-testid={`text-tool-input-${index}`}
                            >
                              {JSON.stringify(tool.input, null, 2)}
                            </pre>
                          </div>
                        )}
                        {tool.output && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Output:</p>
                            <pre
                              className="text-xs font-mono bg-muted/50 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto"
                              data-testid={`text-tool-output-${index}`}
                            >
                              {JSON.stringify(tool.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
