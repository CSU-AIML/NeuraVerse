// UserManagement/userManagementService.ts
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../contexts/AuthContext';

// Updated interface to match what UserList.tsx expects
export interface UserProfile {
  id: string;  // This will hold the Firebase UID for consistency in the UI
  email?: string;
  display_name?: string;
  role: UserRole;
  avatar_url: string; // Required - not optional
  created_at?: string;
  updated_at: string; // Required - not optional
  last_login?: string;
  // Internal fields not exposed in UI
  _databaseId?: number; // The actual PK in the database
}

export async function fetchUsers() {
  try {
    // Fetch all users with their relevant details
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, firebase_uid, display_name, avatar_url, role, created_at, updated_at, last_sign_in')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match our UserProfile interface
    const users: UserProfile[] = data.map(user => ({
      id: user.firebase_uid, // Use Firebase UID as the external ID
      _databaseId: user.id,  // Store the actual PK internally
      display_name: user.display_name || 'User',
      role: (user.role as UserRole) || 'user',
      avatar_url: user.avatar_url || '', // Provide default empty string if null
      created_at: user.created_at,
      updated_at: user.updated_at || new Date().toISOString(), // Ensure it's not null
      last_login: user.last_sign_in
    }));
    
    return { users, error: null };
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return { users: [], error };
  }
}

export async function promoteToAdmin(userId: string) {
  try {
    // First find the user by firebase_uid to get the actual PK
    const { data, error: findError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', userId)
      .single();
    
    if (findError || !data) {
      throw new Error('User not found');
    }
    
    const now = new Date().toISOString();
    
    // Now update using the actual PK
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin',
        updated_at: now
      })
      .eq('id', data.id);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error };
  }
}

export async function demoteToUser(userId: string) {
  try {
    // First find the user by firebase_uid to get the actual PK
    const { data, error: findError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', userId)
      .single();
    
    if (findError || !data) {
      throw new Error('User not found');
    }
    
    const now = new Date().toISOString();
    
    // Now update using the actual PK
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'user',
        updated_at: now
      })
      .eq('id', data.id);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error demoting user to standard user:', error);
    return { success: false, error };
  }
}

export async function removeUser(userId: string) {
  try {
    // First find the user by firebase_uid to get the actual PK
    const { data, error: findError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', userId)
      .single();
    
    if (findError || !data) {
      throw new Error('User not found');
    }
    
    // Delete user profile using the actual PK
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', data.id);
    
    if (error) {
      throw error;
    }
    
    // Note: You should also handle Firebase user deletion here or via a backend function
    // This only removes the database record, not the actual authentication provider user
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing user:', error);
    return { success: false, error };
  }
}