import React, { useState } from 'react';
import { Search, Play, Clock, Eye, ExternalLink, BookOpen, Code, Brain, BarChart3, Sparkles, ArrowLeft, Plus, X, Upload } from 'lucide-react';

// Mock auth context for demo
const useAuth = () => ({
  user: { name: "Demo User" },
  isAdmin: true
});

import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    {children}
  </div>
);

const AdminPanel: React.FC<{ onAddTutorial: () => void }> = ({ onAddTutorial }) => (
  <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-lg font-medium text-white">Content Management</h3>
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
        <p className="text-sm text-emerald-300 font-medium">Add Tutorial</p>
      </button>
      <button className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all">
        <BookOpen className="w-5 h-5 text-purple-400 mb-2" />
        <p className="text-sm text-purple-300 font-medium">Manage</p>
      </button>
      <button className="p-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl hover:from-orange-500/30 hover:to-orange-600/30 transition-all">
        <Upload className="w-5 h-5 text-orange-400 mb-2" />
        <p className="text-sm text-orange-300 font-medium">Import</p>
      </button>
    </div>
  </div>
);

const Templates = () => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [tutorials, setTutorials] = useState([
    {
      id: 'ml-crash-course',
      title: 'Machine Learning Crash Course',
      description: 'Complete ML fundamentals in one comprehensive tutorial',
      category: 'machine-learning',
      level: 'Beginner',
      duration: '3:42:15',
      views: '2.1M',
      channel: 'freeCodeCamp.org',
      thumbnail: 'https://img.youtube.com/vi/NWONeJKn6kc/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      tags: ['Python', 'Scikit-learn', 'Data Science']
    },
    {
      id: 'deep-learning-pytorch',
      title: 'Deep Learning with PyTorch',
      description: 'Build neural networks from scratch using PyTorch',
      category: 'deep-learning',
      level: 'Intermediate',
      duration: '25:30:00',
      views: '1.8M',
      channel: 'freeCodeCamp.org',
      thumbnail: 'https://img.youtube.com/vi/c36lUUr864M/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=c36lUUr864M',
      tags: ['PyTorch', 'Neural Networks', 'Deep Learning']
    },
    {
      id: 'computer-vision-opencv',
      title: 'Computer Vision with OpenCV',
      description: 'Image processing and computer vision techniques',
      category: 'computer-vision',
      level: 'Intermediate',
      duration: '3:45:32',
      views: '890K',
      channel: 'Programming Knowledge',
      thumbnail: 'https://img.youtube.com/vi/oXlwWbU8l2o/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=oXlwWbU8l2o',
      tags: ['OpenCV', 'Python', 'Image Processing']
    },
    {
      id: 'nlp-transformers',
      title: 'NLP with Transformers',
      description: 'Modern natural language processing with Hugging Face',
      category: 'nlp',
      level: 'Advanced',
      duration: '2:15:45',
      views: '654K',
      channel: 'Hugging Face',
      thumbnail: 'https://img.youtube.com/vi/QEaBAZQCtwE/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=QEaBAZQCtwE',
      tags: ['Transformers', 'BERT', 'Hugging Face']
    },
    {
      id: 'data-analysis-pandas',
      title: 'Data Analysis with Pandas',
      description: 'Complete guide to data manipulation and analysis',
      category: 'data-science',
      level: 'Beginner',
      duration: '6:12:00',
      views: '1.2M',
      channel: 'Keith Galli',
      thumbnail: 'https://img.youtube.com/vi/vmEHCJofslg/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=vmEHCJofslg',
      tags: ['Pandas', 'Data Analysis', 'Python']
    },
    {
      id: 'tensorflow-beginners',
      title: 'TensorFlow 2.0 Complete Course',
      description: 'Build and train neural networks with TensorFlow',
      category: 'deep-learning',
      level: 'Beginner',
      duration: '7:00:00',
      views: '1.5M',
      channel: 'TensorFlow',
      thumbnail: 'https://img.youtube.com/vi/tPYj3fFJGjk/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk',
      tags: ['TensorFlow', 'Keras', 'Neural Networks']
    }
  ]);
  
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    category: 'machine-learning',
    level: 'Beginner',
    duration: '',
    views: '',
    channel: '',
    thumbnail: '',
    url: '',
    tags: ''
  });
  
  interface Tutorial {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    views: string;
    channel: string;
    thumbnail: string;
    url: string;
    tags: string[];
  }

  interface NewTutorial {
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    views: string;
    channel: string;
    thumbnail: string;
    url: string;
    tags: string;
  }

  const handleAddTutorial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tutorial: Tutorial = {
      ...newTutorial,
      id: Date.now().toString(),
      tags: newTutorial.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    setTutorials([tutorial, ...tutorials]);
    setNewTutorial({
      title: '',
      description: '',
      category: 'machine-learning',
      level: 'Beginner',
      duration: '',
      views: '',
      channel: '',
      thumbnail: '',
      url: '',
      tags: ''
    });
    setShowAddForm(false);
  };

  interface HandleInputChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {}

  const handleInputChange = (e: HandleInputChangeEvent) => {
    const { name, value } = e.target;
    setNewTutorial((prev: NewTutorial) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const categories = [
    { id: 'all', name: 'All', icon: BookOpen },
    { id: 'machine-learning', name: 'ML', icon: Brain },
    { id: 'deep-learning', name: 'Deep Learning', icon: Code },
    { id: 'computer-vision', name: 'Vision', icon: Eye },
    { id: 'nlp', name: 'NLP', icon: BookOpen },
    { id: 'data-science', name: 'Data Science', icon: BarChart3 }
  ];
  
  const filteredTutorials = tutorials.filter(tutorial => 
    (tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (activeCategory === 'all' || tutorial.category === activeCategory)
  );

  interface LevelColorMap {
    [key: string]: string;
  }

  type TutorialLevel = 'Beginner' | 'Intermediate' | 'Advanced' | string;

  const getLevelColor = (level: TutorialLevel): string => {
    const levelColors: LevelColorMap = {
      'Beginner': 'from-green-500 to-emerald-500',
      'Intermediate': 'from-yellow-500 to-orange-500',
      'Advanced': 'from-red-500 to-pink-500'
    };
    return levelColors[level] || 'from-blue-500 to-purple-500';
  };

  return (
    <Layout>
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full blur-3xl" />
        
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Learning Hub</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
              AI & ML Tutorials
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Curated collection of premium tutorials to master artificial intelligence and machine learning
            </p>
          </div>
          
          {/* Admin Panel */}
          {isAdmin && <AdminPanel onAddTutorial={() => setShowAddForm(true)} />}
          
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
          
          {/* Tutorials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map(tutorial => (
              <div key={tutorial.id} className="group">
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
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
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tutorial.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                      <span>{tutorial.channel}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {tutorial.views}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <a 
                      href={tutorial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Watch Tutorial
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* No results */}
          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tutorials found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or browse different categories</p>
              <button 
                onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {/* Add Tutorial Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Tutorial</h2>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddTutorial} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newTutorial.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Tutorial title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Channel</label>
                      <input
                        type="text"
                        name="channel"
                        value={newTutorial.channel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Channel name"
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
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Tutorial description"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        name="category"
                        value={newTutorial.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="machine-learning">Machine Learning</option>
                        <option value="deep-learning">Deep Learning</option>
                        <option value="computer-vision">Computer Vision</option>
                        <option value="nlp">NLP</option>
                        <option value="data-science">Data Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                      <select
                        name="level"
                        value={newTutorial.level}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="e.g., 2:30:45"
                        required
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
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="e.g., 1.2M"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={newTutorial.tags}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Python, AI, Machine Learning (comma separated)"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={newTutorial.thumbnail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                    <input
                      type="url"
                      name="url"
                      value={newTutorial.url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                      type="submit"
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                    >
                      Add Tutorial
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Footer CTA */}
          {filteredTutorials.length > 0 && (
            <div className="text-center mt-16 pt-12 border-t border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Ready to start learning?
              </h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                These tutorials are carefully selected to provide hands-on experience with the latest AI and ML technologies.
              </p>
              <a 
                href="https://www.youtube.com/results?search_query=machine+learning+tutorial"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Explore More Tutorials
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Templates;