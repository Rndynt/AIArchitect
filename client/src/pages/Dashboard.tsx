import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Code2, Zap, Clock, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
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
            value="0"
            description="Coding sessions"
            icon={MessageSquare}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Files Modified"
            value="0"
            description="Files changed"
            icon={Code2}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Tool Executions"
            value="0"
            description="Tools executed"
            icon={Zap}
            trend={{ value: 0, isPositive: true }}
          />
          <MetricCard
            title="Avg Duration"
            value="0s"
            description="Average session"
            icon={Clock}
            trend={{ value: 0, isPositive: false }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
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
        </div>
      </div>
    </div>
  );
}
