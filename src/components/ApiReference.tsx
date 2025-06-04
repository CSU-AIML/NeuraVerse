import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, 
  Copy, 
  CheckCircle, 
  Info, 
  Play, 
  Code, 
  Book, 
  Zap, 
  Shield, 
  Globe, 
  Database,
  Brain,
  Image,
  FileText,
  MessageSquare,
  Webhook,
  Key,
  Clock,
  Activity,
  ArrowLeft
} from 'lucide-react';
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

const ApiReference = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [testingEndpoint, setTestingEndpoint] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [testResponse, setTestResponse] = useState(null);

  // Enhanced API endpoints with comprehensive documentation
  const apiEndpoints = [
    {
      id: 'models-list',
      name: 'List Models',
      method: 'GET',
      endpoint: '/v1/models',
      category: 'Models',
      description: 'Retrieve a list of available AI models with their capabilities and pricing information.',
      parameters: [
        { name: 'category', type: 'string', required: false, description: 'Filter by model category (text, image, audio, multimodal)' },
        { name: 'limit', type: 'integer', required: false, description: 'Maximum number of models to return (default: 50)' },
        { name: 'provider', type: 'string', required: false, description: 'Filter by model provider (openai, anthropic, google)' }
      ],
      responses: [
        { 
          code: '200', 
          description: 'Success', 
          example: `{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "openai",
      "category": "text",
      "max_tokens": 8192,
      "pricing": {
        "input": 0.03,
        "output": 0.06
      }
    }
  ],
  "total": 15
}` 
        }
      ],
      codeExamples: {
        javascript: `const response = await fetch('https://api.neuraverse.com/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const models = await response.json();
console.log(models);`,
        python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.neuraverse.com/v1/models',
    headers=headers
)

models = response.json()
print(models)`,
        curl: `curl -X GET "https://api.neuraverse.com/v1/models" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
      }
    },
    {
      id: 'chat-completions',
      name: 'Create Chat Completion',
      method: 'POST',
      endpoint: '/v1/chat/completions',
      category: 'Text Generation',
      description: 'Generate conversational responses using advanced language models.',
      parameters: [
        { name: 'model', type: 'string', required: true, description: 'ID of the model to use' },
        { name: 'messages', type: 'array', required: true, description: 'Array of message objects' },
        { name: 'max_tokens', type: 'integer', required: false, description: 'Maximum tokens in response' },
        { name: 'temperature', type: 'number', required: false, description: 'Randomness (0.0 to 2.0)' },
        { name: 'stream', type: 'boolean', required: false, description: 'Enable streaming responses' }
      ],
      responses: [
        { 
          code: '200', 
          description: 'Success', 
          example: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699896916,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 8,
    "total_tokens": 20
  }
}` 
        }
      ],
      codeExamples: {
        javascript: `const response = await fetch('https://api.neuraverse.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 150,
    temperature: 0.7
  })
});

const completion = await response.json();
console.log(completion.choices[0].message.content);`,
        python: `import requests

data = {
    "model": "gpt-4",
    "messages": [
        {"role": "user", "content": "Hello, how are you?"}
    ],
    "max_tokens": 150,
    "temperature": 0.7
}

response = requests.post(
    'https://api.neuraverse.com/v1/chat/completions',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json=data
)

