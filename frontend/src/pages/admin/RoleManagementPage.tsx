import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../components/layout/AppLayout';
import { AdvancedRoleManager } from '../../components/ui/AdvancedRoleManager';


export const RoleManagementPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AppLayout 
      title={t('roles.page_title')} 
      subtitle={t('roles.page_subtitle')}
    >
      <div className="max-w-7xl mx-auto pt-6 pb-2">
        <AdvancedRoleManager />
      </div>
    </AppLayout>
  );
};
