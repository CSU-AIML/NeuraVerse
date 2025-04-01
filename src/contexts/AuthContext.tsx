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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
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


  
  // Check for the role in both metadata and profile to handle all cases
  const determineUserRole = async (authUser: any): Promise<UserRole> => {
    try {
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

  // Function to refresh user data
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        setRole(null);
        return;
      }

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
          setIsLoading(false);
          return;
        }
        
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
        refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
      } else if (event === 'USER_UPDATED') {
        refreshUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        await refreshUser();
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
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
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
    signIn,
    signOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};