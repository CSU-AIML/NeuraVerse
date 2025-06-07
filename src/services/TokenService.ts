// services/TokenService.ts - Improved with persistent session support
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/firebase';

interface TokenInfo {
  token: string;
  expiresAt: number;
  refreshToken?: string;
  userId: string;
  role: string;
}

interface PermissionCache {
  [permission: string]: {
    hasPermission: boolean;
    cachedAt: number;
    expiresAt: number;
  };
}

export class TokenService {
  private static readonly TOKEN_STORAGE_KEY = 'auth_token_info';
  private static readonly PERMISSION_CACHE_KEY = 'permission_cache';
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private static readonly PERMISSION_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY_BASE = 1000; // 1 second

  // Security monitoring
  private static securityEvents: Array<{
    event: string;
    timestamp: number;
    details?: any;
  }> = [];

  // Rate limiting for token refresh
  private static lastRefreshAttempt = 0;
  private static refreshAttemptCount = 0;
  private static readonly REFRESH_RATE_LIMIT = 60 * 1000; // 1 minute

  /**
   * Get the appropriate storage based on persistence setting
   */
  private static getStorage(): Storage {
    const persistenceMode = localStorage.getItem('auth_persistence');
    return persistenceMode === 'session' ? sessionStorage : localStorage;
  }

  /**
   * Check if we should use persistent storage
   */
  private static shouldUsePersistentStorage(): boolean {
    const persistenceMode = localStorage.getItem('auth_persistence');
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    return persistenceMode === 'local' || rememberMe;
  }

