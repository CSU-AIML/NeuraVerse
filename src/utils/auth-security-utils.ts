// utils/SecurityUtils.ts - Advanced Security Utilities
import { supabase } from '../lib/supabase';

// Password security configuration
export const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  prohibitCommonPasswords: true,
  maxRepeatingChars: 3,
  minUniqueChars: 6,
  prohibitPersonalInfo: true
};

// Common passwords list (subset for demo - in production, use a comprehensive list)
const COMMON_PASSWORDS = [
  'password', '123456', 'password123', 'admin', 'qwerty', 'letmein',
  'welcome', 'monkey', '1234567890', 'abc123', 'Password1', 'password1',
  'iloveyou', 'princess', 'admin123', 'welcome123', 'login', 'passw0rd'
];

// Security event types for monitoring
export const SECURITY_EVENT_TYPES = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_CHANGE: 'password_change',
  EMAIL_CHANGE: 'email_change',
  ROLE_CHANGE: 'role_change',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_SUSPENDED: 'account_suspended',
  ACCOUNT_DELETED: 'account_deleted',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  DATA_EXPORT: 'data_export',
  PERMISSION_DENIED: 'permission_denied',
  TOKEN_REFRESH: 'token_refresh',
  SESSION_EXPIRED: 'session_expired',
  DEVICE_CHANGE: 'device_change',
  BULK_OPERATION: 'bulk_operation',
  GDPR_REQUEST: 'gdpr_request'
} as const;

// Risk score thresholds
export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
  HIGH: 90,
  CRITICAL: 95
} as const;

// IP address patterns for suspicious activity detection
const SUSPICIOUS_IP_PATTERNS = [
  /^10\./, // Private IP ranges (could indicate VPN/proxy)
  /^192\.168\./, 
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, 
  /^127\./, // Localhost
  /^169\.254\./, // Link-local
  /^224\./, // Multicast
  /^255\.255\.255\.255$/ // Broadcast
];

// User agent patterns for bot detection
const BOT_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python/i, /php/i, /perl/i, /ruby/i, /java/i, /automate/i
];

export interface PasswordStrengthResult {
  score: number; // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  warnings: string[];
  suggestions: string[];
  isValid: boolean;
  entropy: number;
}

export interface SecurityAnalysisResult {
  riskScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  recommendations: string[];
  blocked: boolean;
}

export interface UserBehaviorPattern {
  userId: string;
  normalLoginTimes: number[]; // Hours of day
  normalLocations: string[];
  typicalDevices: string[];
  averageSessionDuration: number;
  lastUpdated: Date;
}

/**
 * Advanced password strength analyzer
 */
export class PasswordAnalyzer {
  static analyzeStrength(password: string, userInfo?: { email?: string; name?: string }): PasswordStrengthResult {
    const feedback: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 0;
    let isValid = true;

    // Basic length check
    if (password.length < PASSWORD_CONFIG.minLength) {
      warnings.push(`Password must be at least ${PASSWORD_CONFIG.minLength} characters long`);
      isValid = false;
    } else if (password.length >= 12) {
      score += 20;
      feedback.push('Good length');
    } else {
      score += 10;
      suggestions.push('Use at least 12 characters for better security');
    }

    if (password.length > PASSWORD_CONFIG.maxLength) {
      warnings.push(`Password cannot exceed ${PASSWORD_CONFIG.maxLength} characters`);
      isValid = false;
    }

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let varietyScore = 0;
    if (hasLowercase) varietyScore += 1;
    if (hasUppercase) varietyScore += 1;
    if (hasNumbers) varietyScore += 1;
    if (hasSpecialChars) varietyScore += 1;

    if (varietyScore === 4) {
      score += 25;
      feedback.push('Good character variety');
    } else {
      score += varietyScore * 5;
      if (!hasLowercase && PASSWORD_CONFIG.requireLowercase) {
        warnings.push('Include lowercase letters');
        isValid = false;
      }
      if (!hasUppercase && PASSWORD_CONFIG.requireUppercase) {
        warnings.push('Include uppercase letters');
        isValid = false;
      }
      if (!hasNumbers && PASSWORD_CONFIG.requireNumbers) {
        warnings.push('Include numbers');
        isValid = false;
      }
      if (!hasSpecialChars && PASSWORD_CONFIG.requireSpecialChars) {
        warnings.push('Include special characters (!@#$%^&*)');
        isValid = false;
      }
    }

    // Check for repeating characters
    const repeatingPattern = /(.)\1{2,}/g;
    const repeatingMatches = password.match(repeatingPattern);
    if (repeatingMatches && repeatingMatches.some(match => match.length > PASSWORD_CONFIG.maxRepeatingChars)) {
      warnings.push('Avoid repeating characters');
      score -= 10;
    }

    // Check for sequential patterns
    const sequentialPatterns = [
      /123|234|345|456|567|678|789|890/,
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
      /qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm/i
    ];

    if (sequentialPatterns.some(pattern => pattern.test(password))) {
      warnings.push('Avoid sequential characters');
      score -= 15;
    }

    // Check against common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      warnings.push('This is a commonly used password');
      score -= 30;
      isValid = false;
    }

