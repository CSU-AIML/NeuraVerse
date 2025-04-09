import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with enhanced settings for authentication
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'supabase-auth',
    detectSessionInUrl: true,
    flowType: 'pkce' // Changed from 'implicit' to 'pkce' for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'project-management-app'
    }
  }
});

// Simplified authentication checker
export const isUserAuthenticated = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    return !!sessionData.session;
  } catch (err) {
    console.error('Error checking authentication status:', err);
    return false;
  }
};

// Get the current user
export const getCurrentUser = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return null;
    }
    
    // Get the user data
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    return data.user;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};

// Function to create or update user profile
export const createUserProfile = async (userId: string, email: string, role: string = 'user') => {
  try {
    const { error } = await supabase
      .from('app.user_profiles') // Use the app schema
      .upsert({
        id: userId,
        role: role,
        display_name: email.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Error in createUserProfile:', err);
    return { success: false, error: err };
  }
};

// Login helper with device tracking
export const secureLogin = async (email: string, password: string) => {
  try {
    // Get browser fingerprint
    const fingerprint = navigator.userAgent + navigator.language + screen.width + 'x' + screen.height;
    
    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    // Check if MFA is required - use a different approach since factor_id isn't available
    // For MFA check, typically you'd look for metadata or signals in the user or session object
    const mfaRequired = data.user?.factors && data.user.factors.length > 0;

    if (data.user) {
      // Log login for security monitoring
      try {
        await supabase
          .from('app.security_events') // Use the app schema
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
        console.warn('Could not log login event:', logError);
      }
      
      // Update last sign-in timestamp
      try {
        await supabase
          .from('app.user_profiles') // Use the app schema
          .update({
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);
      } catch (profileErr) {
        console.warn('Could not update last sign-in time:', profileErr);
      }
    }
    
    return { data, error: null, mfaRequired };
  } catch (error) {
    console.error('Secure login error:', error);
    return { data: null, error };
  }
};

// Function to check if a user with given email already exists
export const checkUserExists = async (email: string) => {
  try {
    // Check auth.users table (this usually requires admin privileges)
    const { count, error } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);
      
    if (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
    
    return count ? count > 0 : false;
  } catch (err) {
    console.error('Error in checkUserExists:', err);
    return false;
  }
};

// Function to check user role permissions
export const hasRolePermission = async (permission: string) => {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (!data || !data.user) {
      return false;
    }
    
    // Use app.user_profiles to check role
    const { data: profileData, error: profileError } = await supabase
      .from('app.user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
      
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }
    
    // Check if admin
    const isAdmin = profileData.role === 'admin';
    
    if (isAdmin) {
      // For admins, grant ALL permissions automatically
      return true;
    }
    
    // For regular users, only grant general permissions
    return permission === 'general';
  } catch (err) {
    console.error('Error checking permission:', err);
    return false;
  }
};

/**
 * Service for handling authentication operations
 */
export const AuthService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      // Check for MFA (for future implementation)
      const mfaRequired = data.user?.factors && data.user.factors.length > 0;
      
      // Log successful login
      if (data.user && !mfaRequired) {
        try {
          // Get browser fingerprint
          const fingerprint = navigator.userAgent + navigator.language + screen.width + 'x' + screen.height;
          
          // Log login for security monitoring
          await supabase
            .from('app.security_events')
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
            
          // Update last sign-in timestamp
          await supabase
            .from('app.user_profiles')
            .update({
              last_sign_in: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
        } catch (logError) {
          console.error('Error logging login event:', logError);
        }
      }
      
      return { data, error: null, mfaRequired };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  /**
   * Sign up with email and password (no email verification)
   */
  signUp: async (email: string, password: string) => {
    try {
      // Sign up user with regular user role, no email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user', // Always set to 'user' for security
            display_name: email.split('@')[0] || 'User'
          }
        }
      });

      if (error) return { error };
      
      // We don't need to create a user profile - the database trigger will do that

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  /**
   * Request password reset
   */
  resetPassword: async (email: string, redirectUrl: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) return { error };
      
      // Log password reset request (even if email doesn't exist)
      try {
        await supabase
          .from('app.security_events')
          .insert({
            event_type: 'password_reset',
            details: {
              email: email,
              reset_requested: true,
              reset_token_created: true,
              user_agent: navigator.userAgent
            }
          });
      } catch (logError) {
        console.error('Error logging password reset request:', logError);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error };
    }
  },

  /**
   * Update password with token
   */
  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password 
      });

      if (error) return { error };
      
      // Log password update
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          await supabase
            .from('app.security_events')
            .insert({
              event_type: 'password_reset',
              user_id: user.user.id,
              details: {
                reset_completed: true,
                user_agent: navigator.userAgent
              }
            });
        }
      } catch (logError) {
        console.error('Error logging password update:', logError);
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { success: false, error };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      // Log the sign out event
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          await supabase
            .from('app.security_events')
            .insert({
              event_type: 'signout',
              user_id: user.user.id,
              details: {
                user_agent: navigator.userAgent
              }
            });
        }
      } catch (logError) {
        console.error('Error logging sign out event:', logError);
      }
      
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error };
    }
  }
};

// Export the Supabase client and auth functions
export default {
  supabase,
  isUserAuthenticated,
  getCurrentUser,
  createUserProfile,
  secureLogin,
  checkUserExists,
  hasRolePermission,
  AuthService
};