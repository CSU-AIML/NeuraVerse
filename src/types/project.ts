// Types for project-related data

import { ProjectStatus } from "../pages/NewProject";

export interface ProjectTechStack {
  name: string;
  icon: string;
}

export interface ProjectLead {
  id: string;
  name?: string;
  position?: string;
  email?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  usage: string;
  tech_stack: { name: string; icon?: string }[];
  app_url: string;
  colab_url: string;
  github_url: string;
  readme_url: string;
  screenshot_url: string;
  image_path?: string;     // *** Make sure this exists ***
  image_url?: string;      // *** Add this if missing ***
  status: 'ongoing' | 'archived' | string;
  project_lead_id: string;
  project_lead?: {
    id?: string;
    name?: string;
    position?: string;
    avatar?: string;
    firebase_uid?: string;
  };
  created_at: string;
  updated_at: string;
  tags: boolean;
}

// If you're using ExtendedProject elsewhere, make sure it extends Project
export interface ExtendedProject extends Project {
  // Any additional fields
  firebase_user_id?: string;
  project_lead?: {
    id?: string;
    name?: string;
    position?: string;
    avatar?: string;
    firebase_uid?: string;
  };
}

// Utility type for project creation/editing
export interface ProjectFormData {
  name: string;
  description: string;
  usage: string;
  tech_stack: ProjectTechStack[];
  app_url?: string;
  colab_url?: string;
  github_url?: string;
  readme_url?: string;
  screenshot_url?: string;
  image_url?: string;      // External image URL
  image_path?: string;     // Supabase Storage path
  status: ProjectStatus;
  project_lead?: {
    name?: string;
    position?: string;
  };
}

// Type for image handling in components
export interface ProjectImageData {
  imageUrl?: string | null;     // External URL
  imagePath?: string | null;    // Supabase Storage path
  hasImage: boolean;
}

// Helper type for tech stack operations
export interface TechStackItem {
  name: string;
  icon?: string;
}

// Type for project status options
export type ProjectStatusType = 
  | 'planning' 
  | 'ongoing' 
  | 'live' 
  | 'completed' 
  | 'archived' 
  | 'paused';

// Type for project priorities (if you want to add this feature)
export type ProjectPriority = 'high' | 'medium' | 'low';

// Type for project card props
export interface ProjectCardProps {
  project: ExtendedProject;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  priority?: ProjectPriority;
}