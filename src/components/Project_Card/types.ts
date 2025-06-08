// components/project_card/types.ts
import type { Project as BaseProject } from "../../types/project";

// Extended project lead interface that includes position
export interface ProjectLead {
  name: string;
  position?: string;
}

// Extended project interface with proper project_lead typing
export interface ExtendedProject extends Omit<BaseProject, 'project_lead'> {
  project_lead?: ProjectLead;
}

// Re-export the original Project type for compatibility
export type { Project } from "../../types/project";