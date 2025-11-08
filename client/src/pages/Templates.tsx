import { TemplateCard } from "@/components/TemplateCard";
import { Input } from "@/components/ui/input";
import { Search, Bot, Code, Headphones, Database, FileText, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  //todo: remove mock functionality
  const templates = [
    {
      id: "1",
      name: "Customer Support",
      description: "Handle customer inquiries with empathy and efficiency",
      icon: Headphones,
      tags: ["Support", "Chat", "CRM"],
    },
    {
      id: "2",
      name: "Code Assistant",
      description: "Help with code review, debugging, and documentation",
      icon: Code,
      tags: ["Development", "Code Review"],
    },
    {
      id: "3",
      name: "Data Analyst",
      description: "Analyze data and generate insights from complex datasets",
      icon: Database,
      tags: ["Analytics", "SQL", "Visualization"],
    },
    {
      id: "4",
      name: "Content Writer",
      description: "Create engaging content for blogs, social media, and marketing",
      icon: FileText,
      tags: ["Writing", "Marketing", "SEO"],
    },
    {
      id: "5",
      name: "E-commerce Assistant",
      description: "Help customers find products and complete purchases",
      icon: ShoppingCart,
      tags: ["E-commerce", "Sales", "Support"],
    },
    {
      id: "6",
      name: "General Assistant",
      description: "A versatile agent for various tasks and queries",
      icon: Bot,
      tags: ["General", "Multipurpose"],
    },
  ];

  const handleUseTemplate = (templateName: string) => {
    console.log("Using template:", templateName);
    toast({
      title: "Template Selected",
      description: `Creating agent from "${templateName}" template...`,
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Agent Templates</h1>
          <p className="text-muted-foreground mt-1">
            Start with pre-built templates for common use cases
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              onUse={() => handleUseTemplate(template.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
