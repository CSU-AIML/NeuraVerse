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

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <ProjectRunnerProvider>
          <TooltipProvider>
            <Router>
              <Routes>
                {/* Authentication Route - now using phone auth */}
                <Route path="/signin" element={<SignIn />} />
                
                {/* Root path shows Dashboard for logged in users, SignIn for others */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* Additional dashboard route for explicit navigation */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* Standard Routes */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/docs" element={<Docs />} />
                
                {/* Resource Routes */}
                <Route path="/api" element={<ApiReference />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/tutorials" element={<Tutorials />} />
                
                {/* Admin Routes */}
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
              </Routes>
            </Router>
          </TooltipProvider>
        </ProjectRunnerProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;