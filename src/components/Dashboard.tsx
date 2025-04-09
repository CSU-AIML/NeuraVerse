import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlickeringGrid } from './magicui/flickering-grid';
import { TypingAnimation } from './magicui/typing-animation';
import { supabase } from '../lib/supabase';
import type { Project } from '../types/project';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import Loader from './loader';
import ProjectFilters from './ProjectFilters';
import NavButtons from './NavButtons';
import ProjectsList from './ProjectList';
import { useAlert } from '../components/AlertContext';
import logo from "../components/assets/white_logo.png";

// Import CSS for animations
import '../alert-animations.css';
import { motion } from 'motion/react';
import AuthContainer from './auth/AuthContainer';

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isLoading, signOut } = useAuth();
  
  // Use the alert context
  const { showAlert, clearAlerts } = useAlert();

  useEffect(() => {
    fetchProjects();
    
    // Set up a subscription to listen for changes to the projects table
    const projectsSubscription = supabase
      .channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, payload => {
        console.log('Change received!', payload);
        fetchProjects();
      })
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
      // Process projects to ensure all required fields exist
      const processedProjects = data.map(project => {
        // Add default values for any missing fields
        return {
          id: project.id,
          name: project.name || 'Untitled Project',
          description: project.description || 'No description',
          usage: project.usage || '',
          tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
          app_url: project.app_url || '', 
          colab_url: project.colab_url || '',
          github_url: project.github_url || '',
          readme_url: project.readme_url || '',
          screenshot_url: project.screenshot_url || '',
          status: project.status || 'ongoing',
          project_lead_id: project.project_lead_id || '',
          project_lead: project.project_lead || { name: 'Unknown User' },
          created_at: project.created_at || new Date().toISOString(),
          updated_at: project.updated_at || new Date().toISOString(),
          tags: project.tags || [] // Add this line to include the tags property
        };
      });
      
      console.log('Processed projects:', processedProjects);
      setProjects(processedProjects);
      
      // Show success alert
      showAlert(
        'Success', 
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
  
  // Safe filtering to handle missing data
  const filteredProjects = projects.filter(project => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = project.name?.toLowerCase().includes(query) || false;
    const descMatch = project.description?.toLowerCase().includes(query) || false;
    let techMatch = false;
    
    if (Array.isArray(project.tech_stack)) {
      techMatch = project.tech_stack.some(tech => 
        typeof tech.name === 'string' && tech.name.toLowerCase().includes(query)
      );
    }
    
    return nameMatch || descMatch || techMatch;
  });

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-gray-950/90 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-pulse">
          <Loader />
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isLoading && !user) {
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-slate-900 relative overflow-hidden">
      {/* Animated background with enhanced effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(25,100,200,0.2),transparent_70%),radial-gradient(circle_at_80%_70%,rgba(100,50,255,0.15),transparent_50%)]"></div>
        <FlickeringGrid 
          color="rgb(25, 100, 200)" 
          flickerChance={0.2} 
          maxOpacity={0.15}
          squareSize={5}
          gridGap={8}
        />
      </div>
      
      {/* Main content with responsive container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative z-10">
        {/* Enhanced Header with responsive design */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 p-4 sm:p-6 border border-white/20 bg-slate-900/40 backdrop-blur-2xl shadow-2xl rounded-xl overflow-hidden"
        >
          {/* Advanced glass effects */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-slate-900/10 opacity-40 z-0 mix-blend-overlay" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-white/30 via-blue-300/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none" /> */}
          
          {/* Logo and title section */}
          <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src= {logo} 
                  alt="AI/ML Projects Dashboard" 
                  className="h-8 w-auto"
                />
              </motion.div>
              <TypingAnimation
                className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white relative z-10"
                duration={50}
                as="h1"
              >
                NeuraVerse
              </TypingAnimation>
            </div>
          </div>
          
          {/* Responsive navigation buttons */}
          <div className="flex justify-center md:justify-end w-full md:w-auto">
            <NavButtons 
              navigate={navigate} 
              isAdmin={isAdmin} 
              user={user} 
              signOut={async () => {
                await signOut();
                showAlert(
                  'Signed Out', 
                  'You have been successfully signed out', 
                  'info'
                );
                return Promise.resolve();
              }} 
            />
          </div>
        </motion.div>
  
        {/* Project filters with improved styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ProjectFilters 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </motion.div>
  
        {/* Project list with staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
        
        {/* Empty state with enhanced styling */}
        {!loading && filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 mt-8"
          >
            <div className="p-6 rounded-full bg-slate-800/50 border border-slate-700/30 mb-4">
              <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
            <p className="text-slate-400 text-center max-w-md mb-6">
              {searchQuery ? 
                `We couldn't find any projects matching "${searchQuery}". Try a different search term.` :
                "You haven't created any projects yet. Get started by creating your first project."
              }
            </p>
            
            {isAdmin && !searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/new')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg shadow-blue-900/30 flex items-center space-x-2 font-medium transition-all duration-300 hover:shadow-blue-900/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create New Project</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Enhanced footer with fixed position */}
      <div className="mt-auto">
        <Footer />
      </div>
      
      {/* Floating action button for mobile/tablet */}
      {isAdmin && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          onClick={() => navigate('/new')}
          className="fixed bottom-6 right-6 lg:hidden p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 z-20"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </motion.button>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/50 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Loading projects...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;