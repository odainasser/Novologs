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
import { useTranslation } from 'react-i18next';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { _roles, _userList, USER_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
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

import { ClientTableToolbar } from '../client-table-toolbar';
import { ClientTableFiltersResult } from '../client-table-filters-result';
import { ClientTableListRow } from '../client-table-list-row';
import { ClientTableRow } from '../client-table-row';

import { useTheme, useMediaQuery, Typography } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  mock_clients,
  clients,
  vendors,
  locations,
  status,
  emirates,
  _members,
  STATUS_OPTIONS,
} from 'src/sections/client/client-mock-data';
import { TextField, MenuItem } from '@mui/material';
import { Form, Field } from 'src/components/hook-form';
import { useForm, Controller } from 'react-hook-form';
import { UserSettingsButton } from 'src/sections/user/view/user-settings-button';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { ClientSettingsView } from './client-settings-view';
import { AddClientDetails } from '../add-client-details';
import { AddUserImage } from 'src/sections/user/add-user-image';

import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { getClients, addClient, deleteClient } from 'src/actions/client/clientActions';

import { getVendors, addVendor, deleteVendor } from 'src/actions/vendor/vendorActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useAuthContext } from 'src/auth/hooks';
import { getSettings } from 'src/actions/settings/settingActions';
import { getUser } from 'src/actions/user-manage/userManageActions';

