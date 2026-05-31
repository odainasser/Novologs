'use client';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { _roles, _userList } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableSelectedAction,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { ClientTableRow } from '../client-table-row';
import { ClientTableListRow } from '../client-table-list-row';
import { ClientTableToolbar } from '../client-table-toolbar';
import { ClientTableFiltersResult } from '../client-table-filters-result';
import { MemberView } from './member-view';
import { ClientView } from './client-view';
import { LeadView } from './lead-view';

import { useTheme, useMediaQuery, Typography, CardHeader } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  mock_clients,
  clients,
  locations,
  status,
  emirates,
  STATUS_OPTIONS,
} from 'src/sections/client/client-mock-data';
import { TextField, MenuItem } from '@mui/material';
import { Form, Field } from 'src/components/hook-form';
import { useForm, Controller } from 'react-hook-form';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ClientListView({ isClientView }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const [selectedButton, setSelectedButton] = useState('clients');
  const TABLE_HEAD = [
    { id: 'serialNo', label: t('clients.columns.serial_no'), width: 60 },
    { id: 'clientID', label: t('clients.columns.client_id'), width: 120 },
    { id: 'name', label: t('clients.columns.name'), width: 120 },
    { id: 'website', label: t('clients.columns.website'), width: 120 },
    { id: 'emirates', label: t('clients.columns.emirates'), width: 120 },
    { id: 'location', label: t('clients.columns.location'), width: 120 },
    { id: 'email', label: t('clients.columns.email'), width: 200 },
    { id: 'address', label: t('clients.columns.address'), width: 300 },
    { id: '', width: 50 },
  ];
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });
  const router = useRouter();

  const confirm = useBoolean();

  const [newClient, setNewClient] = useState({
    clientId: '',
    name: '',
    website: '',
    // password: '',
    emirates: '',
    location: '',
    email: '',
    contact: '',
    address: '',
  });

  const methods = useForm({
    mode: 'onSubmit',
  });
  const {
    reset,
    watch,
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const addNewClient = (newClient) => {
    setTableData((prevData) => [newClient, ...prevData]);
    console.log('this is the table data', tableData);
    setNewClient({});
  };

  const clearField = () => {
    setNewClient({
      clientId: '',
      name: '',
      website: '',
      // password: '',
      emirates: '',
      location: '',
      email: '',
      contact: '',
      address: '',
    });
  };
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };
  const onSubmit = (data) => {
    const contactValue = getValues('contact');
    console.log('Current Contact Value: ', contactValue);
    console.log('Form Data:', data);
    addNewClient();
  };
  const [tableData, setTableData] = useState(mock_clients);

  const filters = useSetState({ name: '', status: [], type: 'members', department: [] });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name || filters.state.status.length > 0 || filters.state.department.length > 0;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success(t('clients.toast.delete_success'));

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success(t('clients.toast.delete_success'));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleOpenRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.root);
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ type: newValue });
    },
    [filters, table]
  );
  const [view, setView] = useState('list');

  const [leadView, setLeadView] = useState('list');

  const [memberView, setMemberView] = useState('list');

  useEffect(() => {
    const handleReset = () => {
      setView('list');
      setSelectedButton('clients');
    };
    window.addEventListener('reset-client-view', handleReset);
    localStorage.removeItem('editorContentDocs');

    return () => window.removeEventListener('reset-client-view', handleReset);
  }, []);

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const handleChangeLeadView = useCallback((event, newView) => {
    if (newView !== null) {
      setLeadView(newView);
    }
  }, []);

  const handleChangeMemberView = useCallback((event, newView) => {
    if (newView !== null) {
      setMemberView(newView);
    }
  }, []);
  const headingMap = isClientView
    ? {
        members: t('clients.tabs.groups'),
        clients: t('clients.tabs.clients'),
        leads: t('clients.tabs.leads'),
        sharedLeads: 'Shared Leads',
      }
    : {
        clients: t('clients.List.heading2'),
        leads: t('clients.tabs.contracts'),
      };
  const listPath = isClientView ? paths.dashboard.client.list : paths.dashboard.vendor.list;
  return (
    <>
      <DashboardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1 }}>
          <CustomBreadcrumbs
            heading={headingMap[selectedButton] || ''}
            links={[
              { name: t('clients.List.dashboard'), href: paths.dashboard.root },
              { name: headingMap[selectedButton] || '', href: listPath },
              { name: t('clients.List.list') },
            ]}
          />

          <Box>
            {/* Button Group */}
            {isClientView && (
              <Button
                variant={selectedButton === 'clients' ? 'contained' : 'outlined'}
                sx={{
                  mr: 1,
                }}
                onClick={() => handleButtonClick('clients')}
              >
                {t('clients.tabs.clients')}
              </Button>
            )}

            {isClientView && (
              <Button
                variant={selectedButton === 'members' ? 'contained' : 'outlined'}
                sx={{ mr: 1, ...(storedLang === 'ar' && { ml: 1 }) }}
                onClick={() => handleButtonClick('members')}
              >
                {t('clients.tabs.groups')}
              </Button>
            )}
            {isClientView && (
              <Button
                variant={selectedButton === 'leads' ? 'contained' : 'outlined'}
                sx={{ mr: 1, ...(storedLang === 'ar' && { ml: 1 }) }}
                onClick={() => handleButtonClick('leads')}
              >
                {t('clients.tabs.leads')}
              </Button>
            )}
            {isClientView && (
              <Button
                variant={selectedButton === 'sharedLeads' ? 'contained' : 'outlined'}
                onClick={() => handleButtonClick('sharedLeads')}
              >
                Shared Leads
              </Button>
            )}
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2 }}>
          <Box display="flex" gap={1} alignItems="flex-end">
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {selectedButton === 'members' && <Box></Box>}
              {/* {selectedButton === 'clients' && (
                <Box>
                  <ToggleButtonGroup
                    size="small"
                    value={view}
                    exclusive
                    onChange={handleChangeView}
                  >
                    <Tooltip title="List View" arrow>
                      <ToggleButton value="list">
                        <Iconify icon="solar:list-bold" />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Grid View" arrow>
                      <ToggleButton value="grid">
                        <Iconify icon="mingcute:dot-grid-fill" />
                      </ToggleButton>
                    </Tooltip>
                  </ToggleButtonGroup>
                </Box>
              )} */}
              {/* {selectedButton === 'leads' && (
                <Box>
                  <ToggleButtonGroup
                    size="small"
                    value={leadView}
                    exclusive
                    onChange={handleChangeLeadView}
                  >
                    <Tooltip title="List View" arrow>
                      <ToggleButton value="list">
                        <Iconify icon="solar:list-bold" />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Grid View" arrow>
                      <ToggleButton value="grid">
                        <Iconify icon="mingcute:dot-grid-fill" />
                      </ToggleButton>
                    </Tooltip>
                  </ToggleButtonGroup>
                </Box>
              )} */}
            </Box>
          </Box>
        </Box>

        {selectedButton === 'members' && <MemberView view={memberView} />}

        {selectedButton === 'clients' && (
          <>
            <ClientView view={view} isClientView={isClientView} />
          </>
        )}

        {selectedButton === 'leads' && <LeadView view={leadView} isClientView={isClientView} />}
        {selectedButton === 'sharedLeads' && (
          <LeadView view={leadView} isClientView={isClientView} isShared={true} />
        )}
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('clients.dialog.delete_title')}
        content={
          <>
            {t('clients.dialog.delete_content')} <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            {t('clients.dialog.delete_title')}
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, type, status, department } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  // if (type !== 'all') {
  //   inputData = inputData.filter((user) => user.type === type);
  // }

  if (status.length) {
    inputData = inputData.filter((user) => status.includes(user.status));
  }

  if (department.length) {
    inputData = inputData.filter((user) => department.includes(user.department));
  }

  return inputData;
}
