// components/project_card/ProjectDescription.tsx
import React from "react";

interface ProjectDescriptionProps {
  description?: string;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ 
  description 
}) => {
  if (!description) return null;

  return (
    <div className="mb-6">
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <p className="text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};