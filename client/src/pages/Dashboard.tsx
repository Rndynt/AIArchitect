import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Code2, Zap, Clock, Plus, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { CodingSession } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalSessions: number;
  totalMessages: number;
  totalToolExecutions: number;
  filesModified: number;
  avgDuration: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<CodingSession[]>({
    queryKey: ["/api/sessions"],
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getStatusColor = (status: string) => {
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
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Coding agent sessions and activity
            </p>
          </div>
          <Button onClick={() => setLocation("/chat")} data-testid="button-new-session">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Sessions"
            value={statsLoading ? "..." : String(stats?.totalSessions || 0)}
            description="Coding sessions"
            icon={MessageSquare}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Files Modified"
            value={statsLoading ? "..." : String(stats?.filesModified || 0)}
            description="Files changed"
            icon={Code2}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Tool Executions"
            value={statsLoading ? "..." : String(stats?.totalToolExecutions || 0)}
            description="Tools executed"
            icon={Zap}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Avg Duration"
            value={statsLoading ? "..." : formatDuration(stats?.avgDuration || 0)}
            description="Average session"
            icon={Clock}
            trend={{ value: 0, isPositive: false }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
          {sessionsLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading sessions...</p>
              </CardContent>
            </Card>
          ) : !sessions || sessions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No sessions yet</CardTitle>
                <CardDescription>
                  Start a new coding session to see it here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setLocation("/chat")} data-testid="button-start-session">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Coding Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {sessions.slice(0, 6).map((session) => (
                <Card 
                  key={session.id} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/session/${session.id}`)}
                  data-testid={`card-session-${session.id}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Session
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(session.status)}
                      data-testid={`badge-status-${session.id}`}
                    >
                      {session.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Calendar className="h-4 w-4" />
                        <span data-testid={`text-created-${session.id}`}>
                          {session.createdAt 
                            ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
                            : "Unknown"
                          }
                        </span>
                      </div>
                      {session.projectPath && (
                        <div className="text-sm text-muted-foreground truncate">
                          <span className="font-medium">Path:</span> {session.projectPath}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        ID: {session.id}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
