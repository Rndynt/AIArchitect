import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Edit, Play, Trash2 } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  toolCount: number;
  onEdit?: () => void;
  onTest?: () => void;
  onDelete?: () => void;
}

export function AgentCard({
  id,
  name,
  description,
  provider,
  model,
  toolCount,
  onEdit,
  onTest,
  onDelete,
}: AgentCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-agent-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg" data-testid={`text-agent-name`}>{name}</CardTitle>
              <CardDescription className="mt-1" data-testid={`text-agent-description`}>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" data-testid={`badge-provider`}>
            {provider}
          </Badge>
          <Badge variant="outline" data-testid={`badge-model`}>{model}</Badge>
          <Badge variant="outline" data-testid={`badge-tool-count`}>{toolCount} tools</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onTest}
          data-testid={`button-test-agent`}
        >
          <Play className="h-4 w-4 mr-1" />
          Test
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          data-testid={`button-edit-agent`}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          data-testid={`button-delete-agent`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
