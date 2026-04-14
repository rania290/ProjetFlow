import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/projectStore';
import { AuthProvider } from './store/authStore';
import { UiProvider } from './store/uiStore';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TooltipProvider } from './components/ui/tooltip';
import { Loader2, Construction } from 'lucide-react';

// Lazy load pages
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
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
const HRHierarchyPage = lazy(() => import('./pages/hr/HRHierarchyPage').then(module => ({ default: module.HRHierarchyPage })));


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

// Simple placeholder pages for routes still being built
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
      <Construction className="w-7 h-7 text-slate-400" />
    </div>
    <h2 className="text-base font-bold text-slate-700">{title}</h2>
    <p className="text-sm text-slate-400">Ce module est en cours de développement.</p>
  </div>
);



const MyTasksPage = () => <AppLayout title="Mes tâches"><MyTasksPageReal /></AppLayout>;
const TeamPage = () => <AppLayout title="Équipe"><TeamPageReal /></AppLayout>;
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const MessagesPage = () => <MessagesPageReal />;
const CalendarPage = lazy(() => import('./pages/CalendarPage'));

// HR Portal Routes Wrapper (legacy - eventually we can remove HRPageLazy)
const HRDashboard = () => <HRDashboardPage />;
const HRMyLeaves = () => <HRMyLeavesPage />;
const HRValidations = () => <HRValidationsPage />;
const HRAnnuaire = () => <HRAnnuairePage />;
const HRHierarchy = () => <HRHierarchyPage />;

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
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Main App Routes */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
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
                    path="/hr/hierarchy"
                    element={
                      <ProtectedRoute>
                        <HRHierarchy />
                      </ProtectedRoute>
                    }
                  />


                  {/* Client Portal Routes */}
                  <Route path="/client-portal" element={<Navigate to="/client-portal/dashboard" replace />} />
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

                  {/* Permissions management page */}
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
            </Router>
          </TooltipProvider>
        </UiProvider>
      </AuthProvider>
    </StoreProvider>
  );
}

export default App;
