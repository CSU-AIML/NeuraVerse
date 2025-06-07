// lib/supabaseAuth.ts - Improved Supabase integration with Firebase auth
import { supabase } from './supabase';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * Set the Supabase auth token from Firebase user
 * This ensures RLS policies work correctly
 */
export async function setSupabaseAuthToken(firebaseUser: FirebaseUser | null) {
  try {
    if (firebaseUser) {
      // Get the Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Set the auth token in Supabase
      const { error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: 'dummy-refresh-token' // Supabase requires this but we manage refresh via Firebase
      });

      if (error) {
        console.warn('Failed to set Supabase auth token:', error.message);
        return false;
      }

      console.log('✅ Supabase auth token set successfully');
      return true;
    } else {
      // Clear the session when user signs out
      await supabase.auth.signOut();
      console.log('✅ Supabase auth session cleared');
      return true;
    }
  } catch (error) {
    console.error('Error setting Supabase auth token:', error);
    return false;
  }
}

/**
 * Create user profile with proper auth context
 */
export async function createUserProfileWithAuth(firebaseUser: FirebaseUser, additionalData: any = {}) {
  try {
    // First, set the auth token
    const authSet = await setSupabaseAuthToken(firebaseUser);
    if (!authSet) {
      throw new Error('Failed to set authentication context');
    }

    // Prepare profile data
    const profileData = {
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
      ...additionalData
    };

    // Insert the profile
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (createError) {
      console.error('Supabase profile creation error:', createError);
      throw createError;
    }

    console.log('✅ User profile created successfully:', newProfile);
    return newProfile;

  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update user profile with proper auth context
 */
export async function updateUserProfileWithAuth(firebaseUser: FirebaseUser, updates: any) {
  try {
    // Set the auth token
    const authSet = await setSupabaseAuthToken(firebaseUser);
    if (!authSet) {
      throw new Error('Failed to set authentication context');
    }

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('firebase_uid', firebaseUser.uid)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase profile update error:', updateError);
      throw updateError;
    }

    console.log('✅ User profile updated successfully');
    return updatedProfile;

  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Get user profile with proper auth context
 */
export async function getUserProfileWithAuth(firebaseUser: FirebaseUser) {
  try {
    // Set the auth token
    const authSet = await setSupabaseAuthToken(firebaseUser);
    if (!authSet) {
      console.warn('Failed to set auth context, trying without auth');
    }

    // Get the profile
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUser.uid)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase profile fetch error:', fetchError);
      throw fetchError;
    }

    return profile;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Helper function to get auth provider
 */
function getAuthProvider(firebaseUser: FirebaseUser): string {
  if (firebaseUser.providerData.length > 0) {
    return firebaseUser.providerData[0].providerId;
  }
  return 'password';
}

/**
 * Test RLS policies
 */
export async function testRLSPolicies(firebaseUser: FirebaseUser) {
  console.log('🧪 Testing RLS Policies...');
  
  try {
    // Set auth token
    await setSupabaseAuthToken(firebaseUser);
    
    // Test 1: Try to read own profile
    console.log('Test 1: Reading own profile...');
    const { data: profile, error: readError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUser.uid);
    
    if (readError) {
      console.error('❌ Read test failed:', readError.message);
    } else {
      console.log('✅ Read test passed');
    }
    
    // Test 2: Try to create profile (if doesn't exist)
    if (!profile || profile.length === 0) {
      console.log('Test 2: Creating profile...');
      try {
        await createUserProfileWithAuth(firebaseUser);
        console.log('✅ Create test passed');
      } catch (createError) {
        if (createError instanceof Error) {
          console.error('❌ Create test failed:', createError.message);
        } else {
          console.error('❌ Create test failed:', createError);
        }
      }
    }
    
    // Test 3: Try to update profile
    console.log('Test 3: Updating profile...');
    try {
      await updateUserProfileWithAuth(firebaseUser, {
        last_login: new Date().toISOString()
      });
      console.log('✅ Update test passed');
    } catch (updateError) {
      if (updateError instanceof Error) {
        console.error('❌ Update test failed:', updateError.message);
      } else {
        console.error('❌ Update test failed:', updateError);
      }
    }
    
    console.log('🧪 RLS Policy tests completed');
    
  } catch (error) {
    console.error('❌ RLS Policy test failed:', error);
  }
}