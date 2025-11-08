import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Edit, Trash2, Code } from "lucide-react";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  parameterCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewCode?: () => void;
}

export function ToolCard({
  id,
  name,
  description,
  parameterCount,
  onEdit,
  onDelete,
  onViewCode,
}: ToolCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-tool-${id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
            <Wrench className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`text-tool-name`}>{name}</CardTitle>
            <CardDescription className="mt-1" data-testid={`text-tool-description`}>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" data-testid={`badge-param-count`}>
          {parameterCount} parameters
        </Badge>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewCode}
          data-testid={`button-view-code`}
        >
          <Code className="h-4 w-4 mr-1" />
          Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          data-testid={`button-edit-tool`}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          data-testid={`button-delete-tool`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