completion = response.json()
print(completion['choices'][0]['message']['content'])`,
        curl: `curl -X POST "https://api.neuraverse.com/v1/chat/completions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 150
  }'`
      }
    },
    {
      id: 'image-generation',
      name: 'Generate Images',
      method: 'POST',
      endpoint: '/v1/images/generations',
      category: 'Image Generation',
      description: 'Create high-quality images from text descriptions using state-of-the-art diffusion models.',
      parameters: [
        { name: 'prompt', type: 'string', required: true, description: 'Text description of the image' },
        { name: 'model', type: 'string', required: false, description: 'Image generation model (default: dall-e-3)' },
        { name: 'size', type: 'string', required: false, description: 'Image dimensions (1024x1024, 1792x1024, 1024x1792)' },
        { name: 'quality', type: 'string', required: false, description: 'Image quality (standard, hd)' },
        { name: 'n', type: 'integer', required: false, description: 'Number of images to generate (1-4)' }
      ],
      responses: [
        { 
          code: '200', 
          description: 'Success', 
          example: `{
  "created": 1699896916,
  "data": [
    {
      "url": "https://cdn.neuraverse.com/images/abc123.png",
      "revised_prompt": "A serene landscape with mountains..."
    }
  ]
}` 
        }
      ],
      codeExamples: {
        javascript: `const response = await fetch('https://api.neuraverse.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A futuristic city at sunset',
    size: '1024x1024',
    quality: 'hd',
    n: 1
  })
});

const images = await response.json();
console.log(images.data[0].url);`,
        python: `import requests

data = {
    "prompt": "A futuristic city at sunset",
    "size": "1024x1024",
    "quality": "hd",
    "n": 1
}

response = requests.post(
    'https://api.neuraverse.com/v1/images/generations',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json=data
)

images = response.json()
print(images['data'][0]['url'])`,
        curl: `curl -X POST "https://api.neuraverse.com/v1/images/generations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A futuristic city at sunset",
    "size": "1024x1024",
    "quality": "hd"
  }'`
      }
    },
    {
      id: 'embeddings',
      name: 'Create Embeddings',
      method: 'POST',
      endpoint: '/v1/embeddings',
      category: 'Embeddings',
      description: 'Convert text into numerical vector representations for semantic search and similarity analysis.',
      parameters: [
        { name: 'input', type: 'string|array', required: true, description: 'Text or array of texts to embed' },
        { name: 'model', type: 'string', required: true, description: 'Embedding model to use' },
        { name: 'encoding_format', type: 'string', required: false, description: 'Format for embeddings (float, base64)' }
      ],
      responses: [
        { 
          code: '200', 
          description: 'Success', 
          example: `{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.123, -0.456, 0.789, ...]
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}` 
        }
      ],
      codeExamples: {
        javascript: `const response = await fetch('https://api.neuraverse.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'text-embedding-ada-002',
    input: 'The quick brown fox jumps over the lazy dog'
  })
});

const embeddings = await response.json();
console.log(embeddings.data[0].embedding);`,
        python: `import requests

data = {
    "model": "text-embedding-ada-002",
    "input": "The quick brown fox jumps over the lazy dog"
}

response = requests.post(
    'https://api.neuraverse.com/v1/embeddings',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json=data
)

embeddings = response.json()
print(embeddings['data'][0]['embedding'])`,
        curl: `curl -X POST "https://api.neuraverse.com/v1/embeddings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "text-embedding-ada-002",
    "input": "Your text here"
  }'`
      }
    }
  ];

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const handleTestEndpoint = async (endpoint) => {
    setTestingEndpoint(endpoint.id);
    // Simulate API testing
    setTimeout(() => {
      setTestResponse({
        status: 200,
        data: JSON.parse(endpoint.responses[0].example),
        time: Math.floor(Math.random() * 500) + 100
      });
      setTestingEndpoint(null);
    }, 1500);
  };

  const filteredEndpoints = apiEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(apiEndpoints.map(e => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-slate-800/50 transition-all"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            NeuraVerse API
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful AI APIs for the next generation of applications
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Book className="w-4 h-4 mr-2" />
              Quick Start
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Key className="w-4 h-4 mr-2" />
              Get API Key
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              className="pl-12 pr-4 py-4 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 rounded-2xl text-lg backdrop-blur-sm"
              placeholder="Search endpoints, methods, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-400" />
                Navigation
              </h3>
              
              {/* Quick Links */}
              <div className="space-y-2 mb-8">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'authentication', label: 'Authentication', icon: Shield },
                  { id: 'rate-limits', label: 'Rate Limits', icon: Clock },
                  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Categories */}
              <div className="border-t border-slate-700 pt-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">API Categories</h4>
                <div className="space-y-2">
                  {categories.map(category => {
                    const count = apiEndpoints.filter(e => e.category === category).length;
                    return (
                      <div key={category} className="flex items-center justify-between text-gray-400 hover:text-white cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                        <span className="text-sm">{category}</span>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-6">Getting Started</h2>
                  <p className="text-gray-300 text-lg mb-8">
                    The NeuraVerse API provides access to cutting-edge AI models for text generation, image creation, 
                    embeddings, and more. Built on REST principles with JSON responses.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                      <Brain className="w-8 h-8 text-blue-400 mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-2">AI Models</h3>
                      <p className="text-gray-400">Access state-of-the-art language and vision models</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                      <Zap className="w-8 h-8 text-green-400 mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-2">Fast & Reliable</h3>
                      <p className="text-gray-400">99.9% uptime with global edge infrastructure</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Code className="w-5 h-5 mr-2 text-blue-400" />
                      Base URL
                    </h3>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <code className="text-blue-300 font-mono text-lg">https://api.neuraverse.com</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-4 text-gray-400 hover:text-white"
                        onClick={() => handleCopyCode('https://api.neuraverse.com', 'base-url')}
                      >
                        {copiedEndpoint === 'base-url' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white">99.9%</div>
                      <div className="text-gray-400">Uptime</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white">&lt;100ms</div>
                      <div className="text-gray-400">Avg Response</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white">Enterprise</div>
                      <div className="text-gray-400">Security</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Authentication */}
            {activeTab === 'authentication' && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-blue-400" />
                  Authentication
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  The NeuraVerse API uses Bearer token authentication. Include your API key in the Authorization header.
                </p>
                
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Header Format</h3>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <code className="text-blue-300 font-mono">Authorization: Bearer sk-proj-abc123...</code>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Security Best Practices</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Never expose API keys in client-side code</li>
                      <li>• Use environment variables for key storage</li>
                      <li>• Rotate keys regularly</li>
                      <li>• Monitor usage for unusual activity</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* API Endpoints */}
            {activeTab !== 'overview' && activeTab !== 'authentication' && activeTab !== 'rate-limits' && activeTab !== 'webhooks' && (
              <div className="space-y-8">
                {filteredEndpoints.map(endpoint => (
                  <div key={endpoint.id} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                    
                    {/* Endpoint Header */}
                    <div className="p-8 border-b border-slate-700/50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center mb-3">
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg mr-4 ${
                              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                              endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {endpoint.method}
                            </span>
                            <span className="text-sm text-gray-400 bg-slate-700 px-3 py-1 rounded-lg">{endpoint.category}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{endpoint.name}</h3>
                          <p className="text-gray-300 text-lg">{endpoint.description}</p>
                        </div>
                        <Button 
                          onClick={() => handleTestEndpoint(endpoint)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          disabled={testingEndpoint === endpoint.id}
                        >
                          {testingEndpoint === endpoint.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          Test API
                        </Button>
                      </div>
                      
                      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                        <code className="text-blue-300 font-mono text-lg">{endpoint.endpoint}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyCode(endpoint.endpoint, `${endpoint.id}-endpoint`)}
                        >
                          {copiedEndpoint === `${endpoint.id}-endpoint` ? 
                            <CheckCircle className="w-4 h-4 text-green-500" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </div>
                    
                    {/* Endpoint Content */}
                    <div className="p-8">
                      <Tabs defaultValue="parameters" className="space-y-6">
                        <TabsList className="bg-slate-900 border-slate-700">
                          <TabsTrigger value="parameters">Parameters</TabsTrigger>
                          <TabsTrigger value="responses">Responses</TabsTrigger>
                          <TabsTrigger value="examples">Code Examples</TabsTrigger>
                          {testResponse && <TabsTrigger value="test">Test Results</TabsTrigger>}
                        </TabsList>
                        
                        <TabsContent value="parameters" className="space-y-4">
                          {endpoint.parameters.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-slate-700">
                                    <th className="text-left p-4 text-white font-semibold">Parameter</th>
                                    <th className="text-left p-4 text-white font-semibold">Type</th>
                                    <th className="text-left p-4 text-white font-semibold">Required</th>
                                    <th className="text-left p-4 text-white font-semibold">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param, index) => (
                                    <tr key={index} className="border-b border-slate-700/50">
                                      <td className="p-4 font-mono text-blue-300">{param.name}</td>
                                      <td className="p-4 text-gray-300">{param.type}</td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          param.required ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                          {param.required ? 'Required' : 'Optional'}
                                        </span>
                                      </td>
                                      <td className="p-4 text-gray-300">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-400 p-4 text-center bg-slate-900/30 rounded-lg">No parameters required</p>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="responses">
                          <div className="space-y-4">
                            {endpoint.responses.map((response, index) => (
                              <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-white">Status {response.code}</h4>
                                  <span className="text-gray-400">{response.description}</span>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
                                  <pre className="text-blue-300 font-mono text-sm whitespace-pre-wrap">
                                    {response.example}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="examples">
                          <div className="space-y-4">
                            <div className="flex gap-2 mb-4">
                              {Object.keys(endpoint.codeExamples).map(lang => (
                                <Button
                                  key={lang}
                                  variant={selectedLanguage === lang ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedLanguage(lang)}
                                  className={selectedLanguage === lang ? "bg-blue-600" : ""}
                                >
                                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </Button>
                              ))}
                            </div>
                            <div className="relative bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                onClick={() => handleCopyCode(endpoint.codeExamples[selectedLanguage], `${endpoint.id}-${selectedLanguage}`)}
                              >
                                {copiedEndpoint === `${endpoint.id}-${selectedLanguage}` ? 
                                  <CheckCircle className="w-4 h-4 text-green-500" /> : 
                                  <Copy className="w-4 h-4" />
                                }
                              </Button>
                              <pre className="text-blue-300 font-mono text-sm overflow-x-auto pr-12 whitespace-pre-wrap">
                                {endpoint.codeExamples[selectedLanguage]}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        {testResponse && (
                          <TabsContent value="test">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-white">Test Response</h4>
                                <div className="flex items-center gap-4">
                                  <span className="text-green-400">Status: {testResponse.status}</span>
                                  <span className="text-gray-400">Time: {testResponse.time}ms</span>
                                </div>
                              </div>
                              <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-blue-300 font-mono text-sm whitespace-pre-wrap">
                                  {JSON.stringify(testResponse.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rate Limits */}
            {activeTab === 'rate-limits' && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-8 h-8 mr-3 text-blue-400" />
                  Rate Limits
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Our API implements intelligent rate limiting to ensure optimal performance for all users.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { plan: 'Starter', rpm: '60', rpd: '1,000', color: 'blue' },
                    { plan: 'Pro', rpm: '300', rpd: '10,000', color: 'purple' },
                    { plan: 'Enterprise', rpm: 'Custom', rpd: 'Custom', color: 'green' }
                  ].map(tier => (
                    <Card key={tier.plan} className={`bg-gradient-to-r from-${tier.color}-500/10 to-${tier.color}-600/10 border-${tier.color}-500/20`}>
                      <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">{tier.plan}</h3>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-white">{tier.rpm}</div>
                          <div className="text-gray-400 text-sm">requests/minute</div>
                          <div className="text-lg font-semibold text-white">{tier.rpd}</div>
                          <div className="text-gray-400 text-sm">requests/day</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Rate Limit Headers</h3>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="text-gray-300"><span className="text-blue-300">X-RateLimit-Limit:</span> 60</div>
                    <div className="text-gray-300"><span className="text-blue-300">X-RateLimit-Remaining:</span> 59</div>
                    <div className="text-gray-300"><span className="text-blue-300">X-RateLimit-Reset:</span> 1699896916</div>
                  </div>
                </div>
              </div>
            )}

            {/* Webhooks */}
            {activeTab === 'webhooks' && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <Webhook className="w-8 h-8 mr-3 text-blue-400" />
                  Webhooks
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Receive real-time notifications about events in your account through webhooks.
                </p>
                
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Supported Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'completion.created', 'completion.completed', 'completion.failed',
                        'image.generated', 'embeddings.created', 'usage.limit_reached'
                      ].map(event => (
                        <div key={event} className="flex items-center p-3 bg-slate-800 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <code className="text-blue-300 text-sm">{event}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Example Payload</h3>
                    <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-blue-300 font-mono text-sm whitespace-pre-wrap">
{`{
  "id": "evt_abc123",
  "type": "completion.completed",
  "created": 1699896916,
  "data": {
    "id": "cmpl-abc123",
    "model": "gpt-4",
    "usage": {
      "prompt_tokens": 12,
      "completion_tokens": 8,
      "total_tokens": 20
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && filteredEndpoints.length === 0 && activeTab === 'overview' && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400">No endpoints match "{searchQuery}". Try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiReference;