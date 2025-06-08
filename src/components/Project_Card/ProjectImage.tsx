// Project_Card/ProjectImage.tsx - FIXED VERSION
import React, { useState, useMemo, useEffect } from "react";
import { Image, ImageOff } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ProjectImageProps {
  // Support both image URL and storage path
  imageUrl?: string | null;
  imagePath?: string | null;
  projectName: string;
  className?: string;
}

export const ProjectImage: React.FC<ProjectImageProps> = ({
  imageUrl,
  imagePath,
  projectName,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate the final image URL - prioritize Supabase Storage path, fallback to external URL
  const finalImageUrl = useMemo(() => {
    console.log('🖼️ ProjectImage - Debug Info:', {
      projectName,
      imagePath,
      imageUrl,
      hasImagePath: !!imagePath,
      hasImageUrl: !!imageUrl,
    });

    // Priority 1: Supabase Storage path
    if (imagePath && imagePath.trim() !== '') {
      try {
        const { data } = supabase.storage
          .from('project-images')
          .getPublicUrl(imagePath);
        
        console.log('✅ Generated Supabase URL:', data.publicUrl);
        
        // Test if the URL is valid
        const testUrl = data.publicUrl;
        console.log('🔗 Testing URL:', testUrl);
        
        return testUrl;
      } catch (error) {
        console.error('❌ Error generating Supabase image URL:', error);
        // Fall through to external URL if Supabase fails
      }
    } else {
      console.log('⚠️ No image path provided for:', projectName);
    }
    
    // Priority 2: External image URL
    if (imageUrl && imageUrl.trim() !== '') {
      console.log('✅ Using external URL:', imageUrl);
      return imageUrl;
    }
    
    // No image available
    console.log('❌ No image available for project:', projectName);
    return null;
  }, [imagePath, imageUrl, projectName]);

  // Reset loading state when URL changes
  useEffect(() => {
    if (finalImageUrl) {
      setIsLoading(true);
      setHasError(false);
      console.log('🔄 Loading image:', finalImageUrl);
    } else {
      setIsLoading(false);
      setHasError(false);
    }
  }, [finalImageUrl]);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', finalImageUrl);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('❌ Image failed to load:', {
      url: finalImageUrl,
      error: e,
      projectName,
      imagePath,
      imageUrl
    });
    setIsLoading(false);
    setHasError(true);
  };

  // If no image is available, show placeholder
  if (!finalImageUrl) {
    return (
      <div className={`w-20 h-16 bg-gray-800/40 border border-gray-700/40 rounded-lg flex items-center justify-center ${className}`}>
        <ImageOff className="w-6 h-6 text-gray-500" />
        {/* Debug indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            !
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-20 h-16 bg-gray-800/40 border border-gray-700/40 rounded-lg overflow-hidden group ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/60 z-10">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/60">
          <ImageOff className="w-6 h-6 text-gray-500" />
          {/* Debug error indicator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              X
            </div>
          )}
        </div>
      ) : (
        <img
          src={finalImageUrl}
          alt={`${projectName} screenshot`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          crossOrigin="anonymous"
        />
      )}
      
      {/* Hover overlay */}
      {!hasError && (
        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Image className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* Debug indicator for successful images */}
      {process.env.NODE_ENV === 'development' && finalImageUrl && !hasError && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div 
            className={`w-2 h-2 rounded-full ${imagePath ? 'bg-green-500' : 'bg-blue-500'}`} 
            title={imagePath ? `Storage: ${imagePath}` : `External: ${imageUrl}`} 
          />
        </div>
      )}
    </div>
  );
};