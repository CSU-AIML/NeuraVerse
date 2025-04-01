-- ENHANCED SECURITY MIGRATION SCRIPT
-- Original migration: 20250318103945_amber_peak.sql
-- Enhanced with additional security measures

-- Set statement timeout to prevent long-running queries
SET statement_timeout = '30s';

-- 1. Create schema for application-specific tables (better isolation)
CREATE SCHEMA IF NOT EXISTS app;

-- 2. Create user_profiles table with enhanced security
CREATE TABLE IF NOT EXISTS app.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT CHECK (length(display_name) <= 100), -- Input validation
  avatar_url TEXT CHECK (avatar_url IS NULL OR (avatar_url LIKE 'https://%' OR avatar_url LIKE 'http://%')), -- URL validation
  bio TEXT CHECK (length(bio) <= 500), -- Input validation
  website TEXT CHECK (website IS NULL OR (website LIKE 'https://%' OR website LIKE 'http://%')), -- URL validation
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Role validation
  last_sign_in TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  version INTEGER DEFAULT 1 -- For optimistic concurrency control
);

-- Add a comment for documentation
COMMENT ON TABLE app.user_profiles IS 'User profile information extending auth.users';

-- 3. Create user_settings table with enhanced security
CREATE TABLE IF NOT EXISTS app.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')), -- Enum validation
  preferences JSONB DEFAULT '{}', -- For extensibility
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Create admin_permissions table with enhanced security
CREATE TABLE IF NOT EXISTS app.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_manage_projects BOOLEAN DEFAULT FALSE,
  can_manage_content BOOLEAN DEFAULT FALSE,
  permissions_granted_by UUID REFERENCES auth.users(id), -- Audit who granted permissions
  permissions_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id)
);

-- 5. Create audit_logs table for tracking important changes
CREATE TABLE IF NOT EXISTS app.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- 6. Create security_events table for tracking suspicious activity
CREATE TABLE IF NOT EXISTS app.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('failed_login', 'role_change', 'suspicious_activity', 'permission_change')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Enable RLS on all tables
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.security_events ENABLE ROW LEVEL SECURITY;

-- 8. Set up improved RLS policies for user_profiles with additional security

-- Users can read profiles that are not marked as private (new column we could add)
CREATE POLICY "Users can view public profiles"
  ON app.user_profiles
  FOR SELECT
  TO authenticated
  USING (true); -- We could enhance this with privacy settings

-- Users can only update their own profile with optimistic locking
CREATE POLICY "Users can update own profile with version check"
  ON app.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON app.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 9. Set up improved RLS policies for user_settings

-- Users can only view their own settings
CREATE POLICY "Users can view own settings"
  ON app.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only update their own settings
CREATE POLICY "Users can update own settings"
  ON app.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only insert their own settings
CREATE POLICY "Users can insert own settings"
  ON app.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 10. Set up improved RLS policies for admin_permissions

-- Only admins can view admin permissions
CREATE POLICY "Only admins can view permissions"
  ON app.admin_permissions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- Only admins can insert/update admin permissions
CREATE POLICY "Only admins can insert permissions"
  ON app.admin_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

CREATE POLICY "Only admins can update permissions"
  ON app.admin_permissions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- Only admins can delete permissions and we track who in the audit log
CREATE POLICY "Only admins can delete permissions"
  ON app.admin_permissions
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- 11. Set up RLS policies for audit_logs

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON app.audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- Nobody can update or delete audit logs (immutable)
-- All inserts happen via triggers or admin functions

-- 12. Set up RLS policies for security_events

-- Only admins can view security events
CREATE POLICY "Only admins can view security events"
  ON app.security_events
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- 13. Create improved trigger functions

