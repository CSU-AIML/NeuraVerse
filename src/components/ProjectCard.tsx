import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, Archive, Edit, Trash2, Info, Calendar, User, Code, CheckCircle, Lock, ArrowRight, RefreshCw, Star, ChevronDown, ChevronUp, BarChart, Zap, BookOpen } from 'lucide-react';
import type { Project } from '../types/project';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  priority?: 'high' | 'medium' | 'low';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  priority = 'medium',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'tech' | 'usage'>('details');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  
  const isArchived = project.status?.toLowerCase() === 'archived';
  
  // Handle responsive state
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // Auto-collapse on desktop
      if (!newIsMobile && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);
  
  // Handle click outside to collapse on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node) && isExpanded && isMobile) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, isMobile]);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/edit/${project.id}`);
  };

  const handleArchiveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArchived && onUnarchive) {
      onUnarchive(project.id);
    } else {
      onArchive(project.id);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
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

  const handleUseProject = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getStatusStyles = () => {
    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md backdrop-blur-xl border-opacity-40 bg-opacity-30 transition-colors duration-300";
    
    switch(project.status?.toLowerCase()) {
      case 'ongoing':
        return `${baseClasses} bg-green-600/40 text-green-100 border border-green-400/50`;
      case 'completed':
        return `${baseClasses} bg-blue-600/40 text-blue-100 border border-blue-400/50`;
      case 'archived':
        return `${baseClasses} bg-gray-600/40 text-gray-100 border border-gray-400/50`;
      case 'live':
        return `${baseClasses} bg-purple-600/40 text-purple-100 border border-purple-400/50`;
      case 'paused':
        return `${baseClasses} bg-yellow-600/40 text-yellow-100 border border-yellow-400/50`;
      case 'planning':
        return `${baseClasses} bg-orange-600/40 text-orange-100 border border-orange-400/50`;
      default:
        return `${baseClasses} bg-green-600/40 text-green-100 border border-green-400/50`;
    }
  };

  const getPriorityBadge = () => {
    const baseClasses = "absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md";
    
    switch(priority) {
      case 'high':
        return (
          <div className={`${baseClasses} bg-red-500/80 text-white`}>
            <Star className="w-3 h-3 fill-white" />
            <span>Priority</span>
          </div>
        );
      case 'medium':
        return null; // No badge for medium
      case 'low':
        return null; // No badge for low
      default:
        return null;
    }
  };

  // Enhanced animations
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.05, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)" },
  };

  const contentVariants = {
    collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
    expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };
  
  const imageLoadingVariants = {
    loading: { filter: 'blur(10px)', scale: 1.05 },
    loaded: { filter: 'blur(0px)', scale: 1, transition: { duration: 0.5 } }
  };
  
  const hoverVariants = {
    initial: { scale: 1 },
    hover: { scale: isArchived ? 1 : 1.02, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <motion.div 
      ref={cardRef}
      className={`relative rounded-xl overflow-hidden border ${isArchived ? 'border-gray-700/30 bg-gray-800/10' : 'border-gray-700/40 bg-gray-800/30'} backdrop-blur-xl shadow-xl transition-all duration-300`}
      initial="initial"
      animate="animate"
      variants={cardVariants}
      layoutId={`project-${project.id}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover="hover"
      onClick={() => isMobile && !isExpanded && setIsExpanded(true)}
    >
      {/* Professional glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-blue-900/30 z-0 pointer-events-none" />
      
      {/* Archive overlay for archived projects */}
      {isArchived && (
        <motion.div 
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center px-6 py-8 rounded-xl bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-md mx-4">
            <Archive className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{project.name || 'Untitled Project'}</h3>
            <p className="text-gray-300 mb-6">This project has been archived and is no longer active.</p>
            
            {isAdmin && onUnarchive && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnarchive(project.id);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 mx-auto bg-blue-600/80 hover:bg-blue-500 transition-colors duration-300 text-white rounded-lg shadow-lg shadow-blue-900/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Project</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Main card content */}
      <div className={`flex flex-col md:flex-row relative z-10 ${isArchived ? 'opacity-60 filter grayscale' : ''}`}>
        {/* Project Image/Screenshot with enhanced styling */}
        <div className={`relative md:w-2/5 lg:w-1/3 h-60 md:h-auto overflow-hidden flex-shrink-0 p-3 transition-all duration-300`}>
          <div className="relative w-full h-full rounded-xl border border-gray-700/50 overflow-hidden shadow-lg">
            {(project.screenshot_url && !imageError) ? (
              <div className="absolute inset-0 w-full h-full">
                <motion.img
                  src={project.screenshot_url}
                  alt={`${project.name} screenshot`}
                  className={`w-full h-full object-cover object-center ${isArchived ? 'blur-sm grayscale' : ''}`}
                  initial="loading"
                  animate={isImageLoaded ? "loaded" : "loading"}
                  variants={imageLoadingVariants}
                  onError={() => setImageError(true)}
                  onLoad={() => setIsImageLoaded(true)}
                  loading="lazy"
                />
                
                {/* Enhanced overlay styling */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gray-950/90 to-transparent opacity-80"></div>
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
          
            {/* Status badge - better positioned */}
            <div className="absolute top-3 left-3 z-10">
              <div className={getStatusStyles()}>
                {project.status?.toLowerCase() === 'ongoing' && <Zap className="w-3.5 h-3.5 mr-1" />}
                {project.status?.toLowerCase() === 'completed' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                {project.status?.toLowerCase() === 'archived' && <Archive className="w-3.5 h-3.5 mr-1" />}
                {project.status?.toLowerCase() === 'live' && <BarChart className="w-3.5 h-3.5 mr-1" />}
                {project.status?.toLowerCase() === 'paused' && <Info className="w-3.5 h-3.5 mr-1" />}
                {project.status?.toLowerCase() === 'planning' && <Calendar className="w-3.5 h-3.5 mr-1" />}
                <span>{project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Ongoing'}</span>
              </div>
            </div>
            
            {/* Priority badge */}
            {getPriorityBadge()}

            {/* Mobile expand/collapse toggle - more accessible */}
            {!isArchived && isMobile && (
              <button
                className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 z-20 shadow-lg hover:bg-white/20 active:bg-white/30 transition-all duration-300"
                onClick={toggleExpand}
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content section with enhanced animations */}
        <div className="flex-1 p-5 flex flex-col h-full relative transition-all duration-300">
          {/* Header with Title and Action Buttons */}
          <div className="flex justify-between items-start mb-4 relative">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-tight group flex items-center">
              {project.name || 'Untitled Project'}
              <span className="hidden md:inline-flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {project.app_url && (
                  <button 
                    onClick={handleUseProject}
                    className="text-blue-400 hover:text-blue-300"
                    title="Open project"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </span>
            </h3>
            
            {/* Action buttons - desktop */}
            <div className="hidden md:flex gap-2">
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
                    onClick={handleDeleteClick}
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
          
          {/* Desktop and expanded mobile view */}
          <AnimatePresence initial={false}>
            {(!isMobile || isExpanded) && (
              <motion.div
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={contentVariants}
                className="flex flex-col"
              >
                {/* Tab navigation for mobile */}
                {isMobile && (
                  <div className="flex rounded-lg bg-gray-800/50 border border-gray-700/30 mb-4 overflow-hidden">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`flex-1 py-2 px-3 text-xs font-medium transition-colors duration-200 ${
                        activeTab === 'details' ? 'bg-blue-700/40 text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveTab('tech')}
                      className={`flex-1 py-2 px-3 text-xs font-medium transition-colors duration-200 ${
                        activeTab === 'tech' ? 'bg-blue-700/40 text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      Tech Stack
                    </button>
                    {project.usage && (
                      <button
                        onClick={() => setActiveTab('usage')}
                        className={`flex-1 py-2 px-3 text-xs font-medium transition-colors duration-200 ${
                          activeTab === 'usage' ? 'bg-blue-700/40 text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        Usage
                      </button>
                    )}
                  </div>
                )}
                
                {/* Mobile tab content */}
                {isMobile ? (
                  <div>
                    {/* Details Tab */}
                    {activeTab === 'details' && (
                      <>
                        {/* Description */}
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
                              <Info className="h-4 w-4 text-gray-400 opacity-80" />
                              <p className="text-gray-400 text-sm font-normal italic">
                                No description provided
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Project Meta Info Section */}
                        <div className="grid grid-cols-1 gap-3 mb-4">
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
                        
                        {/* Mobile action buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={handleUseProject}
                            disabled={!project.app_url || isArchived}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-300 bg-blue-600/90 border border-blue-500/60 hover:bg-blue-500 hover:border-blue-400/80 text-white disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Open project application"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Project
                          </button>
                          
                          {isAdmin && (
                            <button
                              onClick={handleEdit}
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-300 bg-gray-600/90 border border-gray-500/60 hover:bg-gray-500 hover:border-gray-400/80 text-white disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-gray-500"
                              aria-label="Edit project"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit Project
                            </button>
                          )}
                        </div>
                        
                        {/* Mobile source code/docs buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-700/40 border border-gray-600/40 text-white hover:bg-gray-600/50 hover:border-gray-500/60 transition-colors duration-300"
                              aria-label="View source code on GitHub"
                              tabIndex={isArchived ? -1 : 0}
                              style={isArchived ? { pointerEvents: 'none' } : {}}
                            >
                              <Github className="w-3.5 h-3.5" />
                              Source Code
                            </a>
                          )}
                          
                          {project.readme_url && (
                            <a
                              href={project.readme_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-700/40 border border-gray-600/40 text-white hover:bg-gray-600/50 hover:border-gray-500/60 transition-colors duration-300"
                              aria-label="View project documentation"
                              tabIndex={isArchived ? -1 : 0}
                              style={isArchived ? { pointerEvents: 'none' } : {}}
                            >
                              <Info className="w-3.5 h-3.5" />
                              Docs
                            </a>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* Tech Stack Tab */}
                    {activeTab === 'tech' && (
                      <>
                        <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="w-4 h-4 text-blue-300" />
                            <span className="text-sm text-blue-300 font-medium">Technology Stack</span>
                          </div>
                          
                          {techStack.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {techStack.map((tech, index) => (
                                <div
                                  key={index}
                                  className="px-3 py-2 rounded-lg text-xs bg-gray-700/50 text-gray-200 border border-gray-600/40 hover:bg-blue-900/30 hover:text-blue-200 transition-colors duration-300 flex items-center gap-2"
                                >
                                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                  <span>{tech.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm italic text-center py-2">
                              No technologies specified
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    {/* Usage Tab */}
                    {activeTab === 'usage' && project.usage && (
                      <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-4 h-4 text-blue-300" />
                          <span className="text-sm text-blue-300 font-medium">Usage Instructions</span>
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          {project.usage}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Desktop view - shows everything */
                  <>
                    {/* Description */}
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
                          <Info className="h-4 w-4 text-gray-400 opacity-80" />
                          <p className="text-gray-400 text-sm font-normal italic">
                            No description provided
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Two-column layout for desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-4">
                        {/* Project Lead */}
                        <div className="flex items-center gap-3 bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
                          <div className="p-2 rounded-full bg-blue-900/30 border border-blue-600/20">
                            <User className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">
                              {project.project_lead?.name || 'Unassigned'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {project.project_lead?.position || 'Project Lead'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Last Updated with visual improvement */}
                        <div className="flex items-center gap-3 bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
                          <div className="p-2 rounded-full bg-blue-900/30 border border-blue-600/20">
                            <Calendar className="w-4 h-4 text-blue-300 flex-shrink-0" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Last Updated</p>
                            <p className="text-xs text-gray-400">{formatDate(project.updated_at)}</p>
                          </div>
                        </div>
                        
                        {/* Tech Stack - condensed for desktop */}
                        {techStack.length > 0 && (
                          <div className="bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-full bg-blue-900/30 border border-blue-600/20">
                                <Code className="w-3.5 h-3.5 text-blue-300" />
                              </div>
                              <span className="text-sm text-blue-300 font-medium">Tech Stack</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {techStack.map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700/60 text-gray-300 border border-gray-600/40 hover:bg-blue-900/30 hover:text-blue-200 transition-colors duration-300"
                                >
                                  {tech.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {/* Usage Instructions - collapsible for desktop */}
                        {project.usage && (
                          <details className="bg-gray-700/30 border border-gray-600/40 rounded-lg group overflow-hidden">
                            <summary className="p-3 text-sm font-medium text-blue-300 cursor-pointer flex items-center justify-between select-none">
                              <span className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-blue-900/30 border border-blue-600/20">
                                  <Info className="w-3.5 h-3.5" />
                                </div>
                                Usage Instructions
                              </span>
                              <svg className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </summary>
                            <div className="p-3 pt-1 text-sm text-gray-300 border-t border-gray-600/50 leading-relaxed">
                              {project.usage}
                            </div>
                          </details>
                        )}
                        
                        {/* Github/Source info */}
                        {project.github_url && (
                          <div className="flex items-center gap-3 bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
                            <div className="p-2 rounded-full bg-gray-800/70 border border-gray-600/40">
                              <Github className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-sm font-medium text-white">Source Code</p>
                              <p className="text-xs text-gray-400 truncate hover:text-blue-300 transition-colors">
                                <a 
                                  href={project.github_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {project.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                                </a>
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Documentation link */}
                        {project.readme_url && (
                          <div className="flex items-center gap-3 bg-gray-700/30 border border-gray-600/40 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-300">
                            <div className="p-2 rounded-full bg-gray-800/70 border border-gray-600/40">
                              <BookOpen className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-sm font-medium text-white">Documentation</p>
                              <p className="text-xs text-gray-400 truncate hover:text-blue-300 transition-colors">
                                <a 
                                  href={project.readme_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View documentation
                                </a>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons with enhanced styling for desktop */}
<div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-700/30">
  <motion.button
    onClick={handleUseProject}
    disabled={!project.app_url || isArchived}
    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg shadow-blue-500/20"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    aria-label="Open project application"
  >
    <ExternalLink className="w-4 h-4" />
    Open Project
  </motion.button>
  
  {project.github_url && (
    <motion.a
      href={project.github_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/40 border border-gray-600/40 text-white hover:bg-gray-600/50 hover:border-gray-500/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="View source code on GitHub"
      tabIndex={isArchived ? -1 : 0}
      style={isArchived ? { pointerEvents: 'none' } : {}}
      onClick={(e) => e.stopPropagation()}
    >
      <Github className="w-4 h-4" />
      Source Code
    </motion.a>
  )}
  
  {project.readme_url && (
    <motion.a
      href={project.readme_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/40 border border-gray-600/40 text-white hover:bg-gray-600/50 hover:border-gray-500/60 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="View project documentation"
      tabIndex={isArchived ? -1 : 0}
      style={isArchived ? { pointerEvents: 'none' } : {}}
      onClick={(e) => e.stopPropagation()}
    >
      <Info className="w-4 h-4" />
      Documentation
    </motion.a>
  )}
</div>
</>
)}
</motion.div>
)}
</AnimatePresence>

{/* Mobile admin action buttons at bottom */}
{isAdmin && isMobile && (
<div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-700/30">
  <button
    onClick={handleArchiveToggle}
    className={`p-2.5 rounded-full ${isArchived 
      ? 'bg-blue-600/40 border-blue-500/50' 
      : 'bg-gray-700/40 border-gray-600/30'} 
      hover:bg-purple-600/40 hover:border-purple-500/50 transition-colors duration-300 border`}
    title={isArchived ? "Restore project" : "Archive project"}
    aria-label={isArchived ? "Restore project" : "Archive project"}
  >
    {isArchived ? (
      <RefreshCw className="w-4 h-4 text-blue-300" />
    ) : (
      <Archive className="w-4 h-4 text-gray-300" />
    )}
  </button>
  
  <button
    onClick={handleDeleteClick}
    className="p-2.5 rounded-full bg-gray-700/40 border border-gray-600/30 hover:bg-red-600/40 hover:border-red-500/50 transition-colors duration-300"
    title="Delete project"
    aria-label="Delete project"
  >
    <Trash2 className="w-4 h-4 text-gray-300" />
  </button>
</div>
)}
</div>
</div>

{/* Floating button on non-mobile to expand project details in modal/drawer */}
{!isMobile && !isArchived && (
<button
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}`);
  }}
  className="absolute bottom-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white hover:bg-white/20 z-20"
  title="View full details"
  aria-label="View full project details"
>
  <ArrowRight className="w-4 h-4" />
</button>
)}
</motion.div>
);
};