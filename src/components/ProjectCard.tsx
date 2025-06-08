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
      <div className={`relative z-10 p-6 ${isArchived ? "opacity-60" : ""}`}>
        {/* Header Section with Image */}
        <div className="flex items-start gap-4 mb-6">
          {/* Project Image Container */}
          <div className="flex-shrink-0">
            
            <ProjectImage
              imageUrl={project.image_url}
              imagePath={project.image_path}
              projectName={project.name}
              className="ring-1 ring-gray-600/40 hover:ring-gray-500/60 transition-all duration-300"
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
        <ProjectDescription description={project.description} />

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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Project Info */}
                <div className="lg:col-span-1 space-y-4">
                  <ProjectDetails project={project} variant="desktop" />
                  <TechStack techStack={techStack} variant="desktop" />
                </div>

                {/* Right Column - Usage & Links */}
                <div className="lg:col-span-2 space-y-4">
                  <UsageInstructions usage={project.usage} variant="desktop" />
                  <LinkButtons
                    project={project}
                    isAdmin={isAdmin}
                    variant="desktop"
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
