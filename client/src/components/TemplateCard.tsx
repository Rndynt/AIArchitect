import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  onUse?: () => void;
}

export function TemplateCard({
  id,
  name,
  description,
  icon: Icon,
  tags,
  onUse,
}: TemplateCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-template-${id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle data-testid={`text-template-name`}>{name}</CardTitle>
            <CardDescription className="mt-1" data-testid={`text-template-description`}>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onUse}
          data-testid={`button-use-template`}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
