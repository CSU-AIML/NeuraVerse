// components/DebugAuth.tsx - Add this temporarily to debug auth issues
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const DebugAuth: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const runDebug = async () => {
    setLoading(true);
    try {
      // Test 1: Check Firebase auth
      const firebaseAuth = {
        isAuthenticated,
        userId: user?.uid,
        email: user?.email,
      };

      // Test 2: Check stored tokens
      const storedAuth = {
        firebaseToken: localStorage.getItem('firebase_token') ? 'Present' : 'Missing',
        firebaseUid: localStorage.getItem('firebase_uid'),
      };

      // Test 3: Test Supabase connection
      let supabaseTest = {};
      try {
        const { data, error } = await supabase.from('projects').select('id').limit(1);
        supabaseTest = {
          connection: 'Success',
          error: error?.message || null,
          dataCount: data?.length || 0,
        };
      } catch (err: any) {
        supabaseTest = {
          connection: 'Failed',
          error: err.message,
        };
      }

      // Test 4: Test storage bucket access
      let storageTest = {};
      try {
        const { data, error } = await supabase.storage.from('project-images').list('', {
          limit: 1,
        });
        storageTest = {
          bucketAccess: 'Success',
          error: error?.message || null,
          filesCount: data?.length || 0,
        };
      } catch (err: any) {
        storageTest = {
          bucketAccess: 'Failed',
          error: err.message,
        };
      }

      // Test 5: Check RLS policies
      let rlsTest = {};
      try {
        // Try to query storage objects directly
        const { data, error } = await supabase
          .from('storage.objects')
          .select('*')
          .eq('bucket_id', 'project-images')
          .limit(1);
        
        rlsTest = {
          rlsQuery: 'Success',
          error: error?.message || null,
        };
      } catch (err: any) {
        rlsTest = {
          rlsQuery: 'Failed',
          error: err.message,
        };
      }

      setDebugInfo({
        timestamp: new Date().toISOString(),
        firebaseAuth,
        storedAuth,
        supabaseTest,
        storageTest,
        rlsTest,
      });
    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">🔍 Authentication Debug</h3>
      
      <button
        onClick={runDebug}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 mb-4"
      >
        {loading ? 'Running Tests...' : 'Run Debug Tests'}
      </button>

      {debugInfo && (
        <div className="space-y-4">
          <div className="bg-gray-900 p-3 rounded">
            <h4 className="text-sm font-semibold text-green-400 mb-2">Firebase Authentication</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.firebaseAuth, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-3 rounded">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Stored Auth Tokens</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.storedAuth, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-3 rounded">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Supabase Connection</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.supabaseTest, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-3 rounded">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">Storage Bucket Access</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.storageTest, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-3 rounded">
            <h4 className="text-sm font-semibold text-red-400 mb-2">RLS Policy Test</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo.rlsTest, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>How to use:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Run the debug test when logged in</li>
          <li>Check if Firebase auth shows as authenticated</li>
          <li>Verify Supabase connection works</li>
          <li>Look for storage bucket errors</li>
          <li>Check RLS policy errors</li>
        </ul>
      </div>
    </div>
  );
};

// Add this to your page temporarily:
// <DebugAuth />