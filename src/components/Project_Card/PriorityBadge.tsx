// components/project_card/PriorityBadge.tsx
import React from "react";
import { getPriorityConfig } from "./utils";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityConfig = getPriorityConfig(priority);

  if (!priorityConfig) return null;

  return (
    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${priorityConfig.bg} ${priorityConfig.border} ${priorityConfig.text} border flex items-center gap-1.5`}>
      <span>{priorityConfig.icon}</span>
      <span className="capitalize">{priority}</span>
    </div>
  );
};