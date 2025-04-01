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

// Login helper with device tracking
export const secureLogin = async (email: string, password: string) => {
  try {
    // Get browser fingerprint
    const fingerprint = navigator.userAgent + navigator.language + screen.width + 'x' + screen.height;
    
    // Get IP address (simple approach for demo)
    let ipAddress = 'unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (ipErr) {
      console.warn('Could not get IP address:', ipErr);
    }
    
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
      await supabase
        .from('security_events')
        .insert({
          event_type: 'login',
          user_id: data.user.id,
          details: {
            fingerprint,
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            screen_size: `${screen.width}x${screen.height}`
          }
        });
    }
    
    return { data, error: null, mfaRequired };
  } catch (error) {
    console.error('Secure login error:', error);
    return { data: null, error };
  }
};

// Function to handle MFA verification
export const verifyMFA = async (factorId: string, code: string) => {
  try {
    // Use the correct Supabase MFA API
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    });

    if (error) return { error };
    
    // Log successful MFA verification
    const user = await supabase.auth.getUser();
    if (user.data.user) {
      await supabase
        .from('security_events')
        .insert({
          event_type: 'mfa_verification',
          user_id: user.data.user.id,
          details: {
            verified: true,
            method: 'totp'
          }
        });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('MFA verification error:', error);
    return { data: null, error };
  }
};

// Function to enroll a new MFA factor for a user
export const enrollMFA = async () => {
  try {
    // Start the MFA enrollment process
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });
    
    if (error) return { error };
    
    return { data, error: null };
  } catch (error) {
    console.error('MFA enrollment error:', error);
    return { data: null, error };
  }
};

// Function to check user role permissions
export const hasRolePermission = async (permission: string) => {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (!data || !data.user) {
      return false;
    }
    
    // Check if admin
    const isAdmin = data.user.user_metadata?.role === 'admin';
    
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