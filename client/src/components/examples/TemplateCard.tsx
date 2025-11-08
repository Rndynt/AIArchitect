import { TemplateCard } from "../TemplateCard";
import { Headphones } from "lucide-react";

export default function TemplateCardExample() {
  return (
    <div className="p-8">
      <TemplateCard
        id="1"
        name="Customer Support"
        description="Handle customer inquiries with empathy and efficiency"
        icon={Headphones}
        tags={["Support", "Chat", "CRM"]}
        onUse={() => console.log("Use template")}
      />
    </div>
  );
}
