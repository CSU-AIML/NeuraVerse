-- Fix audit_logs actor_id null issue when updates come from clients without Postgres auth context
-- We coalesce to the explicit updated_by (Firebase UID) set by the application layer

-- Recreate function to log user activity into public.audit_logs using NEW.updated_by when present
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log significant profile changes
    IF OLD.role != NEW.role OR OLD.account_status != NEW.account_status THEN
      INSERT INTO audit_logs (
        action,
        actor_id,
        target_user_id,
        details
      ) VALUES (
        'user_profile_updated',
        -- Prefer the explicit actor set by the application; fall back to auth.uid()
        COALESCE(NEW.updated_by,
                 OLD.updated_by,
                 (auth.uid())::text),
        NEW.firebase_uid,
        jsonb_build_object(
          'old_role', OLD.role,
          'new_role', NEW.role,
          'old_status', OLD.account_status,
          'new_status', NEW.account_status,
          'updated_fields', array(
            SELECT key FROM jsonb_each_text(to_jsonb(NEW)) 
            WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key
          )
        )
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is present (idempotent)
DROP TRIGGER IF EXISTS trigger_log_user_activity ON user_profiles;
CREATE TRIGGER trigger_log_user_activity
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_user_activity();


