import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Copy, ExternalLink, CheckCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';

// Admin feature components that will only be visible to admins
const AdminApiPanel = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-400" />
        Admin API Management
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">API Usage Analytics</CardTitle>
            <CardDescription>View detailed API usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Monitor endpoint performance and user activity</p>
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
            <CardTitle className="text-white">API Documentation Management</CardTitle>
            <CardDescription>Update and manage API documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Edit endpoints, examples, and implementation details</p>
            <div className="h-32 bg-slate-800 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Documentation Editor Placeholder</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Edit Documentation</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const ApiReference: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('introduction');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  
  // Sample API endpoints for demonstration
  const apiEndpoints = [
    {
      id: 'get-projects',
      name: 'Get Projects',
      method: 'GET',
      endpoint: '/api/projects',
      description: 'Returns a list of all available projects',
      parameters: [
        { name: 'limit', type: 'number', description: 'Maximum number of results to return' },
        { name: 'offset', type: 'number', description: 'Number of results to skip' }
      ],
      responses: [
        { code: '200', description: 'Success', example: '{ "projects": [...] }' },
        { code: '401', description: 'Unauthorized', example: '{ "error": "Authentication required" }' }
      ],
      codeExamples: {
        javascript: `fetch('/api/projects')
  .then(response => response.json())
  .then(data => console.log(data));`,
        python: `import requests\n\nresponse = requests.get('https://api.neuraverse.com/api/projects')\ndata = response.json()\nprint(data)`
      }
    },
    {
      id: 'create-project',
      name: 'Create Project',
      method: 'POST',
      endpoint: '/api/projects',
      description: 'Creates a new project',
      parameters: [
        { name: 'name', type: 'string', description: 'Name of the project' },
        { name: 'description', type: 'string', description: 'Project description' }
      ],
      responses: [
        { code: '201', description: 'Created', example: '{ "id": "123", "name": "Project Name" }' },
        { code: '400', description: 'Bad Request', example: '{ "error": "Invalid project data" }' }
      ],
      codeExamples: {
        javascript: `fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My Project', description: 'Description' })
})
  .then(response => response.json())
  .then(data => console.log(data));`,
        python: `import requests\n\ndata = {\n    "name": "My Project",\n    "description": "Description"\n}\n\nresponse = requests.post('https://api.neuraverse.com/api/projects', json=data)\nresult = response.json()\nprint(result)`
      }
    }
  ];
  
  const handleCopyCode = (code: string, endpointId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEndpoint(endpointId);
    
    setTimeout(() => {
      setCopiedEndpoint(null);
    }, 2000);
  };
  
  // Filter endpoints based on search query
  const filteredEndpoints = apiEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-4xl font-bold text-white mb-4">API Reference</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Integrate with NeuraVerse APIs to power your AI/ML applications
            </p>
          </div>
          
          {/* Admin Panel (only visible to admins) */}
          {isAdmin && <AdminApiPanel />}
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 w-full"
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* API Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4">Contents</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="#introduction" 
                      className={`block px-3 py-2 rounded-md transition-colors ${activeTab === 'introduction' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('introduction')}
                    >
                      Introduction
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#authentication" 
                      className={`block px-3 py-2 rounded-md transition-colors ${activeTab === 'authentication' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('authentication')}
                    >
                      Authentication
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#ratelimits" 
                      className={`block px-3 py-2 rounded-md transition-colors ${activeTab === 'ratelimits' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('ratelimits')}
                    >
                      Rate Limits
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#endpoints" 
                      className={`block px-3 py-2 rounded-md transition-colors ${activeTab === 'endpoints' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('endpoints')}
                    >
                      Endpoints
                    </a>
                  </li>
                  <li className="pt-2 border-t border-slate-700">
                    <h4 className="text-sm font-medium text-gray-500 px-3 py-1">API Resources</h4>
                  </li>
                  {apiEndpoints.map(endpoint => (
                    <li key={endpoint.id}>
                      <a 
                        href={`#${endpoint.id}`} 
                        className={`block px-3 py-2 rounded-md transition-colors ${activeTab === endpoint.id ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
                        onClick={() => setActiveTab(endpoint.id)}
                      >
                        {endpoint.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Introduction Section */}
              {activeTab === 'introduction' && (
                <div id="introduction" className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                  <p className="text-gray-300 mb-4">
                    Welcome to the NeuraVerse API reference. Our APIs provide programmatic access to NeuraVerse's powerful
                    AI/ML tools and services. This documentation will help you integrate our services into your applications.
                  </p>
                  <p className="text-gray-300 mb-4">
                    The API is organized around REST principles. It accepts JSON-encoded request bodies, returns JSON-encoded responses, and
                    uses standard HTTP response codes and authentication.
                  </p>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Base URL</h3>
                    <code className="block p-3 bg-slate-800 rounded text-blue-300 font-mono">
                      https://api.neuraverse.com
                    </code>
                  </div>
                </div>
              )}
              
              {/* Authentication Section */}
              {activeTab === 'authentication' && (
                <div id="authentication" className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                  <p className="text-gray-300 mb-4">
                    The NeuraVerse API uses API keys for authentication. You can manage your API keys from your account settings.
                    Your API keys carry many privileges, so be sure to keep them secure!
                  </p>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Authentication Example</h3>
                    <code className="block p-3 bg-slate-800 rounded text-blue-300 font-mono">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>
              )}
              
              {/* Rate Limits Section */}
              {activeTab === 'ratelimits' && (
                <div id="ratelimits" className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Rate Limits</h2>
                  <p className="text-gray-300 mb-4">
                    The NeuraVerse API implements rate limiting to ensure stability and availability for all users.
                    Rate limits vary based on your subscription plan.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="p-3 text-white">Plan</th>
                          <th className="p-3 text-white">Requests per minute</th>
                          <th className="p-3 text-white">Requests per day</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <tr>
                          <td className="p-3 text-gray-300">Basic</td>
                          <td className="p-3 text-gray-300">60</td>
                          <td className="p-3 text-gray-300">10,000</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-gray-300">Pro</td>
                          <td className="p-3 text-gray-300">120</td>
                          <td className="p-3 text-gray-300">50,000</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-gray-300">Enterprise</td>
                          <td className="p-3 text-gray-300">Unlimited</td>
                          <td className="p-3 text-gray-300">Unlimited</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Endpoints Section */}
              {activeTab === 'endpoints' && (
                <div id="endpoints" className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Available Endpoints</h2>
                  <p className="text-gray-300 mb-4">
                    Below is a list of all available API endpoints. Click on each endpoint to view detailed documentation.
                  </p>
                  <div className="space-y-4">
                    {filteredEndpoints.map(endpoint => (
                      <div 
                        key={endpoint.id}
                        className="p-4 border border-slate-700 rounded-lg hover:bg-slate-700/20 transition-colors"
                      >
                        <a 
                          href={`#${endpoint.id}`} 
                          className="flex justify-between items-center"
                          onClick={() => setActiveTab(endpoint.id)}
                        >
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded mr-3 ${
                              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-300' : 
                              endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-300' :
                              endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>{endpoint.method}</span>
                            <span className="text-white font-medium">{endpoint.name}</span>
                          </div>
                          <span className="text-gray-400">{endpoint.endpoint}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Individual Endpoint Documentation */}
              {filteredEndpoints.map(endpoint => (
                activeTab === endpoint.id && (
                  <div id={endpoint.id} key={endpoint.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                    <div className="flex items-center mb-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded mr-3 ${
                        endpoint.method === 'GET' ? 'bg-green-500/20 text-green-300' : 
                        endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-300' :
                        endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>{endpoint.method}</span>
                      <h2 className="text-2xl font-bold text-white">{endpoint.name}</h2>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6 flex justify-between items-center">
                      <code className="text-blue-300 font-mono">{endpoint.endpoint}</code>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={() => handleCopyCode(endpoint.endpoint, `${endpoint.id}-endpoint`)}
                      >
                        {copiedEndpoint === `${endpoint.id}-endpoint` ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-gray-300 mb-6">{endpoint.description}</p>
                    
                    {/* Parameters */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3">Parameters</h3>
                      {endpoint.parameters.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="border-b border-slate-700">
                              <tr>
                                <th className="p-3 text-white">Name</th>
                                <th className="p-3 text-white">Type</th>
                                <th className="p-3 text-white">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                              {endpoint.parameters.map((param, index) => (
                                <tr key={index}>
                                <td className="p-3 text-gray-300">{param.name}</td>
                                <td className="p-3 text-gray-300">{param.type}</td>
                                <td className="p-3 text-gray-300">{param.description}</td>
                              </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-400">No parameters required</p>
                      )}
                    </div>
                    
                    {/* Response Codes */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3">Response Codes</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="border-b border-slate-700">
                            <tr>
                              <th className="p-3 text-white">Code</th>
                              <th className="p-3 text-white">Description</th>
                              <th className="p-3 text-white">Example</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {endpoint.responses.map((response, index) => (
                              <tr key={index}>
                                <td className="p-3 text-gray-300">{response.code}</td>
                                <td className="p-3 text-gray-300">{response.description}</td>
                                <td className="p-3 font-mono text-sm">
                                  <div className="bg-slate-900 p-2 rounded">
                                    <code className="text-blue-300">{response.example}</code>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Code Examples */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Code Examples</h3>
                      <Tabs defaultValue="javascript">
                        <TabsList className="bg-slate-900 border-slate-700">
                          <TabsTrigger value="javascript" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">JavaScript</TabsTrigger>
                          <TabsTrigger value="python" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">Python</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="javascript" className="mt-2">
                          <div className="relative bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="absolute top-2 right-2 text-gray-400 hover:text-white"
                              onClick={() => handleCopyCode(endpoint.codeExamples.javascript, `${endpoint.id}-js`)}
                            >
                              {copiedEndpoint === `${endpoint.id}-js` ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="text-blue-300 font-mono text-sm overflow-x-auto p-1">
                              {endpoint.codeExamples.javascript}
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="python" className="mt-2">
                          <div className="relative bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="absolute top-2 right-2 text-gray-400 hover:text-white"
                              onClick={() => handleCopyCode(endpoint.codeExamples.python, `${endpoint.id}-py`)}
                            >
                              {copiedEndpoint === `${endpoint.id}-py` ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <pre className="text-blue-300 font-mono text-sm overflow-x-auto p-1">
                              {endpoint.codeExamples.python}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    {/* Try It Out (Interactive console) */}
                    <div className="mt-8 border-t border-slate-700 pt-6">
                      <h3 className="text-xl font-semibold text-white mb-3">Try It Out</h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <p className="text-gray-400 mb-4">Test this endpoint with your API key</p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Open Console
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              ))}
              
              {/* No results found */}
              {searchQuery && filteredEndpoints.length === 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No API endpoints found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApiReference;