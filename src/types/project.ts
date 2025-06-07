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
  status: 'ongoing' | 'archived' | string;
  project_lead_id: string;
  project_lead: { name: string };
  created_at: string;
  updated_at: string;
  tags: boolean;
}