  /**
   * Log security events for monitoring
   */
  private static logSecurityEvent(event: string, details?: any): void {
    const securityEvent = {
      event,
      timestamp: Date.now(),
      details
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 100 events
    if (this.securityEvents.length > 100) {
      this.securityEvents = this.securityEvents.slice(-100);
    }

    // In production, send to security monitoring service
    console.log('[Security Event]', securityEvent);
  }

  /**
   * Securely store token information with appropriate persistence
   */
  private static storeTokenInfo(tokenInfo: TokenInfo): void {
    try {
      const storage = this.getStorage();
      const encryptedData = JSON.stringify(tokenInfo);
      
      // Store in the appropriate storage
      storage.setItem(this.TOKEN_STORAGE_KEY, encryptedData);
      
      // Also store a backup in localStorage if using sessionStorage (for cross-tab sync)
      if (storage === sessionStorage) {
        try {
          localStorage.setItem(`${this.TOKEN_STORAGE_KEY}_backup`, encryptedData);
        } catch (error) {
          console.warn('Failed to store token backup:', error);
        }
      }
      
      this.logSecurityEvent('token_stored', {
        userId: tokenInfo.userId,
        expiresAt: tokenInfo.expiresAt,
        storage: storage === localStorage ? 'persistent' : 'session'
      });
    } catch (error) {
      console.error('Error storing token info:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logSecurityEvent('token_storage_error', { error: errorMessage });
    }
  }

  /**
   * Retrieve stored token information from appropriate storage
   */
  private static getStoredTokenInfo(): TokenInfo | null {
    try {
      const storage = this.getStorage();
      let encryptedData = storage.getItem(this.TOKEN_STORAGE_KEY);
      
      // If not found in primary storage, try backup (for cross-tab sync)
      if (!encryptedData && storage === sessionStorage) {
        encryptedData = localStorage.getItem(`${this.TOKEN_STORAGE_KEY}_backup`);
        if (encryptedData) {
          // Restore to session storage
          storage.setItem(this.TOKEN_STORAGE_KEY, encryptedData);
        }
      }
      
      if (!encryptedData) return null;

      const tokenInfo: TokenInfo = JSON.parse(encryptedData);
      
      // Validate token structure
      if (!tokenInfo.token || !tokenInfo.expiresAt || !tokenInfo.userId) {
        this.clearTokenInfo();
        return null;
      }

      // Check if token is expired
      if (tokenInfo.expiresAt <= Date.now()) {
        this.clearTokenInfo();
        return null;
      }

      return tokenInfo;
    } catch (error) {
      console.error('Error retrieving token info:', error);
      this.clearTokenInfo();
      return null;
    }
  }

  /**
   * Clear stored token information from all storages
   */
  private static clearTokenInfo(): void {
    try {
      // Clear from both storages to be safe
      sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      localStorage.removeItem(`${this.TOKEN_STORAGE_KEY}_backup`);
      
      // Clear permission cache
      sessionStorage.removeItem(this.PERMISSION_CACHE_KEY);
      localStorage.removeItem(this.PERMISSION_CACHE_KEY);
      
      this.logSecurityEvent('token_cleared');
    } catch (error) {
      console.error('Error clearing token info:', error);
    }
  }

  /**
   * Check if current token needs refresh
   */
  private static needsRefresh(tokenInfo: TokenInfo): boolean {
    const now = Date.now();
    const timeUntilExpiry = tokenInfo.expiresAt - now;
    return timeUntilExpiry <= this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Check rate limiting for token refresh
   */
  private static isRefreshRateLimited(): boolean {
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshAttempt;

    if (timeSinceLastRefresh > this.REFRESH_RATE_LIMIT) {
      this.refreshAttemptCount = 0;
      return false;
    }

    return this.refreshAttemptCount >= this.MAX_RETRY_ATTEMPTS;
  }

  /**
   * Refresh authentication token
   */
  private static async refreshToken(): Promise<TokenInfo | null> {
    // Check rate limiting
    if (this.isRefreshRateLimited()) {
      this.logSecurityEvent('token_refresh_rate_limited');
      throw new Error('Token refresh rate limited');
    }

    this.lastRefreshAttempt = Date.now();
    this.refreshAttemptCount++;

    try {
      const firebaseUser = getCurrentUser();
      if (!firebaseUser) {
        this.clearTokenInfo();
        throw new Error('No authenticated user');
      }

      // Get fresh token from Firebase
      const token = await firebaseUser.getIdToken(true);
      const tokenResult = await firebaseUser.getIdTokenResult();

      const tokenInfo: TokenInfo = {
        token,
        expiresAt: new Date(tokenResult.expirationTime).getTime(),
        userId: firebaseUser.uid,
        role: typeof tokenResult.claims.role === 'string' ? tokenResult.claims.role : 'user'
      };

      this.storeTokenInfo(tokenInfo);
      this.refreshAttemptCount = 0; // Reset on success

      this.logSecurityEvent('token_refreshed', {
        userId: tokenInfo.userId,
        expiresAt: tokenInfo.expiresAt
      });

      return tokenInfo;
    } catch (error) {
      this.logSecurityEvent('token_refresh_failed', {
        error: error instanceof Error ? error.message : String(error),
        attempt: this.refreshAttemptCount
      });

      if (this.refreshAttemptCount >= this.MAX_RETRY_ATTEMPTS) {
        this.clearTokenInfo();
        throw new Error('Token refresh failed after maximum attempts');
      }

      throw error;
    }
  }

  /**
   * Get current valid token
   */
  public static async getCurrentToken(): Promise<string | null> {
    try {
      let tokenInfo = this.getStoredTokenInfo();

      // Check if token exists and is not expired
      if (!tokenInfo || tokenInfo.expiresAt <= Date.now()) {
        tokenInfo = await this.refreshToken();
      }
      // Check if token needs refresh soon
      else if (this.needsRefresh(tokenInfo)) {
        try {
          tokenInfo = await this.refreshToken();
        } catch (error) {
          // If refresh fails, use current token if still valid
          if (tokenInfo && tokenInfo.expiresAt > Date.now()) {
            console.warn('Token refresh failed, using current token:', error);
          } else {
            throw error;
          }
        }
      }

      return tokenInfo?.token || null;
    } catch (error) {
      console.error('Error getting current token:', error);
      this.logSecurityEvent('get_token_failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * Refresh token if needed
   */
  public static async refreshIfNeeded(): Promise<boolean> {
    try {
      const token = await this.getCurrentToken();
      return !!token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Get cached permission with appropriate storage
   */
  private static getCachedPermission(permission: string): boolean | null {
    try {
      const storage = this.getStorage();
      const cacheData = storage.getItem(this.PERMISSION_CACHE_KEY);
      if (!cacheData) return null;

      const cache: PermissionCache = JSON.parse(cacheData);
      const permissionData = cache[permission];

      if (!permissionData || permissionData.expiresAt <= Date.now()) {
        return null;
      }

      return permissionData.hasPermission;
    } catch (error) {
      console.error('Error getting cached permission:', error);
      return null;
    }
  }

  /**
   * Cache permission result with appropriate storage
   */
  private static cachePermission(permission: string, hasPermission: boolean): void {
    try {
      const storage = this.getStorage();
      const cacheData = storage.getItem(this.PERMISSION_CACHE_KEY);
      const cache: PermissionCache = cacheData ? JSON.parse(cacheData) : {};

      cache[permission] = {
        hasPermission,
        cachedAt: Date.now(),
        expiresAt: Date.now() + this.PERMISSION_CACHE_DURATION
      };

      storage.setItem(this.PERMISSION_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching permission:', error);
    }
  }

  /**
   * Check user permission with caching and retry logic
   */
  public static async checkPermission(permission: string): Promise<boolean> {
    // Check cache first
    const cachedResult = this.getCachedPermission(permission);
    if (cachedResult !== null) {
      return cachedResult;
    }

    let attempts = 0;
    while (attempts < this.MAX_RETRY_ATTEMPTS) {
      try {
        const tokenInfo = this.getStoredTokenInfo();
        if (!tokenInfo) {
          throw new Error('No valid token available');
        }

        // Call permission check endpoint
        const { data, error } = await supabase.rpc('check_permission', {
          user_id_param: tokenInfo.userId,
          permission_name: permission
        });

        if (error) {
          throw error;
        }

        const hasPermission = data === true;
        
        // Cache the result
        this.cachePermission(permission, hasPermission);

        this.logSecurityEvent('permission_checked', {
          permission,
          hasPermission,
          userId: tokenInfo.userId
        });

        return hasPermission;
      } catch (error) {
        attempts++;
        
        this.logSecurityEvent('permission_check_failed', {
          permission,
          attempt: attempts,
          error: error instanceof Error ? error.message : String(error)
        });

        if (attempts >= this.MAX_RETRY_ATTEMPTS) {
          console.error(`Permission check failed after ${attempts} attempts:`, error);
          return false;
        }

        // Exponential backoff
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return false;
  }

  /**
   * Clear all cached data and prepare for sign out
   */
  public static signOut(): void {
    this.clearTokenInfo();
    
    // Clear remember me preferences if user explicitly signs out
    localStorage.removeItem('remembered_email');
    localStorage.removeItem('remember_me');
    localStorage.removeItem('auth_persistence');
    
    this.logSecurityEvent('user_signed_out');
  }

  /**
   * Get user information from stored token
   */
  public static getUserInfo(): { userId: string; role: string } | null {
    const tokenInfo = this.getStoredTokenInfo();
    if (!tokenInfo) return null;

    return {
      userId: tokenInfo.userId,
      role: tokenInfo.role
    };
  }

  /**
   * Validate token integrity
   */
  public static async validateToken(): Promise<boolean> {
    try {
      const token = await this.getCurrentToken();
      if (!token) return false;

      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        this.clearTokenInfo();
        this.logSecurityEvent('token_validation_failed', { error: error?.message });
        return false;
      }

      this.logSecurityEvent('token_validated', { userId: data.user.id });
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.logSecurityEvent('token_validation_error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Set persistence mode (for manual control)
   */
  public static setPersistenceMode(persistent: boolean): void {
    localStorage.setItem('auth_persistence', persistent ? 'local' : 'session');
    localStorage.setItem('remember_me', persistent ? 'true' : 'false');
    
    // Migrate existing token to new storage if needed
    const currentStorage = this.getStorage();
    const otherStorage = persistent ? sessionStorage : localStorage;
    
    const tokenData = otherStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (tokenData) {
      currentStorage.setItem(this.TOKEN_STORAGE_KEY, tokenData);
      otherStorage.removeItem(this.TOKEN_STORAGE_KEY);
    }
    
    this.logSecurityEvent('persistence_mode_changed', { persistent });
  }

  /**
   * Get current persistence mode
   */
  public static getPersistenceMode(): 'local' | 'session' {
    const persistenceMode = localStorage.getItem('auth_persistence');
    return persistenceMode === 'session' ? 'session' : 'local';
  }

  /**
   * Check if remember me is enabled
   */
  public static isRememberMeEnabled(): boolean {
    return localStorage.getItem('remember_me') === 'true';
  }

  /**
   * Get security events for monitoring
   */
  public static getSecurityEvents(): Array<{ event: string; timestamp: number; details?: any }> {
    return [...this.securityEvents];
  }

  /**
   * Clear expired cache entries
   */
  public static cleanupExpiredCache(): void {
    try {
      const storage = this.getStorage();
      const cacheData = storage.getItem(this.PERMISSION_CACHE_KEY);
      if (!cacheData) return;

      const cache: PermissionCache = JSON.parse(cacheData);
      const now = Date.now();
      const cleanedCache: PermissionCache = {};

      for (const [permission, data] of Object.entries(cache)) {
        if (data.expiresAt > now) {
          cleanedCache[permission] = data;
        }
      }

      storage.setItem(this.PERMISSION_CACHE_KEY, JSON.stringify(cleanedCache));
      this.logSecurityEvent('cache_cleaned');
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }
}