    // Check for personal information
    if (userInfo) {
      const personalInfo = [
        userInfo.email?.split('@')[0]?.toLowerCase(),
        userInfo.name?.toLowerCase(),
        userInfo.email?.split('@')[1]?.split('.')[0]?.toLowerCase()
      ].filter(Boolean);

      for (const info of personalInfo) {
        if (info && password.toLowerCase().includes(info)) {
          warnings.push('Avoid using personal information');
          score -= 20;
          break;
        }
      }
    }

    // Calculate entropy
    const entropy = this.calculateEntropy(password);
    if (entropy >= 60) {
      score += 20;
      feedback.push('High entropy');
    } else if (entropy >= 40) {
      score += 10;
      feedback.push('Good entropy');
    } else {
      suggestions.push('Use more varied characters');
    }

    // Check for dictionary words
    if (this.containsDictionaryWords(password)) {
      warnings.push('Avoid common dictionary words');
      score -= 10;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine strength level
    let level: PasswordStrengthResult['level'];
    if (score >= 90) level = 'very-strong';
    else if (score >= 75) level = 'strong';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';
    else if (score >= 20) level = 'weak';
    else level = 'very-weak';

    // Add suggestions based on score
    if (score < 60) {
      suggestions.push('Consider using a passphrase with multiple words');
      suggestions.push('Add numbers and special characters');
    }

    return {
      score,
      level,
      feedback,
      warnings,
      suggestions,
      isValid: isValid && score >= 40, // Minimum acceptable score
      entropy
    };
  }

  private static calculateEntropy(password: string): number {
    const charSets = {
      lowercase: /[a-z]/.test(password) ? 26 : 0,
      uppercase: /[A-Z]/.test(password) ? 26 : 0,
      numbers: /\d/.test(password) ? 10 : 0,
      symbols: /[^a-zA-Z0-9]/.test(password) ? 32 : 0
    };

    const charSetSize = Object.values(charSets).reduce((sum, size) => sum + size, 0);
    if (charSetSize === 0) return 0;

    return password.length * Math.log2(charSetSize);
  }

  private static containsDictionaryWords(password: string): boolean {
    // Simplified dictionary check - in production, use a comprehensive word list
    const commonWords = [
      'password', 'admin', 'user', 'login', 'welcome', 'hello', 'world',
      'computer', 'internet', 'security', 'access', 'system', 'database'
    ];

    const lowercasePassword = password.toLowerCase();
    return commonWords.some(word => lowercasePassword.includes(word));
  }
}

/**
 * Security risk analyzer for login attempts and user behavior
 */
