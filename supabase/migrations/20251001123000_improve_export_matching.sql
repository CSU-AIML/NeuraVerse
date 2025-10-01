-- Improve export_user_data to match by firebase_uid or internal UUID id

CREATE OR REPLACE FUNCTION export_user_data(user_identifier TEXT)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
  profile_data JSONB;
  preferences_data JSONB;
  audit_data JSONB;
  resolved_firebase_uid TEXT;
BEGIN
  -- Resolve firebase_uid from either firebase_uid or id
  SELECT up.firebase_uid
  INTO resolved_firebase_uid
  FROM user_profiles up
  WHERE up.firebase_uid = user_identifier
     OR up.id::text = user_identifier
  LIMIT 1;

  -- If nothing resolved, return empty structure
  IF resolved_firebase_uid IS NULL THEN
    RETURN jsonb_build_object(
      'export_date', NOW(),
      'user_profile', '{}'::jsonb,
      'preferences', '{}'::jsonb,
      'audit_history', '[]'::jsonb
    );
  END IF;

  -- Get user profile
  SELECT to_jsonb(up.*) INTO profile_data
  FROM user_profiles up
  WHERE up.firebase_uid = resolved_firebase_uid
  LIMIT 1;
  
  -- Get user preferences
  SELECT to_jsonb(pref.*) INTO preferences_data
  FROM user_preferences pref
  JOIN user_profiles up ON pref.user_id = up.id
  WHERE up.firebase_uid = resolved_firebase_uid
  LIMIT 1;
  
  -- Get recent audit logs (last 100 entries)
  SELECT jsonb_agg(al.*) INTO audit_data
  FROM (
    SELECT * FROM audit_logs 
    WHERE target_user_id::text = resolved_firebase_uid
       OR actor_id = resolved_firebase_uid
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


