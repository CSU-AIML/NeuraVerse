// components/ImageUpload.tsx - Fixed version with proper authentication
import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadFileWithAuth } from '../lib/supabaseAuth';
import { useAuth } from '../contexts/AuthContext';

interface ImageUploadProps {
  onImageUpload: (imagePath: string | null) => void;
  currentImagePath?: string | null;
  projectName?: string;
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImagePath,
  projectName = 'project',
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get auth context
  const { user, isAuthenticated } = useAuth();

  // Get the public URL for the current image
  const getCurrentImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    
    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  };

  const currentImageUrl = getCurrentImageUrl(currentImagePath ?? null);

  // Validate file
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }

    return null;
  };

  // Generate unique filename
  const generateFileName = (file: File): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const extension = file.name.split('.').pop();
    
    return `${sanitizedProjectName}-${timestamp}-${randomString}.${extension}`;
  };

  // Handle file upload with multiple fallback methods
  const handleFileUpload = async (file: File) => {
    if (!isAuthenticated || !user) {
      setUploadError('You must be logged in to upload images');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Delete old image if exists
      if (currentImagePath) {
        try {
          await supabase.storage
            .from('project-images')
            .remove([currentImagePath]);
        } catch (deleteError) {
          console.warn('Could not delete old image:', deleteError);
          // Don't fail the upload if we can't delete the old image
        }
      }

      // Generate unique filename
      const fileName = generateFileName(file);

      // Try multiple upload methods
      let uploadResult = null;
      let uploadError = null;

      // Method 1: Try with authentication helper
      try {
        console.log('Attempting upload with auth helper...');
        uploadResult = await uploadFileWithAuth('project-images', fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
        if (uploadResult.error) {
          throw uploadResult.error;
        }
      } catch (authError) {
        console.warn('Auth helper upload failed:', authError);
        
        // Method 2: Try direct upload
        try {
          console.log('Attempting direct upload...');
          const { data, error } = await supabase.storage
            .from('project-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw error;
          }
          
          uploadResult = { data, error: null };
        } catch (directError) {
          console.warn('Direct upload failed:', directError);
          uploadError = directError;
        }
      }

      // Check if upload was successful
      if (uploadResult && uploadResult.data) {
        // Call the callback with the file path
        onImageUpload(uploadResult.data.path);
        console.log('✅ Image uploaded successfully:', uploadResult.data.path);
      } else {
        throw uploadError || new Error('Upload failed with unknown error');
      }

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to upload image';
      
      if (error.message?.includes('row-level security')) {
        errorMessage = 'Authentication error. Please try logging out and back in.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Storage configuration error. Please contact support.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    if (!currentImagePath && !previewUrl) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Delete from Supabase Storage if it's an uploaded image
      if (currentImagePath) {
        await supabase.storage
          .from('project-images')
          .remove([currentImagePath]);
      }

      // Clear preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Call callback with null
      onImageUpload(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Error removing image:', error);
      setUploadError(error.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Authentication Warning */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">Please log in to upload images</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
          ${disabled || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
          ${displayImageUrl ? 'p-2' : 'p-6'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={displayImageUrl ? undefined : triggerFileInput}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || !isAuthenticated}
        />

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Uploading image...</p>
            </div>
          </div>
        )}

        {/* Image preview */}
        {displayImageUrl ? (
          <div className="relative group">
            <img
              src={displayImageUrl}
              alt="Project preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Image overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                disabled={disabled || isUploading || !isAuthenticated}
                title="Change image"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                disabled={disabled || isUploading}
                title="Remove image"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload prompt */
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 p-3 bg-gray-800 rounded-full">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Upload Project Image
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              {isAuthenticated ? 
                'Drag and drop an image here, or click to select a file' :
                'Please log in to upload images'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-600">
              <span>Supports: JPEG, PNG, WebP, GIF</span>
              <span className="hidden sm:inline">•</span>
              <span>Max size: 5MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{uploadError}</p>
            {uploadError.includes('Authentication') && (
              <p className="text-xs text-red-400 mt-1">
                Try refreshing the page or logging out and back in
              </p>
            )}
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-600 space-y-1">
          <p>🔍 <strong>Debug Info:</strong></p>
          <p>Auth: {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}</p>
          <p>User: {user?.uid ? `✅ ${user.uid.substring(0, 8)}...` : '❌ No user'}</p>
        </div>
      )}
    </div>
  );
};