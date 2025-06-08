// components/project_card/StatusBadge.tsx
import React from "react";
import { getStatusConfig } from "./utils";

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} border`}>
      <div className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
      <StatusIcon className="w-3.5 h-3.5" />
      <span>
        {status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Ongoing"}
      </span>
    </div>
  );
};