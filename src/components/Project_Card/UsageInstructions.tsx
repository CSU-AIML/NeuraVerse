// components/project_card/UsageInstructions.tsx
import React from "react";
import { Info } from "lucide-react";

interface UsageInstructionsProps {
  usage?: string;
  variant?: "mobile" | "desktop";
}

export const UsageInstructions: React.FC<UsageInstructionsProps> = ({ 
  usage, 
  variant = "desktop" 
}) => {
  if (!usage) return null;

  if (variant === "mobile") {
    return (
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center">
            <Info className="w-4 h-4 text-green-400" />
          </div>
          <h4 className="text-sm font-medium text-white">Usage Instructions</h4>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {usage}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Info className="w-4 h-4 text-green-400" />
        Usage Instructions
      </h4>
      <p className="text-sm text-gray-300 leading-relaxed text-justify">
        {usage}
      </p>
    </div>
  );
};