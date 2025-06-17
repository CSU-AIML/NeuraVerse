import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  ExternalLink, 
  Github, 
  BookOpen, 
  Play,
  Edit,
  Archive,
  Trash2,
  RotateCcw,
  Tag,
  Clock,
  Code2
} from "lucide-react";
import { motion } from "motion/react";
import type { ExtendedProject } from "../components/Project_Card/types";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../components/AlertContext";
import { supabase } from "../lib/supabase";
import { ProjectImage } from "../components/Project_Card/ProjectImage";
import { PriorityBadge } from "../components/Project_Card";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showAlert } = useAlert();
  
  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [priority] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (data) {
        const processedProject: ExtendedProject = {
          id: data.id,
          name: data.name || 'Untitled Project',
          description: data.description || 'No description',
          usage: data.usage || '',
          tech_stack: Array.isArray(data.tech_stack)
            ? data.tech_stack.map((tech: any) => ({
                name: tech.name || 'Unknown',
                icon: tech.icon || '',
              }))
            : [],
          app_url: data.app_url || '',
          colab_url: data.colab_url || '',
          github_url: data.github_url || '',
          readme_url: data.readme_url || '',
          screenshot_url: data.screenshot_url || '',
          image_path: data.image_path || undefined,
          image_url: data.image_url || undefined,
          status: data.status || 'ongoing',
          project_lead_id: data.project_lead_id || '',
          project_lead: data.project_lead || { name: 'Unknown User' },
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          tags: Array.isArray(data.tags) ? data.tags.length > 0 : Boolean(data.tags)
        };
        setProject(processedProject);
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      showAlert('Error', `Failed to fetch project: ${error.message}`, 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!isAdmin || !project) return;
    navigate(`/projects/edit/${project.id}`);
  };

  const handleArchive = async () => {
    if (!isAdmin || !project) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', project.id);

      if (error) throw error;
      
      setProject({ ...project, status: 'archived' });
      showAlert('Success', 'Project archived successfully', 'success');
    } catch (error: any) {
      showAlert('Error', `Failed to archive project: ${error.message}`, 'error');
    }
  };

  const handleUnarchive = async () => {
    if (!isAdmin || !project) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'ongoing' })
        .eq('id', project.id);

      if (error) throw error;
      
      setProject({ ...project, status: 'ongoing' });
      showAlert('Success', 'Project unarchived successfully', 'success');
    } catch (error: any) {
      showAlert('Error', `Failed to unarchive project: ${error.message}`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !project) return;
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      
      showAlert('Success', 'Project deleted successfully', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showAlert('Error', `Failed to delete project: ${error.message}`, 'error');
    }
  };

  const handleUseProject = () => {
    if (!project?.app_url) {
      showAlert('Info', 'This project doesn\'t have an application URL.', 'info');
      return;
    }

    try {
      new URL(project.app_url);
      window.open(project.app_url, "_blank", "noopener,noreferrer");
    } catch (e) {
      showAlert('Error', 'This project has an invalid application URL.', 'error');
    }
  };

  const isArchived = project?.status?.toLowerCase() === "archived";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-600 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-slate-300 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const techStack = project.tech_stack || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                
                {isArchived ? (
                  <button
                    onClick={handleUnarchive}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={handleArchive}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Archive Warning */}
          {isArchived && (
            <div className="mb-6 p-4 bg-amber-600/20 border border-amber-500/40 rounded-lg">
              <div className="flex items-center gap-2 text-amber-200">
                <Archive className="w-5 h-5" />
                <span className="font-medium">This project is archived</span>
              </div>
            </div>
          )}

          {/* Project Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Project Image */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <ProjectImage
                  imageUrl={project.image_url}
                  imagePath={project.image_path}
                  projectName={project.name}
                  className="w-full h-64 object-cover ring-1 ring-gray-600/40"
                />
                
                {/* Priority and Status */}
                <div className="flex items-center justify-between mt-4">
                  <PriorityBadge priority={priority} />
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.status === "completed"
                          ? "bg-green-500"
                          : project.status === "archived"
                          ? "bg-gray-500"
                          : "bg-blue-500 animate-pulse"
                      }`}
                    />
                    <span className="text-sm text-gray-400 capitalize">
                      {project.status || "ongoing"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Project Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl h-full">
                <h1 className="text-4xl font-bold text-white mb-4">{project.name}</h1>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Meta Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {project.project_lead?.name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Project Lead</p>
                        <p className="text-white font-medium">{project.project_lead.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-white font-medium">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Updated</p>
                      <p className="text-white font-medium">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Technologies</p>
                      <p className="text-white font-medium">{techStack.length} technologies</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {project.app_url && (
                    <button
                      onClick={handleUseProject}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      <Play className="w-5 h-5" />
                      Use Project
                    </button>
                  )}
                  
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      <Github className="w-5 h-5" />
                      View Code
                    </a>
                  )}
                  
                  {project.readme_url && (
                    <a
                      href={project.readme_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      <BookOpen className="w-5 h-5" />
                      Documentation
                    </a>
                  )}
                  
                  {project.colab_url && (
                    <a
                      href={project.colab_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-orange-700 hover:bg-orange-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open in Colab
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="mb-8">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-6 h-6" />
                  Technology Stack
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {techStack.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all"
                    >
                      {tech.icon && (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <img 
                            src={tech.icon} 
                            alt={tech.name} 
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <span className="text-blue-200 font-medium text-sm">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          {project.usage && (
            <div className="mb-8">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Usage Instructions
                </h2>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {project.usage}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};