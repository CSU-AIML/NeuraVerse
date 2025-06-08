// components/project_card/ProjectHeader.tsx
import React from "react";
import { User, Calendar, Code } from "lucide-react";
import type { ExtendedProject } from "./types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "./utils";

interface ProjectHeaderProps {
  project: ExtendedProject;
  techStackLength: number;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project, 
  techStackLength 
}) => {
  return (
    <div className="flex-1 min-w-0">
      {/* Project Title */}
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-200 transition-colors">
          {project.name || "Untitled Project"}
        </h3>
        
        {/* Status Badge */}
        <StatusBadge status={project.status} />
      </div>

      {/* Project Meta Row */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span>{project.project_lead?.name || "Unassigned"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(project.updated_at)}</span>
        </div>
        {techStackLength > 0 && (
          <div className="flex items-center gap-1.5">
            <Code className="w-4 h-4" />
            <span>{techStackLength} technologies</span>
          </div>
        )}
      </div>
    </div>
  );
};