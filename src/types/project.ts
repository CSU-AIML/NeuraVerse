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
  tags: boolean;
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tech_stack: ProjectTechStack[];
  project_lead?: {
    id?: string;
    name?: string;
    position?: string;
    avatar?: string;
  };
  app_url?: string;
  github_url?: string;
  readme_url?: string;
  screenshot_url?: string;
  usage?: string;
  created_at?: string;
  updated_at?: string;
}