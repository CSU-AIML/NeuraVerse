import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectRunnerProvider } from './components/ProjectRunnerManager';
import { EditProject } from './components/EditProject';
import ContactPage from "./components/ContactPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Docs from './components/docs';
import { AuthProvider } from './contexts/AuthContext';
import { SignIn } from './SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import { NewProject } from './pages/NewProject';
import { UserManagement } from './pages/UserManagement';
import Dashboard from './components/Dashboard';
import { TooltipProvider } from "./components/ui/tooltip";
import { AlertProvider } from './components/AlertContext';
import ApiReference from './components/ApiReference';
import Templates from './components/Templates';
import Tutorials from './components/Tutorials';
import { AdminSetup } from './components/AdminSetup';

// Loading Component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-t-indigo-600 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-white mb-2">NeuraVerse</h2>
      <p className="text-slate-400">Loading your workspace...</p>
    </div>
  </div>
);

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
    
    // Log to your error reporting service here
    // Example: Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 to-orange-950 flex items-center justify-center p-6">
          <div className="text-center bg-red-900/20 border border-red-800 rounded-2xl p-8 max-w-md">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-100 mb-2">Something went wrong</h1>
            <p className="text-red-300 mb-4">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-red-200 cursor-pointer">Error Details</summary>
                <pre className="text-xs text-red-300 mt-2 p-2 bg-red-900/30 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


// Network Status Component
const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white p-2 text-center text-sm z-50">
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        You're offline. Some features may not work properly.
      </span>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AppErrorBoundary>
      {/* Router must be the outermost component using router hooks */}
      <Router>
        <AuthProvider>
          <AlertProvider>
            <ProjectRunnerProvider>
              <TooltipProvider>
                <NetworkStatus />
                
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Public Authentication Route */}
                    <Route path="/signin" element={<SignIn />} />
                    
                    {/* Admin Setup Route (Development/Initial Setup) */}
                    {(process.env.NODE_ENV === 'development' || 
                      window.location.search.includes('setup=true')) && (
                      <Route path="/setup" element={<AdminSetup />} />
                    )}
                    
                    {/* Root path - allow guests to see dashboard in demo mode */}
                    <Route path="/" element={
                      <ProtectedRoute allowGuest={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    
                    {/* Dashboard - allow guests for demo/preview */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute allowGuest={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    
                    {/* Public Routes - No authentication required */}
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    
                    {/* Documentation - Allow guests to read docs */}
                    <Route path="/docs" element={
                      <ProtectedRoute allowGuest={true}>
                        <Docs />
                      </ProtectedRoute>
                    } />
                    
                    {/* Resource Routes - Allow guests to browse */}
                    <Route path="/api" element={
                      <ProtectedRoute allowGuest={true}>
                        <ApiReference />
                      </ProtectedRoute>
                    } />
                    <Route path="/templates" element={
                      <ProtectedRoute allowGuest={true}>
                        <Templates />
                      </ProtectedRoute>
                    } />
                    <Route path="/tutorials" element={
                      <ProtectedRoute allowGuest={true}>
                        <Tutorials />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin-Only Routes - Full authentication required */}
                    <Route path="/new" element={
                      <ProtectedRoute adminOnly={true}>
                        <NewProject />
                      </ProtectedRoute>
                    } />
                    <Route 
                      path="/projects/edit/:id" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <EditProject />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/users" element={
                      <ProtectedRoute adminOnly={true}>
                        <UserManagement />
                      </ProtectedRoute>
                    } />
                    
                    
                    
                    {/* Catch-all route - redirect to dashboard */}
                    <Route path="*" element={
                      <ProtectedRoute allowGuest={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Suspense>
                
                {/* Development Tools */}
                {/* <AuthDebugger /> */}
                
              </TooltipProvider>
            </ProjectRunnerProvider>
          </AlertProvider>
        </AuthProvider>
      </Router>
    </AppErrorBoundary>
  );
}

export default App;