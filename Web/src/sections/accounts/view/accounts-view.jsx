'use client';

import { useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { GeneralAccountsView } from './general-account-view';
import { PurchasesView } from './purchases-view';
import { PaymentView } from './payment-view';
import { ReportView } from './report-view';

import { UserSettingsButton } from 'src/sections/user/view/user-settings-button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { ProductsView } from './products-view';

import { useTranslation } from 'react-i18next';
import { AssetsManagement } from '../assets-management';
import { DashboardContent } from 'src/layouts/dashboard';
import { HRView } from './hr-view';

export function AccountsView() {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');

  const [currentTab, setCurrentTab] = useState('accounting');
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const [currentSettingsTab, setCurrentSettingsTab] = useState('product');
  const handleChangeSettingsTab = (event, newValue) => {
    setCurrentSettingsTab(newValue);
  };
  useEffect(() => {
    localStorage.removeItem('editorContentDocs');
  }, []);
  const renderTabs = (
    <CustomTabs
      value={currentTab}
      onChange={handleChangeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {[
        { value: 'accounting', label: t('accounts.general_accounting') },
        { value: 'purchases', label: t('accounts.purchases') },
        { value: 'sales', label: t('accounts.sales') },
        { value: 'payment', label: t('accounts.payment') },
        { value: 'receipt', label: t('accounts.receipt') },
        { value: 'report', label: 'Report' },

        // { value: 'hr', label: t('accounts.hr') },

        // { value: 'assets', label: t('accounts.assets_management') },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderSettingsTabs = (
    <CustomTabs
      value={currentSettingsTab}
      onChange={handleChangeSettingsTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {[{ value: 'product', label: 'Product/Service' }].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const [selectedButton, setSelectedButton] = useState('mainView');
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('accounts.accounts')}
        links={[
          { name: t('accounts.dashboard'), href: paths.dashboard.root },
          { name: t('accounts.accounts'), href: paths.dashboard.settings.root },
        ]}
        sx={{ mb: 2 }}
      />

      <Box
        sx={{ mb: 1 }}
        display="flex"
        alignItems="center"
        justifyContent={selectedButton === 'mainView' ? 'flex-end' : 'space-between'}
        gap={1}
      >
        {selectedButton === 'settingsView' && (
          <Button
            onClick={() => {
              setSelectedButton('mainView');
            }}
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
        )}
        {/* <Tooltip title="Settings" arrow>
          <UserSettingsButton
            sx={{ color: '#006A67' }}
            onClick={() => handleButtonClick('settingsView')}
          />
        </Tooltip> */}
      </Box>

      {selectedButton === 'mainView' && (
        <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
          {renderTabs}
          {currentTab === 'accounting' && <GeneralAccountsView />}
          {currentTab === 'purchases' && <PurchasesView isClientView={false} />}
          {currentTab === 'sales' && <PurchasesView isClientView={true} />}
          {currentTab === 'payment' && <PaymentView />}
          {currentTab === 'receipt' && <PaymentView isReceipt={true} />}
          {currentTab === 'report' && <ReportView />}

          {currentTab === 'hr' && <HRView />}

          {currentTab === 'assets' && (
            <AssetsManagement isInvoice={false} isLocalPurchaseOrder={true} />
          )}
        </Card>
      )}

      {selectedButton === 'settingsView' && (
        <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
          {renderSettingsTabs}
          {currentSettingsTab === 'product' && <ProductsView />}
        </Card>
      )}
    </DashboardContent>
  );
}
