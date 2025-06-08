import React from "react";

interface MobileTabsProps {
  activeTab: "overview" | "tech" | "links";
  onTabChange: (tab: "overview" | "tech" | "links") => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="flex rounded-xl bg-gray-800/40 border border-gray-700/40 p-1">
      {["overview", "tech", "links"].map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab as any)}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
            activeTab === tab
              ? "bg-blue-600/30 text-blue-200 border border-blue-500/30"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
};