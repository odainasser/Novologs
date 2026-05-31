'use client';

import { useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { SetCurrency } from '../set-currency';
import { SetProvince } from '../set-province';
import { useTranslation } from 'react-i18next';
import { CompanyInfo } from '../company-info';
import { TaskExemptedView } from 'src/sections/user/view/task-exempted-view';
import { AddBranch } from '../add-branch';
import { ShowHideMenu } from '../show-hide-menu';

export function SettingsView() {
  const { t, i18n } = useTranslation('dashboard/projects');
  const [currentTab, setCurrentTab] = useState('companyInfo');
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
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
        { value: 'companyInfo', label: t('settings.company_info') },
        { value: 'currencies', label: t('settings.currency') },
        { value: 'provinces', label: t('settings.provinces') },
        // { value: 'dashboard', label: t('settings.view_admin_dashboard') },
        // { value: 'accounts', label: t('settings.access_accounts_module') },
        { value: 'branches', label: t('settings.company_branches') },
        { value: 'menu', label: 'Show/Hide Menu' },

        // { value: 'system', label: 'System Dashboard' },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={t('settings.name')}
        links={[
          { name: t('settings.dashboard'), href: paths.dashboard.root },
          { name: t('settings.name'), href: paths.dashboard.settings.root },
          { name: t('settings.list') },
        ]}
        sx={{ mb: 2 }}
      />
      <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
        {renderTabs}
        {currentTab === 'currencies' && <SetCurrency />}
        {currentTab === 'companyInfo' && <CompanyInfo />}
        {currentTab === 'provinces' && <SetProvince />}
        {currentTab === 'accounts' && <TaskExemptedView isAccountsAccessible={true} />}
        {currentTab === 'branches' && <AddBranch />}
        {currentTab === 'menu' && <ShowHideMenu />}
      </Card>
    </DashboardContent>
  );
}
