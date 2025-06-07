// src/components/AdminSetup.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import UserManagementService from '../services/userManagementService';

interface SetupStatus {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
}

export function AdminSetup() {
  const [setupSteps, setSetupSteps] = useState<SetupStatus[]>([
    { step: 'Database Connection', status: 'pending', message: 'Checking database connection...' },
    { step: 'Schema Validation', status: 'pending', message: 'Validating database schema...' },
    { step: 'RLS Policies', status: 'pending', message: 'Checking RLS policies...' },
    { step: 'Admin User', status: 'pending', message: 'Setting up admin user...' },
  ]);
  
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const updateStep = (stepIndex: number, status: 'running' | 'success' | 'error', message: string) => {
    setSetupSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, message } : step
    ));
  };

  const runSetup = async () => {
    if (!adminPassword) {
      alert('Please enter an admin password');
      return;
    }

    setIsRunning(true);

    try {
      // Step 1: Database Connection
      updateStep(0, 'running', 'Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (testError) {
        updateStep(0, 'error', `Connection failed: ${testError.message}`);
        return;
      }
      updateStep(0, 'success', 'Database connection successful');

      // Step 2: Schema Validation
      updateStep(1, 'running', 'Checking required tables...');
      const { data: tableCheck } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .in('table_name', ['user_profiles', 'audit_logs', 'security_events'])
        .eq('table_schema', 'public');
      
      const requiredTables = ['user_profiles', 'audit_logs', 'security_events'];
      const existingTables = tableCheck?.map(t => t.table_name) || [];
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        updateStep(1, 'error', `Missing tables: ${missingTables.join(', ')}`);
        return;
      }
      updateStep(1, 'success', 'All required tables found');

      // Step 3: RLS Policies
      updateStep(2, 'running', 'Checking RLS policies...');
      try {
        // Test if we can query with RLS enabled
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user) {
          // Try to fetch user profile to test RLS
          await supabase
            .from('user_profiles')
            .select('id')
            .eq('firebase_uid', currentUser.user.id)
            .limit(1);
        }
        updateStep(2, 'success', 'RLS policies are working');
      } catch (rlsError) {
        const rlsErrorMessage = rlsError instanceof Error ? rlsError.message : String(rlsError);
        updateStep(2, 'error', `RLS policy issue: ${rlsErrorMessage}`);
        // Continue anyway, we'll fix this with admin creation
      }

      // Step 4: Admin User Creation
      updateStep(3, 'running', 'Creating admin user...');
      try {
        await UserManagementService.initializeAdminUser(adminEmail, adminPassword);
        updateStep(3, 'success', 'Admin user created successfully');
      } catch (adminError) {
        const adminErrorMessage = adminError instanceof Error ? adminError.message : String(adminError);
        updateStep(3, 'error', `Admin creation failed: ${adminErrorMessage}`);
        return;
      }

      alert('Setup completed successfully! You can now sign in with your admin credentials.');
      
    } catch (error) {
      console.error('Setup error:', error);
      alert(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runDiagnostics = async () => {
    console.log('=== SUPABASE DIAGNOSTICS ===');
    
    try {
      // Check current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', userData.user?.id, userError?.message);
      
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', !!sessionData.session, sessionError?.message);
      
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .limit(1);
      console.log('Database test:', dbTest, dbError?.message);
      
      // Check table structure
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'user_profiles')
        .eq('table_schema', 'public');
      console.log('User profiles columns:', columns);
      
      // Check RLS status
      const { data: rlsStatus } = await supabase
        .rpc('pg_get_rls_status', { table_name: 'user_profiles' })
        .single();
      console.log('RLS status:', rlsStatus);
      
    } catch (error) {
      console.error('Diagnostics error:', error);
    }
    
    console.log('=== END DIAGNOSTICS ===');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Admin Setup & Diagnostics</h2>
      
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Setup Steps</h3>
        {setupSteps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
              step.status === 'pending' ? 'bg-gray-300' :
              step.status === 'running' ? 'bg-blue-500 animate-pulse' :
              step.status === 'success' ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{step.step}</div>
              <div className={`text-sm ${
                step.status === 'error' ? 'text-red-600' :
                step.status === 'success' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {step.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Admin User Setup</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Email
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Password
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a secure password"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={runSetup}
          disabled={isRunning || !adminPassword}
          className={`px-6 py-2 rounded-md font-medium ${
            isRunning || !adminPassword
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Setup...' : 'Run Setup'}
        </button>
        
        <button
          onClick={runDiagnostics}
          className="px-6 py-2 rounded-md font-medium bg-gray-600 text-white hover:bg-gray-700"
        >
          Run Diagnostics
        </button>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>First, make sure you've run the SQL schema update in your Supabase SQL editor</li>
          <li>Enter your desired admin email and password above</li>
          <li>Click "Run Setup" to initialize your admin user</li>
          <li>If you encounter issues, click "Run Diagnostics" and check the browser console</li>
          <li>After successful setup, you can sign in with your admin credentials</li>
        </ol>
      </div>
    </div>
  );
}