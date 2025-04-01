import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlickeringGrid } from './magicui/flickering-grid';
import { TypingAnimation } from './magicui/typing-animation';
import { supabase } from '../lib/supabase';
import type { Project } from '../types/project';
import { useAuth } from '../contexts/AuthContext';
import { SignIn } from '../SignIn';
import Footer from './Footer';
import Loader from './loader';
import ProjectFilters from './ProjectFilters';
import NavButtons from './NavButtons';
import ProjectsList from './ProjectList';
import { useAlert } from '../components/AlertContext';

// Import CSS for animations
import '../alert-animations.css';

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
      <div className="min-h-screen bg-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0">
          <FlickeringGrid 
            color="rgb(25, 100, 200)" 
            flickerChance={0.5} 
            maxOpacity={0.1}
            squareSize={50}
            gridGap={10}
          />
        </div>
        
        <div className="w-full max-w-md z-10">
          <div className="text-center mb-6">
            <img 
              src="/white_logo.png" 
              alt="NeuraVerse" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-white">
              Welcome to NeuraVerse Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Sign in to access AI/ML projects and tools
            </p>
          </div>
          
          <SignIn onSuccess={() => {
            showAlert(
              'Authentication Successful', 
              'Welcome to NeuraVerse Dashboard', 
              'success'
            );
            fetchProjects();
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Flickering Grid Background */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid 
          color="rgb(25, 100, 200)" 
          flickerChance={0.2} 
          maxOpacity={0.15}
          squareSize={5}
          gridGap={8}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="relative flex items-center justify-between mb-8 p-6 border border-white/20 bg-slate-900/30 backdrop-blur-2xl shadow-2xl rounded-xl overflow-hidden">
          {/* Background gradient overlay for enhanced glass effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-slate-900/10 opacity-40 z-0 mix-blend-overlay" />
          
          {/* Top light reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Left light reflection effect */}
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-white/30 via-blue-300/20 to-transparent" />
          
          {/* Static subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none" />
          
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <img 
                src="/white_logo.png" 
                alt="AI/ML Projects Dashboard" 
                className="h-8 w-auto"
              />
              <TypingAnimation
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white relative z-10"
                duration={50}
                as="h1"
              >
                NeuraVerse
              </TypingAnimation>
            </div>
          </div>
          
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

        <ProjectFilters 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

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
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;