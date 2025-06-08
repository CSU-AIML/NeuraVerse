// utils/imageUtils.ts
import { supabase } from '../lib/supabase';
import type { Project, ProjectImageData } from '../types/project';

/**
 * Get the best available image URL for a project
 * Prioritizes Supabase Storage path over external URL
 */
export function getProjectImageUrl(project: Project): string | null {
  // Priority 1: Supabase Storage path
  if (project.image_path) {
    try {
      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(project.image_path);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating Supabase image URL:', error);
      // Fall through to external URL
    }
  }
  
  // Priority 2: External image URL
  if (project.image_url) {
    return project.image_url;
  }
  
  return null;
}

/**
 * Get project image data with metadata
 */
export function getProjectImageData(project: Project): ProjectImageData {
  const imageUrl = project.image_url || null;
  const imagePath = project.image_path || null;
  const hasImage = !!(imagePath || imageUrl);
  
  return {
    imageUrl,
    imagePath,
    hasImage
  };
}

/**
 * Check if a project has any image (either URL or path)
 */
export function hasProjectImage(project: Project): boolean {
  return !!(project.image_path || project.image_url);
}

/**
 * Get image source type
 */
export function getImageSourceType(project: Project): 'storage' | 'external' | 'none' {
  if (project.image_path) return 'storage';
  if (project.image_url) return 'external';
  return 'none';
}

/**
 * Validate external image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  } catch {
    return false;
  }
}

/**
 * Clean up old image when updating project
 * Call this before updating a project with a new image
 */
export async function cleanupOldProjectImage(
  oldImagePath: string | null,
  newImagePath: string | null
): Promise<void> {
  // Only cleanup if we're replacing with a different image or removing image
  if (oldImagePath && oldImagePath !== newImagePath) {
    try {
      await supabase.storage
        .from('project-images')
        .remove([oldImagePath]);
      
      console.log('Cleaned up old image:', oldImagePath);
    } catch (error) {
      console.error('Error cleaning up old image:', error);
      // Don't throw - this shouldn't block the update
    }
  }
}

/**
 * Get optimized image URL with transformations (if using Supabase Pro)
 * Falls back to regular URL if transformations aren't available
 */
export function getOptimizedImageUrl(
  project: Project, 
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'auto';
  }
): string | null {
  const baseUrl = getProjectImageUrl(project);
  if (!baseUrl) return null;
  
  // If it's a Supabase Storage URL and options are provided, add transformations
  if (project.image_path && options) {
    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    
    const transformParams = params.toString();
    if (transformParams) {
      return `${baseUrl}?${transformParams}`;
    }
  }
  
  return baseUrl;
}

/**
 * Generate placeholder image URL for projects without images
 */
export function getPlaceholderImageUrl(projectName: string): string {
  // Using a service like Placeholder.com or UI Avatars
  const encodedName = encodeURIComponent(projectName);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=320&background=1f2937&color=9ca3af&format=png`;
}

/**
 * Migrate project from external URL to Supabase Storage
 * This is a utility function for migration scripts
 */
export async function migrateProjectImageToStorage(
  projectId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    // Download the external image
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    
    // Generate filename
    const timestamp = Date.now();
    const extension = imageUrl.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `migrated-${projectId}-${timestamp}.${extension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(filename, blob);
    
    if (error) throw error;
    
    // Update project record
    await supabase
      .from('projects')
      .update({
        image_path: data.path,
        image_url: null // Clear the old URL
      })
      .eq('id', projectId);
    
    console.log(`Migrated image for project ${projectId}: ${data.path}`);
    return data.path;
    
  } catch (error) {
    console.error(`Failed to migrate image for project ${projectId}:`, error);
    return null;
  }
}