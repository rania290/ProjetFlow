import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { AdvancedRoleManager } from '../components/ui/AdvancedRoleManager';
import SimplePermissionsPage from '../components/admin/SimplePermissionsPage';
import PermissionsTestPage from '../pages/admin/PermissionsTestPage';
import UserProjectsPage from '../pages/UserProjectsPage';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/my-projects" element={<UserProjectsPage />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/roles" element={<AdvancedRoleManager />} />
      <Route path="/admin/permissions" element={<SimplePermissionsPage />} />
      <Route path="/admin/permissions-test" element={<PermissionsTestPage />} />
    </Routes>
  );
};
