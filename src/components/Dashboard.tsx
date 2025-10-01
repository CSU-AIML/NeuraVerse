import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../types/project';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../components/AlertContext';
import { motion } from 'motion/react';

// Import existing components
import Footer from './Footer';
import ProjectFilters from './ProjectFilters';
import ProjectsList from './ProjectList';
import AuthContainer from './auth/AuthContainer';

// Import new dashboard components
import DashboardHeader from './Dashboard/DashboardHeader';
import DashboardBackground from './Dashboard/DashboardBackground';
import EmptyState from './Dashboard/EmptyState';
import LoadingOverlay from './Dashboard/LoadingOverlay';
import DashboardLoader from './Dashboard/DashboardLoader';
import HomePage from './Dashboard/HomePage';
import TextPressurePage from './Dashboard/TextPressurePage';

// Import enhanced filtering utilities
import { applyProjectFilters, getDefaultFilterState } from '../utils/projectFilters';
import type { FilterState } from '../utils/projectFilters';

// Import CSS for animations
import '../alert-animations.css';

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHomePage, setShowHomePage] = useState(true);
  
  // Check if user has seen the TextPressure page before
  const [showTextPressure, setShowTextPressure] = useState(() => {
    // Check sessionStorage to see if user has already seen the welcome page
    try {
      const hasSeenWelcome = sessionStorage.getItem('neuraverse_welcome_seen');
      return !hasSeenWelcome; // Show only if they haven't seen it
    } catch (error) {
      // Fallback if sessionStorage is not available
      return true;
    }
  });
  
  // Enhanced filtering state
  const [filterState, setFilterState] = useState<FilterState>(getDefaultFilterState());
  
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  
  // Use the alert context
  const { showAlert, clearAlerts } = useAlert();

  

  useEffect(() => {
    fetchProjects();
    
    // FIXED: Updated Supabase subscription syntax
    const projectsSubscription = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchProjects();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, []);
  
  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      
      // Show loading alert
      showAlert(
        'Loading', 
        'Fetching projects data...', 
        'info',
        { autoClose: false }
      );
      
      // Simplified query to debug the 400 error
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        showAlert(
          'Database Error', 
          `Failed to fetch projects: ${error.message}`, 
          'error'
        );
        throw error;
      }
      
      console.log('Raw project data:', data);
      
      
      
      // Handle case where data might be null or undefined
      if (!data) {
        console.log('No projects found');
        showAlert(
          'No Projects', 
          'No projects were found in the database', 
          'info'
        );
        setProjects([]);
        return;
      }
      
      // Process projects to ensure all required fields exist
      interface ProjectLead {
        name: string;
        [key: string]: any;
      }

      interface TechStackItem {
        name: string;
        [key: string]: any;
      }

      interface RawProject {
        id: string;
        name?: string;
        description?: string;
        usage?: string;
        tech_stack?: TechStackItem[];
        app_url?: string;
        colab_url?: string;
        github_url?: string;
        readme_url?: string;
        screenshot_url?: string;
        image_path?: string;        // *** ADD THIS ***
        image_url?: string;         // *** ADD THIS ***
        status?: string;
        project_lead_id?: string;
        project_lead?: ProjectLead;
        created_at?: string;
        updated_at?: string;
        tags?: string[] | boolean; // Handle both types temporarily
        [key: string]: any;
      }

      const processedProjects: Project[] = (data as RawProject[]).map((project: RawProject): Project => {
        // Add default values for any missing fields
        return {
          id: project.id,
          name: project.name || 'Untitled Project',
          description: project.description || 'No description',
          usage: project.usage || '',
          tech_stack: Array.isArray(project.tech_stack)
            ? project.tech_stack.map((tech: any) => ({
                name: tech.name || 'Unknown',
                icon: tech.icon || '', // Provide a default icon if missing
              }))
            : [],
          app_url: project.app_url || '', 
          colab_url: project.colab_url || '',
          github_url: project.github_url || '',
          readme_url: project.readme_url || '',
          screenshot_url: project.screenshot_url || '',
          image_path: project.image_path || undefined,     // *** ADD THIS ***
          image_url: project.image_url || undefined,       // *** ADD THIS ***
          status: (project.status as Project['status']) || 'ongoing',
          project_lead_id: project.project_lead_id || '',
          project_lead: project.project_lead || { name: 'Unknown User' },
          created_at: project.created_at || new Date().toISOString(),
          updated_at: project.updated_at || new Date().toISOString(),
          // FIXED: Handle tags properly - convert to boolean if it's an array
          tags: Array.isArray(project.tags) ? project.tags.length > 0 : Boolean(project.tags)
        };
      });
      
      console.log('Processed projects:', processedProjects);
      
      // *** DEBUG: Check processed image data ***
      const processedWithImages = processedProjects.filter(p => p.image_path || p.image_url);
      console.log('🖼️ DEBUG - Processed projects with images:', {
        count: processedWithImages.length,
        examples: processedWithImages.slice(0, 2).map(p => ({
          id: p.id,
          name: p.name,
          image_path: p.image_path,
          image_url: p.image_url
        }))
      });
      
      setProjects(processedProjects);
      
      // Show success alert
      showAlert(
        'Success!', 
        `Loaded ${processedProjects.length} projects`, 
        'success',
        { duration: 2000 }
      );
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      showAlert(
        'Error', 
        `Failed to fetch projects: ${error.message || 'Unknown error'}`, 
        'error'
      );
    } finally {
      setLoading(false);
      // Clear the loading alert
      clearAlerts();
    }
  };

  // Enhanced filtering with memoization
  const filteredProjects = useMemo(() => {
    const combinedFilters = { ...filterState, searchQuery };
    return applyProjectFilters(projects, combinedFilters);
  }, [projects, filterState, searchQuery]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilterState(newFilters);
    setSearchQuery(newFilters.searchQuery);
  };

  const handleEdit = (id: string) => {
    if (!isAdmin) {
      // Show an alert for non-admin users
      showAlert(
        'Access Restricted', 
        'You need admin privileges to edit projects.', 
        'warning'
      );
      return;
    }
    console.log('Edit project:', id);
    navigate(`/projects/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      showAlert(
        'Access Restricted', 
        'You need admin privileges to delete projects.', 
        'warning'
      );
      return;
    }
    
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      // Show processing alert
      showAlert(
        'Processing', 
        'Deleting project...', 
        'info', 
        { autoClose: false }
      );
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(projects.filter(p => p.id !== id));
      
      // Show success alert
      showAlert(
        'Success', 
        'Project deleted successfully', 
        'success',
        { duration: 2000 }
      );
    } catch (error: any) {
      console.error('Error deleting project:', error);
      showAlert(
        'Error', 
        `Failed to delete project: ${error.message || 'Unknown error'}`, 
        'error'
      );
    } finally {
      // Clear the processing alert
      clearAlerts();
    }
  };

  const handleArchive = async (id: string) => {
    if (!isAdmin) {
      showAlert(
        'Access Restricted', 
        'You need admin privileges to archive projects.', 
        'warning'
      );
      return;
    }
    
    try {
      // Show processing alert
      showAlert(
        'Processing', 
        'Archiving project...', 
        'info', 
        { autoClose: false }
      );
      
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      
      await fetchProjects();
      
      // Show success alert
      showAlert(
        'Success', 
        'Project archived successfully', 
        'success',
        { duration: 2000 }
      );
    } catch (error: any) {
      console.error('Error archiving project:', error);
      showAlert(
        'Error', 
        `Failed to archive project: ${error.message || 'Unknown error'}`, 
        'error'
      );
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!isAdmin) {
      showAlert(
        'Access Restricted', 
        'You need admin privileges to unarchive projects.', 
        'warning'
      );
      return;
    }
    
    try {
      // Show processing alert
      showAlert(
        'Processing', 
        'Unarchiving project...', 
        'info', 
        { autoClose: false }
      );
      
      const { error } = await supabase
        .from('projects')
        .update({ status: 'ongoing' })
        .eq('id', id);
  
      if (error) throw error;
      
      await fetchProjects();
      
      // Show success alert
      showAlert(
        'Success', 
        'Project unarchived successfully', 
        'success',
        { duration: 2000 }
      );
    } catch (error: any) {
      console.error('Error unarchiving project:', error);
      showAlert(
        'Error', 
        `Failed to unarchive project: ${error.message || 'Unknown error'}`, 
        'error'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showAlert(
      'Signed Out', 
      'You have been successfully signed out', 
      'info'
    );
    return Promise.resolve();
  };

  const handleCreateProject = () => {
    navigate('/new');
  };

  const handleExploreProjects = () => {
    setShowHomePage(false);
    // Scroll to projects section
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContinueFromTextPressure = () => {
    // Mark that user has seen the welcome page
    try {
      sessionStorage.setItem('neuraverse_welcome_seen', 'true');
    } catch (error) {
      console.log('SessionStorage not available:', error);
    }
    setShowTextPressure(false);
  };

  // Show initial loading screen
  if (loading) {
    return <DashboardLoader />;
  }

  // Show login screen if not authenticated
  if (!authLoading && !user) {
    return (
      <AuthContainer 
        onSuccess={() => {
          showAlert(
            'Authentication Successful', 
            'Welcome to NeuraVerse Dashboard', 
            'success'
          );
          fetchProjects();
        }} 
      />
    );
  }

  // Show TextPressure page only for first-time visitors
  if (showTextPressure) {
    return <TextPressurePage onContinue={handleContinueFromTextPressure} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 relative">
      {/* Animated Background */}
      <DashboardBackground />
      
      {/* Main content with responsive container */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative z-10">
        {/* Enhanced Header */}
        <DashboardHeader 
          navigate={navigate}
          isAdmin={isAdmin}
          user={user}
          signOut={handleSignOut}
        />

        {/* HomePage Section */}
        {showHomePage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <HomePage
              isAdmin={isAdmin}
              onCreateProject={handleCreateProject}
              onExploreProjects={handleExploreProjects}
            />
          </motion.div>
        )}

        {/* Projects Section */}
        <div id="projects-section" className={showHomePage ? 'pt-8' : ''}>
          {/* Section Header */}
          {showHomePage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100 mb-4">
                Featured Projects
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Discover our latest AI and machine learning innovations
              </p>
            </motion.div>
          )}

          {/* Enhanced Project filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: showHomePage ? 0.4 : 0.2, duration: 0.5 }}
          >
            <ProjectFilters 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              projects={projects}
              onFiltersChange={handleFiltersChange}
              activeFilters={{ ...filterState, searchQuery }}
            />
          </motion.div>

          {/* Enhanced Project list with staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showHomePage ? 0.6 : 0.4, duration: 0.5 }}
            className="mt-6 sm:mt-8"
          >
            <ProjectsList 
              loading={loading}
              searchQuery={searchQuery}
              projects={projects}
              filteredProjects={filteredProjects}
              isAdmin={isAdmin}
              navigate={navigate}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleArchive={handleArchive}
              handleUnarchive={handleUnarchive}
            />
          </motion.div>
          
          {/* Empty state */}
          {!loading && filteredProjects.length === 0 && (
            <EmptyState 
              searchQuery={searchQuery}
              isAdmin={isAdmin}
              onCreateProject={handleCreateProject}
            />
          )}
        </div>
      </div>
      
      {/* Enhanced footer */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
      
      {/* Loading overlay */}
      <LoadingOverlay 
        isVisible={loading}
        message="Loading projects..."
      />
    </div>
  );
}

export default Dashboard;