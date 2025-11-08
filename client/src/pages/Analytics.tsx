import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { MessageSquare, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Analytics() {
  //todo: remove mock functionality
  const usageData = [
    { name: "Mon", conversations: 45 },
    { name: "Tue", conversations: 52 },
    { name: "Wed", conversations: 48 },
    { name: "Thu", conversations: 61 },
    { name: "Fri", conversations: 55 },
    { name: "Sat", conversations: 38 },
    { name: "Sun", conversations: 42 },
  ];

  const toolUsageData = [
    { name: "web_search", calls: 124 },
    { name: "send_email", calls: 89 },
    { name: "get_weather", calls: 67 },
    { name: "database_query", calls: 45 },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor usage and performance metrics
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Conversations"
            value="1,284"
            icon={MessageSquare}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Success Rate"
            value="94.2%"
            icon={CheckCircle2}
            trend={{ value: 2.1, isPositive: true }}
          />
          <MetricCard
            title="Avg Response Time"
            value="1.2s"
            icon={Clock}
            trend={{ value: 5.3, isPositive: false }}
          />
          <MetricCard
            title="Token Usage"
            value="2.4M"
            icon={TrendingUp}
            trend={{ value: 18.7, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Volume</CardTitle>
              <CardDescription>Daily conversations over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversations"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tool Usage</CardTitle>
              <CardDescription>Function calls by tool type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={toolUsageData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest conversations and tool calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  agent: "Customer Support Agent",
                  user: "user@example.com",
                  messages: 12,
                  tokens: "1,234",
                  duration: "3m 24s",
                  time: "2 minutes ago",
                },
                {
                  id: 2,
                  agent: "Code Assistant",
                  user: "developer@example.com",
                  messages: 8,
                  tokens: "2,156",
                  duration: "5m 12s",
                  time: "15 minutes ago",
                },
                {
                  id: 3,
                  agent: "Customer Support Agent",
                  user: "customer@example.com",
                  messages: 6,
                  tokens: "892",
                  duration: "2m 05s",
                  time: "1 hour ago",
                },
              ].map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`row-activity-${activity.id}`}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{activity.agent}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Messages</p>
                      <p className="font-mono">{activity.messages}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens</p>
                      <p className="font-mono">{activity.tokens}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-mono">{activity.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
