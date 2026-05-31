'use client';

import { useState } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { DepartmentsView } from './departments-view';
import { DesignationsView } from './designations-view';
import { UserStatusView } from './user-status-view';
import { TeamNoticeView } from './team-notice-view';
import { SetHierarchyView } from './set-heirarchy-view';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';
import { RolesPermissionView } from './roles-permissions-view';
// ----------------------------------------------------------------------}

export function UserSettingsView() {
  const { t, i18n } = useTranslation('dashboard/teams');
  const { zetaUser } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('departments');
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderTabs = (
    <CustomTabs
      value={currentTab}
      onChange={handleChangeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {[
        { value: 'departments', label: t('user_profile.user_settings.departments') },
        { value: 'designations', label: t('user_profile.user_settings.designations') },
        { value: 'employee-statuses', label: t('user_profile.user_settings.employee_statuses') },
        { value: 'team-notice', label: t('user_profile.user_settings.team_notice') },

        { value: 'roles', label: t('user_profile.user_settings.roles') },

        // { value: 'hierarchy', label: t('user_profile.user_settings.hierarchy')  },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );
  return (
    <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
      {renderTabs}
      {currentTab === 'departments' && <DepartmentsView />}
      {currentTab === 'designations' && <DesignationsView />}
      {currentTab === 'employee-statuses' && <UserStatusView />}
      {currentTab === 'team-notice' && <TeamNoticeView />}
      {currentTab === 'hierarchy' && <SetHierarchyView />}
      {currentTab === 'roles' && <RolesPermissionView />}
    </Card>
  );
}
