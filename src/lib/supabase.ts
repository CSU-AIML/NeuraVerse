// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  // Add a fallback or default URL for development if needed
  throw new Error('Supabase URL is required. Check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  // Add a fallback or default key for development if needed
  throw new Error('Supabase Anon Key is required. Check your .env file.');
}

// Log configuration for debugging (remove in production)
console.log('Initializing Supabase with URL:', supabaseUrl);

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'supabase-auth',
    detectSessionInUrl: true,
    flowType: 'pkce' // More secure than 'implicit'
  },
  global: {
    // Add some fetch options to handle CORS and potential network issues
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        credentials: 'same-origin',
      });
    },
  },
  realtime: {
    // Configure real-time options
    timeout: 30000, // ms
  }
});

// Check if the connection is working
export const checkSupabaseConnection = async () => {
  try {
    // Try a simple query to test the connection
    const { data, error } = await supabase.from('projects').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test succeeded');
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
};

export default supabase;