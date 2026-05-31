'use client';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { OverviewAppView } from './overview-app-view';
import { AuditLogView } from './audit-log-view';
import { TaskExemptedView } from 'src/sections/user/view/task-exempted-view';
import { SystemDashboard } from 'src/sections/settings/system-dashboard';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTabs } from 'src/hooks/use-tabs';

export function AdminPanel({ isAdmin }) {
  const tabs = useTabs('dashboard');

  const TABS = [
    {
      value: 'dashboard',
      label: 'Admin Dashboard',
    },
    {
      value: 'audit',
      label: 'Audit Logs',
    },
    {
      value: 'adminDashboard',
      label: 'View Admin Dashboard Permission',
    },
    {
      value: 'systemDashboard',
      label: 'System Dashboard',
    },
  ];
  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>

      {tabs.value === 'dashboard' && <OverviewAppView isAdmin={isAdmin} />}
      {tabs.value === 'audit' && <AuditLogView />}
      {tabs.value === 'adminDashboard' && <TaskExemptedView isViewDashboard={true} />}
      {tabs.value === 'systemDashboard' && <SystemDashboard />}
    </DashboardContent>
  );
}
