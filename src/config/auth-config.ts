// config/auth-config.ts
/**
 * Enhanced Authentication Configuration
 * Secure defaults and environment validation for production-ready authentication
 */

// Environment validation
interface EnvConfig {
  // Firebase Configuration
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  
  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string; // Server-side only
  
  // Security Configuration
  environment: 'development' | 'staging' | 'production';
  enableSecurityLogging: boolean;
  enableRateLimiting: boolean;
  allowGuestAccess: boolean;
  maxGuestSessionDuration: number;
  sessionTimeout: number;
  
  // Optional integrations
  sentryDsn?: string;
  analyticsId?: string;
}

/**
 * Validate and load environment configuration
 */
export const loadAuthConfig = (): EnvConfig => {
  const env = import.meta.env;
  
  // Required environment variables
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  // Check for missing required variables
  const missing = requiredVars.filter(varName => !env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate environment values
  const environment = (env.VITE_NODE_ENV || env.NODE_ENV || 'development') as EnvConfig['environment'];
  if (!['development', 'staging', 'production'].includes(environment)) {
    throw new Error(`Invalid environment: ${environment}`);
  }
  
  // Build configuration object
  const config: EnvConfig = {
    // Firebase
    firebaseApiKey: env.VITE_FIREBASE_API_KEY,
    firebaseAuthDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: env.VITE_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: env.VITE_FIREBASE_APP_ID,
    
    // Supabase
    supabaseUrl: env.VITE_SUPABASE_URL,
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY, // Server-side only
    
    // Security settings
    environment,
    enableSecurityLogging: env.VITE_ENABLE_SECURITY_LOGGING !== 'false',
    enableRateLimiting: environment === 'production' || env.VITE_ENABLE_RATE_LIMITING === 'true',
    allowGuestAccess: env.VITE_ALLOW_GUEST_ACCESS !== 'false',
    maxGuestSessionDuration: parseInt(env.VITE_MAX_GUEST_SESSION_DURATION || '86400000'), // 24 hours
    sessionTimeout: parseInt(env.VITE_SESSION_TIMEOUT || '86400000'), // 24 hours
    
    // Optional
    sentryDsn: env.VITE_SENTRY_DSN,
    analyticsId: env.VITE_ANALYTICS_ID
  };
  
  // Additional validation
  validateConfiguration(config);
  
  return config;
};

/**
 * Validate configuration values
 */
const validateConfiguration = (config: EnvConfig): void => {
  // Validate URLs
  try {
    new URL(config.supabaseUrl);
    new URL(`https://${config.firebaseAuthDomain}`);
  } catch (error) {
    throw new Error('Invalid URL format in configuration');
  }
  
  // Validate numeric values
  if (config.maxGuestSessionDuration < 3600000) { // Minimum 1 hour
    throw new Error('maxGuestSessionDuration must be at least 1 hour (3600000ms)');
  }
  
  if (config.sessionTimeout < 1800000) { // Minimum 30 minutes
    throw new Error('sessionTimeout must be at least 30 minutes (1800000ms)');
  }
  
  // Production-specific validations
  if (config.environment === 'production') {
    if (!config.enableSecurityLogging) {
      console.warn('Security logging disabled in production - this is not recommended');
    }
    
    if (!config.enableRateLimiting) {
      console.warn('Rate limiting disabled in production - this is not recommended');
    }
  }
};

// Export the loaded configuration
export const authConfig = loadAuthConfig();

/**
 * Security policy configuration
 */
export const securityPolicy = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbidCommonPasswords: true,
    maxLength: 128
  },
  
  // Session management
  session: {
    timeout: authConfig.sessionTimeout,
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    warningBeforeTimeout: 5 * 60 * 1000, // 5 minutes
    maxConcurrentSessions: 3,
    requireReauthForSensitive: true
  },
  
  // Rate limiting
  rateLimiting: {
    enabled: authConfig.enableRateLimiting,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000
  },
  
  // Guest access
  guest: {
    enabled: authConfig.allowGuestAccess,
    maxSessionDuration: authConfig.maxGuestSessionDuration,
    allowedPaths: [
      '/guest-dashboard',
      '/public',
      '/demos',
      '/docs'
    ],
    restrictedPaths: [
      '/admin',
      '/settings',
      '/profile',
      '/billing'
    ]
  },
  
  // Security headers and CSP
  security: {
    enableCSP: true,
    enableHSTS: authConfig.environment === 'production',
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true,
    allowedOrigins: authConfig.environment === 'production' 
      ? [`https://${authConfig.firebaseAuthDomain}`]
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
  },
  
  // Audit logging
  audit: {
    enabled: authConfig.enableSecurityLogging,
    events: [
      'login',
      'logout',
      'login_failed',
      'password_changed',
      'account_locked',
      'permission_denied',
      'suspicious_activity',
      'data_access',
      'admin_action'
    ],
    retention: authConfig.environment === 'production' ? 90 : 30 // days
  }
};

/**
 * Development helper to check configuration
 */
export const validateEnvironment = (): boolean => {
  try {
    loadAuthConfig();
    console.log('✅ Environment configuration is valid');
    console.log('📋 Configuration summary:', {
      environment: authConfig.environment,
      securityLogging: authConfig.enableSecurityLogging,
      rateLimiting: authConfig.enableRateLimiting,
      guestAccess: authConfig.allowGuestAccess
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Environment configuration error:', error.message);
    } else {
      console.error('❌ Environment configuration error:', error);
    }
    return false;
  }
};

/**
 * Generate Content Security Policy header
 */
export const generateCSP = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://accounts.google.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  if (authConfig.environment !== 'production') {
    // Add development-specific sources
    cspDirectives[1] += " 'unsafe-eval'"; // Allow eval for development tools
    cspDirectives.push("connect-src 'self' ws://localhost:* http://localhost:* https://*.supabase.co wss://*.supabase.co");
  }
  
  return cspDirectives.join('; ');
};

/**
 * Database schema initialization (SQL)
 * This should be run in your Supabase dashboard or migration system
 */
export const databaseSchema = `
-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT, -- Can be firebase_uid or guest_id
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User permissions junction table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES user_profiles(id),
  UNIQUE(user_id, permission_id)
);

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (firebase_uid = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (firebase_uid = auth.uid());

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE firebase_uid = auth.uid() AND role = 'admin'
    )
  );

-- Security events - only admins can view
CREATE POLICY "Admins can view security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE firebase_uid = auth.uid() AND role = 'admin'
    )
  );

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
  ('general', 'General application access'),
  ('manage_users', 'Manage user accounts'),
  ('manage_projects', 'Manage projects and deployments'),
  ('view_analytics', 'View application analytics'),
  ('admin_panel', 'Access admin panel'),
  ('security_events', 'View security events')
ON CONFLICT (name) DO NOTHING;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_permission(user_id_param TEXT, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM user_profiles
  WHERE firebase_uid = user_id_param;
  
  -- Admins have all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN EXISTS (
    SELECT 1
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    JOIN user_profiles u ON up.user_id = u.id
    WHERE u.firebase_uid = user_id_param
    AND p.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last login
CREATE OR REPLACE FUNCTION update_last_login(user_firebase_uid TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET last_login = NOW(), updated_at = NOW()
  WHERE firebase_uid = user_firebase_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
`;

// Validate environment on module load in development
if (authConfig.environment === 'development') {
  validateEnvironment();
}