// components/ProjectFilters.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownAZ, 
  Calendar, 
  Code, 
  X, 
  ChevronDown,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import type { Project } from '../types/project';
import type { FilterState, SortOption } from '../utils/projectFilters';

interface ProjectFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  projects?: Project[];
  onFiltersChange?: (filters: FilterState) => void;
  activeFilters?: FilterState;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  projects = [],
  onFiltersChange,
  activeFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Default filter state if not provided
  const defaultFilters: FilterState = {
    searchQuery: '',
    statusFilter: [],
    techFilter: [],
    sortBy: 'date',
    sortDirection: 'desc',
    dateRange: 'all'
  };

  const filters = activeFilters || defaultFilters;

  // Extract unique values from projects
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.status).filter(Boolean)));
  const uniqueTechs = Array.from(new Set(
    projects.flatMap(p => 
      Array.isArray(p.tech_stack) 
        ? p.tech_stack.map((tech: any) => tech.name).filter(Boolean)
        : []
    )
  ));

  const handleStatusFilter = (status: string) => {
    if (!onFiltersChange) return;
    
    const newStatusFilter = filters.statusFilter.includes(status)
      ? filters.statusFilter.filter(s => s !== status)
      : [...filters.statusFilter, status];
    
    onFiltersChange({
      ...filters,
      statusFilter: newStatusFilter
    });
  };

  const handleTechFilter = (tech: string) => {
    if (!onFiltersChange) return;
    
    const newTechFilter = filters.techFilter.includes(tech)
      ? filters.techFilter.filter(t => t !== tech)
      : [...filters.techFilter, tech];
    
    onFiltersChange({
      ...filters,
      techFilter: newTechFilter
    });
  };

  const handleSortChange = (sortBy: SortOption) => {
    if (!onFiltersChange) return;
    
    const sortDirection = 
      filters.sortBy === sortBy && filters.sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onFiltersChange({
      ...filters,
      sortBy,
      sortDirection
    });
    setShowSortDropdown(false);
  };

  const clearAllFilters = () => {
    if (!onFiltersChange) return;
    
    onFiltersChange(defaultFilters);
    setSearchQuery('');
  };

  const activeFilterCount = 
    filters.statusFilter.length + 
    filters.techFilter.length + 
    (filters.dateRange !== 'all' ? 1 : 0);

  const getSortIcon = () => {
    switch (filters.sortBy) {
      case 'name': return <ArrowDownAZ className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'status': return <Activity className="w-4 h-4" />;
      case 'tech': return <Code className="w-4 h-4" />;
      default: return <ArrowDownAZ className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 mb-8 w-full">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="flex-1 relative">
          {/* Search input with glassmorphism */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onFiltersChange) {
                  onFiltersChange({
                    ...filters,
                    searchQuery: e.target.value
                  });
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-md transition-all duration-300"
            />
            
            {/* Subtle light reflection at the top of input */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Filter buttons group with glassmorphism */}
        <div className="flex gap-2 sm:gap-3">
          {/* Advanced Filters Toggle - Only show if we have onFiltersChange */}
          {onFiltersChange && (
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-3 backdrop-blur-xl border rounded-lg text-white transition-all duration-300 ${
                showAdvanced || activeFilterCount > 0
                  ? 'bg-blue-600/30 border-blue-500/50 shadow-md shadow-blue-500/10' 
                  : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/40 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 text-blue-400" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          
          {/* Sort Dropdown - Only show if we have onFiltersChange */}
          {onFiltersChange && (
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/40 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300"
              >
                {getSortIcon()}
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    {[
                      { key: 'date', label: 'Last Updated', icon: Calendar },
                      { key: 'name', label: 'Name', icon: ArrowDownAZ },
                      { key: 'status', label: 'Status', icon: Activity },
                      { key: 'tech', label: 'Tech Stack', icon: Code }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => handleSortChange(key as SortOption)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          filters.sortBy === key 
                            ? 'bg-blue-600/30 text-blue-200' 
                            : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                        {filters.sortBy === key && (
                          <span className="ml-auto text-xs">
                            {filters.sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear Filters - Only show if we have active filters */}
          {onFiltersChange && activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-3 bg-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-lg text-red-200 hover:bg-red-600/30 transition-all duration-300"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel - Only show if we have onFiltersChange */}
      {onFiltersChange && showAdvanced && (
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-600/50 transition-colors"
              >
                <span>
                  {filters.statusFilter.length === 0 
                    ? 'All Statuses' 
                    : `${filters.statusFilter.length} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-40 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    {uniqueStatuses.map((status) => (
                      <label key={status} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.statusFilter.includes(status)}
                          onChange={() => handleStatusFilter(status)}
                          className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-gray-300 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tech Stack Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Technology</label>
              <button
                onClick={() => setShowTechDropdown(!showTechDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-600/50 transition-colors"
              >
                <span>
                  {filters.techFilter.length === 0 
                    ? 'All Technologies' 
                    : `${filters.techFilter.length} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTechDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showTechDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-40 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    {uniqueTechs.slice(0, 20).map((tech) => (
                      <label key={tech} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.techFilter.includes(tech)}
                          onChange={() => handleTechFilter(tech)}
                          className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">{tech}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: e.target.value as any
                })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.statusFilter.length > 0 || filters.techFilter.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex flex-wrap gap-2">
                {filters.statusFilter.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-200 text-sm rounded-full border border-blue-500/30"
                  >
                    Status: {status}
                    <button
                      onClick={() => handleStatusFilter(status)}
                      className="ml-1 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.techFilter.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-200 text-sm rounded-full border border-purple-500/30"
                  >
                    Tech: {tech}
                    <button
                      onClick={() => handleTechFilter(tech)}
                      className="ml-1 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;