import React from "react";
import { Globe, Github, BookOpen, Lock } from "lucide-react";
import type { ExtendedProject } from "./types";

interface LinkButtonsProps {
  project: ExtendedProject;
  isAdmin: boolean;
  variant?: "mobile" | "desktop";
  onUseProject: (e: React.MouseEvent) => void;
}

export const LinkButtons: React.FC<LinkButtonsProps> = ({
  project,
  isAdmin,
  variant = "desktop",
  onUseProject,
}) => {
  if (variant === "mobile") {
    return (
      <div className="space-y-3">
        {project.app_url && (
          <button
            onClick={onUseProject}
            className="w-full flex items-center gap-3 bg-blue-600/20 border border-blue-500/40 rounded-xl p-4 text-blue-200 hover:bg-blue-600/30 transition-colors"
          >
            <Globe className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Open Application</div>
              <div className="text-xs text-blue-300/70">Launch live project</div>
            </div>
          </button>
        )}

        {/* Admin-only GitHub button for mobile */}
        {isAdmin && project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 text-gray-200 hover:bg-gray-700/40 transition-colors"
          >
            <Github className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">View Source Code</div>
              <div className="text-xs text-gray-400">GitHub repository</div>
            </div>
          </a>
        )}

        {/* Admin-only documentation button for mobile */}
        {isAdmin && project.readme_url && (
          <a
            href={project.readme_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 text-gray-200 hover:bg-gray-700/40 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Documentation</div>
              <div className="text-xs text-gray-400">Project docs</div>
            </div>
          </a>
        )}

        {/* Show lock message when user is not admin and GitHub/docs exist */}
        {!isAdmin && (project.github_url || project.readme_url) && (
          <div className="w-full flex items-center gap-3 bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 text-gray-400">
            <Lock className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Source Code & Documentation</div>
              <div className="text-xs text-gray-500">Admin access required</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {project.app_url && (
        <button
          onClick={onUseProject}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-500 border border-blue-500/50 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20"
        >
          <Globe className="w-4 h-4" />
          Open Application
        </button>
      )}

      {/* Admin-only GitHub button for desktop */}
      {isAdmin && project.github_url && (
        <a
          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-200 rounded-lg font-medium transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <Github className="w-4 h-4" />
          Source Code
        </a>
      )}

      {/* Admin-only documentation button for desktop */}
      {isAdmin && project.readme_url && (
        <a
          href={project.readme_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-200 rounded-lg font-medium transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <BookOpen className="w-4 h-4" />
          Documentation
        </a>
      )}

      {/* Show lock indicator for non-admin users when source code/docs exist */}
      {!isAdmin && (project.github_url || project.readme_url) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/30 border border-gray-700/30 text-gray-500 rounded-lg font-medium">
          <Lock className="w-4 h-4" />
          Source Code & Docs (Admin Only)
        </div>
      )}
    </div>
  );
};
export default LinkButtons;