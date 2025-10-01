-- Fix export_user_data to avoid uuid=text operator issues by ensuring comparisons use text

CREATE OR REPLACE FUNCTION export_user_data(user_firebase_uid TEXT)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
  profile_data JSONB;
  preferences_data JSONB;
  audit_data JSONB;
BEGIN
  -- Get user profile
  SELECT to_jsonb(up.*) INTO profile_data
  FROM user_profiles up
  WHERE up.firebase_uid = user_firebase_uid;
  
  -- Get user preferences
  SELECT to_jsonb(pref.*) INTO preferences_data
  FROM user_preferences pref
  JOIN user_profiles up ON pref.user_id = up.id
  WHERE up.firebase_uid = user_firebase_uid;
  
  -- Get recent audit logs (last 100 entries)
  SELECT jsonb_agg(al.*) INTO audit_data
  FROM (
    SELECT * FROM audit_logs 
    WHERE target_user_id::text = user_firebase_uid 
    ORDER BY created_at DESC 
    LIMIT 100
  ) al;
  
  -- Combine all data
  user_data := jsonb_build_object(
    'export_date', NOW(),
    'user_profile', COALESCE(profile_data, '{}'::jsonb),
    'preferences', COALESCE(preferences_data, '{}'::jsonb),
    'audit_history', COALESCE(audit_data, '[]'::jsonb),
    'data_controller', 'NeuraVerse Platform',
    'export_format_version', '1.0'
  );
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


