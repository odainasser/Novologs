'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

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

import { UserTableRow } from '../user-table-row';
import { UserTableListRow } from '../user-table-list-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserTableFiltersResult } from '../user-table-filters-result';
import { useTheme, useMediaQuery, Typography } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { employees, departments, status, designations } from 'src/sections/user/user-mock-data';
import { TextField, MenuItem } from '@mui/material';
import { Form, Field } from 'src/components/hook-form';
import { useForm, Controller } from 'react-hook-form';
import { UserSettingsButton } from './user-settings-button';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { UserSettingsView } from './user-settings-view';
import { OrganizationalChartView } from './organizational-chart-view';
import { AddUserDetails } from '../add-user-details';
import { AddUserImage } from '../add-user-image';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { getUser, getAllRoles } from 'src/actions/userManage/userManageActions';
import { addUser } from 'src/actions/userSettings/userSettingsActions';
import { getDepartments } from 'src/actions/department/departmentActions';
import { getDesignations } from 'src/actions/designation/designationActions';
import { getCompanyBranches } from 'src/actions/userManage/userManageActions';
import { getHierarchy } from 'src/actions/hierarchy/hierarchyActions';
import { Chip } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuthContext } from 'src/auth/hooks';
import Autocomplete from '@mui/material/Autocomplete';

