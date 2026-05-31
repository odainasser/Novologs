'use client';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { _roles, _userList } from 'src/_mock';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';
import { TextField, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import { AddGroup } from '../add-group';
import { getUser, getUserGroups, deleteUserGroup } from 'src/actions/user-manage/userManageActions';
import { getHierarchy } from 'src/actions/hierarchy/hierarchyActions';

import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';

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

import { MemberTableRow } from '../member-table-row';
import { MemberTableListRow } from '../member-table-list-row';
import { MemberTableToolbar } from '../member-table-toolbar';
import { MemberTableFiltersResult } from '../member-table-filters-result';

import { useTheme, useMediaQuery } from '@mui/material';

import { _members, mock_members } from 'src/sections/client/client-mock-data';
import { useMockedUser } from 'src/auth/hooks';
import { UserTableListRow } from 'src/sections/user/user-table-list-row';
import { employees } from 'src/sections/user/user-mock-data';
import { Label } from 'src/components/label';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useAuthContext } from 'src/auth/hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, Avatar } from '@mui/material';
import { fDate } from 'src/utils/format-time';

export function MemberView({ view }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();
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
  const {
    usersList,
    usersListLoading,
    usersListError,
    usersListValidating,
    usersListEmpty,
    mutate: mutateUsers,
  } = getUser(getUsersParams);

  const {
    userGroupList,
    userGroupListLoading,
    userGroupListError,
    userGroupListValidating,
    userGroupListEmpty,
    mutate: mutateUserGroups,
  } = getUserGroups();

  const {
    hierarchyList,
    hierarchyListLoading,
    hierarchyListError,
    hierarchyListValidating,
    hierarchyListEmpty,
    mutate: mutateHierarchyList,
  } = getHierarchy();

  const initialStatusOptions = [
    { value: 'internal', label: t('clients.tabs.group1') },
    { value: 'myteam', label: t('clients.tabs.group2') },
    { value: 'external', label: t('clients.tabs.group3') },
  ];
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [members, setMembers] = useState(false);
  const { user } = useMockedUser();
  const [mode, setMode] = useState('');
  const [statusOptions, setStatusOptions] = useState(initialStatusOptions);
  const [groupID, setGroupID] = useState('');
  const [groupName, setGroupName] = useState('');

  const [groupIdToEdit, setGroupIdToEdit] = useState('');

  const handleTogglePerson = (person) => {
    setSelectedPersons((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };

  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };

  const addNewGroup = (newGroup) => {
    newGroup.groupId = groupID;
    newGroup.name = groupName;
    newGroup.members = selectedPersons;
    setStatusOptions((prevOptions) => [
      ...prevOptions,
      { value: newGroup.groupId, label: newGroup.name },
    ]);
    // setTableData((prevData) => {
    //   const updatedData = [newGroup, ...prevData];
    //   return updatedData;
    // });
    toast.success(t('clients.toast.group_add'));

    setSelectedPersons([]);
    setGroupID('');
    setGroupName('');
  };

  const TABLE_HEAD = [
    // { id: 'serialNo', label: t('clients.columns.serial_no'), width: '5%', align: 'center' },
    { id: 'empId', label: t('clients.columns.employId'), width: '5%' },
    { id: 'empId', label: 'Code', width: '6%' },
    { id: 'name', label: t('clients.columns.names'), width: '14%' },
    { id: 'userName', label: t('clients.columns.username'), width: '15%' },
    { id: 'role', label: t('clients.columns.role'), width: '15%' },
    { id: 'department', label: t('clients.columns.department'), width: '15%' },
    { id: 'contact', label: t('clients.columns.details'), width: '12%' },
    { id: 'tree', label: t('clients.columns.level'), width: '9%' },
    { id: 'status', label: t('clients.columns.status'), width: '8%' },
    { id: 'target', label: t('clients.sales_report.target'), width: '8%' },
  ];

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });
  const router = useRouter();

  const confirm = useBoolean();

  const confirmDeleteGroup = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const [groupDetails, setGroupDetails] = useState(null);
  console.log('this is the grp details', groupDetails);

  const handleOpenDetailsDialog = (tab) => {
    setGroupDetails(tab);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  const isClientGroup = true;
  const filters = useSetState({
    name: '',
    member: [],
    type: undefined,
  });

  useEffect(() => {
    if (userGroupList?.userGroup?.length > 0 && !filters.state.type) {
      filters.setState({ type: userGroupList.userGroup[0].id });
    }

    if (
      usersList?.users?.length > 0 &&
      userGroupList?.userGroup?.length > 0 &&
      filters.state.type
    ) {
      const selectedGroup = userGroupList.userGroup.find(
        (group) => group.id === filters.state.type
      );

      if (selectedGroup) {
        const memberUserIds = selectedGroup.members.map((member) => member.userId);

        const groupMembers = usersList.users.filter((user) => memberUserIds.includes(user.id));

        console.log('this is the group members', groupMembers);

        setTableData(groupMembers);
      } else {
        setTableData([]);
      }
    }
  }, [userGroupList, usersList, filters.state.type]);

  const GROUP_OPTIONS = userGroupList?.userGroup
    ?.filter((group) => group?.members?.some((member) => member.userId === zetaUser?.id))
    .map((data) => ({
      value: data?.id,
      label: data?.name,
      creatorUser: data?.creatorUser,
      created: data?.created,
    }));
  useEffect(() => {
    if (GROUP_OPTIONS?.length > 0 && !filters.state.type) {
      handleFilterStatus(null, GROUP_OPTIONS[0].value);
    }
  }, [GROUP_OPTIONS]);
  const handleGroupClick = (tab) => {
    filters.setState({ type: tab.value });
  };
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ type: newValue });
    },
    [filters, table]
  );

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });
  console.log('this is the data filtered', dataFiltered);

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.state.name || filters.state.member.length > 0;

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

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleOpenRow = useCallback(
    (id) => {
      router.push(paths.dashboard.clientMember.details(id));
    },
    [router]
  );
  const [groupIdForDelete, setGroupIdForDelete] = useState(null);

  const handleDeleteGroup = async () => {
    if (!groupIdForDelete) {
      toast.error('No group selected for deletion.');
      confirmDeleteGroup.onFalse();
      return;
    }

    try {
      const response = await deleteUserGroup(groupIdForDelete);
      if (response.success) {
        await mutateUserGroups();
        await mutateUsers();
        toast.success(t('clients.toast.group_deleted'));

        if (filters.state.type === groupIdForDelete) {
          filters.setState({ type: undefined });
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('clients.toast.group_error');
    } finally {
      confirmDeleteGroup.onFalse();
      setGroupIdForDelete(null);
    }
  };

  if (userGroupListLoading)
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
  if (userGroupListError) {
    return <ErrorView errorCode={userGroupListError} />;
  }

  return (
    <>
      {zetaUser?.permissions?.includes('UserGroups.AddUserGroup') && (
        <Box display="flex" justifyContent="end" sx={{ mb: 1 }}>
          <Button
            startIcon={
              <Iconify
                icon="mingcute:add-line"
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            sx={{ ml: 1 }}
            variant="contained"
            onClick={() => {
              setMembers(true);
              setMode('add');
            }}
          >
            {t('clients.buttons.add_sales_group')}
          </Button>
        </Box>
      )}

      <Card>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            display: 'flex',
            py: 0,
            pl: 1,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          <Box sx={{ maxWidth: '70%', flexGrow: 1, overflowX: 'auto' }}>
            <Tabs value={filters.state.type} onChange={handleFilterStatus}>
              {[...GROUP_OPTIONS].map((tab, index) => {
                const isActive =
                  filters.state.type === tab.value || (!filters.state.type && index === 0);

                return (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.2}>
                        <Stack alignItems="center">
                          <Typography variant="subtitle2" sx={{ color: '#006A67' }}>
                            {tab.label}
                          </Typography>
                        </Stack>

                        <>
                          {zetaUser?.permissions?.includes('UserGroups.UpdateUserGroup') && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMembers(true);
                                setMode('edit');

                                const groupToEdit = userGroupList?.userGroup?.find(
                                  (group) => group.id === tab.value
                                );
                                if (groupToEdit) {
                                  setGroupIdToEdit(groupToEdit?.id);
                                  setGroupID(groupToEdit.code || '');
                                  setGroupName(groupToEdit.name || '');

                                  if (groupToEdit.members && usersList?.users) {
                                    const memberIds = groupToEdit.members.map(
                                      (member) => member.userId
                                    );
                                    const selectedUsers = usersList.users.filter((user) =>
                                      memberIds.includes(user.id)
                                    );
                                    setSelectedPersons(selectedUsers || []);
                                  }
                                }
                              }}
                            >
                              <Iconify icon="solar:pen-bold" width={13} />
                            </IconButton>
                          )}
                          {zetaUser?.permissions?.includes('UserGroups.DeleteUserGroup') && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupIdForDelete(tab.value);
                                confirmDeleteGroup.onTrue();
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={13} />
                            </IconButton>
                          )}
                          <Tooltip title="Group Details" arrow>
                            <IconButton
                              sx={{
                                fontSize: 24,
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                },
                              }}
                            >
                              <Iconify
                                icon="mdi:information-outline"
                                onClick={() => handleOpenDetailsDialog(tab)}
                              />
                            </IconButton>
                          </Tooltip>
                        </>
                      </Stack>
                    }
                    onClick={() => handleGroupClick(tab)}
                    sx={{
                      borderBottom: isActive ? '2px solid black' : 'none',
                      color: isActive ? 'black' : 'text.primary',
                    }}
                  />
                );
              })}
            </Tabs>
          </Box>

          <Box>
            <MemberTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
              memberOptions={{ members: _members }}
            />
          </Box>
        </Stack>

        {canReset && (
          <MemberTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
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
              <Tooltip title={t('clients.buttons.delete')}>
                <IconButton color="primary" onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{ minWidth: 960, my: 1, tableLayout: 'fixed' }}
            >
              {view === 'list' && (
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
              )}
              {view === 'list' ? (
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <UserTableListRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        index={index + table.page * table.rowsPerPage}
                        onOpenRow={() => handleOpenRow(row.id)}
                        isClientGroup={isClientGroup}
                        hierarchyList={hierarchyList}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  ></TableRow>

                  {Array.from({
                    length: Math.ceil(dataFiltered.length / (isLargeScreen ? 4 : 3)),
                  }).map((_, index) => {
                    const startIdx = index * (isLargeScreen ? 4 : 3);
                    const rows = dataFiltered.slice(startIdx, startIdx + (isLargeScreen ? 4 : 3));

                    return (
                      <TableRow key={index}>
                        <TableCell colSpan={isLargeScreen ? 4 : 3}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {rows.map((row, rowIndex) => (
                              <Box key={row.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Card
                                  sx={{
                                    width: 'auto',
                                    minWidth: 200,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <MemberTableRow
                                    row={row}
                                    selected={table.selected.includes(row.id)}
                                    onSelectRow={() => table.onSelectRow(row.id)}
                                    onDeleteRow={() => handleDeleteRow(row.id)}
                                    onEditRow={() => handleEditRow(row.id)}
                                    onOpenRow={() => handleOpenRow(row.id)}
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
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />
                  <TableNoData notFound={notFound} />
                </TableBody>
              )}
            </Table>
          </Scrollbar>
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
        <AddGroup
          open={members}
          shared={usersList?.users?.filter((user) => user.id !== zetaUser?.id) || []}
          selectedPersons={selectedPersons}
          setSelectedPersons={setSelectedPersons}
          onClick={handleOpenMembers}
          handleClose={handleMemberDialogClose}
          onTogglePerson={handleTogglePerson}
          user={user}
          mode={mode}
          setGroupID={setGroupID}
          setGroupName={setGroupName}
          groupID={groupID}
          groupName={groupName}
          addNewGroup={addNewGroup}
          mutateUsers={mutateUsers}
          mutateUserGroups={mutateUserGroups}
          groupIdToEdit={groupIdToEdit}
        />
        <ConfirmDialog
          open={confirmDeleteGroup.value}
          onClose={confirmDeleteGroup.onFalse}
          title={t('clients.buttons.delete')}
          content={t('clients.dialog.delete_group')}
          action={
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteGroup}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('clients.buttons.delete')}
            </Button>
          }
          sx={{
            direction: storedLang === 'ar' ? 'rtl' : 'ltr',
          }}
        />
        <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} fullWidth maxWidth="xs">
          {groupDetails && (
            <DialogContent>
              <DialogTitle sx={{ ml: 2.5, textAlign: 'center' }}>{groupDetails.label}</DialogTitle>

              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('clients.columns.creator')}:
                </Typography>

                <>
                  <Avatar
                    alt={groupDetails?.creatorUser?.fullName}
                    src={
                      groupDetails?.creatorUser?.profileImageUrl ||
                      groupDetails?.creatorUser?.fullName?.charAt(0).toUpperCase()
                    }
                  />
                  <Typography variant="body2" noWrap>
                    {groupDetails?.creatorUser?.fullName || '.'}
                  </Typography>
                </>
              </Stack>

              <Box sx={{ display: 'flex', mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('clients.columns.created_on')}:
                </Typography>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {fDate(groupDetails?.created) || t('clients.labels.no_availble')}
                </Typography>
              </Box>
            </DialogContent>
          )}

          <DialogActions>
            <Button onClick={handleCloseDetailsDialog} variant="contained">
              {t('clients.buttons.cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, type, member } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) =>
        user.code?.toLowerCase().includes(name.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(name.toLowerCase()) ||
        user.email?.toLowerCase().includes(name.toLowerCase())
    );
  }

  // if (member.length) {
  //   inputData = inputData.filter((user) =>
  //     user.members?.some((person) => member.includes(person.firstName))
  //   );
  // }
  // if (type !== 'all') {
  //   inputData = inputData.filter((user) => user.type === type);
  // }

  return inputData;
}
