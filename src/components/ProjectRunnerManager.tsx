import React, { useState, useContext, createContext } from 'react';
import { ProjectUsage } from './ProjectUsage';
import type { Project } from '../types/project';

// Define types for our project runner context
interface ProjectRunnerContextType {
  runningProjects: Project[];
  startProject: (project: Project) => void;
  stopProject: (projectId: string) => void;
  isProjectRunning: (projectId: string) => boolean;
  maximizedProject: string | null;
  setMaximizedProject: (projectId: string | null) => void;
}

// Create the context
const ProjectRunnerContext = createContext<ProjectRunnerContextType>({
  runningProjects: [],
  startProject: () => {},
  stopProject: () => {},
  isProjectRunning: () => false,
  maximizedProject: null,
  setMaximizedProject: () => {},
});

// Hook to use the project runner context
export const useProjectRunner = () => useContext(ProjectRunnerContext);

// Provider component
export const ProjectRunnerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [runningProjects, setRunningProjects] = useState<Project[]>([]);
  const [maximizedProject, setMaximizedProject] = useState<string | null>(null);

  const startProject = (project: Project) => {
    // Check if project is already running
    if (runningProjects.some(p => p.id === project.id)) {
      // If it's already running, maximize it
      setMaximizedProject(project.id);
      return;
    }
    
    // Add to running projects
    setRunningProjects(prev => [...prev, project]);
  };

  const stopProject = (projectId: string) => {
    // Remove from running projects
    setRunningProjects(prev => prev.filter(p => p.id !== projectId));
    
    // If this was the maximized project, clear it
    if (maximizedProject === projectId) {
      setMaximizedProject(null);
    }
  };

  const isProjectRunning = (projectId: string) => {
    return runningProjects.some(p => p.id === projectId);
  };

  return (
    <ProjectRunnerContext.Provider
      value={{
        runningProjects,
        startProject,
        stopProject,
        isProjectRunning,
        maximizedProject,
        setMaximizedProject,
      }}
    >
      {children}
      <ProjectRunnerManager />
    </ProjectRunnerContext.Provider>
  );
};

// Manager component that renders all running projects
const ProjectRunnerManager = () => {
  const {
    runningProjects,
    stopProject,
    maximizedProject,
    setMaximizedProject,
  } = useProjectRunner();

  // Don't render anything if no projects are running
  if (runningProjects.length === 0) {
    return null;
  }

  // If a project is maximized, render only that one in full screen
  if (maximizedProject) {
    const project = runningProjects.find(p => p.id === maximizedProject);
    if (project) {
      return (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <ProjectUsage
            project={project}
            onClose={() => stopProject(project.id)}
            isMaximized={true}
            onToggleMaximize={() => setMaximizedProject(null)}
          />
        </div>
      );
    }
  }

  // Otherwise, render all running projects in a grid at the bottom
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-30">
      <div className="grid grid-cols-1 gap-4 max-h-[80vh] overflow-auto p-2">
        {runningProjects.map(project => (
          <div key={project.id} className="w-96">
            <ProjectUsage
              project={project}
              onClose={() => stopProject(project.id)}
              isMaximized={false}
              onToggleMaximize={() => setMaximizedProject(project.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};