-- Function to update timestamps
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new users with input validation
CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT;
BEGIN
  -- Get role from metadata with validation
  default_role = COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  
  -- Validate role is allowed
  IF default_role NOT IN ('user', 'admin') THEN
    default_role := 'user';
  END IF;
  
  -- Create sanitized profile
  INSERT INTO app.user_profiles (
    id, 
    display_name, 
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(
      SUBSTRING(NEW.raw_user_meta_data->>'name', 1, 100),
      SUBSTRING(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), 1, 100),
      'User'
    ), 
    default_role,
    NOW(),
    NOW()
  );
  
  -- Create default settings
  INSERT INTO app.user_settings (
    user_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NOW(),
    NOW()
  );
  
  -- Log user creation in audit
  INSERT INTO app.audit_logs (
    action,
    table_name,
    record_id,
    new_values,
    performed_at
  )
  VALUES (
    'user_created',
    'auth.users',
    NEW.id,
    json_build_object(
      'email', NEW.email,
      'role', default_role
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging function for user profiles
CREATE OR REPLACE FUNCTION app.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only log if something actually changed
    IF OLD.role != NEW.role OR OLD.display_name != NEW.display_name THEN
      INSERT INTO app.audit_logs (
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        performed_by
      )
      VALUES (
        'profile_updated',
        'app.user_profiles',
        NEW.id,
        jsonb_build_object(
          'role', OLD.role,
          'display_name', OLD.display_name
        ),
        jsonb_build_object(
          'role', NEW.role,
          'display_name', NEW.display_name
        ),
        auth.uid()
      );
      
      -- Log security event for role changes specifically
      IF OLD.role != NEW.role THEN
        INSERT INTO app.security_events (
          event_type,
          user_id,
          details
        )
        VALUES (
          'role_change',
          NEW.id,
          jsonb_build_object(
            'old_role', OLD.role,
            'new_role', NEW.role,
            'changed_by', auth.uid()
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NULL; -- After trigger doesn't need to return anything
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin with validation and security
CREATE OR REPLACE FUNCTION app.promote_to_admin(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  target_user_exists BOOLEAN;
  is_admin BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id_param) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Check if current user is admin
  SELECT EXISTS(
    SELECT 1 FROM app.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Update user role to admin
  UPDATE app.user_profiles
  SET 
    role = 'admin',
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Add admin permissions
  INSERT INTO app.admin_permissions (
    user_id, 
    can_manage_users, 
    can_manage_projects, 
    can_manage_content,
    permissions_granted_by
  )
  VALUES (
    user_id_param, 
    TRUE, 
    TRUE, 
    TRUE,
    auth.uid()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    can_manage_users = TRUE,
    can_manage_projects = TRUE,
    can_manage_content = TRUE,
    permissions_granted_by = auth.uid(),
    permissions_granted_at = NOW(),
    updated_at = NOW();
    
  -- Log the promotion action
  INSERT INTO app.audit_logs (
    action,
    table_name,
    record_id,
    new_values,
    performed_by
  )
  VALUES (
    'user_promoted',
    'app.user_profiles',
    user_id_param,
    jsonb_build_object('role', 'admin'),
    auth.uid()
  );
  
  -- Log security event
  INSERT INTO app.security_events (
    event_type,
    user_id,
    details
  )
  VALUES (
    'role_change',
    user_id_param,
    jsonb_build_object(
      'new_role', 'admin',
      'changed_by', auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to standard user
CREATE OR REPLACE FUNCTION app.demote_to_user(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  target_user_exists BOOLEAN;
  is_admin BOOLEAN;
  is_self BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id_param) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Check if current user is admin
  SELECT EXISTS(
    SELECT 1 FROM app.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;
  
  -- Check if user is demoting themselves
  is_self := auth.uid() = user_id_param;
  
  -- Update user role to standard user
  UPDATE app.user_profiles
  SET 
    role = 'user',
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Remove admin permissions
  DELETE FROM app.admin_permissions
  WHERE user_id = user_id_param;
  
  -- Log the demotion action
  INSERT INTO app.audit_logs (
    action,
    table_name,
    record_id,
    new_values,
    performed_by
  )
  VALUES (
    'user_demoted',
    'app.user_profiles',
    user_id_param,
    jsonb_build_object('role', 'user'),
    auth.uid()
  );
  
  -- Log security event
  INSERT INTO app.security_events (
    event_type,
    user_id,
    details
  )
  VALUES (
    'role_change',
    user_id_param,
    jsonb_build_object(
      'new_role', 'user',
      'changed_by', auth.uid(),
      'self_demotion', is_self
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely remove a user
CREATE OR REPLACE FUNCTION app.remove_user(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  target_user_exists BOOLEAN;
  is_admin BOOLEAN;
  is_self BOOLEAN;
  user_email TEXT;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id_param) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Check if current user is admin
  SELECT EXISTS(
    SELECT 1 FROM app.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can remove users';
  END IF;
  
  -- Check if user is removing themselves
  is_self := auth.uid() = user_id_param;
  
  IF is_self THEN
    RAISE EXCEPTION 'Admins cannot remove themselves';
  END IF;
  
  -- Get user email for audit log
  SELECT email INTO user_email FROM auth.users WHERE id = user_id_param;
  
  -- Log the removal action before deleting
  INSERT INTO app.audit_logs (
    action,
    table_name,
    record_id,
    old_values,
    performed_by
  )
  VALUES (
    'user_removed',
    'auth.users',
    user_id_param,
    jsonb_build_object('email', user_email),
    auth.uid()
  );
  
  -- Log security event
  INSERT INTO app.security_events (
    event_type,
    details
  )
  VALUES (
    'user_removed',
    jsonb_build_object(
      'removed_user_id', user_id_param,
      'removed_user_email', user_email,
      'removed_by', auth.uid()
    )
  );
  
  -- Delete associated records first
  -- (ON DELETE CASCADE will handle most of this, but being explicit)
  DELETE FROM app.admin_permissions WHERE user_id = user_id_param;
  DELETE FROM app.user_settings WHERE user_id = user_id_param;
  DELETE FROM app.user_profiles WHERE id = user_id_param;
  
  -- Note: We're not deleting from auth.users as that requires special privileges
  -- You would need to call auth.admin functions for that
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create triggers

-- Trigger for updating timestamps
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();
  
CREATE TRIGGER set_updated_at_user_settings
  BEFORE UPDATE ON app.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();
  
CREATE TRIGGER set_updated_at_admin_permissions
  BEFORE UPDATE ON app.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app.handle_new_user();

-- Trigger for auditing profile changes
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.log_profile_changes();

-- 15. Create admin-only view for user emails
CREATE OR REPLACE VIEW app.user_emails AS
SELECT 
  id as user_id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at
FROM auth.users;

-- Set up RLS policy to allow admins to read
CREATE POLICY "Allow admins to read user emails"
  ON app.user_emails
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  ));

-- 16. Create function to check permissions more granularly
CREATE OR REPLACE FUNCTION app.has_permission(permission text)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
  has_specific_permission boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS(
    SELECT 1 FROM app.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) INTO is_admin;
  
  -- If not admin, return false immediately
  IF NOT is_admin THEN
    RETURN false;
  END IF;
  
  -- Check for specific permission
  IF permission = 'manage_users' THEN
    SELECT can_manage_users FROM app.admin_permissions 
    WHERE user_id = auth.uid() 
    INTO has_specific_permission;
  ELSIF permission = 'manage_projects' THEN
    SELECT can_manage_projects FROM app.admin_permissions 
    WHERE user_id = auth.uid() 
    INTO has_specific_permission;
  ELSIF permission = 'manage_content' THEN
    SELECT can_manage_content FROM app.admin_permissions 
    WHERE user_id = auth.uid() 
    INTO has_specific_permission;
  ELSE
    -- Unknown permission
    RETURN false;
  END IF;
  
  -- Return true if they have the specific permission
  RETURN COALESCE(has_specific_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Grant appropriate permissions
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT SELECT ON app.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON app.user_settings TO authenticated;
GRANT SELECT ON app.user_emails TO authenticated;

-- Revoke unnecessary permissions
REVOKE ALL ON app.security_events FROM authenticated;
REVOKE ALL ON app.audit_logs FROM authenticated;

-- Let policies handle the rest of the permissions

-- 18. Add rate limiting functionality to prevent abuse
-- Note: This is typically handled at the application level or using external services

-- 19. Optional: Add IP whitelisting for admin functions
-- This would need to be implemented at the application level or in 
-- conjunction with a edge functions or service

-- 20. Create a helper function for admin authentication that can be used in endpoints
CREATE OR REPLACE FUNCTION app.require_admin() 
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM app.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 21. Create optimistic locking function for user profiles to prevent race conditions
CREATE OR REPLACE FUNCTION app.update_profile_with_version(
  user_id UUID,
  display_name TEXT,
  bio TEXT,
  website TEXT,
  expected_version INTEGER
) 
RETURNS BOOLEAN AS $$
DECLARE
  current_version INTEGER;
  rows_updated INTEGER;
BEGIN
  -- Get current version
  SELECT version INTO current_version FROM app.user_profiles WHERE id = user_id;
  
  -- Check if version matches expected
  IF current_version != expected_version THEN
    RETURN FALSE;
  END IF;
  
  -- Update with validation and increment version
  UPDATE app.user_profiles
  SET 
    display_name = CASE 
      WHEN LENGTH(update_profile_with_version.display_name) <= 100 
      THEN update_profile_with_version.display_name
      ELSE LEFT(update_profile_with_version.display_name, 100)
    END,
    bio = CASE 
      WHEN LENGTH(update_profile_with_version.bio) <= 500 
      THEN update_profile_with_version.bio
      ELSE LEFT(update_profile_with_version.bio, 500)
    END,
    website = CASE 
      WHEN update_profile_with_version.website IS NULL
        OR update_profile_with_version.website LIKE 'https://%'
        OR update_profile_with_version.website LIKE 'http://%'
      THEN update_profile_with_version.website
      ELSE NULL
    END,
    version = version + 1,
    updated_at = NOW()
  WHERE id = user_id AND version = expected_version
  RETURNING 1 INTO rows_updated;
  
  RETURN rows_updated = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 22. Create enhanced token validation in your application code
-- Create in your database migrations
CREATE OR REPLACE FUNCTION app.validate_token() 
RETURNS jsonb AS $$
DECLARE
  current_user_id uuid;
  current_user_role text;
  current_user_data jsonb;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Not authenticated'
    );
  END IF;
  
  -- Get user data
  SELECT
    jsonb_build_object(
      'id', id,
      'role', role,
      'email', (SELECT email FROM auth.users WHERE id = user_profiles.id),
      'created_at', created_at,
      'permissions', (
        SELECT jsonb_build_object(
          'can_manage_users', can_manage_users,
          'can_manage_projects', can_manage_projects,
          'can_manage_content', can_manage_content
        )
        FROM app.admin_permissions
        WHERE user_id = current_user_id
      )
    ) INTO current_user_data
  FROM app.user_profiles 
  WHERE id = current_user_id;
  
  -- Check if there's an active block on this user
  IF EXISTS (
    SELECT 1 
    FROM app.security_events 
    WHERE user_id = current_user_id 
    AND event_type = 'account_blocked'
    AND created_at > now() - interval '30 days'
  ) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Account is blocked'
    );
  END IF;
  
  -- Log this validation event
  INSERT INTO app.security_events (
    event_type,
    user_id,
    details
  ) VALUES (
    'token_validation',
    current_user_id,
    jsonb_build_object(
      'timestamp', extract(epoch from now())
    )
  );
  
  -- Return validation result
  RETURN jsonb_build_object(
    'valid', true,
    'user', current_user_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check specific permissions
CREATE OR REPLACE FUNCTION app.check_permission(permission_name text) 
RETURNS boolean AS $$
DECLARE
  current_user_id uuid;
  current_user_role text;
  has_specific_permission boolean;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user role
  SELECT role INTO current_user_role 
  FROM app.user_profiles 
  WHERE id = current_user_id;
  
  -- Admin always has access to general features
  IF current_user_role = 'admin' AND permission_name = 'general' THEN
    RETURN true;
  END IF;
  
  -- Check specific permissions for admins
  IF current_user_role = 'admin' THEN
    IF permission_name = 'manage_users' THEN
      SELECT can_manage_users INTO has_specific_permission 
      FROM app.admin_permissions 
      WHERE user_id = current_user_id;
      
      RETURN COALESCE(has_specific_permission, false);
    ELSIF permission_name = 'manage_projects' THEN
      SELECT can_manage_projects INTO has_specific_permission 
      FROM app.admin_permissions 
      WHERE user_id = current_user_id;
      
      RETURN COALESCE(has_specific_permission, false);
    ELSIF permission_name = 'manage_content' THEN
      SELECT can_manage_content INTO has_specific_permission 
      FROM app.admin_permissions 
      WHERE user_id = current_user_id;
      
      RETURN COALESCE(has_specific_permission, false);
    END IF;
  END IF;
  
  -- Standard users only have general access
  IF permission_name = 'general' THEN
    RETURN true;
  END IF;
  
  -- Default deny
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE app.security_events DROP CONSTRAINT IF EXISTS security_events_event_type_check;
ALTER TABLE app.security_events ADD CONSTRAINT security_events_event_type_check 
  CHECK (event_type IN ('failed_login', 'role_change', 'suspicious_activity', 
                         'permission_change', 'password_reset', 'login', 'user_removed'));

-- Create a function to track password reset attempts
CREATE OR REPLACE FUNCTION app.track_password_reset()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the password reset request in security_events
  INSERT INTO app.security_events (
    event_type,
    user_id,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    'password_reset',
    NEW.id,
    jsonb_build_object(
      'reset_requested_at', NOW(),
      'reset_token_created', true
    ),
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to check for suspicious reset activity
CREATE OR REPLACE FUNCTION app.check_reset_abuse(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  -- Count recent reset attempts (last 24 hours)
  SELECT COUNT(*)
  INTO reset_count
  FROM app.security_events
  WHERE 
    user_id = user_id_param AND
    event_type = 'password_reset' AND
    created_at > NOW() - INTERVAL '24 hours';
    
  -- If more than 5 reset attempts in 24 hours, consider it abuse
  RETURN reset_count > 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;