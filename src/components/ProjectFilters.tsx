import { Search, Filter, ArrowDownAZ, Calendar, Code } from 'lucide-react';

interface ProjectFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProjectFilters = ({ searchQuery, setSearchQuery }: ProjectFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
      <div className="flex-1 relative">
        {/* Search input with glassmorphism */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-md transition-all duration-300"
          />
          
          {/* Subtle light reflection at the top of input */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      </div>
      
      {/* Filter buttons group with glassmorphism */}
      <div className="flex gap-2 sm:gap-3">
        <button className="flex items-center gap-2 px-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/40 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
          <Filter className="w-5 h-5 text-blue-400" />
          <span className="hidden sm:inline">Filters</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/40 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
          <ArrowDownAZ className="w-5 h-5 text-blue-400" />
          <span className="hidden sm:inline">Sort</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/40 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="hidden md:inline">Date</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/40 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300">
          <Code className="w-5 h-5 text-blue-400" />
          <span className="hidden md:inline">Tech</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectFilters;