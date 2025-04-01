import { NavigateFunction } from 'react-router-dom';
import { Plus } from 'lucide-react';
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

const ProjectsList = ({
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
}: ProjectsListProps) => {
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
      <div className="text-center py-12 bg-gray-900/80 backdrop-blur-sm p-8 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">No Projects Found</h3>
        <p className="text-gray-400 mb-6">
          {searchQuery 
            ? 'No projects match your search criteria.' 
            : 'You haven\'t created any projects yet. Get started by creating your first project.'}
        </p>
        {isAdmin && (
          <button
            onClick={() => navigate('/new')}
            className="px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create First Project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {filteredProjects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
        />
      ))}
    </div>
  );
};

export default ProjectsList;