import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/projectStore';
import { AuthProvider } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { UiProvider } from './store/uiStore';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { Loader2, Construction } from 'lucide-react';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ProjectsListPage = lazy(() => import('./pages/ProjectsListPage').then(module => ({ default: module.ProjectsListPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(module => ({ default: module.ProjectDetailPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const UserProjectsPage = lazy(() => import('./pages/UserProjectsPage').then(module => ({ default: module.UserProjectsPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersManagementPage').then(module => ({ default: module.UsersManagementPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage').then(module => ({ default: module.SystemSettingsPage })));
const AdminLogsPage = lazy(() => import('./pages/admin/ActivityLogsPage').then(module => ({ default: module.ActivityLogsPage })));

const AdminRolesPage = lazy(() => import('./pages/admin/RoleManagementPage').then(module => ({ default: module.RoleManagementPage })));
const SuperSimpleAccessManager = lazy(() => import('./components/admin/AccessManager').then(module => ({ default: module.SuperSimpleAccessManager })));

const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then(module => ({ default: module.UserProfilePage })));
const MyTasksPageReal = lazy(() => import('./pages/MyTasksPage').then(module => ({ default: module.MyTasksPage })));
const TeamPageReal = lazy(() => import('./pages/TeamPage').then(module => ({ default: module.TeamPage })));
const MessagesPageReal = lazy(() => import('./pages/MessagesPage').then(module => ({ default: module.MessagesPage })));

// HR Portal Pages
const HRDashboardPage = lazy(() => import('./pages/hr/HRDashboardPage').then(module => ({ default: module.HRDashboardPage })));
const HRMyLeavesPage = lazy(() => import('./pages/hr/HRMyLeavesPage').then(module => ({ default: module.HRMyLeavesPage })));
const HRValidationsPage = lazy(() => import('./pages/hr/HRValidationsPage').then(module => ({ default: module.HRValidationsPage })));
const HRAnnuairePage = lazy(() => import('./pages/hr/HRAnnuairePage').then(module => ({ default: module.HRAnnuairePage })));
import { TimeTrackingPage } from './features/hr/time-tracking/pages/TimeTrackingPage';

// Client Portal Pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard').then(module => ({ default: module.ClientDashboard })));
const ClientProjectsPage = lazy(() => import('./pages/client/ClientProjectsPage').then(module => ({ default: module.ClientProjectsPage })));
const ClientTicketsPage = lazy(() => import('./pages/client/ClientTicketsPage').then(module => ({ default: module.ClientTicketsPage })));
const ClientDocumentsPage = lazy(() => import('./pages/client/ClientDocumentsPage').then(module => ({ default: module.ClientDocumentsPage })));

// Loading Fallback
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-xs text-slate-500">Chargement...</p>
    </div>
  </div>
);

// Wrapper for automatic client redirection
const ClientRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role === 'CLIENT') {
    return <Navigate to="/client-portal" replace />;
  }
  return <>{children}</>;
};

const MyTasksPage = () => <AppLayout title="Mes tâches"><MyTasksPageReal /></AppLayout>;
const TeamPage = () => <AppLayout title="Équipe"><TeamPageReal /></AppLayout>;
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const MessagesPage = () => <MessagesPageReal />;
const CalendarPage = lazy(() => import('./pages/CalendarPage'));

// HR Portal Routes Wrapper
const HRDashboard = () => <HRDashboardPage />;
const HRMyLeaves = () => <HRMyLeavesPage />;
const HRValidations = () => <HRValidationsPage />;
const HRAnnuaire = () => <HRAnnuairePage />;

function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <UiProvider>
          <TooltipProvider>
            <Router>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Main App Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ClientRedirectWrapper>
                          <DashboardPage />
                        </ClientRedirectWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <ProtectedRoute>
                        <ProjectsListPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projects/:projectId"
                    element={
                      <ProtectedRoute>
                        <ProjectDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-tasks"
                    element={
                      <ProtectedRoute>
                        <MyTasksPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <TeamPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documents"
                    element={
                      <ProtectedRoute>
                        <DocumentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/tickets" element={<Navigate to="/client-portal/tickets" replace />} />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <CalendarPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/client-portal"
                    element={
                      <ProtectedRoute>
                        <ClientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/client-portal/projects"
                    element={
                      <ProtectedRoute>
                        <ClientProjectsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/client-portal/tickets"
                    element={
                      <ProtectedRoute>
                        <ClientTicketsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/client-portal/documents"
                    element={
                      <ProtectedRoute>
                        <ClientDocumentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* HR Portal Routes */}
                  <Route
                    path="/hr"
                    element={
                      <ProtectedRoute>
                        <HRDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/my-leaves"
                    element={
                      <ProtectedRoute>
                        <HRMyLeaves />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/validations"
                    element={
                      <ProtectedRoute requiredRole={['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'PROJECT_MANAGER', 'MANAGER']}>
                        <HRValidations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/directory"
                    element={
                      <ProtectedRoute>
                        <HRAnnuaire />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/pointage"
                    element={
                      <ProtectedRoute>
                        <TimeTrackingPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/my-projects"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <UserProjectsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <AdminUsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/roles"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <AdminRolesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <AdminSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/logs"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <AdminLogsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/permissions"
                    element={
                      <ProtectedRoute requiredRole={['ADMIN']}>
                        <SuperSimpleAccessManager />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" richColors />
            </Router>
          </TooltipProvider>
        </UiProvider>
      </AuthProvider>
    </StoreProvider>
  );
}

export default App;
