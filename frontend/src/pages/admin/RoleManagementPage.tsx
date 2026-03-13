import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { AdvancedRoleManager } from '../../components/ui/AdvancedRoleManager';


export const RoleManagementPage: React.FC = () => {
  return (
    <AppLayout title="Gestion des Permissions" subtitle="Gérez les accès et les rôles par profil">
      <div className="max-w-7xl mx-auto">
        <AdvancedRoleManager />
      </div>
    </AppLayout>
  );
};