//}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ClientView({ isClientView, isPurchaseClient }) {
  const filters = useSetState({ name: '', status: [], type: 'members', myClient: [], members: [] });

  const { zetaUser } = useAuthContext();
  const { settingsList } = getSettings();
  const defaultProvinceValue = settingsList?.settings?.find(
    (setting) => setting.key === 'defaultProvince'
  )?.value;

  const provinceSettings = settingsList?.settings?.filter(
    (setting) => setting.key === `province${defaultProvinceValue}`
  );

  function useClientOrVendor(isClientView, myClientArray) {
    const payload = {
      pagination: {
        pageNumber: 1,
        pageSize: 200,
      },
    };

    if (
      (isClientView && myClientArray?.[0] === 'My Clients') ||
      !zetaUser?.permissions?.includes('Client.ViewAll')
    ) {
      payload.search = {
        fieldName: 'CreatorId',
        fieldValue: zetaUser?.id,
        operator: 0,
        logicOperator: 0,
      };
    }
    if (isPurchaseClient) {
      payload.search = {
        fieldName: 'CreatorId',
        fieldValue: zetaUser?.id,
        operator: 0,
        logicOperator: 0,
      };
      payload.isAccount = true;
    } else {
      payload.isAccount = false;
    }
    if (
      (!isClientView && myClientArray?.[0] === 'My Vendors') ||
      !zetaUser?.permissions?.includes('Vendor.ViewAll')
    ) {
      payload.search = {
        fieldName: 'CreatorId',
        fieldValue: zetaUser?.id,
        operator: 0,
        logicOperator: 0,
      };
    }

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

  const { list, listLoading, listError, listValidating, listEmpty, mutate } = useClientOrVendor(
    isClientView,
    filters.state.myClient
  );
  const subFilters = [
    {
      fieldName: 'emailConfirmed',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    },
  ];
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
  };
  const { usersList, usersListEmpty } = getUser(getUsersParams);
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('clients.columns.serial_no'), width: '5%', align: 'center' },
    { id: 'id', label: t('clients.columns.id'), width: '5%' },

    {
      id: 'code',
      label: t('clients.columns.code'),
      width: '5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'created',
      label: t('clients.columns.creator'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'name',
      label: t('clients.columns.names'),
      width: isPurchaseClient ? '30%' : '23%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'email',
      label: t('clients.columns.email'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'emirate',
      label: t('clients.columns.emirates'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'website',
      label: t('clients.columns.details'),
      width: '11%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'leads', label: t('clients.columns.leads'), width: '12%' },
    ...(isClientView && !isPurchaseClient
      ? [
          {
            id: 'leadCount',
            label: t('clients.columns.leads'),
            width: '12%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(isClientView && !isPurchaseClient
      ? [
          {
            id: 'sales',
            label: t('clients.columns.sales'),
            width: '12%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isClientView && !isPurchaseClient
      ? [
          {
            id: 'sales',
            label: t('clients.columns.contracts'),
            width: '12%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),

    // { id: 'sales', label: t('clients.columns.sales'), width: '12%' },
    { id: '', label: t('clients.columns.actions'), width: '11%', align: 'center' },
  ];

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
    defaultOrderBy: 'created',
    defaultOrder: 'desc',
  });
  const router = useRouter();

  const confirm = useBoolean();
  const [profileImageFileId, setProfileImageFileId] = useState('');

  const [newClient, setNewClient] = useState({
    code: '',
    name: '',
    website: '',
    emirate: '',
    location: '',
    email: '',
    contact: '',
    address: '',
    members: '',
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

  const addNewClient = async (newClient) => {
    let hasError = false;

    if (!newClient.name || !newClient.name.trim()) {
      setNameError(t('clients.validations.required'));
      hasError = true;
    } else {
      setNameError('');
    }

    if (hasError) return;
    newClient.address = address;
    newClient.website = website;

    newClient.phonenumber = phonenumber;
    newClient.avatarUrl = preview;
    newClient.logoFileId = profileImageFileId;
    newClient.locationLatitude = latitude;
    newClient.locationLongitude = longitude;
    if (isPurchaseClient) {
      newClient.isAccount = true;
    }
    try {
      console.log('this is the new vendor', newClient);
      let response;
      if (isClientView) {
        response = await addClient(newClient);
      } else {
        response = await addVendor(newClient);
      }
      if (response.success) {
        if (isClientView) {
          toast.success(t('clients.toast.client_add'));
        } else {
          toast.success(t('clients.toast.vendor_added'));
        }

        setNewClient({});
        setAddress('');
        setWebsite('');
        setPhoneNumber('');
        setAvatarUrl(null);
        setPreview('');
        setProfileImageFileId('');
        setNameError('');
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add client failed:', error);
    }
  };

  const clearField = () => {
    setNewClient({
      code: '',
      name: '',
      website: '',
      emirate: '',
      location: '',
      email: '',
      contact: '',
      address: '',
      members: '',
    });
    setAddress('');
    setWebsite('');
    setPhoneNumber('');
    setAvatarUrl(null);
    setPreview('');
    setProfileImageFileId('');
    setNameError('');
  };

  const onSubmit = (data) => {
    const contactValue = getValues('contact');
    console.log('Current Contact Value: ', contactValue);
    console.log('Form Data:', data);
    addNewClient();
  };
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (list?.length) {
      console.log('this is the list', list);
      const sortedList = [...list].sort((a, b) => {
        const dateA = new Date(a.created);
        const dateB = new Date(b.created);
        return dateB - dateA;
      });
      setTableData([...list]);
    } else {
      setTableData([]);
    }
  }, [list]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.status.length > 0 ||
    filters.state.myClient.length > 0 ||
    filters.state.members.length > 0;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = async (id) => {
    if (id) {
      let response;
      try {
        if (isClientView) {
          response = await deleteClient(id);
        } else {
          response = await deleteVendor(id);
        }
        if (response.success) {
          await mutate();
          toast.success(
            isClientView
              ? t('leaddetails.toast.client_deleted_successfully')
              : t('leaddetails.toast.vendor_deleted_successfully')
          );
        } else {
          if (isClientView) {
            toast.error(response.error || t('leaddetails.toast.failed_to_delete_client'));
          } else {
            toast.error(response.error || t('leaddetails.toast.failed_to_delete_vendor'));
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('leaddetails.toast.unexpected_error'));
      }
    }
  };

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
    (id, clientName) => {
      if (clientName) {
        localStorage.setItem('clientName', clientName);
      }
      isClientView
        ? router.push(paths.dashboard.clientDetails.details(id))
        : router.push(paths.dashboard.vendorDetails.details(id));
    },
    [router]
  );

  const [view, setView] = useState('list');

  useEffect(() => {
    const handleReset = () => {
      setView('list');
      setSelectedButton('clientList');
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

  const [selectedButton, setSelectedButton] = useState('clientList');

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const [mode, setMode] = useState('add');

  const [details, setDetails] = useState(false);

  const [openImage, setOpenImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [preview, setPreview] = useState('');

  console.log('this is the avatar URL', avatarUrl);
  useEffect(() => {
    if (typeof avatarUrl === 'string') {
      setPreview(avatarUrl);
    } else if (avatarUrl instanceof File) {
      setPreview(URL.createObjectURL(avatarUrl));
    }
  }, [avatarUrl]);

  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };

  const handleOpenImage = () => {
    setOpenImage(true);
  };
  const handleImageDialogClose = () => {
    setTimeout(() => {
      setOpenImage(false);
    }, 100);
  };

  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  const [phonenumber, setPhoneNumber] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const addNewDetails = (details) => {
    details.address = address;
    details.website = website;
    details.phonenumber = phonenumber;

    const location =
      details.location && details.location.lat && details.location.lng
        ? details.location
        : { lat: 25.2048, lng: 55.2708 };

    setLatitude(location.lat);
    setLongitude(location.lng);
  };
  const [nameError, setNameError] = useState('');
  const [idError, setIDError] = useState('');

  const handleNameInputChange = (e) => {
    setNewClient({ ...newClient, name: e.target.value });
    setNameError('');
  };
  const [emailError, setEmailError] = useState('');

  const handleEmailInputChange = (e) => {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setNewClient({ ...newClient, email });

    if (email && !emailRegex.test(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  if (listLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  if (listError) {
    return <ErrorView errorCode={listError} />;
  }

  return (
    <>
      <>
        {!isPurchaseClient && (
          <Box sx={{ mb: 1 }} display="flex" justifyContent="space-between">
            <Box onClick={() => handleButtonClick('clientList')}>
              <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
                <Tooltip title={t('clients.views.list')} arrow>
                  <ToggleButton value="list">
                    <Iconify icon="solar:list-bold" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title={t('clients.views.grid')} arrow>
                  <ToggleButton value="grid">
                    <Iconify icon="mingcute:dot-grid-fill" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
            {((isClientView && zetaUser?.permissions?.includes('General.ClientSettings')) ||
              (!isClientView && zetaUser?.permissions?.includes('General.VendorSettings'))) && (
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title={t('clients.views.settings')} arrow>
                  <UserSettingsButton
                    sx={{ color: '#006A67' }}
                    onClick={() => handleButtonClick('settings')}
                  />
                </Tooltip>
              </Box>
            )}
          </Box>
        )}

        {selectedButton === 'settings' && <ClientSettingsView isClientView={isClientView} />}
        {selectedButton === 'clientList' && (
          <Card>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                px: 1,
                py: 0,
                pt: 1,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              {!isPurchaseClient && (
                <ClientTableToolbar
                  filters={filters}
                  onResetPage={table.onResetPage}
                  options={{ status: status }}
                  clients={{ clients: clients }}
                  vendors={{ vendors: vendors }}
                  isClientView={isClientView}
                  allUsers={{
                    allUsers: usersList?.users.map((user) => user.fullName),
                  }}
                />
              )}
            </Box>

            {canReset && (
              <ClientTableFiltersResult
                filters={filters}
                totalResults={dataFiltered.length}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <Box sx={{ position: 'relative' }}>
              <Form methods={methods} onSubmit={onSubmit}>
                <TableSelectedAction
                  dense={table.dense}
                  numSelected={table.selected.length}
                  rowCount={dataFiltered.length}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                  action={
                    <Tooltip title={t('clients.dialog.delete_title')}>
                      <IconButton color="primary" onClick={confirm.onTrue}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  }
                />

                <Scrollbar>
                  {view === 'list' ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        width: '100%',
                        overflowX: 'auto',
                      }}
                    >
                      <Table
                        size={table.dense ? 'small' : 'medium'}
                        sx={{
                          width: '100%',
                          tableLayout: 'fixed',
                          '& td, & th': {
                            padding: table.dense ? '4px' : '8px',
                          },
                        }}
                      >
                        <TableHeadCustom
                          order={table.order}
                          orderBy={table.orderBy}
                          headLabel={TABLE_HEAD}
                          rowCount={dataFiltered.length}
                          numSelected={table.selected.length}
                          onSort={table.onSort}
                          onSelectAllRows={(checked) =>
                            table.onSelectAllRows(
                              checked,
                              dataFiltered.map((row) => row.id)
                            )
                          }
                        />

                        <TableBody>
                          {((isClientView && zetaUser?.permissions?.includes('Client.Add')) ||
                            (!isClientView && zetaUser?.permissions?.includes('Vendor.Add'))) && (
                            <TableRow>
                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              ></TableCell>
                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              ></TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  label="Code"
                                  value={newClient.code || ''}
                                  onChange={(e) =>
                                    setNewClient({ ...newClient, code: e.target.value })
                                  }
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      padding: '9px 14px',
                                    },
                                    '& .MuiInputLabel-root': {
                                      top: '-5px',
                                      fontSize: '10px',
                                    },
                                  }}
                                  error={!!idError}
                                  helperText={idError}
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              ></TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                {' '}
                                <Box display="flex" gap={1} alignItems="center">
                                  {!avatarUrl ? (
                                    <Tooltip title={t('clients.labels.add_client_image')} arrow>
                                      <IconButton
                                        onClick={() => {
                                          setOpenImage(true);
                                        }}
                                        sx={{ cursor: 'pointer' }}
                                      >
                                        <Iconify
                                          icon="eva:cloud-upload-fill"
                                          sx={{ color: '#006A67' }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title={t('clients.labels.change_user_image')} arrow>
                                      <Avatar
                                        onClick={() => {
                                          setOpenImage(true);
                                        }}
                                        src={preview}
                                        sx={{ width: 30, height: 30, cursor: 'pointer' }}
                                      />
                                    </Tooltip>
                                  )}

                                  <TextField
                                    fullWidth
                                    variant="outlined"
                                    label={
                                      <span>
                                        {isClientView
                                          ? t('clients.columns.name')
                                          : t('clients.columns.vendor_name')}{' '}
                                        <span style={{ color: 'red' }}>*</span>
                                      </span>
                                    }
                                    value={newClient.name || ''}
                                    onChange={handleNameInputChange}
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        padding: '9px 14px',
                                      },
                                      '& .MuiInputLabel-root': {
                                        top: '-5px',
                                        fontSize: '10px',
                                      },
                                    }}
                                    error={!!nameError}
                                    helperText={nameError}
                                  />
                                </Box>
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  label={t('clients.columns.email')}
                                  value={newClient.email || ''}
                                  onChange={handleEmailInputChange}
                                  error={!!emailError}
                                  helperText={emailError}
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      padding: '9px 14px',
                                    },
                                    '& .MuiInputLabel-root': {
                                      top: '-5px',
                                      fontSize: '10px',
                                    },
                                  }}
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <TextField
                                  select
                                  fullWidth
                                  label={t('clients.columns.emirates')}
                                  value={newClient.emirate || ''}
                                  onChange={(e) =>
                                    setNewClient({ ...newClient, emirate: e.target.value })
                                  }
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      padding: '9px 14px',
                                    },
                                    '& .MuiInputLabel-root': {
                                      top: '-5px',
                                      fontSize: '10px',
                                    },
                                  }}
                                >
                                  {provinceSettings?.length > 0
                                    ? JSON.parse(provinceSettings[0].value).map((item) => (
                                        <MenuItem key={item.symbol} value={item.name.value}>
                                          {item.name.value}
                                        </MenuItem>
                                      ))
                                    : []}
                                </TextField>
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              >
                                <Tooltip title={t('clients.labels.add_client_details')} arrow>
                                  <IconButton
                                    onClick={() => {
                                      setDetails(true);
                                    }}
                                  >
                                    <Iconify icon="mdi:account-details" sx={{ color: '#006A67' }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              {!isPurchaseClient && (
                                <>
                                  <TableCell
                                    sx={{
                                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                    }}
                                    align="center"
                                  ></TableCell>
                                  {isClientView && (
                                    <TableCell
                                      sx={{
                                        borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                      }}
                                    />
                                  )}
                                </>
                              )}

                              <TableCell
                                align="center"
                                sx={{
                                  ...(storedLang === 'ar' && {
                                    borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                  }),
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Tooltip title={t('clients.buttons.add_client')}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => {
                                        addNewClient(newClient);
                                        setNewClient({});
                                      }}
                                      size="small"
                                      sx={{
                                        color: 'primary.contrastText',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        textTransform: 'none',
                                        padding: '6px 12px',
                                        bgcolor: !newClient.name ? 'grey.400' : '#006A67',
                                      }}
                                    >
                                      {t('clients.buttons.save')}
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title={t('clients.buttons.clear_all')} arrow>
                                    <Iconify
                                      icon="mdi:close-circle"
                                      onClick={() => clearField()}
                                      sx={{
                                        cursor: 'pointer',
                                        height: 13,
                                        width: 13,
                                        color: 'error.main',
                                        ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                                      }}
                                    />
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                          {dataFiltered
                            .slice(
                              table.page * table.rowsPerPage,
                              table.page * table.rowsPerPage + table.rowsPerPage
                            )
                            .map((row, index) => (
                              <ClientTableListRow
                                key={row.id}
                                row={row}
                                selected={table.selected.includes(row.id)}
                                onSelectRow={() => table.onSelectRow(row.id)}
                                onDeleteRow={() => handleDeleteRow(row.id)}
                                onEditRow={() => handleEditRow(row.id)}
                                index={index + table.page * table.rowsPerPage}
                                onOpenRow={() => handleOpenRow(row?.id, row?.name)}
                                tableData={tableData}
                                setTableData={setTableData}
                                isClientView={isClientView}
                                mutate={mutate}
                                settingsList={settingsList?.settings}
                                isPurchaseClient={isPurchaseClient}
                              />
                            ))}

                          <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              dataFiltered.length
                            )}
                          />

                          <TableNoData notFound={notFound} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, my: 1 }}>
                        <TableBody>
                          {Array.from({
                            length: Math.ceil(dataFiltered.length / (isLargeScreen ? 4 : 3)),
                          }).map((_, index) => {
                            const startIdx = index * (isLargeScreen ? 4 : 3);
                            const rows = dataFiltered.slice(
                              startIdx,
                              startIdx + (isLargeScreen ? 4 : 3)
                            );

                            return (
                              <TableRow key={index}>
                                <TableCell colSpan={isLargeScreen ? 4 : 3}>
                                  <Grid container spacing={2} sx={{ ml: 0, mt: 1 }}>
                                    {rows.map((row, rowIndex) => (
                                      <Box
                                        key={row.id}
                                        sx={{ display: 'flex', alignItems: 'center' }}
                                      >
                                        <Card
                                          sx={{
                                            width: 'auto',
                                            minWidth: 200,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            my: 1,
                                          }}
                                        >
                                          <ClientTableRow
                                            row={row}
                                            selected={table.selected.includes(row.id)}
                                            onSelectRow={() => table.onSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(row.id)}
                                            onEditRow={() => handleEditRow(row.id)}
                                            onOpenRow={() => handleOpenRow(row.id, row?.name)}
                                            isClientView={isClientView}
                                            isPurchaseClient={isPurchaseClient}
                                          />
                                        </Card>

                                        {rowIndex < rows.length - 1 && (
                                          <Box
                                            sx={{
                                              height: '100px',
                                              width: '1px',
                                              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                              marginX: 2,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    ))}
                                  </Grid>
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              dataFiltered.length
                            )}
                          />
                          <TableNoData notFound={notFound} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Scrollbar>
              </Form>
            </Box>
            {view === 'list' && (
              <TablePaginationCustom
                page={table.page}
                rowsPerPageOptions={[100, 150, 250]}
                dense={table.dense}
                count={dataFiltered.length}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onChangeDense={table.onChangeDense}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                sx={{
                  borderTopColor: 'transparent',
                  '& .MuiTablePagination-actions > button svg': {
                    transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                  },
                }}
              />
            )}
          </Card>
        )}
      </>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('clients.dialog.delete_title')}
        content={
          <>
            {t('clients.dialog.delete_content')} <strong> {table.selected.length} </strong>{' '}
            {t('clients.dialog.items')}
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
      <AddClientDetails
        open={details}
        onClick={handleOpenDetails}
        handleClose={handleDetailsDialogClose}
        mode={mode}
        setAddress={setAddress}
        setPhoneNumber={setPhoneNumber}
        address={address}
        website={website}
        setWebsite={setWebsite}
        phonenumber={phonenumber}
        addNewDetails={addNewDetails}
        isClientView={isClientView}
      />

      <AddUserImage
        open={openImage}
        onClick={handleOpenImage}
        handleClose={handleImageDialogClose}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        mode={mode}
        setProfileImageFileId={setProfileImageFileId}
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, type, status, myClient, members } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  const searchName = name ? name.toLowerCase() : '';

  inputData = inputData.filter((user) => {
    const userName = user.name ? user.name.toLowerCase() : '';
    const userCode = user.code ? user.code.toLowerCase() : '';
    return userName.includes(searchName) || userCode.includes(searchName);
  });

  // if (type !== 'all') {
  //   inputData = inputData.filter((user) => user.type === type);
  // }

  if (status.length) {
    inputData = inputData.filter((user) => status.includes(user.status));
  }

  // if (myClient.length) {
  //   inputData = inputData.filter((user) => myClient.includes(user.myClient));
  // }

  if (members.length) {
    inputData = inputData.filter((user) => members.includes(user.creator.fullName));
  }
  return inputData;
}
