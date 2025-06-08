// utils/projectFilters.ts
import type { Project } from '../types/project';

export type SortOption = 'name' | 'date' | 'status' | 'tech';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  statusFilter: string[];
  techFilter: string[];
  sortBy: SortOption;
  sortDirection: SortDirection;
  dateRange: 'all' | 'week' | 'month' | 'year';
}

export const applyProjectFilters = (
  projects: Project[], 
  filters: FilterState
): Project[] => {
  let filtered = [...projects];

  // Text search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(project => 
      project.name?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.usage?.toLowerCase().includes(query) ||
      project.project_lead?.name?.toLowerCase().includes(query) ||
      (Array.isArray(project.tech_stack) && 
        project.tech_stack.some((tech: any) => 
          tech.name?.toLowerCase().includes(query)
        ))
    );
  }

  // Status filter
  if (filters.statusFilter.length > 0) {
    filtered = filtered.filter(project => 
      filters.statusFilter.includes(project.status || '')
    );
  }

  // Tech stack filter
  if (filters.techFilter.length > 0) {
    filtered = filtered.filter(project => {
      if (!Array.isArray(project.tech_stack)) return false;
      
      return filters.techFilter.some(tech => 
        project.tech_stack.some((projectTech: any) => 
          projectTech.name === tech
        )
      );
    });
  }

  // Date range filter
  if (filters.dateRange !== 'all') {
    const now = new Date();
    const filterDate = new Date();
    
    switch (filters.dateRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    filtered = filtered.filter(project => {
      const updatedAt = project.updated_at ? new Date(project.updated_at) : new Date(0);
      return updatedAt >= filterDate;
    });
  }

  // Sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      
      case 'date':
        const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      
      case 'status':
        const statusOrder = ['live', 'ongoing', 'planning', 'completed', 'paused', 'archived'];
        const statusA = statusOrder.indexOf(a.status || '');
        const statusB = statusOrder.indexOf(b.status || '');
        comparison = statusA - statusB;
        break;
      
      case 'tech':
        const techA = Array.isArray(a.tech_stack) ? a.tech_stack.length : 0;
        const techB = Array.isArray(b.tech_stack) ? b.tech_stack.length : 0;
        comparison = techA - techB;
        break;
      
      default:
        comparison = 0;
    }

    return filters.sortDirection === 'desc' ? -comparison : comparison;
  });

  return filtered;
};

export const getDefaultFilterState = (): FilterState => ({
  searchQuery: '',
  statusFilter: [],
  techFilter: [],
  sortBy: 'date',
  sortDirection: 'desc',
  dateRange: 'all'
});