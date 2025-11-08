import { useState } from "react";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ToolRegistry() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  //todo: remove mock functionality
  const mockTools = [
    {
      id: "1",
      name: "web_search",
      description: "Search the internet for up-to-date information",
      parameterCount: 2,
    },
    {
      id: "2",
      name: "send_email",
      description: "Send email notifications to users",
      parameterCount: 3,
    },
    {
      id: "3",
      name: "get_weather",
      description: "Fetch current weather data for a location",
      parameterCount: 1,
    },
    {
      id: "4",
      name: "database_query",
      description: "Execute database queries safely",
      parameterCount: 2,
    },
  ];

  const handleCreateTool = () => {
    console.log("Creating new tool");
    setOpen(false);
    toast({
      title: "Tool Created",
      description: "Your new tool has been added to the registry.",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-page-title">Tool Registry</h1>
            <p className="text-muted-foreground mt-1">
              Manage custom functions for your agents
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-tool">
                <Plus className="h-4 w-4 mr-2" />
                Create Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Tool</DialogTitle>
                <DialogDescription>
                  Define a new function that agents can call
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tool-name">Tool Name</Label>
                  <Input id="tool-name" placeholder="my_custom_tool" data-testid="input-tool-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tool-description">Description</Label>
                  <Textarea
                    id="tool-description"
                    placeholder="Describe what this tool does..."
                    data-testid="input-tool-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tool-code">Implementation</Label>
                  <Textarea
                    id="tool-code"
                    placeholder="function myCustomTool(params) { ... }"
                    className="min-h-[200px] font-mono text-sm"
                    data-testid="input-tool-code"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button onClick={handleCreateTool} data-testid="button-save-tool">
                  Create Tool
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {mockTools.map((tool) => (
            <ToolCard
              key={tool.id}
              {...tool}
              onEdit={() => console.log("Edit tool:", tool.id)}
              onDelete={() => console.log("Delete tool:", tool.id)}
              onViewCode={() => console.log("View code:", tool.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
