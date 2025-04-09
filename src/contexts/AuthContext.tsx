// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  getCurrentUser, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from '../lib/firebase';
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
  refreshUser: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  authenticated: false,
  refreshUser: async () => {},
  checkAuthStatus: async () => false,
  signOut: async () => {},
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

  // Determine user role from Supabase database
  const determineUserRole = async (email: string, uid: string): Promise<UserRole> => {
    try {
      // Special case: Make specific emails always admin
      const adminEmails = ['admin@example.com', 'dhruvil7694@gmail.com']; 
      if (adminEmails.includes(email.toLowerCase())) {
        console.log('Default admin user detected');
        
        // First check if user already exists by firebase_uid
        const { data: existingUser, error: lookupError } = await supabase
          .from('user_profiles')
          .select('id, role')
          .eq('firebase_uid', uid)
          .single();
        
        if (lookupError || !existingUser) {
          // User doesn't exist, create new user
          try {
            // Create profile
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                display_name: email.split('@')[0],
                firebase_uid: uid,
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error('Error creating admin profile:', insertError);
            }
          } catch (err) {
            console.error('Error creating admin profile:', err);
          }
        } else {
          // User exists, update role if needed
          if (existingUser.role !== 'admin') {
            try {
              const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                  role: 'admin',
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingUser.id);  // Use the actual primary key
                
              if (updateError) {
                console.error('Error updating admin role:', updateError);
              }
            } catch (err) {
              console.error('Error updating admin role:', err);
            }
          }
        }
        
        return 'admin';
      }
      
      // Try to fetch from profile
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, role')
          .eq('firebase_uid', uid)
          .single();
        
        if (error) {
          console.log('No profile found, creating new user profile');
          
          // Create new user profile
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              display_name: email.split('@')[0],
              firebase_uid: uid,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }
            
          return 'user';
        }
        
        if (data && (data.role === 'admin' || data.role === 'user')) {
          return data.role;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
      
      // Default to user role
      return 'user';
    } catch (error) {
      console.error('Error determining user role:', error);
      return 'user';
    }
  };
  

  // Check if user is authenticated
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const firebaseUser = getCurrentUser();
      const isAuthenticated = !!firebaseUser;
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
      const firebaseUser = getCurrentUser();
      
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setAuthenticated(true);
      
      // Get email from Firebase user
      const email = firebaseUser.email || '';
      
      // Determine role using our helper function
      const userRole = await determineUserRole(email, firebaseUser.uid);
      setRole(userRole);
      
      // Set user data
      setUser({
        id: firebaseUser.uid,
        email: email,
        role: userRole,
        display_name: firebaseUser.displayName || email.split('@')[0],
      });
      
      // Log the authentication event
      try {
        await supabase
          .from('security_events')
          .insert({
            event_type: 'login',
            user_id: firebaseUser.uid,
            details: {
              method: 'google',
              email: email,
              user_agent: navigator.userAgent
            }
          });
      } catch (error) {
        console.error('Error logging authentication event:', error);
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
      
      // Sign out from Firebase
      await firebaseSignOut();
      
      // Clear user state
      setUser(null);
      setRole(null);
      setAuthenticated(false);
      
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setAuthenticated(true);
        await refreshUser();
      } else {
        // User is signed out
        setUser(null);
        setRole(null);
        setAuthenticated(false);
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Provide auth context
  const value = {
    user,
    role,
    isAdmin: role === 'admin',
    isLoading,
    authenticated,
    refreshUser,
    checkAuthStatus,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};