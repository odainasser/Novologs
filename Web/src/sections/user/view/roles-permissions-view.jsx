'use client';
import { useState } from 'react';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Label } from 'src/components/label';
import { RolesView } from '../roles-view';
import { useTranslation } from 'react-i18next';
import { PermissionsView } from '../permissions-view';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function RolesPermissionView({}) {
  const { t, i18n } = useTranslation('dashboard/teams');

  const tabs = useTabs('roles_permissions');

  const TABS = [
    {
      value: 'roles_permissions',
      label: t('role.permission_descriptions'),
    },
    {
      value: 'roles',
      label: t('role.rolesPermissions'),
    },
  ];

  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>

      {tabs.value === 'roles_permissions' && <RolesView />}
      {tabs.value === 'roles' && <PermissionsView />}
    </DashboardContent>
  );
}
