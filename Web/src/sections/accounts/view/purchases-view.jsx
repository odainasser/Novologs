'use client';
import { useState } from 'react';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';
import Card from '@mui/material/Card';

import { Iconify } from 'src/components/iconify';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';

import { Label } from 'src/components/label';
import { ChartAccount } from '../chart-account';
import { JournalVoucher } from '../journal-voucher';
import { LocalPurchaseOrder } from '../local-purchase-order';

import { ClientView } from 'src/sections/client/view/client-view';
import Tooltip from '@mui/material/Tooltip';
import { UserSettingsButton } from 'src/sections/user/view/user-settings-button';
import { ProductsView } from './products-view';
import { PurchaseOrderTypeView } from './purchase-order-type-view';
import { PurchaseTermsView } from './purchase-terms-view';
import { PurchaseUnitsView } from './purchase-units-view';
import { DefaultAccountView } from './default-account-view';
import { CustomTabs } from 'src/components/custom-tabs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function PurchasesView({ isClientView }) {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');

  const tabs = useTabs('client');
  const [currentSettingsTab, setCurrentSettingsTab] = useState('orderType');
  const [selectedButton, setSelectedButton] = useState('mainView');
  const [view, setView] = useState('list');

  const isLocalPurchaseOrder = true;
  const isPurchaseClient = true;

  const TABS = [
    {
      value: 'client',
      label: isClientView ? t('accounts.clients') : t('accounts.vendors'),
    },
    ...(!isClientView
      ? [
          {
            value: 'order',
            label: t('accounts.purchase_order'),
          },
        ]
      : []),
    {
      value: 'material',
      label: isClientView ? t('accounts.sales_invoices') : t('accounts.purchase_invoices'),
    },
    {
      value: 'debitNote',
      label: isClientView ? t('accounts.credit_note') : t('accounts.debit_note'),
    },
    // {
    //   value: 'posted',
    //   label: isClientView ? t('accounts.posted_sales_invoices') : t('accounts.posted_purchase_invoices'),
    // },
    // {
    //   value: 'postedNote',
    //   label: isClientView ? t('accounts.posted_credit_note') : t('accounts.posted_debit_note'),
    // },
  ];

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const handleChangeSettingsTab = (event, newValue) => {
    setCurrentSettingsTab(newValue);
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {selectedButton === 'mainView' ? (
          <Tabs value={tabs.value} onChange={tabs.onChange}>
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>
        ) : (
          <CustomTabs
            value={currentSettingsTab}
            onChange={handleChangeSettingsTab}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mt: 1,
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {[
              { value: 'orderType', label: 'Order Type' },
              { value: 'terms', label: 'Terms' },
              { value: 'product', label: 'Product/Service' },
              { value: 'units', label: 'Units' },
              { value: 'debitAccount', label: 'Set default Debit accounts' },
              { value: 'creditAccount', label: 'Set default Credit accounts' },
            ].map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </CustomTabs>
        )}

        {selectedButton === 'settingsView' ? (
          <Button
            onClick={() => setSelectedButton('mainView')}
            variant="outlined"
            startIcon={
              <Iconify
                icon="eva:arrow-back-fill"
                sx={{
                  transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
          >
            Back
          </Button>
        ) : (
          <Tooltip title="Purchase Settings" arrow>
            <UserSettingsButton
              sx={{ color: '#006A67' }}
              onClick={() => handleButtonClick('settingsView')}
            />
          </Tooltip>
        )}
      </Box>

      {selectedButton === 'mainView' && (
        <>
          {tabs.value === 'client' && (
            <ClientView
              view={view}
              isClientView={isClientView}
              isPurchaseClient={isPurchaseClient}
            />
          )}

          {tabs.value === 'order' && (
            <LocalPurchaseOrder isInvoice={false} isLocalPurchaseOrder={isLocalPurchaseOrder} />
          )}

          {tabs.value === 'material' && (
            <LocalPurchaseOrder isInvoice={true} isClientView={isClientView} />
          )}

          {tabs.value === 'debitNote' && (
            <LocalPurchaseOrder isInvoice={true} isClientView={isClientView} isNote={true} />
          )}

          {tabs.value === 'posted' && (
            <LocalPurchaseOrder isInvoice={true} isPosted={true} isClientView={isClientView} />
          )}

          {tabs.value === 'postedNote' && (
            <LocalPurchaseOrder isInvoice={true} isPosted={true} isClientView={isClientView} />
          )}
        </>
      )}

      {selectedButton === 'settingsView' && (
        <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
          {currentSettingsTab === 'orderType' && <PurchaseOrderTypeView />}
          {currentSettingsTab === 'terms' && <PurchaseTermsView />}
          {currentSettingsTab === 'product' && <ProductsView />}
          {currentSettingsTab === 'units' && <PurchaseUnitsView />}
          {currentSettingsTab === 'debitAccount' && <DefaultAccountView isDebit={true} />}
          {currentSettingsTab === 'creditAccount' && <DefaultAccountView isDebit={false} />}
        </Card>
      )}
    </DashboardContent>
  );
}
