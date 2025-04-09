import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Terminal, X, AlertTriangle } from 'lucide-react';
import { checkSupabaseConnection, supabase } from '../lib/supabase';
import type { ProjectTechStack } from '../types/project';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../components/AlertContext';

// Import CSS for animations
import '../alert-animations.css';

export type ProjectStatus = 'live' | 'planning' | 'ongoing' | 'completed' | 'archived' | 'paused';
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tech_stack: Array<{ name: string }>;
  project_lead?: {
    name: string;
    position: string;
    avatar: string;
  };
  app_url?: string;
  github_url?: string;
  readme_url?: string;
  screenshot_url?: string;
  usage?: string;
  updated_at?: string;
  // ... any other fields you have
}

export function NewProject() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techStack, setTechStack] = useState<ProjectTechStack[]>([]);
  const [newTech, setNewTech] = useState('');
  const [projectLeadName, setProjectLeadName] = useState('');
  const [projectLeadPosition, setProjectLeadPosition] = useState('');

  // Use our auth context
  const { user, isAdmin, isLoading } = useAuth();
  
  // Use our alert context
  const { showAlert, clearAlerts } = useAlert();

  // If not loading and either not authenticated or not admin, redirect back
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      showAlert(
        'Access Restricted', 
        'You need admin privileges to access this page. Redirecting to dashboard...', 
        'warning'
      );
      
      // Slight delay to ensure user sees the message
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [user, isAdmin, isLoading, navigate, showAlert]);

  // In handleSubmit function of NewProject.tsx
  
  // Updated handleSubmit function for NewProject.tsx
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user || !isAdmin) {
      showAlert(
        'Permission Denied', 
        'You need admin privileges to create projects', 
        'error'
      );
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validate form fields
      const projectName = formData.get('name') as string;
      if (!projectName || projectName.trim().length < 3) {
        showAlert(
          'Validation Error', 
          'Project name must be at least 3 characters long', 
          'error'
        );
        setIsSubmitting(false);
        return;
      }
      
      // Current timestamp for created_at and updated_at
      const now = new Date().toISOString();
      
      const projectData = {
        name: projectName,
        description: formData.get('description') as string,
        usage: formData.get('usage') as string,
        tech_stack: techStack.length > 0 ? techStack : [{ name: 'Unspecified', icon: 'code' }],
        app_url: formData.get('appUrl') ? (formData.get('appUrl') as string) : null,
        github_url: formData.get('githubUrl') as string || null,
        readme_url: formData.get('readmeUrl') as string || null,
        screenshot_url: formData.get('screenshotUrl') as string || null,
        status: formData.get('status') as string || 'ongoing',
        // Store Firebase UID as text to match your column type
        firebase_user_id: user.id, 
        project_lead: {
          firebase_uid: user.id,
          name: projectLeadName || user.display_name || 'Admin',
          position: projectLeadPosition || 'Project Lead'
        },
        created_at: now,
        updated_at: now
      };

      // Show processing alert
      showAlert(
        'Processing', 
        'Creating your project...', 
        'info', 
        { autoClose: false }
      );
      
      // Check Supabase connection before attempting insert
      try {
        // First check if we have network connectivity at all
        try {
          await fetch('https://www.google.com', { mode: 'no-cors', cache: 'no-store' });
        } catch (e) {
          throw new Error('No internet connection detected. Please check your network connection and try again.');
        }
        
        // Add a connection check (import this from supabase.ts)
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your configuration and try again.');
        }
        
        console.log('Attempting to insert project data:', projectData);
        
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select();

        if (error) {
          console.error('Database Error Details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          let errorMessage = error.message;
          
          // Provide more specific error messages based on error codes
          if (error.code === '23505') {
            errorMessage = 'A project with this name already exists.';
          } else if (error.code === '23503') {
            errorMessage = 'Invalid reference to another resource. Check project lead information.';
          } else if (error.code === '42P01') {
            errorMessage = 'The projects table does not exist. Database setup issue.';
          } else if (error.code === 'PGRST301' || error.code === 'PGRST302') {
            errorMessage = 'Authentication error. Please log out and log back in.';
          } else if (error.message.includes('network')) {
            errorMessage = 'Network error. Check your internet connection.';
          }
          
          showAlert(
            'Database Error', 
            `Failed to create project: ${errorMessage}`, 
            'error'
          );
          throw error;
        }
        
        // Success alert
        showAlert(
          'Success!', 
          'Project created successfully', 
          'success',
          { autoClose: true, duration: 1500 }
        );

        // Redirect after a brief delay
        setTimeout(() => {
          clearAlerts();
          navigate('/dashboard');
        }, 1500);
      } catch (error: any) {
        console.error('Detailed error:', error);
        
        // Check for specific network errors
        if (error.message === 'Failed to fetch') {
          showAlert(
            'Connection Error', 
            'Failed to connect to the database. Please check your network connection and try again.', 
            'error'
          );
        } else {
          showAlert(
            'Error', 
            `Failed to create project: ${error.message || 'Unknown error occurred'}`, 
            'error'
          );
        }
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      // More detailed error message
      if (error.code) console.error('Error code:', error.code);
      if (error.details) console.error('Error details:', error.details);
      
      showAlert(
        'Error', 
        `Failed to create project: ${error.message || 'Unknown error occurred'}`, 
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTechStack = () => {
    if (newTech.trim()) {
      setTechStack([...techStack, { name: newTech.trim(), icon: 'code' }]);
      setNewTech('');
      
      // Show a quick success alert
      showAlert(
        'Technology Added', 
        `Added ${newTech.trim()} to tech stack`, 
        'success', 
        { duration: 2000 }
      );
    } else {
      // Show warning if trying to add empty tech
      showAlert(
        'Warning', 
        'Please enter a technology name', 
        'warning', 
        { duration: 2000 }
      );
    }
  };

  const removeTechStack = (index: number) => {
    const techToRemove = techStack[index].name;
    setTechStack(techStack.filter((_, i) => i !== index));
    
    // Show removal notification
    showAlert(
      'Technology Removed', 
      `Removed ${techToRemove} from tech stack`, 
      'info', 
      { duration: 2000 }
    );
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 transform hover:translate-x-1 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:animate-bounce-x" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="p-8 bg-gray-900/70 backdrop-blur-xl rounded-lg border border-red-600/30 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-900/30 border border-red-700/30 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">Admin Access Required</h2>
            </div>
            
            <p className="mb-4 text-gray-300">You don't have the necessary permissions to create new projects.</p>
            <p className="mb-6 text-gray-400">Only administrators can create and manage projects. You're being redirected to the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Enhanced UI for admin users
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 w-full bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 py-4 px-6 z-10 shadow-md">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 transform hover:translate-x-1 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:animate-bounce-x" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-gradient">Create New Project</h1>
        </div>
      </div>

      {/* Main Content Area with form */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-2xl transition-all duration-500 hover:shadow-blue-900/20 animate-fadeIn">
          {/* Form Header */}
          <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-gray-800/60 rounded-t-xl">
            <h2 className="text-2xl font-bold text-white">Project Details</h2>
            <p className="text-gray-400 mt-1">Fill in the details below to create your new project</p>
          </div>

          {/* Form Content - Two Columns Layout */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-5 transition-all duration-300 transform hover:translate-y-[-2px]">
                <h3 className="text-xl font-semibold text-blue-400 border-b border-gray-800/50 pb-2 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-900/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Basic Information
                </h3>
                
                <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                  <span className="text-gray-200 font-medium flex items-center gap-1">
                    Project Name 
                    <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                    placeholder="Enter project name"
                  />
                </label>

                <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                  <span className="text-gray-200 font-medium">Description <span className="text-red-500">*</span></span>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90 resize-none"
                    placeholder="Describe your project"
                  />
                </label>

                <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                  <span className="text-gray-200 font-medium">Usage & Applications <span className="text-red-500">*</span></span>
                  <textarea
                    name="usage"
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90 resize-none"
                    placeholder="Describe how this project can be used"
                  />
                </label>
              </div>

              {/* Tech Stack Section */}
              <div className="space-y-5 transition-all duration-300 transform hover:translate-y-[-2px]">
                <h3 className="text-xl font-semibold text-blue-400 border-b border-gray-800/50 pb-2 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-900/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </span>
                  Tech Stack & Status
                </h3>
                
                <div className="block">
                  <span className="text-gray-200 font-medium">Tech Stack <span className="text-red-500">*</span></span>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      className="flex-1 rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                      placeholder="Add technology"
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechStack();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTechStack}
                      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-1 hover:shadow-lg hover:shadow-blue-700/30 transform hover:translate-y-[-2px]"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-800/40 backdrop-blur-md rounded-lg min-h-16 border border-gray-700/50 transition-all duration-300 hover:border-blue-900/50">
                    {techStack.length === 0 && (
                      <span className="text-gray-500 text-sm italic">No technologies added yet</span>
                    )}
                    {techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-900/40 backdrop-blur-sm rounded-full text-sm flex items-center gap-2 border border-blue-800/50 transition-all duration-300 hover:bg-blue-800/60 hover:border-blue-700 animate-fadeIn"
                      >
                        {tech.name}
                        <button
                          type="button"
                          onClick={() => removeTechStack(index)}
                          className="text-gray-400 hover:text-white transition-colors duration-200 hover:bg-red-900/40 rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                  <span className="text-gray-200 font-medium">Project Status <span className="text-red-500">*</span></span>
                  <select
                    name="status"
                    required
                    defaultValue="ongoing"
                    className="mt-1 block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90 cursor-pointer"
                  >
                    <option value="planning">Planning</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Team Information */}
              <div className="space-y-5 transition-all duration-300 transform hover:translate-y-[-2px]">
                <h3 className="text-xl font-semibold text-blue-400 border-b border-gray-800/50 pb-2 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-900/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  Team Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                    <span className="text-gray-200 font-medium">Project Lead</span>
                    <input
                      type="text"
                      value={projectLeadName}
                      onChange={(e) => setProjectLeadName(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                      placeholder="Enter project lead name"
                    />
                  </label>

                  <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                    <span className="text-gray-200 font-medium">Position</span>
                    <input
                      type="text"
                      value={projectLeadPosition}
                      onChange={(e) => setProjectLeadPosition(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                      placeholder="E.g. Senior Developer, Team Lead"
                    />
                  </label>
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-5 transition-all duration-300 transform hover:translate-y-[-2px]">
                <h3 className="text-xl font-semibold text-blue-400 border-b border-gray-800/50 pb-2 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-900/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  Project Links
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                      <span className="text-gray-200 font-medium">Application URL</span>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </span>
                        <input
                          type="url"
                          name="appUrl"
                          className="block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                          placeholder="https://myapp.example.com"
                        />
                      </div>
                    </label>

                    <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                      <span className="text-gray-200 font-medium">GitHub Repository</span>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </span>
                        <input
                          type="url"
                          name="githubUrl"
                          className="block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                      <span className="text-gray-200 font-medium">Documentation</span>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                        <input
                          type="url"
                          name="readmeUrl"
                          className="block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                          placeholder="Link to documentation"
                        />
                      </div>
                    </label>

                    <label className="block transition-all duration-200 transform hover:translate-y-[-2px]">
                      <span className="text-gray-200 font-medium">Screenshot</span>
                      <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          type="url"
                          name="screenshotUrl"
                          className="block w-full rounded-lg bg-gray-800/70 border border-gray-700/70 pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-gray-800/90"
                          placeholder="Link to project screenshot"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 border-t border-gray-800/50 flex flex-col-reverse sm:flex-row justify-end gap-4 bg-gradient-to-r from-gray-900/80 to-gray-800/60 rounded-b-xl">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-800/80 rounded-lg hover:bg-gray-700/90 transition-all duration-300 text-center transform hover:translate-y-[-2px] hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-700/30"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Project
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}