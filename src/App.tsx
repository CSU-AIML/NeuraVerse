import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { useSmoothScroll, usePageTransition } from './hooks/useGSAP';
import { gsap } from 'gsap';

// Enhanced Loading Component with GSAP animations
const LoadingScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
      }
    });

    // Initial setup
    gsap.set('.loading-logo', { scale: 0.5, opacity: 0 });
    gsap.set('.loading-text', { y: 20, opacity: 0 });
    gsap.set('.loading-spinner', { rotation: 0 });
    gsap.set('.loading-progress', { width: '0%' });

    // Animation sequence
    tl.to('.loading-logo', {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'back.out(1.7)'
    })
    .to('.loading-text', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.loading-spinner', {
      rotation: 360,
      duration: 1,
      ease: 'power2.inOut',
      repeat: -1
    }, '-=0.6')
    .to('.loading-progress', {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut'
    }, '-=0.6')
    .to('.loading-screen', {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      delay: 0.5
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div className="loading-screen fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="loading-logo w-16 h-16 mb-6 mx-auto relative">
          <div className="loading-spinner w-full h-full border-4 border-t-indigo-600 border-slate-600 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Text Animation */}
        <div className="loading-text">
          <h2 className="text-2xl font-bold text-white mb-2">NeuraVerse</h2>
          <p className="text-slate-400 mb-4">Initializing your workspace...</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-64 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
          <div className="loading-progress h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Error Boundary Component with enhanced animations
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
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.state.hasError && !prevState.hasError) {
      // Animate error state
      gsap.fromTo('.error-container', 
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 to-orange-950 flex items-center justify-center p-6">
          <div className="error-container text-center bg-red-900/20 border border-red-800 rounded-2xl p-8 max-w-md">
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
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
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

// Network Status Component with animations
const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Animate online notification
      gsap.fromTo('.network-status', 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Animate offline notification
      gsap.fromTo('.network-status', 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="network-status fixed top-0 left-0 right-0 bg-amber-600 text-white p-2 text-center text-sm z-50">
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        You're offline. Some features may not work properly.
      </span>
    </div>
  );
};

// Page wrapper component for route animations
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pageRef = usePageTransition();
  
  return (
    <div ref={pageRef} className="page-content">
      {children}
    </div>
  );
};

// Routes wrapper with location-based animations
const RoutesWrapper: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Route change animation
    gsap.fromTo('.route-content', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return (
    <div className="route-content">
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/signin" element={
          <PageWrapper>
            <SignIn />
          </PageWrapper>
        } />
        
        {/* Admin Setup Route */}
        {(process.env.NODE_ENV === 'development' || 
          window.location.search.includes('setup=true')) && (
          <Route path="/setup" element={
            <PageWrapper>
              <AdminSetup />
            </PageWrapper>
          } />
        )}
        
        {/* Root path */}
        <Route path="/" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        {/* Public Routes */}
        <Route path="/contact" element={
          <PageWrapper>
            <ContactPage />
          </PageWrapper>
        } />
        <Route path="/privacy-policy" element={
          <PageWrapper>
            <PrivacyPolicy />
          </PageWrapper>
        } />
        
        {/* Documentation */}
        <Route path="/docs" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <Docs />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        {/* Resource Routes */}
        <Route path="/api" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <ApiReference />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/templates" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <Templates />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/tutorials" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <Tutorials />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        {/* Admin-Only Routes */}
        <Route path="/new" element={
          <ProtectedRoute adminOnly={true}>
            <PageWrapper>
              <NewProject />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/projects/edit/:id" element={
          <ProtectedRoute adminOnly={true}>
            <PageWrapper>
              <EditProject />
            </PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute adminOnly={true}>
            <PageWrapper>
              <UserManagement />
            </PageWrapper>
          </ProtectedRoute>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={
          <ProtectedRoute allowGuest={true}>
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize smooth scrolling
  useSmoothScroll();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppErrorBoundary>
      {/* Smooth scroll wrapper - Required for ScrollSmoother */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {/* Loading Screen */}
          {isLoading && (
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          )}
          
          {/* Main App Content */}
          <div className={`main-content ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
            <Router>
              <AuthProvider>
                <AlertProvider>
                  <ProjectRunnerProvider>
                    <TooltipProvider>
                      <NetworkStatus />
                      
                      <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="animate-pulse text-white">Loading...</div>
                        </div>
                      }>
                        <RoutesWrapper />
                      </Suspense>
                      
                    </TooltipProvider>
                  </ProjectRunnerProvider>
                </AlertProvider>
              </AuthProvider>
            </Router>
          </div>
        </div>
      </div>
    </AppErrorBoundary>
  );
}

export default App;