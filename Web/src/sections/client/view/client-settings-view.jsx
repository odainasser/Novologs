'use client';

import { useState } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { RejectReasonView } from './reject-reason-view';
import { SaleStatusView } from './sale-status-view';
import { ContractStatusView } from './contract-status-view';
import { ContractTypeView } from './contract-type-view';
import { LeadSourceView } from './lead-source-view';

import { ClientPermission } from './client-permission';
import { useTranslation } from 'react-i18next';
import { TaskExemptedView } from 'src/sections/user/view/task-exempted-view';

// ----------------------------------------------------------------------

export function ClientSettingsView({ isClientView }) {
  const { t, i18n } = useTranslation('dashboard/client');

  const [currentTab, setCurrentTab] = useState(isClientView ? 'source' : 'contractTypes');
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
      {!isClientView &&
        [
          { value: 'contractTypes', label: t('clients.labels.contract_types') },
          { value: 'contractStatus', label: t('clients.labels.Contract Status') },
          { value: 'viewAllContract', label: t('clients.labels.view_all_contract') },
        ].map((tab) => <Tab key={tab.value} value={tab.value} label={tab.label} />)}

      {isClientView &&
        [
          // { value: 'viewClients', label: t('clients.labels.client_view_rights') },
          { value: 'source', label: t('clients.labels.lead_source') },
          { value: 'status', label: t('clients.labels.sale_statuses') },
          { value: 'reason', label: t('clients.labels.reject_reasons') },
          { value: 'createGroup', label: t('clients.labels.create_group_permissions') },
          { value: 'viewAllClients', label: t('clients.labels.view_all_clients') },
        ].map((tab) => <Tab key={tab.value} value={tab.value} label={tab.label} />)}
    </CustomTabs>
  );

  return (
    <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
      {renderTabs}
      {currentTab === 'viewClients' && <ClientPermission />}
      {currentTab === 'source' && <LeadSourceView />}
      {currentTab === 'status' && <SaleStatusView />}
      {currentTab === 'reason' && <RejectReasonView />}
      {currentTab === 'contractStatus' && <ContractStatusView />}
      {currentTab === 'contractTypes' && <ContractTypeView />}
      {currentTab === 'viewAllContract' && <TaskExemptedView isViewAllContract={true} />}
      {currentTab === 'createGroup' && <TaskExemptedView isCreateGroup={true} />}
      {currentTab === 'viewAllClients' && <TaskExemptedView isViewAllClients={true} />}
    </Card>
  );
}
