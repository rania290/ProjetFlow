import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout/AppLayout';
import { AdvancedRoleManager } from '../../components/ui/AdvancedRoleManager';


export const RoleManagementPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AppLayout 
      title={t('admin.roles.title', 'Roles & Permissions')} 
      subtitle={t('admin.roles.subtitle', 'Centralized management of the RBAC system and multi-project access')}
    >
      <div className="max-w-7xl mx-auto pt-6 pb-2">
        <AdvancedRoleManager />
      </div>
    </AppLayout>
  );
};