export class SecurityAnalyzer {
  static async analyzeLoginAttempt(
    userId: string,
    ipAddress: string,
    userAgent: string,
    location?: { country?: string; city?: string }
  ): Promise<SecurityAnalysisResult> {
    const indicators: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;
    let blocked = false;

    // Check for suspicious IP patterns
    if (this.isSuspiciousIP(ipAddress)) {
      indicators.push('Suspicious IP address pattern detected');
      riskScore += 30;
    }

    // Check for bot-like user agents
    if (this.isBotUserAgent(userAgent)) {
      indicators.push('Automated/bot activity detected');
      riskScore += 40;
      blocked = true; // Block obvious bots
    }

    // Check recent failed attempts
    const recentFailures = await this.getRecentFailedAttempts(userId, ipAddress);
    if (recentFailures >= 5) {
      indicators.push(`${recentFailures} recent failed attempts`);
      riskScore += Math.min(50, recentFailures * 10);
      if (recentFailures >= 10) {
        blocked = true;
        recommendations.push('Account temporarily locked due to excessive failed attempts');
      }
    }

    // Check for unusual location
    const isUnusualLocation = await this.isUnusualLocation(userId, location);
    if (isUnusualLocation) {
      indicators.push('Login from unusual location');
      riskScore += 25;
      recommendations.push('Verify this login attempt via email');
    }

    // Check for device changes
    const isNewDevice = await this.isNewDevice(userId, userAgent);
    if (isNewDevice) {
      indicators.push('Login from new/unrecognized device');
      riskScore += 20;
      recommendations.push('Consider enabling two-factor authentication');
    }

    // Check login time patterns
    const isUnusualTime = await this.isUnusualLoginTime(userId);
    if (isUnusualTime) {
      indicators.push('Login at unusual time');
      riskScore += 15;
    }

    // Check for concurrent sessions
    const concurrentSessions = await this.getConcurrentSessions(userId);
    if (concurrentSessions > 3) {
      indicators.push(`${concurrentSessions} concurrent sessions detected`);
      riskScore += 20;
    }

    // Determine threat level
    let threatLevel: SecurityAnalysisResult['threatLevel'];
    if (riskScore >= RISK_THRESHOLDS.CRITICAL) threatLevel = 'critical';
    else if (riskScore >= RISK_THRESHOLDS.HIGH) threatLevel = 'high';
    else if (riskScore >= RISK_THRESHOLDS.MEDIUM) threatLevel = 'medium';
    else threatLevel = 'low';

    // Add general recommendations based on risk level
    if (threatLevel === 'high' || threatLevel === 'critical') {
      recommendations.push('Enable additional security measures');
      recommendations.push('Monitor account activity closely');
    }

    return {
      riskScore: Math.min(100, riskScore),
      threatLevel,
      indicators,
      recommendations,
      blocked
    };
  }

  private static isSuspiciousIP(ipAddress: string): boolean {
    return SUSPICIOUS_IP_PATTERNS.some(pattern => pattern.test(ipAddress));
  }

  private static isBotUserAgent(userAgent: string): boolean {
    return BOT_USER_AGENTS.some(pattern => pattern.test(userAgent));
  }

  private static async getRecentFailedAttempts(userId: string, ipAddress: string): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('id')
        .eq('event_type', SECURITY_EVENT_TYPES.LOGIN_FAILED)
        .or(`user_id.eq.${userId},ip_address.eq.${ipAddress}`)
        .gte('created_at', oneHourAgo);

      return error ? 0 : (data?.length || 0);
    } catch {
      return 0;
    }
  }

  private static async isUnusualLocation(userId: string, location?: { country?: string; city?: string }): Promise<boolean> {
    if (!location?.country) return false;

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('details')
        .eq('user_id', userId)
        .eq('event_type', SECURITY_EVENT_TYPES.LOGIN_SUCCESS)
        .gte('created_at', thirtyDaysAgo);

      if (error || !data) return false;

      const knownCountries = new Set(
        data
          .map(event => event.details?.location_country)
          .filter(Boolean)
      );

      return !knownCountries.has(location.country);
    } catch {
      return false;
    }
  }

  private static async isNewDevice(userId: string, userAgent: string): Promise<boolean> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('details')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo);

      if (error || !data) return true; // Assume new device if no history

      const knownUserAgents = new Set(
        data
          .map(event => event.details?.user_agent)
          .filter(Boolean)
      );

      return !knownUserAgents.has(userAgent);
    } catch {
      return true;
    }
  }

  private static async isUnusualLoginTime(userId: string): Promise<boolean> {
    try {
      const currentHour = new Date().getHours();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('created_at')
        .eq('user_id', userId)
        .eq('event_type', SECURITY_EVENT_TYPES.LOGIN_SUCCESS)
        .gte('created_at', thirtyDaysAgo);

      if (error || !data || data.length < 5) return false; // Need some history

      const loginHours = data.map(event => new Date(event.created_at).getHours());
      const hourCounts = loginHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Check if current hour is significantly different from typical patterns
      const avgLogins = loginHours.length / 24;
      const currentHourLogins = hourCounts[currentHour] || 0;

      return currentHourLogins < avgLogins * 0.3; // Less than 30% of average
    } catch {
      return false;
    }
  }

  private static async getConcurrentSessions(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('firebase_uid', userId)
        .gt('expires_at', new Date().toISOString())
        .is('revoked_at', null);

      return error ? 0 : (data?.length || 0);
    } catch {
      return 0;
    }
  }
}

