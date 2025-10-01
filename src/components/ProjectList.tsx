// components/ProjectList.tsx
import React, { useState, useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Plus, Grid3X3, List, LayoutGrid, Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import Loader from './loader';
import type { Project } from '../types/project';

interface ProjectsListProps {
  loading: boolean;
  searchQuery: string;
  projects: Project[];
  filteredProjects: Project[];
  isAdmin: boolean;
  navigate: NavigateFunction;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => Promise<void>;
  handleArchive: (id: string) => Promise<void>;
  handleUnarchive: (id: string) => Promise<void>;
}

type ViewMode = 'list' | 'grid' | 'compact';

const ProjectsList: React.FC<ProjectsListProps> = ({
  loading,
  searchQuery,
  projects,
  filteredProjects,
  isAdmin,
  navigate,
  handleEdit,
  handleDelete,
  handleArchive,
  handleUnarchive
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to first page when projects change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredProjects.length, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status !== 'archived').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const ongoing = projects.filter(p => p.status === 'ongoing').length;
    
    return { total, active, completed, ongoing };
  }, [projects]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-gray-950/90 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-pulse">
          <Loader />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/80 backdrop-blur-sm p-8 rounded-lg border border-gray-800/50">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
          <Search className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">No Projects Found</h3>
        <p className="text-gray-400 mb-6">
          {searchQuery 
            ? 'No projects match your search criteria. Try adjusting your filters.' 
            : 'You haven\'t created any projects yet. Get started by creating your first project.'}
        </p>
        {isAdmin && !searchQuery && (
          <button
            onClick={() => navigate('/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Create First Project
          </button>
        )}
      </div>
    );
  }

  const getGridClass = () => {
    switch (viewMode) {
      case 'grid':
        return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6';
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      default:
        return 'flex flex-col space-y-6';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Project Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-400">Total Projects</div>
            <div className="text-lg font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-400">Active</div>
            <div className="text-lg font-bold text-green-400">{stats.active}</div>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-400">Completed</div>
            <div className="text-lg font-bold text-blue-400">{stats.completed}</div>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-lg px-4 py-2">
            <div className="text-xs text-gray-400">In Progress</div>
            <div className="text-lg font-bold text-yellow-400">{stats.ongoing}</div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'list' 
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'grid' 
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === 'compact' 
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="Compact View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      {filteredProjects.length !== projects.length && (
        <div className="text-sm text-gray-400">
          Showing {filteredProjects.length} of {projects.length} projects
          {searchQuery && (
            <span> matching "{searchQuery}"</span>
          )}
        </div>
      )}

      {/* Projects Container */}
      <div className={`${getGridClass()} relative`}>
        {currentProjects.map((project, index) => {
          // Ensure project_lead.name is always defined for type compatibility
          const safeProject = {
            ...project,
            project_lead: project.project_lead
              ? {
                  ...project.project_lead,
                  name: project.project_lead.name ?? '',
                }
              : undefined,
          };

          return (
            <div
              key={project.id}
              className="animate-fadeIn"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
            >
              <ProjectCard
                project={safeProject}
                variant={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                priority={
                  project.status === 'live' ? 'high' :
                  project.status === 'ongoing' ? 'medium' : 'low'
                }
              />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/60 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600/30 border border-blue-500/50 text-blue-200'
                      : 'bg-gray-800/60 border border-gray-700/50 text-white hover:bg-gray-700/60'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/60 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Quick Create Button for Admins */}
      {isAdmin && (
        <button
          onClick={() => navigate('/new')}
          className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 transform hover:scale-110 z-50"
          title="Create New Project"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-30px); opacity: 0; }
        }
        .page-enter { animation: slideIn 0.4s ease-out; }
        .page-exit { animation: slideOut 0.4s ease-in; }
      `}</style>
    </div>
  );
};

export default ProjectsList;