import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Search, Filter, BookOpen, Info, Edit, Clock, UserCheck, ArrowRight, Bookmark, Calendar, Plus, FileEdit, Eye, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Admin feature components that will only be visible to admins
const AdminTutorialsPanel = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-400" />
        Tutorial Management
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Tutorial Analytics</CardTitle>
            <CardDescription>View completion and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Track user progress and identify popular tutorials</p>
            <div className="h-32 bg-slate-800 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Analytics Dashboard Placeholder</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Analytics</Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Create New Tutorial</CardTitle>
            <CardDescription>Add a new tutorial to the library</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Create content, add media, and configure settings</p>
            <div className="h-32 bg-slate-800 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Tutorial Editor Placeholder</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Create Tutorial</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const Tutorials: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  // Sample tutorial data for demonstration
  const tutorials = [
    {
      id: 'tutorial-1',
      title: 'Getting Started with NeuraVerse',
      description: 'Learn the basics of using the NeuraVerse platform for AI/ML development',
      category: 'fundamentals',
      tags: ['Beginner', 'Platform'],
      author: 'NeuraVerse Team',
      difficulty: 'beginner',
      duration: '30 minutes',
      views: 3450,
      completions: 2230,
      datePublished: '2024-03-10',
      imageUrl: '/api/placeholder/400/225',
      progress: 100 // For current user
    },
    {
      id: 'tutorial-2',
      title: 'Building Your First Neural Network',
      description: 'Step-by-step guide to creating and training a simple neural network',
      category: 'deep-learning',
      tags: ['Neural Networks', 'Training'],
      author: 'AI Research Team',
      difficulty: 'intermediate',
      duration: '45 minutes',
      views: 2780,
      completions: 1540,
      datePublished: '2024-03-05',
      imageUrl: '/api/placeholder/400/225',
      progress: 60 // For current user
    },
    {
      id: 'tutorial-3',
      title: 'Advanced Computer Vision Techniques',
      description: 'Explore cutting-edge approaches to computer vision problems',
      category: 'computer-vision',
      tags: ['CV', 'Advanced'],
      author: 'CV Research Group',
      difficulty: 'advanced',
      duration: '60 minutes',
      views: 1540,
      completions: 780,
      datePublished: '2024-02-28',
      imageUrl: '/api/placeholder/400/225',
      progress: 0 // For current user
    },
    {
      id: 'tutorial-4',
      title: 'Natural Language Processing Fundamentals',
      description: 'Introduction to NLP concepts and implementations',
      category: 'nlp',
      tags: ['NLP', 'Text Processing'],
      author: 'NLP Research Team',
      difficulty: 'intermediate',
      duration: '50 minutes',
      views: 2100,
      completions: 1320,
      datePublished: '2024-02-20',
      imageUrl: '/api/placeholder/400/225',
      progress: 25 // For current user
    }
  ];
  
  // Filter tutorials based on search query, category, and difficulty
  const filteredTutorials = tutorials.filter(tutorial => 
    (tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (activeCategory === 'all' || tutorial.category === activeCategory) &&
    (difficultyFilter === 'all' || tutorial.difficulty === difficultyFilter)
  );
  
  // Categories for filter tabs
  const categories = [
    { id: 'all', name: 'All Tutorials' },
    { id: 'fundamentals', name: 'Fundamentals' },
    { id: 'deep-learning', name: 'Deep Learning' },
    { id: 'computer-vision', name: 'Computer Vision' },
    { id: 'nlp', name: 'NLP' }
  ];
  
  // Helper function to get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };
  
  // Helper function to get progress status text and color
  const getProgressStatus = (progress: number) => {
    if (progress === 0) return { text: 'Not Started', color: 'text-gray-400' };
    if (progress === 100) return { text: 'Completed', color: 'text-green-400' };
    return { text: 'In Progress', color: 'text-yellow-400' };
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="relative z-10">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] z-[-1]" />
          <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl z-[-1]" />
          <div className="absolute bottom-20 left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl z-[-1]" />
          
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Tutorials</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Step-by-step guides to help you master NeuraVerse's features and capabilities
            </p>
          </div>
          
          {/* Admin Panel (only visible to admins) */}
          {isAdmin && <AdminTutorialsPanel />}
          
          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 w-full"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Difficulty
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-700 text-white">
                <DropdownMenuItem
                  className={`hover:bg-slate-800 ${difficultyFilter === 'all' ? 'bg-slate-800' : ''}`}
                  onClick={() => setDifficultyFilter('all')}
                >
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`hover:bg-slate-800 ${difficultyFilter === 'beginner' ? 'bg-slate-800' : ''}`}
                  onClick={() => setDifficultyFilter('beginner')}
                >
                  Beginner
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`hover:bg-slate-800 ${difficultyFilter === 'intermediate' ? 'bg-slate-800' : ''}`}
                  onClick={() => setDifficultyFilter('intermediate')}
                >
                  Intermediate
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`hover:bg-slate-800 ${difficultyFilter === 'advanced' ? 'bg-slate-800' : ''}`}
                  onClick={() => setDifficultyFilter('advanced')}
                >
                  Advanced
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Category Tabs */}
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
            <TabsList className="bg-slate-800 border-slate-700 p-1 rounded-lg w-full overflow-x-auto flex">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id}
                  value={category.id}
                  className="flex-1 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Tutorials List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTutorials.map(tutorial => (
              <Card key={tutorial.id} className="bg-slate-800/50 border-slate-700 overflow-hidden hover:shadow-md hover:shadow-blue-500/10 transition-shadow">
                <div className="relative">
                  <img 
                    src={tutorial.imageUrl} 
                    alt={tutorial.title} 
                    className="w-full h-48 object-cover"
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button variant="outline" size="icon" className="w-8 h-8 rounded-full bg-slate-900/70 border-slate-700 hover:bg-slate-800">
                        <Edit className="h-4 w-4 text-blue-400" />
                      </Button>
                      <Button variant="outline" size="icon" className="w-8 h-8 rounded-full bg-slate-900/70 border-slate-700 hover:bg-slate-800">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  )}
                  <Badge 
                    className={`absolute bottom-2 left-2 ${getDifficultyColor(tutorial.difficulty)}`}
                  >
                    {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{tutorial.title}</CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {tutorial.duration}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">{tutorial.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutorial.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-slate-700 text-gray-300 border-slate-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-1" />
                      {tutorial.completions} completions
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {tutorial.views} views
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={getProgressStatus(tutorial.progress).color}>
                        {getProgressStatus(tutorial.progress).text}
                      </span>
                      <span className="text-gray-400">{tutorial.progress}%</span>
                    </div>
                    <Progress value={tutorial.progress} className="h-2 bg-slate-700" />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {tutorial.datePublished}
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    {tutorial.progress > 0 && tutorial.progress < 100 ? 'Continue' : 'Start'} 
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* No tutorials found */}
          {filteredTutorials.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">No tutorials found matching your search criteria</p>
              <Button onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setDifficultyFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Pagination */}
          {filteredTutorials.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700">
                  Previous
                </Button>
                <Button variant="outline" className="bg-blue-500/20 border-blue-500/30 text-blue-300">
                  1
                </Button>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700">
                  2
                </Button>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700">
                  3
                </Button>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700">
                  Next
                </Button>
              </div>
            </div>
          )}
          
          {/* Saved Progress Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Your Progress</h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Continue Learning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.filter(t => t.progress > 0 && t.progress < 100).map(tutorial => (
                  <Card key={tutorial.id} className="bg-slate-900 border-slate-700 flex overflow-hidden">
                    <img 
                      src={tutorial.imageUrl} 
                      alt={tutorial.title} 
                      className="w-24 h-full object-cover"
                    />
                    <div className="p-4 flex-1">
                      <h4 className="font-medium text-white mb-1">{tutorial.title}</h4>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-yellow-400">In Progress</span>
                        <span className="text-gray-400">{tutorial.progress}%</span>
                      </div>
                      <Progress value={tutorial.progress} className="h-1.5 bg-slate-700 mb-3" />
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Continue</Button>
                    </div>
                  </Card>
                ))}
                
                {tutorials.filter(t => t.progress > 0 && t.progress < 100).length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-400 mb-4">You don't have any tutorials in progress</p>
                    <Button onClick={() => setActiveCategory('all')}>Browse Tutorials</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tutorials;