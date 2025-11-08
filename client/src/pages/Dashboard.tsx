import { MetricCard } from "@/components/MetricCard";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Wrench, Clock, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  //todo: remove mock functionality
  const mockAgents = [
    {
      id: "1",
      name: "Customer Support Agent",
      description: "Handles customer inquiries and support tickets with empathy",
      provider: "OpenAI",
      model: "GPT-4",
      toolCount: 5,
    },
    {
      id: "2",
      name: "Code Assistant",
      description: "Helps with code review, debugging, and documentation",
      provider: "Anthropic",
      model: "Claude 3.5",
      toolCount: 8,
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your AI agents and activity
            </p>
          </div>
          <Button onClick={() => setLocation("/builder")} data-testid="button-create-agent">
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Conversations"
            value="1,284"
            description="Active conversations"
            icon={MessageSquare}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Active Agents"
            value="12"
            description="Configured agents"
            icon={Bot}
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title="Total Tools"
            value="24"
            description="Available functions"
            icon={Wrench}
            trend={{ value: 3.1, isPositive: true }}
          />
          <MetricCard
            title="Avg Response Time"
            value="1.2s"
            description="Last 24 hours"
            icon={Clock}
            trend={{ value: 5.3, isPositive: false }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Agents</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {mockAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                {...agent}
                onEdit={() => console.log("Edit agent:", agent.id)}
                onTest={() => setLocation("/playground")}
                onDelete={() => console.log("Delete agent:", agent.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
