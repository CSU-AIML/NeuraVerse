import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Search, Filter, Download, Star, Info, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
const AdminTemplatesPanel = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-400" />
        Template Management
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Template Analytics</CardTitle>
            <CardDescription>View template usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Track downloads and popularity metrics</p>
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
            <CardTitle className="text-white">Add New Template</CardTitle>
            <CardDescription>Create and publish new template</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Upload files and configure template settings</p>
            <div className="h-32 bg-slate-800 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Template Creator Placeholder</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Create Template</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const Templates: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Sample template data for demonstration
  const templates = [
    {
      id: 'template-1',
      name: 'Image Classification Model',
      description: 'Pre-configured image classification model with transfer learning capabilities',
      category: 'computer-vision',
      tags: ['AI', 'Computer Vision', 'Classification'],
      author: 'NeuraVerse Team',
      downloads: 1250,
      rating: 4.8,
      dateAdded: '2024-03-15',
      imageUrl: '/api/placeholder/400/225'
    },
    {
      id: 'template-2',
      name: 'NLP Sentiment Analysis',
      description: 'Template for analyzing sentiment in text using transformer models',
      category: 'nlp',
      tags: ['AI', 'NLP', 'Sentiment Analysis'],
      author: 'NeuraVerse Team',
      downloads: 980,
      rating: 4.5,
      dateAdded: '2024-03-10',
      imageUrl: '/api/placeholder/400/225'
    },
    {
      id: 'template-3',
      name: 'Time Series Forecasting',
      description: 'LSTM-based model for predicting time series data',
      category: 'time-series',
      tags: ['AI', 'Time Series', 'Forecasting'],
      author: 'Data Science Dept',
      downloads: 750,
      rating: 4.2,
      dateAdded: '2024-03-05',
      imageUrl: '/api/placeholder/400/225'
    },
    {
      id: 'template-4',
      name: 'Recommendation Engine',
      description: 'Collaborative filtering recommendation system template',
      category: 'recommender-systems',
      tags: ['AI', 'Recommendations', 'Personalization'],
      author: 'ML Research Team',
      downloads: 620,
      rating: 4.6,
      dateAdded: '2024-02-28',
      imageUrl: '/api/placeholder/400/225'
    }
  ];
  
  // Filter templates based on search query and category
  const filteredTemplates = templates.filter(template => 
    (template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (activeCategory === 'all' || template.category === activeCategory)
  );
  
  // Categories for filter tabs
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'computer-vision', name: 'Computer Vision' },
    { id: 'nlp', name: 'Natural Language Processing' },
    { id: 'time-series', name: 'Time Series' },
    { id: 'recommender-systems', name: 'Recommender Systems' }
  ];

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
            <h1 className="text-4xl font-bold text-white mb-4">Templates</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Ready-to-use project templates to accelerate your development
            </p>
          </div>
          
          {/* Admin Panel (only visible to admins) */}
          {isAdmin && <AdminTemplatesPanel />}
          
          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 w-full"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-700 text-white">
                <DropdownMenuItem className="hover:bg-slate-800">Most Popular</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-800">Newest First</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-800">Highest Rated</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-800">Most Downloaded</DropdownMenuItem>
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
          
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="bg-slate-800/50 border-slate-700 overflow-hidden hover:shadow-md hover:shadow-blue-500/10 transition-shadow">
                <div className="relative">
                  <img 
                    src={template.imageUrl} 
                    alt={template.name} 
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
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{template.name}</CardTitle>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm">{template.rating}</span>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">{template.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>By: {template.author}</span>
                    <span>{template.downloads} downloads</span>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white">
                    Preview
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* No templates found */}
          {filteredTemplates.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">No templates found matching your search criteria</p>
              <Button onClick={() => {setSearchQuery(''); setActiveCategory('all');}}>
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Pagination */}
          {filteredTemplates.length > 0 && (
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
        </div>
      </div>
    </Layout>
  );
};

export default Templates;