'use client';
import { useState } from 'react';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Label } from 'src/components/label';
import { ChartAccount } from '../chart-account';
import { JournalVoucher } from '../journal-voucher';
import { PaymentVoucher } from '../payment-voucher';
import { useTranslation } from 'react-i18next';

import { ClientView } from 'src/sections/client/view/client-view';
import { ExpenseRegister } from '../expense-register';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function PaymentView({ isReceipt }) {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');

  const tabs = useTabs('voucher');

  const TABS = [
    {
      value: 'voucher',
      label: isReceipt ? t('accounts.receipt_voucher') : t('accounts.payment_voucher'),
    },

    // ...(!isReceipt
    //   ? [
    //       {
    //         value: 'register',
    //         label: t('accounts.expense_register'),
    //       },
    //     ]
    //   : []),
  ];

  return (
    <DashboardContent>
      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: 1 }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>
      {tabs.value === 'voucher' && (
        <PaymentVoucher isInvoice={true} isClientView={true} isReceipt={isReceipt} />
      )}
      {tabs.value === 'register' && (
        <ExpenseRegister isInvoice={false} isLocalPurchaseOrder={true} />
      )}
    </DashboardContent>
  );
}
