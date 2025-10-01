// src/services/UserManagementService.ts - Firebase Auth + Supabase DB
import { supabase } from '../lib/supabase';
import { getCurrentUser, getFirebaseIdToken } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Enhanced User Profile interface for Firebase + Supabase
export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'guest';
  
  // Account status and security
  account_status: 'active' | 'suspended' | 'deleted' | 'pending_verification';
  email_verified: boolean;
  two_factor_enabled: boolean;
  password_changed_at?: string;
  last_login?: string;
  last_ip?: string;
  login_count: number;
  failed_login_attempts: number;
  account_locked_until?: string;
  
  // Provider info
  provider?: string;
  
  // Suspension management
  suspension_reason?: string;
  suspension_end_date?: string;
  suspended_by?: string;
  
  // GDPR and data compliance
  gdpr_consent: boolean;
  gdpr_consent_date?: string;
  data_retention_date?: string;
  data_processing_consent: boolean;
  marketing_consent: boolean;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Soft delete support
  deleted_at?: string;
  deleted_by?: string;
  deletion_reason?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  display_name?: string;
  role?: 'user' | 'admin' | 'guest';
  send_email_confirmation?: boolean;
}

export interface UpdateUserRequest {
  display_name?: string;
  role?: 'user' | 'admin' | 'guest';
  account_status?: 'active' | 'suspended' | 'deleted' | 'pending_verification';
  suspension_reason?: string;
  suspension_end_date?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  pending_users: number;
  admin_users: number;
  new_users_today: number;
  new_users_this_week: number;
}

class UserManagementService {
  private static instance: UserManagementService;
  
