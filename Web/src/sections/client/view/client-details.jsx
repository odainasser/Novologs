'use client';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';

import { LeadView } from './lead-view';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTabs } from 'src/hooks/use-tabs';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';
import { FileManagerView } from 'src/sections/file-manager/view/file-manager-view';
import { ClientDocument } from '../client-document';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { getClients } from 'src/actions/client/clientActions';
import { getVendors } from 'src/actions/vendor/vendorActions';
import DocumentView from 'src/sections/documents/view/documents-view';
import { ClientContactsView } from './client-contacts-view';

function useClientOrVendor(isClientView, payload) {
  const result = isClientView ? getClients(payload) : getVendors(payload);

  return {
    list: isClientView ? result.clientList.clients : result.vendorList.vendors,
    listLoading: isClientView ? result.clientListLoading : result.vendorListLoading,
    listError: isClientView ? result.clientListError : result.vendorListError,
    listValidating: isClientView ? result.clientListValidating : result.vendorListValidating,
    listEmpty: isClientView ? result.clientListEmpty : result.vendorListEmpty,
    mutate: result.mutate,
  };
}

export function ClientDetails({ clientId, isClientView }) {
  const getClientParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1,
    },
    search: {
      logicOperator: 0,
      fieldName: 'Id',
      operator: 0,
      fieldValue: clientId,
    },
  };
  const { list, listLoading, listError, listValidating, listEmpty, mutate } = useClientOrVendor(
    isClientView,
    getClientParams
  );

  const clientDetails = list.find((c) => c.id === clientId);

  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const router = useRouter();

  const tabs = useTabs('lead');
  const TABS = [
    {
      value: 'lead',
      label: isClientView ? t('clients.tabs.leads') : t('clients.tabs.contracts'),
      icon: (
        <Iconify
          icon="mdi:chart-line"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
    {
      value: 'documents',
      label: t('clients.tabs.documents'),
      icon: (
        <Iconify
          icon="mdi:file-document"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
    {
      value: 'tasks',
      label: t('clients.tabs.tasks'),
      icon: (
        <Iconify
          icon="solar:checklist-bold"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
    {
      value: 'files',
      label: t('clients.tabs.files'),
      icon: (
        <Iconify
          icon="mdi:folder"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
    {
      value: 'contacts',
      label: t('clients.tabs.contacts'),
      icon: (
        <Iconify
          icon="mdi:account-outline"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
  ];

  const [leadView, setLeadView] = useState('list');
  const handleChangeLeadView = useCallback((event, newView) => {
    if (newView !== null) {
      setLeadView(newView);
    }
    f;
  }, []);
  const isClient = true;
  const clientName = localStorage.getItem('clientName');

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={1} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center">
            <Button
              onClick={() => {
                localStorage.removeItem('clientName');
                router.push(
                  isClientView ? paths.dashboard.client.list : paths.dashboard.vendor.list
                );
                localStorage.removeItem('clientVendorId');
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
              {t('clients.buttons.back')}
            </Button>
          </Stack>

          <CustomBreadcrumbs
            heading={
              isClientView ? t('clients.labels.client_details') : t('clients.labels.vendor_details')
            }
            links={[
              { name: t('clients.List.dashboard'), href: paths.dashboard.root },
              {
                name: isClientView ? t('clients.tabs.clients') : t('clients.List.heading2'),
                href: isClientView ? paths.dashboard.client.list : paths.dashboard.vendor.list,
              },
              { name: clientName ? clientName : t('clients.columns.name') },
            ]}
          />
        </Box>
      </Box>
      <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 1 }}>
        <Tabs value={tabs.value} onChange={tabs.onChange}>
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {tabs.value === 'lead' && (
        <LeadView
          view={leadView}
          isClient={isClient}
          isClientView={isClientView}
          clientId={clientId}
        />
      )}
      {tabs.value === 'documents' && (
        <DocumentView isClient={isClient} isClientView={isClientView} clientId={clientId} />
      )}
      {tabs.value === 'tasks' && (
        <KanbanListView isClient={isClient} isClientView={isClientView} clientId={clientId} />
      )}
      {tabs.value === 'files' && (
        <FileManagerView
          isClient={isClient}
          clientId={clientId}
          isClientView={isClientView}
          clientRootFolderId={clientDetails?.rootFolderId}
        />
      )}
      {tabs.value === 'contacts' && (
        <ClientContactsView clientId={clientId} isClientView={isClientView} />
      )}
    </DashboardContent>
  );
}
