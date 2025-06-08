import React, { useState } from 'react';
import { Search, Play, Clock, Eye, ExternalLink, BookOpen, Code, Brain, BarChart3, Sparkles, ArrowLeft, Plus, X, Upload, CheckCircle, Award, TrendingUp, Users, Calendar } from 'lucide-react';

// Mock auth context for demo
const useAuth = () => ({
  user: { name: "Demo User" },
  isAdmin: true
});

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    {children}
  </div>
);

const AdminPanel: React.FC<{ onAddTutorial: () => void }> = ({ onAddTutorial }) => (
  <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-lg font-medium text-white">Course Management</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <button className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-blue-600/30 transition-all">
        <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
        <p className="text-sm text-blue-300 font-medium">Analytics</p>
      </button>
      <button 
        onClick={onAddTutorial}
        className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all"
      >
        <Plus className="w-5 h-5 text-emerald-400 mb-2" />
        <p className="text-sm text-emerald-300 font-medium">Add Course</p>
      </button>
      <button className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all">
        <Users className="w-5 h-5 text-purple-400 mb-2" />
        <p className="text-sm text-purple-300 font-medium">Students</p>
      </button>
      <button className="p-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl hover:from-orange-500/30 hover:to-orange-600/30 transition-all">
        <Award className="w-5 h-5 text-orange-400 mb-2" />
        <p className="text-sm text-orange-300 font-medium">Certificates</p>
      </button>
    </div>
  </div>
);

