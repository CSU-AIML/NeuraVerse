import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import type { ExtendedProject } from "./Project_Card/types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ProjectImage } from "./Project_Card/ProjectImage";
import { supabase } from "../lib/supabase";

// Import all the split components
import {
  PriorityBadge,
  ProjectHeader,
  ProjectDescription,
  ActionButtons,
  TechStack,
  ProjectDetails,
  UsageInstructions,
  LinkButtons,
  MobileTabs,
  ArchiveOverlay,
  MobileAdminActions,
} from "./Project_Card";

interface ProjectCardProps {
  project: ExtendedProject;
  variant?: 'list' | 'grid' | 'compact';
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  priority?: "high" | "medium" | "low";
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  variant = 'list',
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  priority = "medium",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tech" | "links">(
    "overview"
  );
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

  // Clamp helpers for grid/compact views
  const isDense = variant !== 'list';
  const titleClamp = isDense ? 'line-clamp-1' : 'line-clamp-2';
  const descClamp = variant === 'compact' ? 'line-clamp-2' : isDense ? 'line-clamp-3' : 'line-clamp-5';

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isArchived
          ? "border border-slate-700/40 bg-slate-900/40"
          : "border border-slate-700/60 bg-slate-900/50 hover:bg-slate-900/70 hover:border-slate-500/60"
      } backdrop-blur-xl shadow-lg hover:shadow-2xl ring-1 ring-white/5`}
      onClick={() => isMobile && !isExpanded && setIsExpanded(true)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Archive overlay */}
      {isArchived && (
        <ArchiveOverlay
          projectName={project.name}
          isAdmin={isAdmin}
          projectId={project.id}
          onUnarchive={onUnarchive}
        />
      )}

      {/* Main content */}
      <div className={`relative z-10 ${isDense ? 'p-4' : 'p-6'} ${isArchived ? "opacity-60" : ""}`}>
        {isDense ? (
          // Minimal grid/compact card layout
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <ProjectImage
                  imageUrl={project.image_url}
                  imagePath={project.image_path}
                  projectName={project.name}
                  className="ring-1 ring-slate-600/40 rounded-lg overflow-hidden w-[80px] h-[60px] object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-white font-semibold truncate ${titleClamp}`}>{project.name}</h3>
                  <PriorityBadge priority={priority} />
                </div>
                <div className="mt-1 text-xs text-slate-400 flex items-center gap-3">
                  {project.project_lead?.name && <span className="truncate">{project.project_lead.name}</span>}
                  {project.updated_at && <span className="truncate">{new Date(project.updated_at).toLocaleDateString()}</span>}
                  {techStack.length > 0 && <span>{techStack.length} tech</span>}
                </div>
              </div>
            </div>

            <p className={`text-slate-300 text-sm ${descClamp}`}>{project.description}</p>

            <div className="flex items-center justify-between">
              <button
                onClick={handleUseProject}
                className="px-3 py-1.5 text-sm bg-blue-600/80 hover:bg-blue-600 rounded-lg text-white transition-colors"
              >
                Open
              </button>
              <ActionButtons
                isAdmin={isAdmin}
                isArchived={isArchived}
                isMobile={true}
                isExpanded={false}
                onEdit={handleEdit}
                onArchiveToggle={handleArchiveToggle}
                onDelete={handleDeleteClick}
                onToggleExpand={toggleExpand}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Header Section with Image */}
            <div className={`flex items-start gap-4 ${isDense ? 'mb-4' : 'mb-6'}`}>
              {/* Project Image Container */}
              <div className="flex-shrink-0">
                <ProjectImage
                  imageUrl={project.image_url}
                  imagePath={project.image_path}  
                  projectName={project.name}
                  className="ring-1 ring-slate-600/40 hover:ring-slate-400/60 transition-all duration-300 rounded-xl overflow-hidden"
                />
              </div>

              {/* Header Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <ProjectHeader
                    project={project}
                    techStackLength={techStack.length}
                  />

                  {/* Action Buttons & Priority */}
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {/* Priority Badge */}
                    <PriorityBadge priority={priority} />

                    <ActionButtons
                      isAdmin={isAdmin}
                      isArchived={isArchived}
                      isMobile={isMobile}
                      isExpanded={isExpanded}
                      onEdit={handleEdit}
                      onArchiveToggle={handleArchiveToggle}
                      onDelete={handleDeleteClick}
                      onToggleExpand={toggleExpand}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={`relative ${descClamp}`}>
              <div className="absolute inset-0 rounded-xl bg-white/2" />
              <ProjectDescription description={project.description} />
            </div>

            {/* Content Areas - Desktop always shows, Mobile shows when expanded */}
            {(!isMobile || isExpanded) && (
              <div className="space-y-6">
                {/* Mobile Tabs */}
                {isMobile && (
                  <MobileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                )}

                {/* Mobile Tab Content */}
                {isMobile ? (
                  <div className="space-y-4">
                    {activeTab === "overview" && (
                      <div className="space-y-4">
                        <ProjectDetails project={project} variant="mobile" />
                        <UsageInstructions usage={project.usage} variant="mobile" />
                      </div>
                    )}

                    {activeTab === "tech" && (
                      <TechStack techStack={techStack} variant="mobile" />
                    )}

                    {activeTab === "links" && (
                      <LinkButtons
                        project={project}
                        isAdmin={isAdmin}
                        variant="mobile"
                        onUseProject={handleUseProject}
                      />
                    )}
                  </div>
                ) : (
                  /* Desktop Layout */
                  <div className={`grid grid-cols-1 lg:grid-cols-3 ${isDense ? 'gap-4' : 'gap-6'}`}>
                    {/* Left Column - Project Info */}
                    <div className={`lg:col-span-1 ${isDense ? 'space-y-3' : 'space-y-4'}`}>
                      <ProjectDetails project={project} variant={isDense ? 'mobile' : 'desktop'} />
                      <TechStack techStack={techStack.slice(0, isDense ? 6 : 12)} variant={isDense ? 'mobile' : 'desktop'} />
                    </div>

                    {/* Right Column - Usage & Links */}
                    <div className={`lg:col-span-2 ${isDense ? 'space-y-3' : 'space-y-4'}`}>
                      <UsageInstructions usage={project.usage} variant={isDense ? 'mobile' : 'desktop'} />
                      <LinkButtons
                        project={project}
                        isAdmin={isAdmin}
                        variant={isDense ? 'mobile' : 'desktop'}
                        onUseProject={handleUseProject}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Admin Actions */}
                {isAdmin && isMobile && (
                  <MobileAdminActions
                    isArchived={isArchived}
                    onEdit={handleEdit}
                    onArchiveToggle={handleArchiveToggle}
                    onDelete={handleDeleteClick}
                  />
                )}
              </div>
            )}
          </>
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
