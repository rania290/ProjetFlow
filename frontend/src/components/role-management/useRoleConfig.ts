import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ROLE_CONFIG as ROLE_CONFIG_BASE, type RoleConfigType } from './types';

const ROLE_KEYS = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'DESIGNER', 'TESTER', 'RH', 'CLIENT'] as const;

export function useRoleConfig(): RoleConfigType {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    return Object.fromEntries(
      ROLE_KEYS.map((key) => [
        key,
        {
          ...ROLE_CONFIG_BASE[key],
          label: t(`admin.roles.${key}`, { defaultValue: ROLE_CONFIG_BASE[key].label }),
          description: t(`admin.role_descriptions.${key}`, { defaultValue: ROLE_CONFIG_BASE[key].description }),
        },
      ]),
    ) as RoleConfigType;
  }, [t, i18n.language]);
}
