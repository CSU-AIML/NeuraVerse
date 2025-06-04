import React, { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  Github,
  Archive,
  Edit,
  Trash2,
  Info,
  Calendar,
  User,
  Code,
  CheckCircle,
  Lock,
  ArrowRight,
  RefreshCw,
  Star,
  ChevronDown,
  ChevronUp,
  BarChart,
  Zap,
  BookOpen,
  Clock,
  Activity,
  Folder,
  Globe,
} from "lucide-react";
import type { Project } from "../types/project";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  priority?: "high" | "medium" | "low";
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  priority = "medium",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tech" | "links">("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const cardRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const isArchived = project.status?.toLowerCase() === "archived";

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  // Handle click outside to collapse on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        isExpanded &&
        isMobile
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    ? project.tech_stack.filter(
        (tech) => tech && typeof tech === "object" && tech.name
      )
    : [];

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      console.error("Invalid date format:", dateString, e);
      return "Invalid date";
    }
  };

  const handleUseProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      project.app_url &&
      typeof project.app_url === "string" &&
      project.app_url.trim() !== ""
    ) {
      try {
        new URL(project.app_url);
        window.open(project.app_url, "_blank", "noopener,noreferrer");
      } catch (e) {
        console.error("Invalid URL format:", project.app_url);
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

  const getStatusConfig = () => {
    const configs = {
      ongoing: {
        color: "emerald",
        icon: Zap,
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        dot: "bg-emerald-400"
      },
      completed: {
        color: "blue", 
        icon: CheckCircle,
        bg: "bg-blue-500/10",
        border: "border-blue-500/30", 
        text: "text-blue-400",
        dot: "bg-blue-400"
      },
      archived: {
        color: "gray",
        icon: Archive,
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
        text: "text-gray-400", 
        dot: "bg-gray-400"
      },
      live: {
        color: "purple",
        icon: Activity,
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-400",
        dot: "bg-purple-400"
      },
      paused: {
        color: "amber",
        icon: Clock,
        bg: "bg-amber-500/10", 
        border: "border-amber-500/30",
        text: "text-amber-400",
        dot: "bg-amber-400"
      },
      planning: {
        color: "orange",
        icon: Calendar,
        bg: "bg-orange-500/10",
        border: "border-orange-500/30", 
        text: "text-orange-400",
        dot: "bg-orange-400"
      }
    };

    return configs[project.status?.toLowerCase() as keyof typeof configs] || configs.ongoing;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getPriorityConfig = () => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-red-500/15",
          border: "border-red-500/40",
          text: "text-red-400",
          icon: "🔥"
        };
      case "medium":
        return {
          bg: "bg-blue-500/15", 
          border: "border-blue-500/40",
          text: "text-blue-400",
          icon: "⭐"
        };
      case "low":
        return {
          bg: "bg-gray-500/15",
          border: "border-gray-500/40", 
          text: "text-gray-400",
          icon: "📋"
        };
      default:
        return null;
    }
  };

  const priorityConfig = getPriorityConfig();

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isArchived
          ? "border border-gray-700/40 bg-gray-900/30"
          : "border border-gray-700/50 bg-gray-900/40 hover:bg-gray-900/60 hover:border-gray-600/60"
      } backdrop-blur-xl shadow-lg hover:shadow-xl`}
      onClick={() => isMobile && !isExpanded && setIsExpanded(true)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
             backgroundSize: '20px 20px'
           }} />

      {/* Archive overlay */}
      {isArchived && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="text-center px-8 py-6 rounded-xl bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-w-sm mx-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {project.name || "Untitled Project"}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              This project has been archived and is no longer active.
            </p>

            {isAdmin && onUnarchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnarchive(project.id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Restore Project
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-10 p-6 ${isArchived ? "opacity-60" : ""}`}>
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            {/* Project Title */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-200 transition-colors">
                {project.name || "Untitled Project"}
              </h3>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} border`}>
                <div className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                <StatusIcon className="w-3.5 h-3.5" />
                <span>
                  {project.status
                    ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
                    : "Ongoing"}
                </span>
              </div>
            </div>

            {/* Project Meta Row */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{project.project_lead?.name || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.updated_at)}</span>
              </div>
              {techStack.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  <span>{techStack.length} technologies</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & Priority */}
          <div className="flex items-center gap-2 ml-4">
            {/* Priority Badge */}
            {priorityConfig && (
              <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${priorityConfig.bg} ${priorityConfig.border} ${priorityConfig.text} border flex items-center gap-1.5`}>
                <span>{priorityConfig.icon}</span>
                <span className="capitalize">{priority}</span>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex gap-1">
              {isAdmin ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-blue-600/20 hover:border-blue-500/50 text-gray-300 hover:text-blue-300 transition-all"
                    title="Edit project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleArchiveToggle}
                    className={`p-2 rounded-lg border transition-all ${
                      isArchived
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                        : "bg-gray-800/60 border-gray-700/50 hover:bg-purple-600/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-300"
                    }`}
                    title={isArchived ? "Restore project" : "Archive project"}
                  >
                    {isArchived ? (
                      <RefreshCw className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={handleDeleteClick}
                    className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-red-600/20 hover:border-red-500/50 text-gray-300 hover:text-red-300 transition-all"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="p-2 rounded-lg bg-gray-800/40 border border-gray-700/30" title="Admin access required">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>

            {/* Mobile expand toggle */}
            {isMobile && !isArchived && (
              <button
                onClick={toggleExpand}
                className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white transition-all md:hidden"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="mb-6">
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <p className="text-gray-300 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>
        )}

        {/* Content Areas - Desktop always shows, Mobile shows when expanded */}
        {(!isMobile || isExpanded) && (
          <div className="space-y-6">
            {/* Mobile Tabs */}
            {isMobile && (
              <div className="flex rounded-xl bg-gray-800/40 border border-gray-700/40 p-1">
                {["overview", "tech", "links"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
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
            )}

            {/* Mobile Tab Content */}
            {isMobile ? (
              <div className="space-y-4">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Project Details */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">Project Lead</h4>
                            <p className="text-xs text-gray-400">
                              {project.project_lead?.name || "Unassigned"}
                            </p>
                          </div>
                        </div>
                        {project.project_lead?.position && (
                          <p className="text-xs text-gray-500 ml-11">
                            {project.project_lead.position}
                          </p>
                        )}
                      </div>

                      {project.usage && (
                        <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                              <Info className="w-4 h-4 text-green-400" />
                            </div>
                            <h4 className="text-sm font-medium text-white">Usage Instructions</h4>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {project.usage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "tech" && (
                  <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                        <Code className="w-4 h-4 text-purple-400" />
                      </div>
                      <h4 className="text-sm font-medium text-white">Technology Stack</h4>
                    </div>

                    {techStack.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {techStack.map((tech, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600/40 text-gray-200 text-xs font-medium hover:bg-gray-600/50 transition-colors"
                          >
                            {tech.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No technologies specified</p>
                    )}
                  </div>
                )}

                {activeTab === "links" && (
                  <div className="space-y-3">
                    {project.app_url && (
                      <button
                        onClick={handleUseProject}
                        className="w-full flex items-center gap-3 bg-blue-600/20 border border-blue-500/40 rounded-xl p-4 text-blue-200 hover:bg-blue-600/30 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Open Application</div>
                          <div className="text-xs text-blue-300/70">Launch live project</div>
                        </div>
                      </button>
                    )}

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 text-gray-200 hover:bg-gray-700/40 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">View Source Code</div>
                          <div className="text-xs text-gray-400">GitHub repository</div>
                        </div>
                      </a>
                    )}

                    {project.readme_url && (
                      <a
                        href={project.readme_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 text-gray-200 hover:bg-gray-700/40 transition-colors"
                      >
                        <BookOpen className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Documentation</div>
                          <div className="text-xs text-gray-400">Project docs</div>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Project Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Folder className="w-4 h-4 text-blue-400" />
                      Project Details
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-white">
                            {project.project_lead?.name || "Unassigned"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {project.project_lead?.position || "Project Lead"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-white">Last Updated</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(project.updated_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {techStack.length > 0 && (
                    <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-purple-400" />
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 rounded-md bg-gray-700/60 border border-gray-600/40 text-gray-300 text-xs font-medium hover:bg-gray-600/60 transition-colors"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Usage & Links */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Usage Instructions */}
                  {project.usage && (
                    <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-green-400" />
                        Usage Instructions
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed text-justify">
                        {project.usage}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {project.app_url && (
                      <button
                        onClick={handleUseProject}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-500 border border-blue-500/50 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Globe className="w-4 h-4" />
                        Open Application
                      </button>
                    )}

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-200 rounded-lg font-medium transition-all"
                        onClick={(e) => e.stopPropagation()}
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-200 rounded-lg font-medium transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookOpen className="w-4 h-4" />
                        Documentation
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Admin Actions */}
            {isAdmin && isMobile && (
              <div className="flex justify-center gap-3 pt-4 border-t border-gray-700/30">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700/60 border border-gray-600/50 text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-600/60 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={handleArchiveToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    isArchived
                      ? "bg-blue-600/60 border-blue-500/50 text-blue-200"
                      : "bg-gray-700/60 border-gray-600/50 text-gray-200 hover:bg-purple-600/60 hover:border-purple-500/50"
                  }`}
                >
                  {isArchived ? <RefreshCw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  {isArchived ? "Restore" : "Archive"}
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/60 border border-red-500/50 text-red-200 rounded-lg text-sm font-medium hover:bg-red-500/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop hover indicator */}
      {!isMobile && !isArchived && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${project.id}`);
          }}
          className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 text-white hover:bg-white/20 transition-all"
          title="View full details"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};