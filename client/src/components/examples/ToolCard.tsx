import { ToolCard } from "../ToolCard";

export default function ToolCardExample() {
  return (
    <div className="p-8">
      <ToolCard
        id="1"
        name="web_search"
        description="Search the internet for up-to-date information"
        parameterCount={2}
        onEdit={() => console.log("Edit")}
        onDelete={() => console.log("Delete")}
        onViewCode={() => console.log("View code")}
      />
    </div>
  );
}
