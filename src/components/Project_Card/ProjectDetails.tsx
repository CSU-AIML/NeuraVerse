// components/project_card/ProjectDetails.tsx
import React from "react";
import { User, Calendar, Folder } from "lucide-react";
import type { ExtendedProject } from "./types";
import { formatDate } from "./utils";

interface ProjectDetailsProps {
  project: ExtendedProject;
  variant?: "mobile" | "desktop";
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  project, 
  variant = "desktop" 
}) => {
  if (variant === "mobile") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Project Lead</h4>
                <p className="text-xs text-gray-400">
                  {project.project_lead?.name || "Unassigned"}
                </p>
              </div>
            </div>
            {project.project_lead?.position && (
              <p className="text-xs text-gray-500 ml-11">
                {project.project_lead.position}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Folder className="w-4 h-4 text-blue-400" />
        Project Details
      </h4>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm text-white">
              {project.project_lead?.name || "Unassigned"}
            </div>
            <div className="text-xs text-gray-400">
              {project.project_lead?.position || "Project Lead"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm text-white">Last Updated</div>
            <div className="text-xs text-gray-400">
              {formatDate(project.updated_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};