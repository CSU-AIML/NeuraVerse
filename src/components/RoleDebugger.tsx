// src/components/RoleDebugger.tsx - Debug and fix user roles
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface RoleDebuggerProps {
  onClose?: () => void;
}

export function RoleDebugger({ onClose }: RoleDebuggerProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const firebaseUser = getCurrentUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get user profile from Supabase
      const { data: supabaseProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser?.uid)
        .maybeSingle();

      setDebugInfo({
        firebaseUser: {
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          displayName: firebaseUser?.displayName,
          emailVerified: firebaseUser?.emailVerified,
        },
        supabaseProfile,
        contextProfile: profile,
        supabaseSession: !!session,
      });
    } catch (error) {
      console.error('Debug check error:', error);
    }
  };

  const makeCurrentUserAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const firebaseUser = getCurrentUser();
      
      if (!firebaseUser) {
        throw new Error('No Firebase user found');
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProfile) {
        // Update existing profile to admin
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            role: 'admin',
            account_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('firebase_uid', firebaseUser.uid);

        if (updateError) throw updateError;
        
        setMessage('✅ Successfully updated existing profile to admin role');
      } else {
        // Create new admin profile
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin User',
            role: 'admin',
            account_status: 'active',
            email_verified: firebaseUser.emailVerified || false,
            two_factor_enabled: false,
            login_count: 1,
            failed_login_attempts: 0,
            gdpr_consent: false,
            data_processing_consent: false,
            marketing_consent: false,
            provider: 'password',
          });

        if (createError) throw createError;
        
        setMessage('✅ Successfully created new admin profile');
      }

      // Refresh the profile in context
      await refreshProfile();
      
      // Refresh debug info
      await checkUserStatus();
      
      // Force page reload to update all components
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error making user admin:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createMissingProfile = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const firebaseUser = getCurrentUser();
      
      if (!firebaseUser) {
        throw new Error('No Firebase user found');
      }

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: 'user',
          account_status: 'active',
          email_verified: firebaseUser.emailVerified || false,
          two_factor_enabled: false,
          login_count: 1,
          failed_login_attempts: 0,
          gdpr_consent: false,
          data_processing_consent: false,
          marketing_consent: false,
          provider: 'password',
        });

      if (error) throw error;
      
      await refreshProfile();
      await checkUserStatus();
      
      setMessage('✅ Successfully created user profile');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🔧 Role Debugger & Fixer</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Debug Information */}
        <div className="space-y-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-600/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Current Status</h3>
            <div className="text-sm space-y-1">
              <div className="text-slate-300">
                Firebase User: <span className="text-green-400">{user?.email || 'Not logged in'}</span>
              </div>
              <div className="text-slate-300">
                Profile Role: <span className={profile?.role === 'admin' ? 'text-green-400' : 'text-red-400'}>
                  {profile?.role || 'No profile'}
                </span>
              </div>
              <div className="text-slate-300">
                Account Status: <span className={profile?.account_status === 'active' ? 'text-green-400' : 'text-red-400'}>
                  {profile?.account_status || 'Unknown'}
                </span>
              </div>
              <div className="text-slate-300">
                Is Admin: <span className={profile?.role === 'admin' ? 'text-green-400' : 'text-red-400'}>
                  {profile?.role === 'admin' && profile?.account_status === 'active' ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Debug Details */}
          {debugInfo && (
            <details className="bg-slate-900/50 border border-slate-600/50 rounded-lg p-4">
              <summary className="font-semibold text-white cursor-pointer">🔍 Debug Details</summary>
              <pre className="text-xs text-slate-300 mt-2 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={makeCurrentUserAdmin}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Processing...' : '👑 Make Current User Admin'}
          </button>

          {!profile && (
            <button
              onClick={createMissingProfile}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Creating...' : '➕ Create Missing Profile'}
            </button>
          )}

          <button
            onClick={checkUserStatus}
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            🔄 Refresh Status
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border ${
            message.startsWith('✅') 
              ? 'bg-green-900/20 border-green-800/30 text-green-200'
              : 'bg-red-900/20 border-red-800/30 text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <h4 className="font-medium text-blue-200 mb-2">💡 Quick Fix Instructions:</h4>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
            <li>Click "Make Current User Admin" to set admin role</li>
            <li>If no profile exists, create one first</li>
            <li>Page will reload automatically after role update</li>
            <li>You should then see admin features (User Management, etc.)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}