/**
 * Security event logger with automatic risk assessment
 */
export class SecurityEventLogger {
  static async logEvent(
    eventType: string,
    userId?: string,
    details: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Calculate risk score based on event type and context
      const riskScore = this.calculateEventRiskScore(eventType, details);
      
      // Determine if this might be part of a larger pattern
      const threatIndicators = await this.analyzeThreatPatterns(eventType, userId, ipAddress);

      const eventData = {
        event_type: eventType,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        risk_score: riskScore,
        threat_indicators: threatIndicators,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          risk_factors: this.identifyRiskFactors(eventType, details)
        },
        success: details.success !== false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('security_events')
        .insert(eventData);

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // Trigger alerts for high-risk events
      if (riskScore >= RISK_THRESHOLDS.HIGH) {
        await this.triggerSecurityAlert(eventData);
      }

    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  private static calculateEventRiskScore(eventType: string, details: any): number {
    const baseScores = {
      [SECURITY_EVENT_TYPES.LOGIN_FAILED]: 30,
      [SECURITY_EVENT_TYPES.PERMISSION_DENIED]: 40,
      [SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY]: 70,
      [SECURITY_EVENT_TYPES.ACCOUNT_LOCKED]: 50,
      [SECURITY_EVENT_TYPES.DEVICE_CHANGE]: 25,
      [SECURITY_EVENT_TYPES.LOGIN_SUCCESS]: 0,
      [SECURITY_EVENT_TYPES.DATA_EXPORT]: 35,
      [SECURITY_EVENT_TYPES.BULK_OPERATION]: 45
    };

    let score = baseScores[eventType as keyof typeof baseScores] || 20;

    // Adjust based on details
    if (details.repeated_attempts > 3) score += 20;
    if (details.from_tor || details.from_vpn) score += 25;
    if (details.unusual_location) score += 15;
    if (details.new_device) score += 10;
    if (details.suspicious_user_agent) score += 30;

    return Math.min(100, score);
  }

  private static async analyzeThreatPatterns(
    eventType: string,
    userId?: string,
    ipAddress?: string
  ): Promise<any> {
    const patterns: Record<string, any> = {};

    if (userId) {
      // Check for rapid successive events from same user
      const recentEvents = await this.getRecentEvents(userId, 5); // Last 5 minutes
      if (recentEvents > 10) {
        patterns['rapid_user_activity'] = { count: recentEvents, window: '5_minutes' };
      }
    }

    if (ipAddress) {
      // Check for events from same IP across different users
      const ipEvents = await this.getRecentIPEvents(ipAddress, 60); // Last hour
      if (ipEvents > 20) {
        patterns['high_ip_activity'] = { count: ipEvents, window: '1_hour' };
      }
    }

    return patterns;
  }

  private static identifyRiskFactors(eventType: string, details: any): string[] {
    const factors = [];

    if (details.repeated_attempts) factors.push('repeated_attempts');
    if (details.unusual_location) factors.push('unusual_location');
    if (details.new_device) factors.push('new_device');
    if (details.suspicious_user_agent) factors.push('suspicious_user_agent');
    if (details.from_tor) factors.push('tor_network');
    if (details.from_vpn) factors.push('vpn_usage');
    if (details.multiple_sessions) factors.push('concurrent_sessions');

    return factors;
  }

  private static async getRecentEvents(userId: string, minutes: number): Promise<number> {
    try {
      const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', startTime);

      return error ? 0 : (data?.length || 0);
    } catch {
      return 0;
    }
  }

  private static async getRecentIPEvents(ipAddress: string, minutes: number): Promise<number> {
    try {
      const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('id')
        .eq('ip_address', ipAddress)
        .gte('created_at', startTime);

      return error ? 0 : (data?.length || 0);
    } catch {
      return 0;
    }
  }

  private static async triggerSecurityAlert(eventData: any): Promise<void> {
    // In production, this would send notifications to admins
    console.warn('HIGH RISK SECURITY EVENT:', {
      type: eventData.event_type,
      user: eventData.user_id,
      risk: eventData.risk_score,
      ip: eventData.ip_address,
      time: eventData.created_at
    });

    // You would integrate with notification services here:
    // - Email alerts to security team
    // - Slack/Teams notifications
    // - SMS alerts for critical events
    // - Integration with SIEM systems
  }
}

/**
 * Data retention and cleanup utilities
 */
export class DataRetentionManager {
  static async cleanupExpiredData(): Promise<{ cleaned: number; errors: string[] }> {
    const errors: string[] = [];
    let totalCleaned = 0;

    try {
      // Clean up expired sessions
      const sessionsCleaned = await this.cleanupExpiredSessions();
      totalCleaned += sessionsCleaned;

      // Clean up old security events (based on retention policy)
      const eventsCleaned = await this.cleanupOldSecurityEvents();
      totalCleaned += eventsCleaned;

      // Clean up old audit logs
      const auditCleaned = await this.cleanupOldAuditLogs();
      totalCleaned += auditCleaned;

      // Anonymize old user data if needed
      const anonymizedCount = await this.anonymizeOldUserData();
      totalCleaned += anonymizedCount;

    } catch (error) {
      errors.push(`Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { cleaned: totalCleaned, errors };
  }

  private static async cleanupExpiredSessions(): Promise<number> {
    const { data, error } = await supabase
      .from('user_sessions')
      .delete()
      .or('expires_at.lt.now(),revoked_at.not.is.null')
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  private static async cleanupOldSecurityEvents(): Promise<number> {
    // Keep security events for 2 years (configurable)
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);

    const { data, error } = await supabase
      .from('security_events')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  private static async cleanupOldAuditLogs(): Promise<number> {
    // Keep audit logs for 7 years (compliance requirement)
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  private static async anonymizeOldUserData(): Promise<number> {
    // Anonymize user data older than retention period (if deleted)
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        email: 'anonymized@deleted.local',
        display_name: 'Anonymized User',
        avatar_url: null
      })
      .eq('account_status', 'deleted')
      .lt('updated_at', cutoffDate.toISOString())
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }
}

/**
 * GDPR compliance utilities
 */
export class GDPRUtils {
  static async exportAllUserData(userId: string): Promise<any> {
    try {
      const userData = await supabase.rpc('export_user_data', {
        user_firebase_uid: userId
      });

      if (userData.error) throw userData.error;

      return {
        export_timestamp: new Date().toISOString(),
        user_data: userData.data,
        export_format: 'JSON',
        data_controller: 'NeuraVerse Platform',
        retention_policy: '7 years from account deletion',
        user_rights: {
          right_to_access: 'Fulfilled via this export',
          right_to_rectification: 'Contact support to update data',
          right_to_erasure: 'Contact support for account deletion',
          right_to_portability: 'Fulfilled via this export',
          right_to_object: 'Contact support to opt-out of processing'
        }
      };
    } catch (error) {
      throw new Error(`Data export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteAllUserData(userId: string, reason: string): Promise<void> {
    try {
      // This would implement complete data deletion for GDPR "right to be forgotten"
      // Including all related data across all tables
      await supabase.rpc('gdpr_delete_user_data', {
        user_firebase_uid: userId,
        deletion_reason: reason
      });
    } catch (error) {
      throw new Error(`GDPR deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export utility functions for easy access
export const securityUtils = {
  analyzePassword: PasswordAnalyzer.analyzeStrength,
  analyzeLogin: SecurityAnalyzer.analyzeLoginAttempt,
  logSecurityEvent: SecurityEventLogger.logEvent,
  cleanupData: DataRetentionManager.cleanupExpiredData,
  exportGDPRData: GDPRUtils.exportAllUserData,
  deleteGDPRData: GDPRUtils.deleteAllUserData
};