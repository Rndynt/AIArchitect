import { AgentCard } from "../AgentCard";

export default function AgentCardExample() {
  return (
    <div className="p-8">
      <AgentCard
        id="1"
        name="Customer Support Agent"
        description="Handles customer inquiries and support tickets with empathy"
        provider="OpenAI"
        model="GPT-4"
        toolCount={5}
        onEdit={() => console.log("Edit")}
        onTest={() => console.log("Test")}
        onDelete={() => console.log("Delete")}
      />
    </div>
  );
}
