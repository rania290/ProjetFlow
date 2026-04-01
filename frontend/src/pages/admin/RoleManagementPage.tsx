import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { AdvancedRoleManager } from '../../components/ui/AdvancedRoleManager';


export const RoleManagementPage: React.FC = () => {
  return (
    <AppLayout 
      title="Autorisations & Rôles" 
      subtitle="Gestion centralisée du système RBAC et des accès multi-projets"
    >
      <div className="max-w-7xl mx-auto py-8">
        <AdvancedRoleManager />
      </div>
    </AppLayout>
  );
};