  static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  /**
   * Get current Firebase user and their Supabase profile
   */
  async getCurrentUserContext(): Promise<{ firebaseUser: any; profile: UserProfile }> {
    try {
      // Get current Firebase user
      const firebaseUser = getCurrentUser();
      
      if (!firebaseUser) {
        throw new Error('No authenticated Firebase user found');
      }

      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('User profile not found in database');
      }

      return { firebaseUser, profile };
    } catch (error) {
      console.error('getCurrentUserContext error:', error);
      throw error;
    }
  }

  /**
   * Check if current user is admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { profile } = await this.getCurrentUserContext();
      return profile.role === 'admin' && profile.account_status === 'active';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Fetch all users with enhanced filtering and pagination
   */
  async fetchUsers(options: {
    page?: number;
    limit?: number;
    role_filter?: string;
    status_filter?: string;
    search_query?: string;
  } = {}): Promise<{
    success: boolean;
    data?: UserProfile[];
    users?: UserProfile[];
    total_count: number;
    has_more: boolean;
    error?: string;
  }> {
    try {
      // Verify admin access
      const { profile: currentUserProfile } = await this.getCurrentUserContext();
      
      if (currentUserProfile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      const {
        page = 1,
        limit = 20,
        role_filter,
        status_filter,
        search_query
      } = options;

      const offset = (page - 1) * limit;

      // Build query
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (role_filter && role_filter !== 'all') {
        query = query.eq('role', role_filter);
      }

      if (status_filter && status_filter !== 'all') {
        query = query.eq('account_status', status_filter);
      }

      if (search_query) {
        query = query.or(`email.ilike.%${search_query}%,display_name.ilike.%${search_query}%`);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: users, error, count } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      return {
        success: true,
        data: users || [],
        users: users || [],
        total_count: count || 0,
        has_more: (count || 0) > offset + limit
      };

    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.message,
        users: [],
        total_count: 0,
        has_more: false
      };
    }
  }

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<UserStats> {
    try {
      // Verify admin access
      await this.getCurrentUserContext();

      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('role, account_status, created_at');

      if (error) {
        throw new Error(`Failed to fetch user stats: ${error.message}`);
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = users?.reduce((acc, user) => {
        const createdAt = new Date(user.created_at);
        
        // Total counts
        acc.total_users++;
        if (user.account_status === 'active') acc.active_users++;
        if (user.account_status === 'suspended') acc.suspended_users++;
        if (user.account_status === 'pending_verification') acc.pending_users++;
        if (user.role === 'admin') acc.admin_users++;
        
        // Time-based counts
        if (createdAt >= today) acc.new_users_today++;
        if (createdAt >= weekAgo) acc.new_users_this_week++;
        
        return acc;
      }, {
        total_users: 0,
        active_users: 0,
        suspended_users: 0,
        pending_users: 0,
        admin_users: 0,
        new_users_today: 0,
        new_users_this_week: 0,
      }) || {
        total_users: 0,
        active_users: 0,
        suspended_users: 0,
        pending_users: 0,
        admin_users: 0,
        new_users_today: 0,
        new_users_this_week: 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Create a new user (Firebase + Supabase)
   */
  async createUser(userData: CreateUserRequest): Promise<UserProfile> {
    try {
      // Verify admin access
      const { profile: currentUserProfile } = await this.getCurrentUserContext();
      
      if (currentUserProfile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      if (!userCredential.user) {
        throw new Error('Failed to create Firebase user');
      }

      const firebaseUser = userCredential.user;

      // Update Firebase profile if display name provided
      if (userData.display_name) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(firebaseUser, {
          displayName: userData.display_name,
        });
      }

      // Create Supabase profile
      const profileData = {
        firebase_uid: firebaseUser.uid,
        email: userData.email,
        display_name: userData.display_name || userData.email.split('@')[0],
        role: userData.role || 'user',
        account_status: 'active' as const,
        email_verified: firebaseUser.emailVerified,
        two_factor_enabled: false,
        login_count: 0,
        failed_login_attempts: 0,
        gdpr_consent: false,
        data_processing_consent: false,
        marketing_consent: false,
        created_by: currentUserProfile.firebase_uid,
        provider: 'password',
      };

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        // Clean up Firebase user if profile creation fails
        await firebaseUser.delete();
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      // Log the action
      await this.logUserAction('user_created', firebaseUser.uid, {
        created_by: currentUserProfile.firebase_uid,
        user_email: userData.email,
        user_role: userData.role || 'user',
      });

      return profile;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<UserProfile> {
    try {
      // Verify admin access
      const { profile: currentUserProfile } = await this.getCurrentUserContext();
      
      if (currentUserProfile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // First attempt: treat userId as firebase_uid
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: currentUserProfile.firebase_uid,
        })
        .eq('firebase_uid', userId)
        .select()
        .maybeSingle();

      // If no row matched firebase_uid, retry by primary id
      if (!profile) {
        const retry = await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
            updated_by: currentUserProfile.firebase_uid,
          })
          .eq('id', userId)
          .select()
          .maybeSingle();

        profile = retry.data as any;
        error = retry.error as any;
      }

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }

      if (!profile) {
        throw new Error('Failed to update user: user not found');
      }

      // Log the action
      await this.logUserAction('user_updated', userId, {
        updated_by: currentUserProfile.firebase_uid,
        changes: updates,
      });

      return profile;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Promote user to admin
   */
  async promoteToAdmin(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.updateUser(userId, { role: 'admin' });
      
      // Log the promotion
      await this.logUserAction('user_promoted', userId, {
        new_role: 'admin',
        reason: reason || 'Promoted by admin',
      });

      return { success: true };
    } catch (error) {
      console.error('Error promoting user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Demote admin to user
   */
  async demoteToUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.updateUser(userId, { role: 'user' });
      
      // Log the demotion
      await this.logUserAction('user_demoted', userId, {
        new_role: 'user',
        reason: reason || 'Demoted by admin',
      });

      return { success: true };
    } catch (error) {
      console.error('Error demoting user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reactivate a suspended/deleted user (set status to active)
   */
  async reactivateUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const profile = await this.updateUser(userId, {
        account_status: 'active',
        suspension_reason: undefined,
        suspension_end_date: undefined,
      });

      await this.logUserAction('user_reactivated', userId, {
        reactivated_by: getCurrentUser()?.uid,
        reason: reason || 'Reactivated by admin',
      });

      return { success: true };
    } catch (error) {
      console.error('Error reactivating user:', error);
      return { success: false, error: (error as any).message };
    }
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string, reason: string, duration?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const suspensionEndDate = duration 
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await this.updateUser(userId, { 
        account_status: 'suspended',
        suspension_reason: reason,
        suspension_end_date: suspensionEndDate,
      });
      
      // Log the suspension
      await this.logUserAction('user_suspended', userId, {
        reason,
        duration_days: duration,
        suspension_end_date: suspensionEndDate,
      });

      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete user (soft delete in Supabase, keep Firebase for audit)
   */
  async deleteUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify admin access
      const { profile: currentUserProfile } = await this.getCurrentUserContext();
      
      if (currentUserProfile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Hard delete the profile so it doesn't reappear after refresh
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('firebase_uid', userId);

      if (profileError) {
        throw new Error(`Failed to delete user profile: ${profileError.message}`);
      }

      // Note: Firebase auth user is not removed here. Consider disabling the Auth user separately if required.

      // Log the action
      await this.logUserAction('user_deleted', userId, {
        deleted_by: currentUserProfile.firebase_uid,
        reason: reason || 'Deleted by admin',
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export user data for GDPR compliance
   */
  async exportUserData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Verify admin access
      const { profile: currentUserProfile } = await this.getCurrentUserContext();
      
      if (currentUserProfile.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Use the GDPR export function
      const { data: exportData, error } = await supabase.rpc('export_user_data', {
        user_firebase_uid: userId
      });

      if (error) {
        throw new Error(`Failed to export user data: ${error.message}`);
      }

      // Log the export
      await this.logUserAction('user_data_exported', userId, {
        exported_by: currentUserProfile.firebase_uid,
        export_timestamp: new Date().toISOString(),
      });

      return { success: true, data: exportData };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log user management actions for audit trail
   */
  private async logUserAction(action: string, targetUserId: string, details: any): Promise<void> {
    try {
      const firebaseUser = getCurrentUser();
      
      if (!firebaseUser) {
        console.warn('No Firebase user found for audit logging');
        return;
      }
      
      await supabase.from('audit_logs').insert({
        action,
        actor_id: firebaseUser.uid,
        target_user_id: targetUserId,
        target_resource_type: 'user',
        details,
        severity: 'medium',
        success: true,
      });
    } catch (error) {
      console.error('Error logging user action:', error);
      // Don't throw here as this shouldn't block the main operation
    }
  }

  /**
   * Initialize admin user (for setup)
   */
  async initializeAdminUser(email: string, password: string): Promise<void> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('Failed to create Firebase admin user');
      }

      const firebaseUser = userCredential.user;

      // Use the special function to create admin profile
      const { error: adminError } = await supabase.rpc('create_admin_user', {
        admin_firebase_uid: firebaseUser.uid,
        admin_email: email,
        admin_display_name: 'Admin User',
      });

      if (adminError) {
        // Clean up Firebase user if profile creation fails
        await firebaseUser.delete();
        throw new Error(`Failed to create admin profile: ${adminError.message}`);
      }

      console.log('Admin user initialized successfully');
    } catch (error) {
      console.error('Error initializing admin user:', error);
      throw error;
    }
  }
}

export default UserManagementService.getInstance();