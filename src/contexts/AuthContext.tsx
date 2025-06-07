// src/contexts/AuthContext.tsx - Improved with Remember Me functionality
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithGoogle,
  signInWithGoogleRedirect,
  getGoogleRedirectResult,
  getCurrentUser,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  auth
} from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../services/userManagementService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Derived states
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin' && profile?.account_status === 'active';
  const isGuest = profile?.role === 'guest';

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Set Firebase persistence based on remember me preference
   */
  const setAuthPersistence = useCallback(async (rememberMe: boolean = true) => {
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      // Also set storage preference for our token service
      if (rememberMe) {
        localStorage.setItem('auth_persistence', 'local');
      } else {
        localStorage.setItem('auth_persistence', 'session');
      }
      
      console.log(`Firebase persistence set to: ${rememberMe ? 'local' : 'session'}`);
    } catch (error) {
      console.warn('Failed to set auth persistence:', error);
    }
  }, []);

  /**
   * Get auth provider from Firebase user
   */
  const getAuthProvider = useCallback((firebaseUser: FirebaseUser): string => {
    if (firebaseUser.providerData.length > 0) {
      return firebaseUser.providerData[0].providerId;
    }
    return 'password';
  }, []);

  /**
   * Sync Firebase user with Supabase user profile
   */
  const syncUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      console.log('Syncing user profile for:', firebaseUser.uid);
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        console.log('Found existing profile');
        
        // Update last login
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('firebase_uid', firebaseUser.uid);

        if (updateError) {
          console.warn('Failed to update last login:', updateError);
        }

        return existingProfile;
      }

      // Create new profile
      console.log('Creating new profile');
      
      const newProfileData = {
        id: crypto.randomUUID(),
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        display_name: firebaseUser.displayName || 
                     firebaseUser.email?.split('@')[0] || 
                     'User',
        avatar_url: firebaseUser.photoURL || null,
        role: 'user' as const,
        account_status: 'active' as const,
        last_login: new Date().toISOString(),
        provider: getAuthProvider(firebaseUser),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(newProfileData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }

      console.log('Created new profile successfully');
      
      // Log security event (optional)
      try {
        await supabase.from('security_events').insert({
          user_id: firebaseUser.uid,
          event_type: 'account_created',
          success: true,
          details: {
            timestamp: new Date().toISOString(),
            provider: getAuthProvider(firebaseUser),
          },
        });
      } catch (securityError) {
        console.log('Security logging not available');
      }

      return newProfile;

    } catch (error: any) {
      console.error('Error syncing user profile:', error);
      throw new Error(`Failed to sync user profile: ${error.message}`);
    }
  }, [getAuthProvider]);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = useCallback(async (firebaseUser: FirebaseUser) => {
    console.log('Handling auth success for:', firebaseUser.uid);
    
    try {
      setLoading(true);
      setError(null);
      
      // Set user first
      setUser(firebaseUser);
      
      // Sync with Supabase
      const userProfile = await syncUserProfile(firebaseUser);
      setProfile(userProfile);
      
      // Handle redirect only if we're on auth-related pages
      const authPages = ['/signin', '/signup', '/auth', '/'];
      const shouldRedirect = authPages.includes(location.pathname);
      
      if (shouldRedirect) {
        const redirectTo = new URLSearchParams(location.search).get('redirectTo') || '/dashboard';
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true });
      }
      
    } catch (error: any) {
      console.error('Error in handleAuthSuccess:', error);
      setError(error.message || 'Authentication setup failed');
    } finally {
      setLoading(false);
    }
  }, [syncUserProfile, navigate, location]);

  /**
   * Handle authentication state changes
   */
  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
    
    // Skip if we're still initializing
    if (initializing) return;
    
    try {
      if (firebaseUser) {
        await handleAuthSuccess(firebaseUser);
      } else {
        // User signed out
        setUser(null);
        setProfile(null);
        setError(null);
        setLoading(false);
        
        // Redirect to signin if on protected route
        const protectedRoutes = ['/dashboard', '/users', '/new', '/projects'];
        const isProtectedRoute = protectedRoutes.some(route => 
          location.pathname.startsWith(route)
        );
        
        if (isProtectedRoute) {
          navigate('/signin', { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Error in auth state change:', error);
      setError(error.message || 'Authentication error');
      setLoading(false);
    }
  }, [initializing, handleAuthSuccess, navigate, location]);

  /**
   * Initialize authentication
   */
  useEffect(() => {
    console.log('Initializing AuthContext...');
    
    const initializeAuth = async () => {
      try {
        // Check for redirect result first
        const { user: redirectUser, error: redirectError } = await getGoogleRedirectResult();
        
        if (redirectError) {
          console.error('Redirect error:', redirectError);
          setError((redirectError as Error)?.message || 'Google redirect error');
        } else if (redirectUser) {
          console.log('Found redirect user:', redirectUser.uid);
          await handleAuthSuccess(redirectUser);
          setInitializing(false);
          return;
        }

        // Check current user
        const currentUser = getCurrentUser();
        if (currentUser) {
          console.log('Found current user:', currentUser.uid);
          await handleAuthSuccess(currentUser);
        } else {
          console.log('No current user found');
          setLoading(false);
        }
        
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        setError(error.message || 'Failed to initialize authentication');
        setLoading(false);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(handleAuthStateChange);

    return () => {
      unsubscribe();
    };
  }, [handleAuthStateChange, handleAuthSuccess]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      // Set persistence before signing in
      await setAuthPersistence(rememberMe);

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        console.log('Email sign in successful:', result.user.uid);
        // Auth state change will handle the rest
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      
      // Map Firebase errors to user-friendly messages
      let errorMessage = 'Sign in failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message || 'Sign in failed';
      }
      
      setError(errorMessage);
      
      // Log failed attempt (optional)
      try {
        await supabase.from('security_events').insert({
          event_type: 'login_failed',
          success: false,
          details: {
            email,
            error_code: error.code,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (logError) {
        console.log('Security logging not available');
      }
      
      throw new Error(errorMessage);
    }
  }, [setAuthPersistence]);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email: string, password: string, userData: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Set persistence to local for new accounts
      await setAuthPersistence(true);

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        // Update Firebase profile if display name provided
        if (userData.displayName || userData.display_name) {
          const { updateProfile } = await import('firebase/auth');
          await updateProfile(result.user, {
            displayName: userData.displayName || userData.display_name,
          });
          
          // Reload user to get updated profile
          await result.user.reload();
        }
        
        console.log('Email sign up successful:', result.user.uid);
        // Auth state change will handle the rest
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setLoading(false);
      
      let errorMessage = 'Account creation failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message || 'Account creation failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setAuthPersistence]);

  /**
   * Sign in with Google popup
   */
  const handleSignInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check remember me preference
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      await setAuthPersistence(rememberMe);

      const googleResult = await signInWithGoogle();

      if ('error' in googleResult && googleResult.error) {
        throw googleResult.error;
      }

      if ('user' in googleResult && googleResult.user) {
        console.log('Google sign in successful:', googleResult.user.uid);
        // Auth state change will handle the rest
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setLoading(false);
      setError(error.message || 'Google sign in failed');
      throw error;
    }
  }, [setAuthPersistence]);

  /**
   * Sign in with Google redirect
   */
  const handleSignInWithGoogleRedirect = useCallback(async () => {
    try {
      setError(null);
      
      // Check remember me preference
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      await setAuthPersistence(rememberMe);
      
      const { error: redirectError } = await signInWithGoogleRedirect();
      
      if (redirectError) {
        throw redirectError;
      }
      
      console.log('Google redirect initiated');
    } catch (error: any) {
      console.error('Google redirect error:', error);
      setError(error.message || 'Google redirect sign in failed');
      throw error;
    }
  }, [setAuthPersistence]);

  /**
   * Sign out
   */
  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Log logout event (optional)
      if (user) {
        try {
          await supabase.from('security_events').insert({
            user_id: user.uid,
            event_type: 'logout',
            success: true,
            details: {
              timestamp: new Date().toISOString(),
            },
          });
        } catch (logError) {
          console.log('Security logging not available');
        }
      }

      // Clear local storage
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remember_me');
      localStorage.removeItem('auth_persistence');

      // Sign out from Firebase
      const { error } = await firebaseSignOut();
      
      if (error) {
        throw error;
      }

      // Clear state
      setUser(null);
      setProfile(null);
      
      // Redirect to home
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const userProfile = await syncUserProfile(user);
      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setError(error.message || 'Failed to refresh profile');
    }
  }, [user, syncUserProfile]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isGuest,
    signIn,
    signUp,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithGoogleRedirect: handleSignInWithGoogleRedirect,
    signOut: handleSignOut,
    refreshProfile,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}