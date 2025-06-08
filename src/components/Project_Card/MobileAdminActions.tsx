import React from "react";
import { Edit, Archive, RefreshCw, Trash2 } from "lucide-react";

interface MobileAdminActionsProps {
  isArchived: boolean;
  onEdit: (e: React.MouseEvent) => void;
  onArchiveToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const MobileAdminActions: React.FC<MobileAdminActionsProps> = ({
  isArchived,
  onEdit,
  onArchiveToggle,
  onDelete,
}) => {
  return (
    <div className="flex justify-center gap-3 pt-4 border-t border-gray-700/30">
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/60 border border-gray-600/50 text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-600/60 transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>

      <button
        onClick={onArchiveToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
          isArchived
            ? "bg-blue-600/60 border-blue-500/50 text-blue-200"
            : "bg-gray-700/60 border-gray-600/50 text-gray-200 hover:bg-purple-600/60 hover:border-purple-500/50"
        }`}
      >
        {isArchived ? <RefreshCw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
        {isArchived ? "Restore" : "Archive"}
      </button>

      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-4 py-2 bg-red-600/60 border border-red-500/50 text-red-200 rounded-lg text-sm font-medium hover:bg-red-500/60 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};