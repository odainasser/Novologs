'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { AttendanceRegisterView } from './attendence-register-view';

 import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function HRView({}) {

  const tabs = useTabs('attendanceRegister');
  const { t, i18n } = useTranslation('dashboard/accounts');

  const TABS = [
    {
      value: 'attendanceRegister',
      label: t('accounts.attendance_register'),
    },
  ];

  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>

      {tabs.value === 'attendanceRegister' && <AttendanceRegisterView />}
    </DashboardContent>
  );
}
