// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Define user role types
export type UserRole = 'user' | 'admin';

// Define user interface
interface User {
  id: string;
  email: string;
  role: UserRole;
  display_name?: string;
  avatar_url?: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  authenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any, mfaRequired?: boolean }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  authenticated: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
  checkAuthStatus: async () => false,
});

// Hook for easy context usage
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  // Check for the role in both metadata and profile to handle all cases
  const determineUserRole = async (authUser: any): Promise<UserRole> => {
    try {
      // Special case: make specific email always an admin
      if (authUser.email === 'dhruvil7694@gmail.com') {
        console.log('Default admin user detected');
        
        // Also update profile to ensure persistence
        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: authUser.id,
              role: 'admin',
              display_name: 'Dhruvil',
              updated_at: new Date().toISOString()
            });
        } catch (err) {
          console.error('Error updating admin profile:', err);
        }
        
        return 'admin';
      }
      
      // First try to get role from user metadata (for newly signed up users)
      const metadataRole = authUser.user_metadata?.role;
      if (metadataRole === 'admin' || metadataRole === 'user') {
        return metadataRole;
      }
      
      // If no role in metadata, try to fetch from profile
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          console.log('No profile found, falling back to default role');
          return 'user'; // Fallback to user if no profile found
        }
        
        if (data && (data.role === 'admin' || data.role === 'user')) {
          return data.role;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
      
      // If all else fails, default to user role
      return 'user';
    } catch (error) {
      console.error('Error determining user role:', error);
      return 'user'; // Default to user role if anything fails
    }
  };

  // Check if user is authenticated (useful for protected routes)
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const isAuthenticated = !!authUser;
      setAuthenticated(isAuthenticated);
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthenticated(false);
      return false;
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        setRole(null);
        setAuthenticated(false);
        return;
      }

      setAuthenticated(true);
      
      // Determine role using our helper function
      const userRole = await determineUserRole(authUser);
      setRole(userRole);
      
      // Set user data
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        role: userRole,
        display_name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        avatar_url: authUser.user_metadata?.avatar_url || null,
      });
      
      // Ensure user profile exists by using upsert 
      // This helps fix cases where profile might be missing
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: authUser.id,
          role: userRole,
          display_name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString()
        });
        
      if (error && error.code !== '23505') {  // Ignore duplicate key violations
        console.warn('Could not update user profile:', error);
      }
      
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setRole(null);
      setAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial authentication check
  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is already authenticated
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          setUser(null);
          setRole(null);
          setAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setAuthenticated(true);
        
        // Use the same role determination logic
        const userRole = await determineUserRole(authUser);
        
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: userRole,
          display_name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          avatar_url: authUser.user_metadata?.avatar_url || null,
        });
        
        setRole(userRole);
        
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setRole(null);
        setAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthenticated(true);
        refreshUser();
        
        // Log auth events
        try {
          await supabase
            .from('security_events')
            .insert({
              event_type: 'signin',
              user_id: session.user.id,
              details: {
                method: 'email',
                user_agent: navigator.userAgent
              }
            });
        } catch (error) {
          console.error('Error logging signin event:', error);
        }
        
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setAuthenticated(false);
        
      } else if (event === 'USER_UPDATED') {
        refreshUser();
        
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        
      } else if (event === 'TOKEN_REFRESHED') {
        // Refresh the user data when token is refreshed
        refreshUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Enhanced sign in function with MFA support
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // For MFA check, typically you'd look for metadata or signals in the user or session object
        const mfaRequired = data.user?.factors && data.user.factors.length > 0;
        
        await refreshUser();
        
        // Log success (if no MFA is required)
        if (!mfaRequired) {
          try {
            // Get browser fingerprint
            const fingerprint = navigator.userAgent + navigator.language + screen.width + 'x' + screen.height;
            
            // Log login for security monitoring
            await supabase
              .from('security_events')
              .insert({
                event_type: 'login',
                user_id: data.user.id,
                details: {
                  fingerprint,
                  user_agent: navigator.userAgent,
                  platform: navigator.platform,
                  screen_size: `${screen.width}x${screen.height}`
                }
              });
          } catch (logError) {
            console.error('Error logging login event:', logError);
          }
        }
        
        return { error: null, mfaRequired };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Log the sign out event if there's a user
      if (user) {
        try {
          await supabase
            .from('security_events')
            .insert({
              event_type: 'signout',
              user_id: user.id,
              details: {
                user_agent: navigator.userAgent
              }
            });
        } catch (error) {
          console.error('Error logging sign out event:', error);
        }
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Provide auth context
  const value = {
    user,
    role,
    isAdmin: role === 'admin',
    isLoading,
    authenticated,
    signIn,
    signOut,
    refreshUser,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};