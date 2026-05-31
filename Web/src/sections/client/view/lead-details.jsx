'use client';
import Box from '@mui/material/Box';

import { useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import CkEditorComponent from 'src/components/html-editor/ck-editor-component';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import Tooltip from '@mui/material/Tooltip';
import { Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'src/routes/hooks';
import { useTabs } from 'src/hooks/use-tabs';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';
import { FileManagerView } from 'src/sections/file-manager/view/file-manager-view';
import { LeadDocument } from '../lead-document';
import { getLeads } from 'src/actions/client/clientActions';
import { getContracts } from 'src/actions/vendor/vendorActions';
import DocumentView from 'src/sections/documents/view/documents-view';
import { LeadUpdateView } from './lead-updates-view';
// ----------------------------------------------------------------------
function useLeadOrContract(isClientView, clientId) {
  const result = isClientView ? getLeads(clientId) : getContracts(clientId);

  return {
    list: isClientView ? result.leadList.leads : result.contractList.contracts,
    listLoading: isClientView ? result.leadListLoading : result.contractListLoading,
    listError: isClientView ? result.leadListError : result.contractListError,
    listValidating: isClientView ? result.leadListValidating : result.contractListValidating,
    listEmpty: isClientView ? result.leadListEmpty : result.contractListEmpty,
    mutate: result.mutate,
  };
}
export function LeadDetails({ leadId, isClientView }) {
  const clientId = localStorage.getItem('clientVendorId');
  const { list, listLoading, listError, listValidating, listEmpty, mutate } = useLeadOrContract(
    isClientView,
    clientId
  );

  const leadDetails = list.find((l) => l.id === leadId);

  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const router = useRouter();
  const tabs = useTabs('tasks');
  const TABS = [
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
      value: 'updates',
      label: 'Updates',
      icon: (
        <Iconify
          icon="mdi:sync"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
  ];

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(
    localStorage.getItem('editorContentLead') || ''
  );
  const editorRef = useRef(null);
  const leadName = localStorage.getItem('leadName');
  const clientVendorId = localStorage.getItem('clientVendorId');
  const clientName = localStorage.getItem('clientName');
  const isBusinessLead = localStorage.getItem('isBusinessLead');
  const isLead = true;

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={1}>
          <Stack direction="row" alignItems="center">
            {isBusinessLead && (
              <Button
                onClick={() => {
                  localStorage.removeItem('leadName');
                  localStorage.removeItem('clientVendorId');
                  localStorage.removeItem('clientName');
                  localStorage.removeItem('isBusinessLead');
                  router.push(
                    isClientView ? paths.dashboard.client.list : paths.dashboard.vendor.list
                  );
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
            )}

            {!isBusinessLead && (
              <Button
                onClick={() => {
                  localStorage.removeItem('leadName');

                  router.push(
                    isClientView
                      ? paths.dashboard.clientDetails.details(clientVendorId)
                      : paths.dashboard.vendorDetails.details(clientVendorId)
                  );
                }}
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
              >
                {t('clients.buttons.back')}
              </Button>
            )}
          </Stack>

          <CustomBreadcrumbs
            heading={
              isClientView
                ? t('leaddetails.breadcrumbs.lead')
                : t('clients.columns.contract_details')
            }
            links={[
              { name: t('leaddetails.breadcrumbs.dashboard'), href: paths.dashboard.root },
              {
                name: isClientView ? t('clients.List.heading') : t('clients.List.heading2'),
                href: isClientView ? paths.dashboard.client.list : paths.dashboard.vendor.list,
              },
              {
                name: clientName,
                href: isClientView
                  ? paths.dashboard.clientDetails.details(clientVendorId)
                  : paths.dashboard.vendorDetails.details(clientVendorId),
              },
              { name: leadName ? leadName : t('clients.columns.names') },
            ]}
          />
        </Box>

        {/* {isClientView && (
          <Box display="flex" flexDirection="column" sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
              <Tooltip title="Lead Status" arrow>
                <Label variant="soft" color="success">
                  {t('leaddetails.common.under_approval')}
                </Label>
              </Tooltip>
            </Stack>
            <Box display="flex" sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center">
                <Tooltip title="Lead Value" arrow>
                  <Typography variant="body2">AED 12,300</Typography>
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" sx={{ ml: 2 }}>
                <Tooltip title="Percentage of success" arrow>
                  <Chip
                    label="30%"
                    color="warning"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderWidth: 1,
                      borderRadius: '16px',
                      color: 'warning.main',
                      borderColor: 'warning.main',
                      // bgcolor: 'warning.main',
                    }}
                  />
                </Tooltip>
              </Stack>
            </Box>
          </Box>
        )} */}
      </Box>
      <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 1 }}>
        <Tabs value={tabs.value} onChange={tabs.onChange}>
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {tabs.value === 'documents' && (
        <DocumentView isLead={isLead} isClientView={isClientView} leadId={leadId} />
      )}
      {tabs.value === 'tasks' && (
        <KanbanListView isLead={isLead} isClientView={isClientView} leadId={leadId} />
      )}
      {tabs.value === 'files' && (
        <FileManagerView
          isLead={isLead}
          isClientView={isClientView}
          leadId={leadId}
          leadRootFolderId={leadDetails?.rootFolderId}
        />
      )}
      {tabs.value === 'updates' && <LeadUpdateView leadId={leadId} />}
    </DashboardContent>
  );
}