//}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });
  const [tableData, setTableData] = useState([]);
  const filters = useSetState({
    name: '',
    status: [],
    department: '',
    designation: '',
    branch: '',
    isActive: true,
  });
  const [searchText, setSearchText] = useState(filters.state.name || '');
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      table.onResetPage();
      filters.setState({ name: searchText });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);
  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const getUsersParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },
  };
  const {
    usersList,
    usersListLoading,
    usersListError,
    usersListValidating,
    usersListEmpty,
    mutate,
  } = getUser(
    getUsersParams,
    filters.state.name,
    filters.state.department,
    filters.state.designation,
    filters.state.branch
  );

  const {
    departmentsList,
    departmentsListLoading,
    departmentsListError,
    departmentsListValidating,
    departmentsListEmpty,
  } = getDepartments();
  const {
    designationsList,
    designationsListLoading,
    designationsListError,
    designationsListValidating,
    designationsListEmpty,
  } = getDesignations();
  const {
    hierarchyList,
    hierarchyListLoading,
    hierarchyListError,
    hierarchyListValidating,
    hierarchyListEmpty,
    mutate: mutateHierarchyList,
  } = getHierarchy();
  const getBranchParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
  };

  const { branchList, branchListEmpty } = getCompanyBranches(getBranchParams);
  const { allRoles } = getAllRoles();

  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  console.log('this is the department list', departmentsList?.departments);
  const STATUS_OPTIONS = [
    { value: 0, label: t('teams.tabs.internal') },
    { value: 2, label: t('teams.tabs.my-team') },
    { value: 1, label: t('teams.tabs.external') },
  ];
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const { zetaUser } = useAuthContext();

  const TABLE_HEAD = [
    // {
    //   id: 'serialNo',
    //   label: t('table.headings.serialNo'),
    //   width: '5%',
    //   align: 'center',
    //   sortable: false,
    // },
    {
      id: 'id',
      label: t('table.headings.id'),
      width: '6%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
      align: 'center',
    },
    {
      id: 'code',
      label: t('table.headings.empId'),
      width: '7%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: 'fullName',
      label: t('table.headings.firstName'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'email',
      label: t('table.headings.userName'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: 'designationId',
      label: t('table.headings.designation'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: 'departmentId',
      label: t('table.headings.departmentId'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: 'country',
      label: t('table.headings.details'),
      width: '11%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: 'tree',
      label: t('table.headings.tree'),
      width: '9%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: 'status',
      label: t('table.headings.status'),
      width: '7%',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
    {
      id: '',
      label: t('table.headings.actions'),
      width: '8%',
      align: 'center',
      align: storedLang === 'ar' ? 'right' : 'left',
      sortable: false,
    },
  ];

  const router = useRouter();

  const confirm = useBoolean();

  const [addBeforeSave, setAddBeforeSave] = useState(false);

  const [address, setAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState(null);

  const [branch, setBranch] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [profileImageFileId, setProfileImageFileId] = useState('');

  const [isExternal, setIsExternal] = useState(false);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const isClientGroup = false;

  const [newEmployee, setNewEmployee] = useState({
    code: '',
    fullName: '',
    userName: '',
    designationId: '',
    departmentId: '',
    email: '',
    contact: '',
    // type: isExternal ? 1 : 0,
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

  const addNewEmployee = async (newEmployee) => {
    if (isSavingEmployee) return;

    let hasError = false;

    if (!newEmployee.fullName || !newEmployee.fullName.trim()) {
      setNameError(t('Validations.name_error'));
      hasError = true;
    } else {
      setNameError('');
    }

    if (!newEmployee.email || !newEmployee.email.trim()) {
      setEmailError(t('Validations.email_error'));
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) {
      return;
    }

    setIsSavingEmployee(true);

    newEmployee.address = address;
    newEmployee.hourlyRate = parseFloat(hourlyRate) || 0;
    newEmployee.companyBranchId = branch;

    newEmployee.userType = isExternal ? 1 : 0;
    newEmployee.phoneNumber = phoneNumber;
    newEmployee.country = nationality;
    newEmployee.roles = selectedRights;
    newEmployee.avatarUrl = preview;
    newEmployee.hierarchyParentId = hierarchyParentId;
    newEmployee.profileImageFileId = profileImageFileId;
    console.log('this is the new employee', newEmployee);
    try {
      const response = await addUser(newEmployee);
      if (response.success) {
        toast.success(t('success_messages.employee_add'));
        setTableData((prevData) => [newEmployee, ...prevData]);
        setNewEmployee({});
        setAddress('');
        setHourlyRate('');
        setBranch('');
        setPhoneNumber('');
        setNationality('');
        setIsExternal(false);
        setSelectedRights([]);
        setAvatarUrl(null);
        setPreview('');
        setProfileImageFileId('');
        setNameError('');
        setEmailError('');
        setHierarchyParentId('');
        setNodeDepth(null);
        setReporter('');
        localStorage.removeItem('tempOrgChartData'); // Clear temp data
        setAddBeforeSave(false); // Reset flag
        await mutate();
        await mutateHierarchyList();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add user failed:', error);
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const clearField = () => {
    setNewEmployee({
      code: '',
      fullName: '',
      userName: '',
      designationId: '',
      departmentId: '',
      email: '',
      contact: '',
      type: isExternal ? 1 : 0,
    });
    setAddress('');
    setHourlyRate('');
    setBranch('');
    setPhoneNumber('');
    setNationality('');
    setIsExternal(false);
    setSelectedRights([]);
    setAvatarUrl(null);
    setPreview('');
    setProfileImageFileId('');
    setNameError('');
    setEmailError('');
    setNodeDepth(null);
    setReporter('');
    setHierarchyParentId('');
    setAddBeforeSave(false); // Reset flag
    localStorage.removeItem('tempOrgChartData'); // Clear temp data
  };

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    addNewEmployee();
  };
  const [nodeDepth, setNodeDepth] = useState(null);
  const [reporter, setReporter] = useState('');

  console.log('this is the node depth', nodeDepth);

  useEffect(() => {
    if (usersList?.users?.length) {
      setTableData(usersList.users);
    }
  }, [usersList]);

  console.log('this is the table data', tableData);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: usersList?.users,
        comparator: getComparator(table.order, table.orderBy),
        filters: filters.state,
        userDepartments: departmentsList?.departments,
      }),
    [usersList, filters.state, table.order, table.orderBy, departmentsList]
  );
  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.status.length > 0 ||
    !!filters.state.department ||
    !!filters.state.designation ||
    filters.state.branch;
  const activeFilteredCount = canReset
    ? dataFiltered.length
    : filters.state.isActive !== null
      ? usersList.users.filter((u) => u.isActive === filters.state.isActive).length
      : usersList.totalusers;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success(t('table.delete_success'));

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

  const handleAddMoreRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.more(id));
    },
    [router]
  );

  const handleOpenRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.details(id));
    },
    [router]
  );

  const handleOpenPermissions = useCallback(
    (id) => {
      router.push(paths.dashboard.user.permissions(id));
    },
    [router]
  );

  const handleOpenShowHideMenu = useCallback(
    (id) => {
      router.push(paths.dashboard.user.showHideMenu(id));
    },
    [router]
  );
  // const handleFilterStatus = useCallback(
  //   (event, newValue) => {
  //     table.onResetPage();
  //     filters.setState({ type: newValue });
  //   },
  //   [filters, table]
  // );
  const [view, setView] = useState('list');

  useEffect(() => {
    const handleReset = () => {
      setView('list');
      setSelectedButton('userList');
    };
    window.addEventListener('reset-user-view', handleReset);
    localStorage.removeItem('editorContentDocs');

    return () => window.removeEventListener('reset-user-view', handleReset);
  }, []);

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const [selectedButton, setSelectedButton] = useState('userList');

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
    // If navigating away from tree view while in addBeforeSave mode, clear temp data
    if (selectedButton === 'tree' && buttonName !== 'tree' && addBeforeSave) {
      localStorage.removeItem('tempOrgChartData');
      // Optionally, reset parts of the newEmployee form or related states if abandoning
      // setAddBeforeSave(false); // Or do this more explicitly elsewhere
    }
    // If switching to tree view NOT for adding a new unsaved employee, clear temp data
    if (buttonName === 'tree' && !addBeforeSave && selectedButton !== 'tree') {
      localStorage.removeItem('tempOrgChartData');
    }
  };

  const [mode, setMode] = useState('add');
  const [hierarchyParentId, setHierarchyParentId] = useState('');
  console.log('this is the hierarchyParentId', hierarchyParentId);

  const [selectedRights, setSelectedRights] = useState([]);
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

  const handleToggleRights = (role) => {
    setSelectedRights((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(role);
      if (isAlreadySelected) {
        return prevSelected.filter((r) => r !== role);
      }
      return [...prevSelected, role];
    });
  };
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

  const addNewDetails = (details) => {
    details.address = address;
    details.hourlyRate = hourlyRate;
    details.branch = branch;
    details.phoneNumber = phoneNumber;
    details.nationality = nationality;
    details.roles = selectedRights;
    details.userType = isExternal;
  };
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleNameInputChange = (e) => {
    setNewEmployee({ ...newEmployee, fullName: e.target.value });
    setNameError('');
  };
  const handleEmailInputChange = (e) => {
    const email = e.target.value;
    setNewEmployee({ ...newEmployee, email });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError(t('Validations.email_error'));
    } else if (!emailRegex.test(email)) {
      setEmailError(t('Validations.email_valid'));
    } else {
      setEmailError('');
    }
  };
  const isDisabled = !newEmployee.fullName || !newEmployee.email;
  const handleClick = () => {
    setAddBeforeSave(true);
    setSelectedButton('tree');
    if (!nodeDepth) {
      localStorage.removeItem('tempOrgChartData'); // Clear if any old temp data exists
    }
  };
  // const getDepartmentPath = (department, allDepartments) => {
  //   const parent = allDepartments.find((d) => d.id === department.parentDepartmentId);
  //   if (!parent) return department.name.value;
  //   return `${getDepartmentPath(parent, allDepartments)} / ${department.name.value}`;
  // };
  const getDeptName = (dept) => {
    if (!dept) return storedLang === 'ar' ? 'غير معروف' : 'Unknown';

    if (storedLang === 'ar') {
      return (
        dept.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')?.value ||
        dept.name?.value
      );
    }

    return dept.name?.value;
  };

  const getDepartmentPath = (department, allDepartments) => {
    const parent = allDepartments.find((d) => d.id === department.parentDepartmentId);

    const currentName = getDeptName(department);

    if (!parent) return currentName;

    return `${getDepartmentPath(parent, allDepartments)} / ${currentName}`;
  };

  if (usersListLoading)
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
  if (usersListError) {
    return <ErrorView errorCode={usersListError} />;
  }

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading={t('teams.heading')}
          links={[
            { name: t('teams.dashboard'), href: paths.dashboard.root },
            { name: t('teams.heading'), href: paths.dashboard.user.list },
            { name: t('teams.list') },
          ]}
          sx={{ mb: 1 }}
        />

        <Box sx={{ mb: 1 }} display="flex" justifyContent="space-between">
          <Box onClick={() => handleButtonClick('userList')}>
            <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
              <Tooltip title={t('tooltip.list')} arrow>
                <ToggleButton value="list">
                  <Iconify icon="solar:list-bold" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title={t('tooltip.grid')} arrow>
                <ToggleButton value="grid">
                  <Iconify icon="mingcute:dot-grid-fill" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ mb: 1 }} display="flex" alignItems="center" gap={1}>
            <Tooltip title={t('tooltip.Organization_tree')} arrow>
              <Button
                variant="contained"
                startIcon={<Iconify icon="mdi:sitemap" />}
                onClick={() => {
                  handleButtonClick('tree');
                  localStorage.removeItem('tempOrgChartData'); // Clear if any old temp data exists
                  setAddBeforeSave(false);
                }}
                sx={{
                  '& .MuiButton-startIcon': {
                    margin: '0',
                  },
                  background: '#006A67',
                }}
              />
            </Tooltip>

            {zetaUser?.permissions?.includes('General.UserSettings') && (
              <Tooltip title={t('tooltip.settings')} arrow>
                <UserSettingsButton
                  sx={{ color: '#006A67' }}
                  onClick={() => handleButtonClick('settings')}
                />
              </Tooltip>
            )}
          </Box>
        </Box>

        {selectedButton === 'settings' && <UserSettingsView />}
        {selectedButton === 'userList' && (
          <Card>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                px: 1,
                py: 0,
                pt: 0.5,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              {/* Left: Tabs */}
              {/* <Tabs value={filters.state.type} onChange={handleFilterStatus}>
                {STATUS_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={tab.label}
                    icon={
                      <Label
                        variant={
                          ((tab.value === 'all' || tab.value === filters.state.type) && 'filled') ||
                          'soft'
                        }
                        color={
                          (tab.value === 0 && 'success') ||
                          (tab.value === 1 && 'error') ||
                          (tab.value === 2 && 'warning') ||
                          'default'
                        }
                      >
                        {[0, 1, 2].includes(tab.value)
                          ? tableData.filter((user) => user.userType === tab.value).length
                          : tableData.length}
                      </Label>
                    }
                  />
                ))}
              </Tabs> */}

              <UserTableToolbar
                filters={filters}
                onResetPage={table.onResetPage}
                options={{ status: status }}
                departments={{ departments: departmentsList?.departments }}
                designations={{ designations: designationsList?.designations }}
                branches={{ branches: branchList?.branches }}
                searchText={searchText}
                setSearchText={setSearchText}
              />
            </Box>

            {canReset && (
              <UserTableFiltersResult
                filters={filters}
                totalResults={usersList.totalusers}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
                searchText={searchText}
                setSearchText={setSearchText}
                departments={{ departments: departmentsList?.departments }}
                designations={{ designations: designationsList?.designations }}
                branches={{ branches: branchList?.branches }}
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
                    <Tooltip title={t('table.actions.delete')}>
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
                          {zetaUser?.permissions?.includes('Users.AddEmployee') && (
                            <TableRow>
                              {/* <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              >
                                {' '}
                              </TableCell> */}
                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              >
                                {' '}
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  label={t('tooltip.code')}
                                  value={newEmployee.code || ''}
                                  onChange={(e) =>
                                    setNewEmployee({ ...newEmployee, code: e.target.value })
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
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <Box display="flex" gap={1} alignItems="center">
                                  {!avatarUrl ? (
                                    <Tooltip title={t('tooltip.add_user_image')} arrow>
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
                                    <Tooltip title={t('tooltip.change_user_image')} arrow>
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
                                        {t('table.headings.firstName')}{' '}
                                        <span style={{ color: 'red' }}>*</span>
                                      </span>
                                    }
                                    value={newEmployee.fullName || ''}
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
                                  label={
                                    <span>
                                      {t('table.headings.email')}{' '}
                                      <span style={{ color: 'red' }}>*</span>
                                    </span>
                                  }
                                  value={newEmployee.email || ''}
                                  onChange={handleEmailInputChange}
                                  sx={{
                                    '& .MuiInputBase-input': {
                                      padding: '9px 14px',
                                    },
                                    '& .MuiInputLabel-root': {
                                      top: '-5px',
                                      fontSize: '10px',
                                    },
                                  }}
                                  error={!!emailError}
                                  helperText={emailError}
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <Autocomplete
                                  fullWidth
                                  options={designationsList?.designations || []}
                                  getOptionLabel={(option) =>
                                    storedLang === 'ar'
                                      ? option.name.localizedStrings?.find(
                                          (ls) => ls.language.toLowerCase() === 'ar'
                                        )?.value || option.name.value
                                      : option.name.value
                                  }
                                  value={
                                    designationsList?.designations.find(
                                      (d) => d.id === newEmployee.designationId
                                    ) || null
                                  }
                                  onChange={(event, newValue) => {
                                    setNewEmployee({
                                      ...newEmployee,
                                      designationId: newValue ? newValue.id : '',
                                    });
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={t('table.headings.designation')}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '9px 14px',
                                        },
                                        '& .MuiInputLabel-root': {
                                          top: '0px',
                                          fontSize: '10px',
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              >
                                <Autocomplete
                                  fullWidth
                                  options={departmentsList?.departments || []}
                                  getOptionLabel={(option) =>
                                    getDepartmentPath(option, departmentsList.departments)
                                  }
                                  value={
                                    departmentsList?.departments.find(
                                      (d) => d.id === newEmployee.departmentId
                                    ) || null
                                  }
                                  onChange={(event, newValue) => {
                                    setNewEmployee({
                                      ...newEmployee,
                                      departmentId: newValue ? newValue.id : '',
                                    });
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={t('table.headings.department')}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        '& .MuiInputBase-input': {
                                          padding: '9px 14px',
                                        },
                                        '& .MuiInputLabel-root': {
                                          top: '0px',
                                          fontSize: '10px',
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {(address ||
                                    hourlyRate ||
                                    phoneNumber ||
                                    nationality ||
                                    branch ||
                                    selectedRights.length > 0 ||
                                    isExternal) && (
                                    <Chip
                                      icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                                      label={t('tooltip.details_added')}
                                      size="small"
                                      color="success"
                                      variant="soft"
                                      sx={{
                                        mb: 0.5,
                                        '& .MuiChip-label': {
                                          fontSize: 'xx-small',
                                        },
                                      }}
                                    />
                                  )}

                                  {address ||
                                  hourlyRate ||
                                  phoneNumber ||
                                  nationality ||
                                  branch ||
                                  selectedRights.length > 0 ||
                                  isExternal ? (
                                    <Tooltip title={t('tooltip.edit_user_details')} arrow>
                                      <IconButton
                                        onClick={() => {
                                          setDetails(true);
                                        }}
                                      >
                                        <Iconify
                                          icon="mdi:account-edit"
                                          sx={{ color: '#006A67' }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title={t('tooltip.add_user_details')} arrow>
                                      <IconButton
                                        onClick={() => {
                                          setDetails(true);
                                        }}
                                      >
                                        <Iconify
                                          icon="mdi:account-details"
                                          sx={{ color: '#006A67' }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                                align="center"
                              >
                                {nodeDepth && (
                                  <>
                                    <Chip
                                      size="small"
                                      label={
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '100%',
                                            color: 'white',
                                          }}
                                        >
                                          {nodeDepth}
                                        </Typography>
                                      }
                                      sx={{
                                        backgroundColor: '#006A67',
                                        color: 'white',
                                        borderRadius: '16px', // makes it more round
                                        height: '24px', // adjust for a compact size
                                        maxWidth: '100%',
                                      }}
                                    />

                                    <Typography
                                      variant="body2"
                                      sx={{
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                      }}
                                    >
                                      {reporter}
                                    </Typography>
                                  </>
                                )}
                                <Tooltip
                                  title={nodeDepth ? 'Change level' : t('tooltip.add_organization')}
                                  arrow
                                >
                                  <IconButton disabled={isDisabled} onClick={handleClick}>
                                    <Iconify
                                      icon="mdi:sitemap"
                                      sx={{ color: isDisabled ? 'action.disabled' : '#006A67' }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                }}
                              />

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
                                  <Tooltip title={t('tooltip.add_employee')}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => {
                                        if (!isSavingEmployee) {
                                          addNewEmployee(newEmployee);
                                        }
                                      }}
                                      size="small"
                                      disabled={isSavingEmployee}
                                      sx={{
                                        color: 'primary.contrastText',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        textTransform: 'none',
                                        padding: '6px 12px',
                                        minWidth: 0,
                                        bgcolor:
                                          (!newEmployee.fullName || !newEmployee.email) &&
                                          !isSavingEmployee
                                            ? 'grey.400'
                                            : isSavingEmployee
                                              ? 'grey.500'
                                              : '#006A67',
                                      }}
                                    >
                                      {isSavingEmployee ? (
                                        <CircularProgress
                                          size={20}
                                          sx={{ color: 'primary.contrastText' }}
                                        />
                                      ) : (
                                        t('table.actions.save')
                                      )}
                                    </Button>
                                  </Tooltip>

                                  <Tooltip title={t('table.actions.clear_all')} arrow>
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

                          {dataFiltered.map((row, index) => (
                            <UserTableListRow
                              key={row.id}
                              row={row}
                              selected={table.selected.includes(row.id)}
                              onSelectRow={() => table.onSelectRow(row.id)}
                              onEditRow={() => handleEditRow(row.id)}
                              onAddMore={() => handleAddMoreRow(row.id)}
                              index={index + table.page * table.rowsPerPage}
                              onOpenRow={() => handleOpenRow(row.id)}
                              onOpenPermissions={() => handleOpenPermissions(row.id)}
                              onOpenShowHideMenu={() => handleOpenShowHideMenu(row.id)}
                              tableData={tableData}
                              setTableData={setTableData}
                              userRoles={allRoles?.roles}
                              userDepartments={departmentsList?.departments}
                              userDesignations={designationsList?.designations}
                              mutate={mutate}
                              hierarchyList={hierarchyList}
                              isClientGroup={isClientGroup}
                              mutateHierarchyList={mutateHierarchyList}
                            />
                          ))}

                          {/* <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              dataFiltered.length
                            )}
                          /> */}

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
                                          <UserTableRow
                                            row={row}
                                            selected={table.selected.includes(row.id)}
                                            onSelectRow={() => table.onSelectRow(row.id)}
                                            onEditRow={() => handleEditRow(row.id)}
                                            onOpenRow={() => handleOpenRow(row.id)}
                                            userDepartments={departmentsList?.departments}
                                            userDesignations={designationsList?.designations}
                                            hierarchyList={hierarchyList}
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

                          {/* <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              dataFiltered.length
                            )}
                          /> */}
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
                rowsPerPageOptions={[50, 100, 200]}
                dense={table.dense}
                count={usersList.totalusers}
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
        {selectedButton === 'tree' && (
          <OrganizationalChartView
            newEmployee={newEmployee}
            avatarUrl={avatarUrl?.path}
            userDepartments={departmentsList?.departments}
            userDesignations={designationsList?.designations}
            addBeforeSave={addBeforeSave}
            setSelectedButton={setSelectedButton}
            setHierarchyParentId={setHierarchyParentId}
            nodeDepth={nodeDepth}
            setNodeDepth={setNodeDepth}
            setReporter={setReporter}
            reporter={reporter}
            hierarchyList={hierarchyList}
            mutate={mutateHierarchyList}
          />
        )}
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('table.actions.delete')}
        content={
          <>
            {t('table.confirm_delete')} <strong> {table.selected.length} </strong> items?
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
            {t('table.actions.delete')}
          </Button>
        }
      />
      <AddUserDetails
        open={details}
        shared={allRoles?.roles}
        selectedRights={selectedRights}
        setSelectedRights={setSelectedRights}
        onClick={handleOpenDetails}
        handleClose={handleDetailsDialogClose}
        onToggleRights={handleToggleRights}
        mode={mode}
        setAddress={setAddress}
        setPhoneNumber={setPhoneNumber}
        setNationality={setNationality}
        address={address}
        hourlyRate={hourlyRate}
        branch={branch}
        setHourlyRate={setHourlyRate}
        setBranch={setBranch}
        phoneNumber={phoneNumber}
        nationality={nationality}
        addNewDetails={addNewDetails}
        isExternal={isExternal}
        setIsExternal={setIsExternal}
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

function applyFilter({ inputData = [], comparator, filters, userDepartments }) {
  console.log('this is the input data', inputData);
  const getDepartmentName = (departmentId) => {
    return userDepartments?.find((dep) => dep.id === departmentId)?.name?.value || 'Not Available';
  };

  const { name, status, department, branch, isActive } = filters;

  console.log('this is the department filter', department);
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) =>
        user.code?.toLowerCase().includes(name.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(name.toLowerCase()) ||
        user.email?.toLowerCase().includes(name.toLowerCase())
    );
  }

  // if (type !== 'all') {
  //   inputData = inputData.filter((user) => user.userType === type);
  // }

  if (status.length) {
    inputData = inputData.filter((user) => status.includes(user.status));
  }

  if (isActive !== null) {
    inputData = inputData.filter((user) => user.isActive === isActive);
  }
  return inputData;
}
