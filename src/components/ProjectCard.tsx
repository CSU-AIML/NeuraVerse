import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Archive, Edit, Trash2, Info, Calendar, User, Code, CheckCircle, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import type { Project } from '../types/project';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  
  const isArchived = project.status?.toLowerCase() === 'archived';
  
  // Auto-collapse expanded view when leaving mobile sizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);
  
  const handleEdit = () => {
    navigate(`/projects/edit/${project.id}`);
  };

  const handleArchiveToggle = () => {
    if (isArchived && onUnarchive) {
      onUnarchive(project.id);
    } else {
      onArchive(project.id);
    }
  };

  const techStack = Array.isArray(project.tech_stack) 
    ? project.tech_stack.filter(tech => tech && typeof tech === 'object' && tech.name)
    : [];
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Invalid date format:', dateString, e);
      return 'Invalid date';
    }
  };

  const handleUseProject = () => {
    if (project.app_url && typeof project.app_url === 'string' && project.app_url.trim() !== '') {
      try {
        new URL(project.app_url);
        window.open(project.app_url, "_blank", "noopener,noreferrer");
      } catch (e) {
        console.error('Invalid URL format:', project.app_url);
        alert("This project has an invalid application URL.");
      }
    } else {
      alert("This project doesn't have an application URL.");
    }
  };

  const getStatusStyles = () => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md backdrop-blur-xl border-opacity-40 bg-opacity-30 transition-colors duration-300";
    
    switch(project.status?.toLowerCase()) {
      case 'ongoing':
        return `${baseClasses} bg-green-600 text-green-100 border border-green-400`;
      case 'completed':
        return `${baseClasses} bg-blue-600 text-blue-100 border border-blue-400`;
      case 'archived':
        return `${baseClasses} bg-gray-600 text-gray-100 border border-gray-400`;
      case 'live':
        return `${baseClasses} bg-purple-600 text-purple-100 border border-purple-400`;
      case 'paused':
        return `${baseClasses} bg-yellow-600 text-yellow-100 border border-yellow-400`;
      case 'planning':
        return `${baseClasses} bg-orange-600 text-orange-100 border border-orange-400`;
      default:
        return `${baseClasses} bg-green-600 text-green-100 border border-green-400`;
    }
  };

  // Simplified animations
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const contentVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className={`relative rounded-xl overflow-hidden border border-gray-700/40 ${isArchived ? 'bg-gray-800/10' : 'bg-gray-800/30'} backdrop-blur-xl shadow-xl`}
      initial="initial"
      animate="animate"
      variants={cardVariants}
      layoutId={`project-${project.id}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: isArchived ? 1 : 1.01, transition: { duration: 0.2 } }}
    >
      {/* Archive overlay for archived projects */}
      {isArchived && (
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
          <div className="text-center px-6 py-8 rounded-xl bg-gray-800/80 backdrop-blur-xl border cursor-pointer border-gray-700/50 shadow-2xl max-w-md">
            <Archive className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
            <p className="text-gray-300 mb-6">This project has been archived and is no longer active.</p>
            
            {isAdmin && onUnarchive && (
              <motion.button
                onClick={() => onUnarchive(project.id)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 mx-auto bg-blue-600/80 hover:bg-blue-500 transition-colors duration-300 text-white rounded-lg shadow-lg shadow-blue-900/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Project</span>
              </motion.button>
            )}
          </div>
        </div>
      )}
      
      {/* Simplified background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-blue-900/40 z-0 pointer-events-none"
        style={{ 
          opacity: isHovering ? 0.9 : 0.8,
          filter: isArchived ? 'grayscale(100%)' : 'none',
          transition: 'opacity 300ms ease-out'
        }} 
      />
      
      <div className={`flex flex-col md:flex-row relative z-10 ${isExpanded ? 'md:flex-col' : ''} ${isArchived ? 'opacity-60 filter grayscale' : ''}`}>
        {/* Project Image/Screenshot with enhanced styling */}
        <div className={`relative md:w-1/3 h-56 md:h-auto overflow-hidden flex-shrink-0 p-3 transition-all duration-300 ${isExpanded ? 'md:w-full md:h-64' : ''}`}>
          <div className={`relative w-full h-full rounded-xl border border-gray-700/50 overflow-hidden shadow-lg`}>
            {(project.screenshot_url && !imageError) ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={project.screenshot_url}
                  alt={`${project.name} screenshot`}
                  className={`w-full h-full object-cover object-center transition-transform duration-300 ${isArchived ? 'blur-sm grayscale' : ''}`}
                  style={{ transform: isHovering && !isArchived ? 'scale(1.05)' : 'scale(1)' }}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
                
                {/* Enhanced overlay styling */}
                <div className="absolute inset-0 bg-gray-950/10 hover:bg-gray-950/5 transition-colors duration-300"></div>
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-gray-950/80 to-transparent"></div>
                <div className="absolute inset-y-0 right-0 w-1/5 bg-gradient-to-r from-transparent to-gray-900/70 hidden md:block"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gray-950/90 to-transparent"></div>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-gray-400 flex flex-col items-center p-6 text-center">
                  <div className="p-4 rounded-full bg-gray-800/80 mb-3 shadow-lg border border-gray-700/30">
                    <Info className="w-8 h-8 opacity-80" />
                  </div>
                  <span className="text-sm font-medium">No Screenshot Available</span>
                  <span className="text-xs text-gray-500 mt-1 max-w-[180px]">Add a screenshot URL in project settings</span>
                </div>
              </div>
            )}
          
            {/* Status badge - moved inside for better positioning */}
            <div className="absolute top-3 left-3 z-10">
              <div className={getStatusStyles()}>
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>{project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Ongoing'}</span>
              </div>
            </div>

            {/* Mobile expand/collapse toggle */}
            {!isArchived && (
              <button
                className="absolute bottom-3 right-3 md:hidden p-2 rounded-full bg-gray-800/80 text-white border border-gray-600/50 z-20 shadow-lg hover:bg-gray-700/80 transition-colors duration-300"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Content section with simplified animations */}
        <motion.div 
          className={`flex-1 p-5 flex flex-col h-full relative transition-all text-justify duration-300 ${!isExpanded && 'md:max-h-none'}`}
          initial="collapsed"
          animate={isExpanded || window.innerWidth >= 768 ? "expanded" : "collapsed"}
          variants={contentVariants}
        >
          {/* Header with Title and Action Buttons */}
          <div className="flex justify-between items-start mb-4 relative">
            <h3 className="text-xl font-bold text-white leading-tight">
              {project.name || 'Untitled Project'}
            </h3>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 rounded-lg bg-gray-700/40 border border-gray-600/30 hover:bg-blue-600/40 hover:border-blue-500/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    title="Edit project"
                    aria-label="Edit project"
                  >
                    <Edit className="w-4 h-4 text-gray-300 hover:text-blue-200 transition-colors duration-300" />
                  </button>
                  
                  <button
                    onClick={handleArchiveToggle}
                    className={`p-2 rounded-lg ${isArchived 
                      ? 'bg-blue-600/40 border-blue-500/50' 
                      : 'bg-gray-700/40 border-gray-600/30'} 
                      hover:bg-purple-600/40 hover:border-purple-500/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    title={isArchived ? "Restore project" : "Archive project"}
                    aria-label={isArchived ? "Restore project" : "Archive project"}
                  >
                    {isArchived ? (
                      <RefreshCw className="w-4 h-4 text-blue-300 hover:text-blue-200 transition-colors duration-300" />
                    ) : (
                      <Archive className="w-4 h-4 text-gray-300 hover:text-purple-200 transition-colors duration-300" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-2 rounded-lg bg-gray-700/40 border border-gray-600/30 hover:bg-red-600/40 hover:border-red-500/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-200 transition-colors duration-300" />
                  </button>
                </>
              ) : (
                <div
                  className="p-2 rounded-lg bg-gray-700/30 border border-gray-600/20"
                  title="Admin access required"
                >
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
          </div>
          
          {/* Description with simplified design */}
          {project.description ? (
            <div className="relative z-10 bg-gray-800/30 rounded-lg border border-gray-700/30 p-4 mb-4 shadow-md overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-blue-500/70 via-purple-500/50 to-transparent mb-3"></div>
              <p className="text-gray-200 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/20 border border-gray-700/20 rounded-lg p-3 mb-4 flex items-center justify-center text-center relative z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-gray-400 opacity-80" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-sm font-normal italic">
                  No description provided
                </p>
              </div>
            </div>
          )}
          
          {/* Project Meta Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Project Lead */}
            <div className="flex items-center gap-2 bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
              <User className="w-4 h-4 text-blue-300 flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {project.project_lead?.name || 'Unassigned'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {project.project_lead?.position || 'Project Lead'}
                </p>
              </div>
            </div>
            
            {/* Last Updated */}
            <div className="flex items-center gap-2 bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
              <Calendar className="w-4 h-4 text-blue-300 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Last Updated</p>
                <p className="text-xs text-gray-400">{formatDate(project.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Tech Stack with simplified animations */}
          {techStack.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-blue-300 font-medium">Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700/40 text-gray-300 border border-gray-600/40 hover:bg-blue-900/30 hover:text-blue-200 transition-colors duration-300"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Usage Info (collapsible) */}
          {project.usage && (
            <details className="mb-4 bg-gray-700/30 border border-gray-600/40 rounded-lg group overflow-hidden">
              <summary className="p-3 text-sm font-medium text-blue-300 cursor-pointer flex items-center justify-between select-none">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Usage Instructions
                </span>
                <span className="text-xs text-gray-400 italic group-open:hidden hover:text-gray-300 transition-colors">
                  Click to expand
                </span>
              </summary>
              <div className="p-3 pt-2 text-sm text-gray-300 border-t border-gray-600/50 leading-relaxed">
                {project.usage}
              </div>
            </details>
          )}
          
          {/* Action Buttons with simplified animations */}
          <div className="flex flex-wrap gap-2 mt-auto pt-3">
            <button
              onClick={handleUseProject}
              disabled={!project.app_url || isArchived}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 bg-blue-600/90 border border-blue-500/60 hover:bg-blue-500 hover:border-blue-400/80 text-white disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg"
              aria-label="Open project application"
            >
              <ExternalLink className="w-4 h-4" />
              Open Project
            </button>
            
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/40 border border-gray-600/40 text-white hover:bg-gray-600/50 hover:border-gray-500/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="View source code on GitHub"
                tabIndex={isArchived ? -1 : 0}
                style={isArchived ? { pointerEvents: 'none' } : {}}
              >
                <Github className="w-4 h-4" />
                Source Code
              </a>
            )}
            
            {project.readme_url && (
              <a
                href={project.readme_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/40 border border-gray-600/40 text-white hover:bg-gray-600/50 hover:border-gray-500/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="View project documentation"
                tabIndex={isArchived ? -1 : 0}
                style={isArchived ? { pointerEvents: 'none' } : {}}
              >
                <Info className="w-4 h-4" />
                Docs
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};