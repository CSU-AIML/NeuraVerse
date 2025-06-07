// components/auth/AuthErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SecurityAudit } from '../../utils/auth-security-utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

export class AuthErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `auth_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error details
    this.logError(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Security audit log
    SecurityAudit.log('auth_error_boundary_triggered', undefined, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
      errorId: this.state.errorId
    });
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console for development
    console.error('Authentication Error Boundary caught an error:', errorDetails);

    // In production, send to error reporting service
    this.reportError(errorDetails);
  };

  private reportError = async (errorDetails: ErrorDetails) => {
    try {
      // In a real application, send to your error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      console.log('Reporting error to monitoring service:', errorDetails);
      
      // You could also send to your backend
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorDetails)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));

      SecurityAudit.log('auth_error_boundary_retry', undefined, {
        errorId: this.state.errorId,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  private handleRefresh = () => {
    SecurityAudit.log('auth_error_boundary_refresh', undefined, {
      errorId: this.state.errorId
    });
    window.location.reload();
  };

  private handleGoHome = () => {
    SecurityAudit.log('auth_error_boundary_go_home', undefined, {
      errorId: this.state.errorId
    });
    window.location.href = '/';
  };

  private getErrorType = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return 'authentication';
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'authorization';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    
    return 'unknown';
  };

  private getErrorSuggestion = (errorType: string): string => {
    switch (errorType) {
      case 'authentication':
        return 'Please try signing in again or clear your browser cache.';
      case 'authorization':
        return 'You may not have permission to access this resource. Contact support if this continues.';
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'timeout':
        return 'The request timed out. Please try again in a moment.';
      default:
        return 'Please try refreshing the page or contact support if the issue persists.';
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const suggestion = this.getErrorSuggestion(errorType);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold">Authentication Error</h1>
                  <p className="text-red-100 text-sm">Something went wrong with the authentication system</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  What happened?
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {suggestion}
                </p>
                
                {/* Error details for development */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono break-all">
                        <strong>Error:</strong> {this.state.error.message}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        <strong>Error ID:</strong> {this.state.errorId}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        <strong>Retry Count:</strong> {this.state.retryCount}/{this.maxRetries}
                      </p>
                    </div>
                  </details>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colo