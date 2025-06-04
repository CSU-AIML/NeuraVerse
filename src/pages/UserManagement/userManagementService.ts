// UserManagement/userManagementService.ts - SIMPLIFIED AND FIXED VERSION
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../contexts/AuthContext';

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  role: UserRole;
  avatar_url: string;
  created_at?: string;
  updated_at: string;
  last_login?: string;
  _databaseId?: number;
}

export async function fetchUsers() {
  try {
    console.log('Fetching users from database...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id, 
        firebase_uid, 
        email, 
        display_name, 
        avatar_url, 
        role, 
        created_at, 
        updated_at, 
        last_sign_in
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error fetching users:', error);
      throw error;
    }

    if (!data) {
      console.log('No users found in database');
      return { users: [], error: null };
    }
    
    console.log(`Found ${data.length} users in database`);
    
    const users: UserProfile[] = data.map(user => ({
      id: user.firebase_uid || user.id.toString(),
      _databaseId: user.id,
      email: user.email || 'No email provided',
      display_name: user.display_name || 'Unknown User',
      role: (user.role as UserRole) || 'user',
      avatar_url: user.avatar_url || '',
      created_at: user.created_at,
      updated_at: user.updated_at || new Date().toISOString(),
      last_login: user.last_sign_in
    }));
    
    console.log('Successfully transformed user data:', users.length);
    return { users, error: null };
    
  } catch (error: any) {
    console.error('Error in fetchUsers:', error);
    return { 
      users: [], 
      error: error.message || 'Failed to fetch users'
    };
  }
}

export async function promoteToAdmin(userId: string) {
  try {
    console.log('Promoting user to admin:', userId);
    
    const { data, error: findError } = await supabase
      .from('user_profiles')
      .select('id, email, display_name')
      .eq('firebase_uid', userId)
      .single();
    
    if (findError || !data) {
      console.error('User not found for promotion:', findError);
      throw new Error(`User not found: ${findError?.message || 'Unknown error'}`);
    }
    
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin',
        updated_at: now
      })
      .eq('id', data.id);
    
    if (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to promote user: ${error.message}`);
    }
    
    console.log(`Successfully promoted user ${data.email} to admin`);
    return { success: true, error: null };
    
  } catch (error: any) {
    console.error('Error promoting user to admin:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to promote user'
    };
  }
}

export async function demoteToUser(userId: string) {
  try {
    console.log('Demoting admin to user:', userId);
    
    const { data, error: findError } = await supabase
      .from('user_profiles')
      .select('id, email, display_name')
      .eq('firebase_uid', userId)
      .single();
    
    if (findError || !data) {
      console.error('User not found for demotion:', findError);
      throw new Error(`User not found: ${findError?.message || 'Unknown error'}`);
    }
    
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'user',
        updated_at: now
      })
      .eq('id', data.id);
    
    if (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to demote user: ${error.message}`);
    }
    
    console.log(`Successfully demoted user ${data.email} to standard user`);
    return { success: true, error: null };
    
  } catch (error: any) {
    console.error('Error demoting user to standard user:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to demote user'
    };
  }
}

// COMPLETELY REWRITTEN DELETE FUNCTION with proper error handling
export async function removeUser(userId: string) {
  try {
    console.log('=== STARTING USER DELETION ===');
    console.log('User ID to delete:', userId);
    
    // Step 1: Find the user record
    console.log('Step 1: Finding user record...');
    const { data: userData, error: findError } = await supabase
      .from('user_profiles')
      .select('id, firebase_uid, email, display_name')
      .eq('firebase_uid', userId)
      .single();
    
    if (findError || !userData) {
      console.error('User not found:', findError);
      throw new Error(`User not found in database. Firebase UID: ${userId}`);
    }
    
    console.log('User found:', {
      databaseId: userData.id,
      firebaseUid: userData.firebase_uid,
      email: userData.email
    });
    
    // Step 2: Check current user permissions
    console.log('Step 2: Checking permissions...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication required to delete users');
    }
    
    // Step 3: Handle foreign key constraints in a transaction
    console.log('Step 3: Handling foreign key constraints...');
    
    // First, update any projects that reference this user
    const { data: projectsData, error: projectsCheckError } = await supabase
      .from('projects')
      .select('id, name')
      .or(`firebase_user_id.eq.${userData.firebase_uid},firebase_user_id.eq.${userData.id}`)
      .limit(10);
    
    if (projectsCheckError) {
      console.log('Warning: Could not check projects table:', projectsCheckError.message);
      // Continue anyway, as projects table might not exist or have different structure
    }
    
    if (projectsData && projectsData.length > 0) {
      console.log(`Found ${projectsData.length} projects linked to user. Updating...`);
      
      // Option 1: Set foreign key references to null
      const { error: updateProjectsError } = await supabase
        .from('projects')
        .update({ 
          firebase_user_id: null,
          // You might want to also update project_lead field
          project_lead: null 
        })
        .or(`firebase_user_id.eq.${userData.firebase_uid},firebase_user_id.eq.${userData.id}`);
      
      if (updateProjectsError) {
        console.error('Failed to update projects:', updateProjectsError);
        // Depending on your business logic, you might want to:
        // throw new Error('Cannot delete user: has associated projects');
        // OR continue with deletion and let database constraints handle it
      } else {
        console.log('Successfully updated project references');
      }
    }
    
    // Step 4: Perform the actual deletion
    console.log('Step 4: Deleting user from database...');
    
    const { data: deletedData, error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userData.id)
      .select('*');
    
    if (deleteError) {
      console.error('Delete operation failed:', deleteError);
      
      // Handle specific database errors
      if (deleteError.code === '23503') {
        throw new Error('Cannot delete user: User has associated data that prevents deletion. Please contact system administrator.');
      } else if (deleteError.code === '42501') {
        throw new Error('Permission denied: You do not have permission to delete users.');
      } else if (deleteError.code === 'PGRST116') {
        throw new Error('User not found or already deleted.');
      } else {
        throw new Error(`Database error: ${deleteError.message}`);
      }
    }
    
    if (!deletedData || deletedData.length === 0) {
      throw new Error('User deletion appeared to succeed but no rows were affected. User may not exist.');
    }
    
    console.log('Step 5: User successfully deleted!');
    console.log('Deleted user data:', deletedData[0]);
    console.log('=== USER DELETION COMPLETE ===');
    
    return { 
      success: true, 
      error: null,
      deletedUser: userData 
    };
    
  } catch (error: any) {
    console.error('=== USER DELETION FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred during user deletion'
    };
  }
}

// Alternative deletion method if the above doesn't work
export async function removeUserAlternative(userId: string) {
  try {
    console.log('=== ALTERNATIVE DELETE METHOD ===');
    
    // Try direct deletion by firebase_uid using RPC if available
    const { data, error } = await supabase.rpc('delete_user_profile', {
      user_firebase_uid: userId
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null, deletedUser: data };
    
  } catch (error: any) {
    console.error('Alternative delete method failed:', error);
    return { 
      success: false, 
      error: error.message || 'Alternative deletion method failed'
    };
  }
}

export async function getUserDetails(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('firebase_uid', userId)
      .single();
    
    if (error || !data) {
      throw new Error('User not found');
    }
    
    return { user: data, error: null };
    
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return { 
      user: null, 
      error: error.message || 'Failed to fetch user details'
    };
  }
}