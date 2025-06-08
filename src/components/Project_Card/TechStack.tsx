// components/project_card/TechStack.tsx
import React from "react";
import { Code } from "lucide-react";

interface TechStackProps {
  techStack: Array<{ name: string }>;
  variant?: "mobile" | "desktop";
}

export const TechStack: React.FC<TechStackProps> = ({ 
  techStack, 
  variant = "desktop" 
}) => {
  if (techStack.length === 0) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Code className="w-4 h-4 text-purple-400" />
          </div>
          <h4 className="text-sm font-medium text-white">Technology Stack</h4>
        </div>
        <p className="text-gray-400 text-sm italic">No technologies specified</p>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Code className="w-4 h-4 text-purple-400" />
          </div>
          <h4 className="text-sm font-medium text-white">Technology Stack</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600/40 text-gray-200 text-xs font-medium hover:bg-gray-600/50 transition-colors"
            >
              {tech.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Code className="w-4 h-4 text-purple-400" />
        Tech Stack
      </h4>
      <div className="flex flex-wrap gap-2">
        {techStack.map((tech, index) => (
          <span
            key={index}
            className="px-2.5 py-1 rounded-md bg-gray-700/60 border border-gray-600/40 text-gray-300 text-xs font-medium hover:bg-gray-600/60 transition-colors"
          >
            {tech.name}
          </span>
        ))}
      </div>
    </div>
  );
};