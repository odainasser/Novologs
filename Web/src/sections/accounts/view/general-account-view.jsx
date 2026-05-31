'use client';
import { useState } from 'react';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';

import { Label } from 'src/components/label';
import { ChartAccount } from '../chart-account';
import { JournalVoucher } from '../journal-voucher';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function GeneralAccountsView({}) {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');

  const tabs = useTabs('account');

  const TABS = [
    {
      value: 'account',
      label: t('accounts.chart_account'),
    },
    {
      value: 'journal',
      label: t('accounts.journal_vocher'),
    },
    // {
    //   value: 'posted',
    //   label: t('accounts.posted_journal_vocher'),
    // },
  ];

  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>

      {tabs.value === 'account' && <ChartAccount />}
      {tabs.value === 'journal' && <JournalVoucher isPosted={false} />}
      {tabs.value === 'posted' && <JournalVoucher isPosted={true} />}
    </DashboardContent>
  );
}