const Tutorials = () => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [tutorials, setTutorials] = useState([
    {
      id: 'langchain-master',
      title: 'LangChain Mastery Course',
      description: 'Build powerful AI applications with LangChain framework and advanced prompt engineering',
      category: 'ai-frameworks',
      level: 'Advanced',
      duration: '8:30:00',
      views: '156K',
      completions: 2840,
      instructor: 'LangChain',
      thumbnail: 'https://img.youtube.com/vi/nAmC7SoVLd8/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=nAmC7SoVLd8',
      tags: ['LangChain', 'Prompt Engineering', 'AI Apps'],
      progress: 65,
      rating: 4.9,
      students: 12500,
      datePublished: '2024-03-01'
    },
    {
      id: 'rag-systems',
      title: 'RAG Systems & Vector Databases',
      description: 'Master Retrieval-Augmented Generation with Pinecone, Weaviate, and advanced vector search',
      category: 'ai-architecture',
      level: 'Advanced',
      duration: '6:45:00',
      views: '98K',
      completions: 1920,
      instructor: 'Pinecone',
      thumbnail: 'https://img.youtube.com/vi/T-D1OfcDW1M/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=T-D1OfcDW1M',
      tags: ['RAG', 'Vector DB', 'Information Retrieval'],
      progress: 0,
      rating: 4.8,
      students: 8900,
      datePublished: '2024-02-15'
    },
    {
      id: 'ai-model-deployment',
      title: 'Production AI Model Deployment',
      description: 'Deploy ML models at scale using Docker, Kubernetes, MLOps, and cloud platforms',
      category: 'mlops',
      level: 'Advanced',
      duration: '12:15:00',
      views: '124K',
      completions: 3200,
      instructor: 'MLOps Community',
      thumbnail: 'https://img.youtube.com/vi/6ZjbQZ8Z-KY/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=6ZjbQZ8Z-KY',
      tags: ['MLOps', 'Docker', 'Kubernetes', 'Production'],
      progress: 100,
      rating: 4.7,
      students: 15600,
      datePublished: '2024-01-20'
    },
    {
      id: 'transformers-architecture',
      title: 'Transformer Architecture Deep Dive',
      description: 'Understand attention mechanisms, BERT, GPT, and modern transformer architectures',
      category: 'deep-learning',
      level: 'Advanced',
      duration: '4:20:00',
      views: '87K',
      completions: 2100,
      instructor: 'Hugging Face',
      thumbnail: 'https://img.youtube.com/vi/kCc8FmEb1nY/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
      tags: ['Transformers', 'Attention', 'BERT', 'GPT'],
      progress: 30,
      rating: 4.9,
      students: 11200,
      datePublished: '2024-02-28'
    },
    {
      id: 'multimodal-ai',
      title: 'Multimodal AI Systems',
      description: 'Build systems that understand text, images, and audio with CLIP, DALL-E, and more',
      category: 'multimodal',
      level: 'Advanced',
      duration: '7:10:00',
      views: '76K',
      completions: 1560,
      instructor: 'OpenAI',
      thumbnail: 'https://img.youtube.com/vi/g2O-vQSU4dY/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=g2O-vQSU4dY',
      tags: ['Multimodal', 'CLIP', 'Vision-Language'],
      progress: 0,
      rating: 4.8,
      students: 7800,
      datePublished: '2024-03-10'
    },
    {
      id: 'reinforcement-learning',
      title: 'Deep Reinforcement Learning',
      description: 'Master RL algorithms, policy gradients, and train agents for complex environments',
      category: 'reinforcement-learning',
      level: 'Advanced',
      duration: '9:30:00',
      views: '112K',
      completions: 2650,
      instructor: 'DeepMind',
      thumbnail: 'https://img.youtube.com/vi/TCCjZe0y4Qc/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=TCCjZe0y4Qc',
      tags: ['Reinforcement Learning', 'Policy Gradients', 'Agents'],
      progress: 45,
      rating: 4.7,
      students: 9400,
      datePublished: '2024-01-15'
    },
    {
      id: 'edge-ai',
      title: 'Edge AI & Model Optimization',
      description: 'Deploy AI models on mobile and edge devices with TensorFlow Lite and ONNX',
      category: 'edge-computing',
      level: 'Intermediate',
      duration: '5:45:00',
      views: '68K',
      completions: 1890,
      instructor: 'TensorFlow',
      thumbnail: 'https://img.youtube.com/vi/DKosV_-4pdQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=DKosV_-4pdQ',
      tags: ['Edge AI', 'TensorFlow Lite', 'Model Optimization'],
      progress: 0,
      rating: 4.6,
      students: 6700,
      datePublished: '2024-02-05'
    },
    {
      id: 'ai-ethics-safety',
      title: 'AI Ethics & Safety',
      description: 'Responsible AI development, bias detection, fairness, and safety considerations',
      category: 'ai-ethics',
      level: 'Intermediate',
      duration: '3:30:00',
      views: '89K',
      completions: 4200,
      instructor: 'Partnership on AI',
      thumbnail: 'https://img.youtube.com/vi/X7PVt3NR8ms/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=X7PVt3NR8ms',
      tags: ['AI Ethics', 'Bias', 'Fairness', 'Safety'],
      progress: 100,
      rating: 4.8,
      students: 18900,
      datePublished: '2024-01-30'
    }
  ]);
  
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    category: 'ai-frameworks',
    level: 'Beginner',
    duration: '',
    views: '',
    instructor: '',
    thumbnail: '',
    url: '',
    tags: '',
    rating: '4.5',
    students: ''
  });

  const categories = [
    { id: 'all', name: 'All', icon: BookOpen },
    { id: 'ai-frameworks', name: 'AI Frameworks', icon: Code },
    { id: 'ai-architecture', name: 'AI Architecture', icon: Brain },
    { id: 'mlops', name: 'MLOps', icon: TrendingUp },
    { id: 'deep-learning', name: 'Deep Learning', icon: Brain },
    { id: 'multimodal', name: 'Multimodal AI', icon: Eye },
    { id: 'reinforcement-learning', name: 'RL', icon: Play },
    { id: 'edge-computing', name: 'Edge AI', icon: Sparkles },
    { id: 'ai-ethics', name: 'AI Ethics', icon: Award }
  ];

  const filteredTutorials = tutorials.filter(tutorial => 
    (tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (activeCategory === 'all' || tutorial.category === activeCategory) &&
    (difficultyFilter === 'all' || tutorial.level.toLowerCase() === difficultyFilter)
  );

  interface Tutorial {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    views: string;
    completions: number;
    instructor: string;
    thumbnail: string;
    url: string;
    tags: string[];
    progress: number;
    rating: number;
    students?: number;
    datePublished: string;
  }

  interface NewTutorial {
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    views: string;
    instructor: string;
    thumbnail: string;
    url: string;
    tags: string;
    rating: string;
    students: string;
  }

  const getLevelColor = (level: string): string => {
    switch(level) {
      case 'Beginner': return 'from-green-500 to-emerald-500';
      case 'Intermediate': return 'from-yellow-500 to-orange-500';
      case 'Advanced': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  interface ProgressStatus {
    text: string;
    color: string;
  }

  const getProgressColor = (progress: number): string => {
    if (progress === 0) return 'bg-gray-600';
    if (progress === 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gradient-to-r from-blue-500 to-purple-500';
  };

  interface ProgressStatus {
    text: string;
    color: string;
  }

  const getProgressStatus = (progress: number): ProgressStatus => {
    if (progress === 0) return { text: 'Not Started', color: 'text-gray-400' };
    if (progress === 100) return { text: 'Completed', color: 'text-green-400' };
    return { text: 'In Progress', color: 'text-blue-400' };
  };

  const handleAddTutorial = () => {
    const tutorial = {
      ...newTutorial,
      id: Date.now().toString(),
      tags: newTutorial.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      completions: Math.floor(Math.random() * 5000),
      progress: 0,
      datePublished: new Date().toISOString().split('T')[0],
      rating: Number(newTutorial.rating),
      students: newTutorial.students ? Number(newTutorial.students) : 0
    };
    setTutorials([tutorial, ...tutorials]);
    setNewTutorial({
      title: '',
      description: '',
      category: 'ai-frameworks',
      level: 'Beginner',
      duration: '',
      views: '',
      instructor: '',
      thumbnail: '',
      url: '',
      tags: '',
      rating: '4.5',
      students: ''
    });
    setShowAddForm(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTutorial((prev: NewTutorial) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Advanced Learning</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent mb-4">
              AI Mastery Courses
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Advanced courses in AI, LangChain, RAG systems, MLOps, and cutting-edge technologies
            </p>
          </div>
          
          {/* Admin Panel */}
          {isAdmin && <AdminPanel onAddTutorial={() => setShowAddForm(true)} />}
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(category => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' 
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredTutorials.map(tutorial => (
              <div key={tutorial.id} className="group">
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <div className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getLevelColor(tutorial.level)} text-white`}>
                        {tutorial.level}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <Clock className="w-3 h-3" />
                        {tutorial.duration}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        <Award className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-white">{tutorial.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={getProgressStatus(tutorial.progress).color}>
                          {getProgressStatus(tutorial.progress).text}
                        </span>
                        <span className="text-gray-400">{tutorial.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(tutorial.progress)}`}
                          style={{ width: `${tutorial.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tutorial.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tutorial.students?.toLocaleString() || tutorial.completions} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {tutorial.views}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      By {tutorial.instructor}
                    </div>
                    
                    {/* Action */}
                    <a 
                      href={tutorial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all"
                    >
                      {tutorial.progress > 0 && tutorial.progress < 100 ? (
                        <>
                          <Play className="w-4 h-4" />
                          Continue Course
                        </>
                      ) : tutorial.progress === 100 ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Review Course
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Start Course
                        </>
                      )}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Learning Section */}
          {tutorials.filter(t => t.progress > 0 && t.progress < 100).length > 0 && (
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                Continue Learning
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.filter(t => t.progress > 0 && t.progress < 100).map(tutorial => (
                  <div key={tutorial.id} className="flex bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title}
                      className="w-24 h-20 object-cover"
                    />
                    <div className="p-4 flex-1">
                      <h4 className="font-medium text-white mb-1 text-sm">{tutorial.title}</h4>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-blue-400">In Progress</span>
                        <span className="text-gray-400">{tutorial.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${tutorial.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Tutorial Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Course</h2>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newTutorial.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Advanced RAG Systems"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Instructor</label>
                      <input
                        type="text"
                        name="instructor"
                        value={newTutorial.instructor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="AI Expert"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={newTutorial.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Master advanced retrieval techniques..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        name="category"
                        value={newTutorial.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <option value="ai-frameworks">AI Frameworks</option>
                        <option value="ai-architecture">AI Architecture</option>
                        <option value="mlops">MLOps</option>
                        <option value="deep-learning">Deep Learning</option>
                        <option value="multimodal">Multimodal AI</option>
                        <option value="reinforcement-learning">RL</option>
                        <option value="edge-computing">Edge AI</option>
                        <option value="ai-ethics">AI Ethics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                      <select
                        name="level"
                        value={newTutorial.level}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        value={newTutorial.duration}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="4:30:00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                      <input
                        type="number"
                        name="rating"
                        value={newTutorial.rating}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        min="1"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Views</label>
                      <input
                        type="text"
                        name="views"
                        value={newTutorial.views}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="156K"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Students</label>
                      <input
                        type="number"
                        name="students"
                        value={newTutorial.students}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="12500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={newTutorial.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="LangChain, RAG, Vector DB (comma separated)"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={newTutorial.thumbnail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Course URL</label>
                    <input
                      type="url"
                      name="url"
                      value={newTutorial.url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2 px-4 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTutorial}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all"
                    >
                      Add Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No results */}
          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or browse different categories</p>
              <button 
                onClick={() => {setSearchQuery(''); setActiveCategory('all'); setDifficultyFilter('all');}}
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {/* Footer CTA */}
          {filteredTutorials.length > 0 && (
            <div className="text-center mt-16 pt-12 border-t border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ready to become an AI expert?
              </h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Master the latest AI technologies with hands-on courses from industry experts.
              </p>
              <a 
                href="https://www.youtube.com/results?search_query=advanced+ai+course"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Explore More Courses
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tutorials;