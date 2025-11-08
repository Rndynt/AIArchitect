import { MetricCard } from "../MetricCard";
import { MessageSquare } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="p-8">
      <MetricCard
        title="Total Conversations"
        value="1,284"
        description="Active conversations"
        icon={MessageSquare}
        trend={{ value: 12.5, isPositive: true }}
      />
    </div>
  );
}
