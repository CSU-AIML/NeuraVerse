import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Play, RefreshCw, ExternalLink, Terminal, Server, Globe, Key } from 'lucide-react';
import type { Project } from '../types/project';

interface ProjectUsageProps {
  project: Project;
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

// Add more backends as needed
type BackendType = 'python' | 'node' | 'other';
type FrontendType = 'react' | 'vue' | 'angular' | 'other';

interface ProjectConfig {
  requiresGithubToken: boolean;
  backendType: BackendType;
  backendCommand: string;
  frontendType: FrontendType;
  frontendCommand: string;
  backendPort: number;
  frontendPort: number;
}

export const ProjectUsage: React.FC<ProjectUsageProps> = ({
  project,
  onClose,
  isMaximized = false,
  onToggleMaximize = () => {},
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState('');
  const [backendRunning, setBackendRunning] = useState(false);
  const [frontendRunning, setFrontendRunning] = useState(false);
  const [backendLogs, setBackendLogs] = useState<string[]>([]);
  const [frontendLogs, setFrontendLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend' | 'config'>('config');
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Determine project configuration based on tech stack or other properties
  const getProjectConfig = (): ProjectConfig => {
    // This is a simplified example - in a real app, you'd want to detect
    // the configuration from the project details or have it stored in the database
    return {
      requiresGithubToken: true,
      backendType: 'python',
      backendCommand: 'python app.py',
      frontendType: 'react',
      frontendCommand: 'npm run dev',
      backendPort: 5000,
      frontendPort: 3000
    };
  };
  
  const projectConfig = getProjectConfig();
  
  useEffect(() => {
    // Auto-scroll logs to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [backendLogs, frontendLogs]);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const startBackend = async () => {
    if (backendRunning) return;
    
    setBackendLogs(prev => [...prev, '> Starting backend server...']);
    
    try {
      // In a real implementation, you would call your API to start the backend
      // This is a simulation
      setBackendLogs(prev => [
        ...prev, 
        '> Setting environment variables...',
        `> GITHUB_TOKEN set ${githubToken ? '✓' : '(empty)'}`
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBackendLogs(prev => [
        ...prev,
        `> Executing: ${projectConfig.backendCommand}`,
        '> Starting Python server...',
        '> Loading dependencies...',
        '> Initializing database connection...',
        `> Server running on port ${projectConfig.backendPort}`
      ]);
      
      setBackendRunning(true);
    } catch (err: any) {
      setBackendLogs(prev => [...prev, `> Error: ${err.message || 'Failed to start backend'}`]);
      setError('Failed to start backend server');
    }
  };

  const startFrontend = async () => {
    if (frontendRunning) return;
    
    setFrontendLogs(prev => [...prev, '> Starting frontend development server...']);
    
    try {
      // In a real implementation, you would call your API to start the frontend
      // This is a simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFrontendLogs(prev => [
        ...prev,
        `> Executing: ${projectConfig.frontendCommand}`,
        '> Starting Vite development server...',
        '> Compiling...',
        '> Dependencies loaded successfully',
        `> Server running on port ${projectConfig.frontendPort}`,
        `> Local:   http://localhost:${projectConfig.frontendPort}/`,
        `> Network: http://192.168.1.X:${projectConfig.frontendPort}/`,
        '> Ready for development!'
      ]);
      
      setFrontendRunning(true);
    } catch (err: any) {
      setFrontendLogs(prev => [...prev, `> Error: ${err.message || 'Failed to start frontend'}`]);
      setError('Failed to start frontend server');
    }
  };

  const startProject = async () => {
    if (projectConfig.requiresGithubToken && !githubToken) {
      setError('GitHub token is required');
      return;
    }
    
    setError(null);
    
    // Start backend first, then frontend
    await startBackend();
    await startFrontend();
  };

  const openProjectInBrowser = () => {
    // Open the frontend URL in a new tab
    window.open(`http://localhost:${projectConfig.frontendPort}`, '_blank');
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-800 flex flex-col
      ${isMaximized ? 'fixed inset-4 z-50' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            loading ? 'bg-yellow-500' :
            error ? 'bg-red-500' :
            backendRunning && frontendRunning ? 'bg-green-500 animate-pulse' : 
            backendRunning || frontendRunning ? 'bg-blue-500' : 'bg-gray-500'
          }`}></div>
          <h3 className="font-semibold text-white truncate">{project.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMaximize}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'config' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Key size={14} className="inline mr-1" />
          Config
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'backend' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Server size={14} className="inline mr-1" />
          Backend
        </button>
        <button
          onClick={() => setActiveTab('frontend')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'frontend' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Globe size={14} className="inline mr-1" />
          Frontend
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-400">Loading project...</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {activeTab === 'config' && (
              <div className="p-4">
                <h4 className="text-lg font-medium text-white mb-4">Project Configuration</h4>
                
                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4 text-red-300 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  {projectConfig.requiresGithubToken && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">
                        GitHub Token
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          placeholder="Enter your GitHub token"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This token will be used as an environment variable
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="text-gray-300 text-sm font-medium mb-2">Project Details</h5>
                    <div className="bg-gray-800 rounded-md p-3 text-sm">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="text-gray-400">Backend:</div>
                        <div className="text-white">{projectConfig.backendType}</div>
                        <div className="text-gray-400">Backend Command:</div>
                        <div className="text-white">{projectConfig.backendCommand}</div>
                        <div className="text-gray-400">Frontend:</div>
                        <div className="text-white">{projectConfig.frontendType}</div>
                        <div className="text-gray-400">Frontend Command:</div>
                        <div className="text-white">{projectConfig.frontendCommand}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={startProject}
                      disabled={backendRunning && frontendRunning}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-md text-white font-medium flex items-center justify-center"
                    >
                      <Play size={16} className="mr-2" />
                      {backendRunning && frontendRunning 
                        ? 'Project Running' 
                        : 'Start Project'}
                    </button>
                    
                    {backendRunning && frontendRunning && (
                      <button
                        onClick={openProjectInBrowser}
                        className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium flex items-center justify-center"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Open in Browser
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'backend' && (
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-300 font-medium">Backend Logs</h4>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${backendRunning ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    <span className="text-xs text-gray-400">{backendRunning ? 'Running' : 'Stopped'}</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-black rounded-md p-3 font-mono text-xs text-green-400 overflow-auto">
                  {backendLogs.length === 0 ? (
                    <div className="text-gray-500 italic">No logs available. Start the project to see backend logs.</div>
                  ) : (
                    <>
                      {backendLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                      <div ref={logsEndRef} />
                    </>
                  )}
                </div>
                
                <button
                  onClick={startBackend}
                  disabled={backendRunning}
                  className="mt-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded text-sm text-white"
                >
                  {backendRunning ? 'Backend Running' : 'Start Backend'}
                </button>
              </div>
            )}
            
            {activeTab === 'frontend' && (
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-300 font-medium">Frontend Logs</h4>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${frontendRunning ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    <span className="text-xs text-gray-400">{frontendRunning ? 'Running' : 'Stopped'}</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-black rounded-md p-3 font-mono text-xs text-green-400 overflow-auto">
                  {frontendLogs.length === 0 ? (
                    <div className="text-gray-500 italic">No logs available. Start the project to see frontend logs.</div>
                  ) : (
                    <>
                      {frontendLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                      <div ref={logsEndRef} />
                    </>
                  )}
                </div>
                
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={startFrontend}
                    disabled={frontendRunning || !backendRunning}
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded text-sm text-white flex-1"
                  >
                    {frontendRunning ? 'Frontend Running' : 'Start Frontend'}
                  </button>
                  
                  {frontendRunning && (
                    <button
                      onClick={openProjectInBrowser}
                      className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm text-white"
                    >
                      Open
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div>
            {backendRunning && frontendRunning 
              ? 'Project running' 
              : backendRunning 
                ? 'Backend running' 
                : 'Ready to start'}
          </div>
          <div className="flex items-center gap-3">
            <span>
              Backend: <span className={backendRunning ? 'text-green-400' : 'text-gray-500'}>
                {backendRunning ? 'Online' : 'Offline'}
              </span>
            </span>
            <span>
              Frontend: <span className={frontendRunning ? 'text-green-400' : 'text-gray-500'}>
                {frontendRunning ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};