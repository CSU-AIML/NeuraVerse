// hooks/useSessionManager.ts - Hook for managing user sessions and persistence
import { useState, useEffect, useCallback } from 'react';
import { TokenService } from '../services/TokenService';
import { useAuth } from '../contexts/AuthContext';

interface SessionState {
  isRemembered: boolean;
  persistenceMode: 'local' | 'session';
  lastActivity: number;
  sessionExpiry: number | null;
}

interface SessionManagerOptions {
  autoLogoutMinutes?: number; // Auto logout after inactivity
  rememberMeDefault?: boolean; // Default remember me state
  sessionWarningMinutes?: number; // Show warning before auto logout
}

export function useSessionManager(options: SessionManagerOptions = {}) {
  const {
    autoLogoutMinutes = 30,
    rememberMeDefault = true,
    sessionWarningMinutes = 5
  } = options;

  const { signOut, isAuthenticated, user } = useAuth();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    isRemembered: rememberMeDefault,
    persistenceMode: 'local',
    lastActivity: Date.now(),
    sessionExpiry: null
  });

  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(0);

  /**
   * Initialize session state from storage
   */
  useEffect(() => {
    if (isAuthenticated) {
      const isRemembered = TokenService.isRememberMeEnabled();
      const persistenceMode = TokenService.getPersistenceMode();
      
      setSessionState(prev => ({
        ...prev,
        isRemembered,
        persistenceMode,
        lastActivity: Date.now(),
        sessionExpiry: persistenceMode === 'session' 
          ? Date.now() + (autoLogoutMinutes * 60 * 1000)
          : null
      }));
    }
  }, [isAuthenticated, autoLogoutMinutes]);

  /**
   * Update last activity timestamp
   */
  const updateActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    const now = Date.now();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      sessionExpiry: prev.persistenceMode === 'session' 
        ? now + (autoLogoutMinutes * 60 * 1000)
        : null
    }));
    
    setShowSessionWarning(false);
  }, [isAuthenticated, autoLogoutMinutes]);

  /**
   * Set remember me preference
   */
  const setRememberMe = useCallback((remember: boolean) => {
    if (!isAuthenticated) return;
    
    TokenService.setPersistenceMode(remember);
    
    setSessionState(prev => ({
      ...prev,
      isRemembered: remember,
      persistenceMode: remember ? 'local' : 'session',
      sessionExpiry: remember 
        ? null 
        : Date.now() + (autoLogoutMinutes * 60 * 1000)
    }));

    // Save to localStorage for next session
    if (remember) {
      localStorage.setItem('remembered_email', user?.email || '');
    }
  }, [isAuthenticated, user, autoLogoutMinutes]);

  /**
   * Extend current session
   */
  const extendSession = useCallback(() => {
    updateActivity();
    console.log('Session extended');
  }, [updateActivity]);

  /**
   * Force logout
   */
  const forceLogout = useCallback(async () => {
    try {
      await signOut();
      setShowSessionWarning(false);
      console.log('Session expired - user logged out');
    } catch (error) {
      console.error('Error during force logout:', error);
    }
  }, [signOut]);

  /**
   * Check session expiry and show warnings
   */
  useEffect(() => {
    if (!isAuthenticated || !sessionState.sessionExpiry) return;

    const checkSessionExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = sessionState.sessionExpiry! - now;
      const warningThreshold = sessionWarningMinutes * 60 * 1000;

      if (timeUntilExpiry <= 0) {
        // Session expired
        forceLogout();
      } else if (timeUntilExpiry <= warningThreshold && !showSessionWarning) {
        // Show warning
        setShowSessionWarning(true);
        setWarningCountdown(Math.ceil(timeUntilExpiry / 1000));
      } else if (showSessionWarning) {
        // Update countdown
        setWarningCountdown(Math.ceil(timeUntilExpiry / 1000));
      }
    };

    const interval = setInterval(checkSessionExpiry, 1000);
    return () => clearInterval(interval);
  }, [
    isAuthenticated, 
    sessionState.sessionExpiry, 
    sessionWarningMinutes, 
    showSessionWarning, 
    forceLogout
  ]);

  /**
   * Track user activity for session management
   */
  useEffect(() => {
    if (!isAuthenticated || sessionState.persistenceMode === 'local') return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Throttle activity updates to avoid excessive calls
    let activityTimeout: NodeJS.Timeout;
    const throttledHandleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleActivity, 1000);
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });
      clearTimeout(activityTimeout);
    };
  }, [isAuthenticated, sessionState.persistenceMode, updateActivity]);

  /**
   * Clean up expired cache periodically
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanupInterval = setInterval(() => {
      TokenService.cleanupExpiredCache();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [isAuthenticated]);

  /**
   * Get session info for display
   */
  const getSessionInfo = useCallback(() => {
    if (!isAuthenticated) return null;

    const now = Date.now();
    const sessionActive = sessionState.sessionExpiry 
      ? sessionState.sessionExpiry > now 
      : true;

    return {
      isActive: sessionActive,
      isPersistent: sessionState.persistenceMode === 'local',
      isRemembered: sessionState.isRemembered,
      lastActivity: new Date(sessionState.lastActivity),
      expiresAt: sessionState.sessionExpiry ? new Date(sessionState.sessionExpiry) : null,
      timeUntilExpiry: sessionState.sessionExpiry 
        ? Math.max(0, sessionState.sessionExpiry - now)
        : null
    };
  }, [isAuthenticated, sessionState]);

  /**
   * Session warning component data
   */
  const sessionWarningData = showSessionWarning ? {
    show: true,
    countdown: warningCountdown,
    onExtend: extendSession,
    onLogout: forceLogout
  } : {
    show: false,
    countdown: 0,
    onExtend: extendSession,
    onLogout: forceLogout
  };

  return {
    // State
    sessionState,
    showSessionWarning,
    warningCountdown,
    
    // Actions
    setRememberMe,
    updateActivity,
    extendSession,
    forceLogout,
    
    // Utils
    getSessionInfo,
    sessionWarningData,
    
    // Computed
    isSessionActive: !sessionState.sessionExpiry || sessionState.sessionExpiry > Date.now(),
    isPersistent: sessionState.persistenceMode === 'local',
    isRemembered: sessionState.isRemembered,
  };
}

// Session warning component props interface
export interface SessionWarningProps {
  show: boolean;
  countdown: number;
  onExtend: () => void;
  onLogout: () => void;
}