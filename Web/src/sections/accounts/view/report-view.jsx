'use client';
import { useState } from 'react';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ReportView() {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');

  const tabs = useTabs('trialBalance');

  const TABS = [
    {
      value: 'trialBalance',
      label: 'Trial Balance',
    },
    {
      value: 'balanceSheet',
      label: 'Balance Sheet',
    },

    {
      value: 'account',
      label: 'Profit and Loss account',
    },
  ];

  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: 1 }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>
    </DashboardContent>
  );
}
