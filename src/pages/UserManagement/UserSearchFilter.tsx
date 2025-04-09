// pages/UserManagement/UserSearchFilter.tsx
import React from 'react';
import { Search, X, Info } from 'lucide-react';

interface UserSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const UserSearchFilter: React.FC<UserSearchFilterProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div>
      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700/70 transition-all duration-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Info banner */}
      <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <p className="text-sm text-blue-300 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>Users are now authenticated via Google. Email addresses and profile images are synced from Google accounts.</span>
        </p>
      </div>
    </div>
  );
};

export default UserSearchFilter;