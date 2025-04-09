// pages/UserManagement/userManagementService.ts
import { supabase } from '../../lib/supabase';

export interface UserProfile {
  avatar_url: any;
  id: string;
  display_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

// Function to fetch all users
export const fetchUsers = async (): Promise<{ users: UserProfile[], error: any }> => {
  try {
    // Fetch user profiles from app.user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('app.user_profiles')
      .select('*');

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return { users: [], error: profileError };
    }

    // Initial users list from profiles
    const users = [...profileData || []];
    
    try {
      // Try to get emails from user_emails view
      const { data: authData, error: authError } = await supabase
        .from('app.user_emails')
        .select('user_id, email');
        
      if (!authError && authData) {
        // Merge in email data
        users.forEach(user => {
          const emailRecord = authData.find(e => e.user_id === user.id);
          if (emailRecord) {
            user.email = emailRecord.email;
          }
        });
      }
    } catch (error) {
      console.log('Could not fetch user emails - continuing with profiles only');
    }
    
    return { users, error: null };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], error };
  }
};

// Function to promote a user to admin
export const promoteToAdmin = async (userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Try the app.promote_to_admin function first
    try {
      const { error: functionError } = await supabase.rpc('app.promote_to_admin', {
        user_id_param: userId
      });
      
      if (!functionError) {
        return { success: true, error: null };
      }
    } catch (err) {
      console.log('Function call failed, falling back to direct update');
    }
    
    // Fallback: Directly update the user_profiles table
    const { error } = await supabase
      .from('app.user_profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (error) {
      console.error('Error promoting user:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in promote to admin:', error);
    return { success: false, error };
  }
};

// Function to demote admin to standard user
export const demoteToUser = async (userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Try the app.demote_to_user function first
    try {
      const { error: functionError } = await supabase.rpc('app.demote_to_user', {
        user_id_param: userId
      });
      
      if (!functionError) {
        return { success: true, error: null };
      }
    } catch (err) {
      console.log('Function call failed, falling back to direct update');
    }
    
    // Fallback: Update the user_profiles table
    const { error } = await supabase
      .from('app.user_profiles')
      .update({ role: 'user' })
      .eq('id', userId);
    
    if (error) {
      console.error('Error demoting user:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in demote to standard user:', error);
    return { success: false, error };
  }
};

// Function to remove a user completely from the system
export const removeUser = async (userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Try the app.remove_user function first
    try {
      const { error: functionError } = await supabase.rpc('app.remove_user', {
        user_id_param: userId
      });
      
      if (!functionError) {
        return { success: true, error: null };
      }
    } catch (err) {
      console.log('Function call failed, falling back to direct delete');
    }
    
    // Fallback: Delete the user from user_profiles first
    const { error: profileError } = await supabase
      .from('app.user_profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error removing user profile:', profileError);
      return { success: false, error: profileError };
    }
    
    // Try to delete from user_settings if exists
    try {
      await supabase
        .from('app.user_settings')
        .delete()
        .eq('user_id', userId);
    } catch (settingsError) {
      // If this fails, we can still continue
      console.warn('Could not remove user settings:', settingsError);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in remove user:', error);
    return { success: false, error };
  }
};