// src/components/DatabaseConnectionTest.tsx
import React, { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';

const DatabaseConnectionTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<{url: string, keyPrefix: string} | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get environment variables (safely)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
      const supabaseKeyPrefix = import.meta.env.VITE_SUPABASE_ANON_KEY 
        ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 5) + '...' 
        : 'Not configured';
      
      setEnvVars({
        url: supabaseUrl,
        keyPrefix: supabaseKeyPrefix
      });
      
      // Test connection
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Failed to connect to Supabase.');
      }
    } catch (err: any) {
      setIsConnected(false);
      setError(err.message || 'An unknown error occurred');
      console.error('Connection test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Database Connection Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Connection Status:</span>
          {isLoading ? (
            <span className="flex items-center text-yellow-400">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              Testing...
            </span>
          ) : isConnected === null ? (
            <span className="text-gray-400">Not tested</span>
          ) : isConnected ? (
            <span className="text-green-400">Connected</span>
          ) : (
            <span className="text-red-400">Disconnected</span>
          )}
        </div>
        
        {envVars && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Supabase URL:</span>
              <span className="text-gray-400 font-mono text-sm max-w-xs truncate">{envVars.url}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Key (prefix):</span>
              <span className="text-gray-400 font-mono text-sm">{envVars.keyPrefix}</span>
            </div>
          </>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700/30 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-1">Error:</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionTest;