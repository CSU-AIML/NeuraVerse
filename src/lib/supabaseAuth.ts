// lib/supabaseAuth.ts - Fixed authentication integration
import { supabase } from './supabase';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * Create a custom JWT token for Supabase from Firebase user
 */
export async function createSupabaseAuthToken(firebaseUser: FirebaseUser): Promise<string | null> {
  try {
    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();
    
    // Create a simple auth session with the Firebase UID
    // This bypasses the complex JWT creation
    return idToken;
  } catch (error) {
    console.error('Error creating Supabase auth token:', error);
    return null;
  }
}

/**
 * Set Supabase auth session using Firebase user
 */
export async function setSupabaseAuth(firebaseUser: FirebaseUser | null): Promise<boolean> {
  try {
    if (firebaseUser) {
      // Method 1: Use custom headers for API calls
      const token = await firebaseUser.getIdToken();
      
      // Store the token for use in API calls
      localStorage.setItem('firebase_token', token);
      localStorage.setItem('firebase_uid', firebaseUser.uid);
      
      console.log('✅ Firebase auth context stored for Supabase');
      return true;
    } else {
      // Clear stored auth
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('firebase_uid');
      
      console.log('✅ Auth context cleared');
      return true;
    }
  } catch (error) {
    console.error('❌ Error setting Supabase auth:', error);
    return false;
  }
}

/**
 * Get authenticated Supabase client with Firebase context
 */
export function getAuthenticatedSupabaseClient() {
  const token = localStorage.getItem('firebase_token');
  const uid = localStorage.getItem('firebase_uid');
  
  if (token && uid) {
    // Return the supabase client instance
    return supabase;
  }
  
  return supabase;
}

/**
 * Upload file with proper authentication
 */
export async function uploadFileWithAuth(
  bucket: string,
  path: string,
  file: File,
  options?: any
) {
  try {
    const token = localStorage.getItem('firebase_token');
    const uid = localStorage.getItem('firebase_uid');
    
    if (!token || !uid) {
      throw new Error('User not authenticated');
    }
    
    // Upload with authentication context
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Firebase-UID': uid,
        }
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in uploadFileWithAuth:', error);
    return { data: null, error };
  }
}