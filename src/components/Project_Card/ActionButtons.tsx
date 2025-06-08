// components/project_card/ActionButtons.tsx
import React from "react";
import {
  Edit,
  Trash2,
  Archive,
  RefreshCw,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ActionButtonsProps {
  isAdmin: boolean;
  isArchived: boolean;
  isMobile: boolean;
  isExpanded: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onArchiveToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleExpand: (e: React.MouseEvent) => void;
  onUnarchive?: (id: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isAdmin,
  isArchived,
  isMobile,
  isExpanded,
  onEdit,
  onArchiveToggle,
  onDelete,
  onToggleExpand,
}) => {
  return (
    <div className="flex items-center gap-2 ml-4">
      {/* Desktop Action Buttons */}
      <div className="hidden md:flex gap-1">
        {isAdmin ? (
          <>
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-blue-600/20 hover:border-blue-500/50 text-gray-300 hover:text-blue-300 transition-all"
              title="Edit project"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={onArchiveToggle}
              className={`p-2 rounded-lg border transition-all ${
                isArchived
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : "bg-gray-800/60 border-gray-700/50 hover:bg-purple-600/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-300"
              }`}
              title={isArchived ? "Restore project" : "Archive project"}
            >
              {isArchived ? (
                <RefreshCw className="w-4 h-4" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-red-600/20 hover:border-red-500/50 text-gray-300 hover:text-red-300 transition-all"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="p-2 rounded-lg bg-gray-800/40 border border-gray-700/30" title="Admin access required">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>

      {/* Mobile expand toggle */}
      {isMobile && !isArchived && (
        <button
          onClick={onToggleExpand}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white transition-all md:hidden"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};