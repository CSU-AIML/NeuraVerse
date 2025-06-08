import React from "react";
import { Archive, RefreshCw } from "lucide-react";

interface ArchiveOverlayProps {
  projectName?: string;
  isAdmin: boolean;
  projectId: string;
  onUnarchive?: (id: string) => void;
}

export const ArchiveOverlay: React.FC<ArchiveOverlayProps> = ({
  projectName,
  isAdmin,
  projectId,
  onUnarchive,
}) => {
  return (
    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-20 flex items-center justify-center">
      <div className="text-center px-8 py-6 rounded-xl bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-sm mx-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <Archive className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {projectName || "Untitled Project"}
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          This project has been archived and is no longer active.
        </p>

        {isAdmin && onUnarchive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnarchive(projectId);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Project
          </button>
        )}
      </div>
    </div>
  );
};