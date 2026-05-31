'use client';
import { useState, useEffect } from 'react';
import { useSetState } from 'src/hooks/use-set-state';

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Tooltip,
  Card,
} from '@mui/material';

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
import { DashboardContent } from 'src/layouts/dashboard';
import { RolesTableToolbar } from './roles-table-toolbar';
import { RolesTableFiltersResult } from './roles-table-filters-result';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  getAllUserRoles,
  addRoles,
  deleteRole,
  unassignPermissionToRole,
  addPermissionDescription,
  assignPermissionToUser,
  getPermissionList,
  unassignPermissionToUser,
} from 'src/actions/user-manage/userManageActions';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import IconButton from '@mui/material/IconButton';
import { AddPermissions } from './add-permissions';
import { Scrollbar } from 'src/components/scrollbar';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { Description } from '@mui/icons-material';
import { varAlpha } from 'src/theme/styles';

export function RolesView({
  isUser,
  userPermissions = [],
  userPersonalPermissions = [],
  userRoles = [],
  userId,
  mutateUserDetails,
}) {
  const { userRolesList, userRolesListLoading, userRolesListEmpty, userRolesListError, mutate } =
    getAllUserRoles();

  const { t } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const [tableData, setTableData] = useState([]);
  const TABLE_HEAD = [
    { id: 'serialNo', label: t('table.headings.serialNo'), width: '4%', align: 'center' },
    {
      id: 'name',
      label: t('role.permission'),
      width: '25%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'category',
      label: t('table.headings.category'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'role',
      label: t('role.role'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    { id: '', label: t('table.headings.actions'), width: '11%', align: 'center' },
  ];

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });

  const { permissionList } = getPermissionList();
  const filters = useSetState({
    name: '',
    roles: [],
  });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const groupedPermissions = dataFiltered.reduce((acc, currentPerm) => {
    const key = currentPerm.name;

    if (!acc[key]) {
      // If the permission name hasn't been seen yet, initialize it
      acc[key] = {
        ...currentPerm,
        roleName: currentPerm.roleName, // Start with the first role name
      };
    } else {
      // If it has been seen, append the new roleName (if not already present)
      const existingRoles = acc[key].roleName.split(', ');
      if (!existingRoles.includes(currentPerm.roleName)) {
        acc[key].roleName += `, ${currentPerm.roleName}`;
      }
    }
    return acc;
  }, {});

  // Convert the grouped object back into an array for table rendering
  const finalTableData = Object.values(groupedPermissions);

  const stabilizedThis = finalTableData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = getComparator(table.order, table.orderBy)(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  const sortedFinalTableData = stabilizedThis.map((el) => el[0]);

  const paginatedData = sortedFinalTableData.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !!filters.state.name || filters.state.roles.length > 0;
  const notFound = (!sortedFinalTableData.length && canReset) || !sortedFinalTableData.length;

  const confirmDeleteRole = useBoolean();
  const confirmUnassign = useBoolean();
  const confirmUnassignAll = useBoolean();

  const confirmAssign = useBoolean();
  const confirmUnassignPermission = useBoolean();

  const [permissionToUnassign, setPermissionToUnassign] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleForDelete, setRoleForDelete] = useState(null);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedRights, setSelectedRights] = useState([]);
  const [permissionDescId, setPermissionDescId] = useState(null);
  const [permissionDescRole, setPermissionDescRole] = useState(null);
  const [permissionId, setPermissionId] = useState(null);

  const [isAssign, setIsAssign] = useState(false);

  const [newPermDescription, setNewPermDescription] = useState('');

  const handleEditDescription = (perm) => {
    setPermissionDescId(perm.id);
    setPermissionDescRole(perm.roleName);
    setNewPermDescription(perm.description);
  };

  const clearField = () => {
    setPermissionDescId(null);
    setPermissionDescRole(null);
  };
  const handleToggleRights = (role) => {
    setSelectedRights((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(role);
      if (isAlreadySelected) {
        return prevSelected.filter((r) => r !== role);
      }
      return [...prevSelected, role];
    });
  };

  // --- helpers ---
  const formatPermissionName = (str) => str.replace(/([a-z])([A-Z])/g, '$1 $2');

  const getCategoryFromPermission = (name) => {
    if (!name) return '';
    return name.split('.')[0]; // first segment is category
  };

  const handleDeleteRole = async () => {
    if (!roleForDelete) return;

    try {
      const response = await deleteRole(roleForDelete);
      if (response.success) {
        await mutate();
        toast.success(t('role.role_deleted'));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      confirmDeleteRole.onFalse();
      setRoleForDelete(null);
    }
  };

  useEffect(() => {
    if (userRolesList?.roles.length) {
      setTableData([...userRolesList?.roles]);
    } else {
      setTableData([]);
    }
  }, [userRolesList]);

  const handleUnassignPermission = async () => {
    const payload = {
      roleId: tabs.value,
      permissionIds: [permissionToUnassign?.id],
    };
    try {
      const response = await unassignPermissionToRole(payload);
      if (response.success) {
        toast.success(t('role.permissions_unassigned'));

        setPermissionToUnassign(null);

        await mutate();

        confirmUnassign.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unassign Permissions failed:', error);
    }
  };

  const handleUnassignAllPermissions = async () => {
    const currentRole = userRolesList?.roles?.find((r) => r.id === tabs.value);
    if (!currentRole) return;

    const permissionIds = currentRole.permissions.map((p) => p.id);

    const payload = {
      roleId: tabs.value,
      permissionIds,
    };

    try {
      const response = await unassignPermissionToRole(payload);
      if (response.success) {
        toast.success(t('role.all_permissions'));
        await mutate();
        confirmUnassignAll.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unassign all permissions failed:', error);
    }
  };
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setNewRoleName('');
    setOpenDialog(false);
  };

  const handleAddRole = async () => {
    const payload = { name: newRoleName };
    try {
      const response = await addRoles(payload);
      if (response.success) {
        toast.success(t('roles.role_added'));
        setNewRoleName('');
        await mutate();
        setOpenDialog(false);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add role:', error);
    }
  };
  const handlePermission = async () => {
    const assignedPermissionIds = permissionList.permissions
      ?.filter((p) => userPersonalPermissions.includes(p.name))
      .map((p) => p.id);

    const updatedPermissionIds = Array.from(new Set([...assignedPermissionIds, permissionId]));
    let payload = {
      userIds: [userId],
    };
    if (isAssign) {
      payload.permissionIds = updatedPermissionIds;
    } else {
      payload.permissionIds = [permissionId];
    }
    try {
      let response;
      if (isAssign) {
        response = await assignPermissionToUser(payload);
      } else {
        response = await unassignPermissionToUser(payload);
      }

      if (response.success) {
        toast.success(
          isAssign ? t('role.permissions_added_user') : t('role.permissions_removed_user')
        );
        if (isAssign) {
          confirmAssign.onFalse();
        } else {
          confirmUnassignPermission.onFalse();
        }
        await mutateUserDetails();
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add Permissions failed:', error);
    }
  };

  const handleOpenPermissionDialog = (roleId, roleName) => {
    setSelectedRoleId(roleId);
    setSelectedRoleName(roleName);
    setOpenPermissionDialog(true);
  };

  const handleClosePermissionDialog = () => {
    setSelectedRoleId(null);
    setSelectedRoleName('');
    setOpenPermissionDialog(false);
  };

  const handleAssignPermission = () => {
    // TODO: call API to assign selected permissions
    toast.success(t('roles.permissions_assigned'));
    handleClosePermissionDialog();
  };

  const handleAddDescription = async () => {
    const payload = {
      id: permissionDescId,
      description: newPermDescription,
    };

    try {
      const response = await addPermissionDescription(payload);
      if (response.success) {
        toast.success(t('role.description_added'));
        setPermissionDescId(null);
        setPermissionDescRole(null);

        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add description failed:', error);
      toast.error(error || t('role.description_added_fail'));
    }
  };
  if (userRolesListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)',
          }}
        />
      </div>
    );
  if (userRolesListError) {
    return <ErrorView errorCode={userRolesListError} />;
  }

  return (
    <>
      <Box display="flex" justifyContent="end">
        {/* {!isUser && (
          <Stack spacing={1} sx={{ p: 1, pl: 0 }}>
            <Button
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{ ml: 1 }}
              variant="contained"
              onClick={handleOpenDialog}
            >
              Add Role
            </Button>
          </Stack>
        )} */}
      </Box>
      <Card sx={{ mt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            px: 1,
            py: 0,
            pt: 0.2,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          <RolesTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            allRoles={{
              allRoles: userRolesList?.roles.map((role) => role.name),
            }}
          />
        </Box>

        {canReset && (
          <RolesTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Scrollbar>
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
                  padding: table.dense ? '6px' : '10px',
                },
              }}
            >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
              />
              <TableBody>
                {paginatedData.map((perm, index) => (
                  <TableRow key={perm.id}>
                    <TableCell align="center">
                      {table.page * table.rowsPerPage + index + 1}
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatPermissionName(perm.name.split('.').slice(-1)[0])}
                      </Typography>
                      {permissionDescId === perm?.id && permissionDescRole === perm?.roleName ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={newPermDescription}
                          onChange={(e) => setNewPermDescription(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <Typography variant="caption">
                          {perm?.description || 'Description not available'}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#006A67' }}>
                        {formatPermissionName(getCategoryFromPermission(perm.name))}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" sx={{ color: '#006A67' }}>
                        {formatPermissionName(perm.roleName)}
                      </Typography>
                    </TableCell>

                    {!isUser ? (
                      <TableCell align="center">
                        {permissionDescId === perm?.id && permissionDescRole === perm?.roleName ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Tooltip
                              title={perm?.description ? t('role.edit_description') : t('role.add_description')}
                              arrow
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={handleAddDescription}
                                sx={{
                                  color: 'primary.contrastText',
                                  '&:hover': { bgcolor: 'primary.dark' },
                                  textTransform: 'none',
                                  padding: '6px 12px',
                                  bgcolor: '#006A67',
                                }}
                              >
                                {perm?.description ? t('role.update') : t('role.add')}
                              </Button>
                            </Tooltip>
                            <Tooltip title={t("tables.actions.clear")} arrow>
                              <Iconify
                                icon="solar:trash-bin-trash-bold"
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
                        ) : (
                          <Tooltip
                            title={perm?.description ? t('role.edit_description') : t('role.add_description')}
                            arrow
                          >
                            <Iconify
                              onClick={() => {
                                handleEditDescription(perm);
                              }}
                              icon={
                                perm?.description
                                  ? 'mdi:clipboard-edit-outline'
                                  : 'mdi:clipboard-text-outline'
                              }
                              color="#006A67"
                              sx={{
                                mr: storedLang === 'ar' ? 0 : 1,
                                ml: storedLang === 'ar' ? 1 : 0,
                                cursor: 'pointer',
                              }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    ) : (
                      <TableCell align="center">
                        {userPermissions?.includes(perm?.name) &&
                        !userPersonalPermissions?.includes(perm?.name) &&
                        !userRoles?.includes(perm.roleName) ? (
                          <Tooltip title={t('role.role_permissions_cannot_be_edit')}>
                            <span>
                              <Button variant="contained" size="small" disabled>
                              {t('role.unassign')}
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={
                              userRoles?.includes(perm.roleName) &&
                              userPermissions?.includes(perm?.name) &&
                              !userPersonalPermissions?.includes(perm?.name)
                                ? t('role.role_permissions_cannot_be_edit')
                                : ''
                            }
                          >
                            <span>
                              <Button
                                variant="contained"
                                size="small"
                                disabled={
                                  userRoles?.includes(perm.roleName) &&
                                  userPermissions?.includes(perm?.name) &&
                                  !userPersonalPermissions?.includes(perm?.name)
                                }
                                onClick={
                                  userPermissions?.includes(perm?.name)
                                    ? () => {
                                        setPermissionId(perm?.id);
                                        confirmUnassignPermission.onTrue();
                                        setIsAssign(false);
                                      }
                                    : () => {
                                        setPermissionId(perm?.id);
                                        confirmAssign.onTrue();
                                        setIsAssign(true);
                                      }
                                }
                                sx={{
                                  backgroundColor: userPermissions?.includes(perm?.name)
                                    ? 'error.main'
                                    : '#006A67',
                                  '&:hover': {
                                    backgroundColor: userPermissions?.includes(perm?.name)
                                      ? 'error.dark'
                                      : '#005b58',
                                  },
                                  textTransform: 'none',
                                }}
                              >
                                {userPermissions?.includes(perm?.name) ? t('role.unassign') : t('role.assign')}
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePaginationCustom
          page={table.page}
          rowsPerPageOptions={[100, 150, 250]}
          dense={table.dense}
          count={finalTableData.length}
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
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('role.add_role')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label={t('role.role_name')}
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('role.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleAddRole}
            disabled={!newRoleName.trim()}
            sx={{ bgcolor: '#006A67' }}
          >
            {t('role.Add')}
          </Button>
        </DialogActions>
      </Dialog>
      <AddPermissions
        open={openPermissionDialog}
        selectedRights={selectedRights}
        setSelectedRights={setSelectedRights}
        handleClose={handleClosePermissionDialog}
        onToggleRights={handleToggleRights}
        mutateRolesList={mutate}
        roleId={selectedRoleId}
        isRolePermission={true}
      />

      <ConfirmDialog
        open={confirmDeleteRole.value}
        onClose={confirmDeleteRole.onFalse}
        title={t('role.delete')}
        content={t('role.confirm_delete')}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRole}>
            {t('role.delete')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmUnassign.value}
        onClose={confirmUnassign.onFalse}
        title={t('role.unassign_Permission')}
        content={`${t('role.are_you_sure_want')} "${formatPermissionName(permissionToUnassign?.name || '')}" ${t('role.from_this')}`}
        action={
          <Button variant="contained" color="error" onClick={handleUnassignPermission}>
            {t('role.unassign')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmUnassignAll.value}
        onClose={confirmUnassignAll.onFalse}
        title={t('role.unassign_all_permission')}
        content={`${t('role.unassign_sure')}`}
        action={
          <Button variant="contained" color="error" onClick={handleUnassignAllPermissions}>
            {t('role.unassignall')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmAssign.value}
        onClose={confirmAssign.onFalse}
        title={t('role.assign')}
        content={t('role.assign_sure')}
        action={
          <Button
            variant="contained"
            onClick={handlePermission}
            sx={{
              '&:hover': { bgcolor: '#006A67' },
              bgcolor: '#006A67',
            }}
          >
            {t('role.assign')}
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmUnassignPermission.value}
        onClose={confirmUnassignPermission.onFalse}
        title={t('role.unassign')}
        content={t('role.unassign_user_role')}
        action={
          <Button variant="contained" color="error" onClick={handlePermission}>
            {t('role.unassign')}
          </Button>
        }
      />
    </>
  );
}
function applyFilter({ inputData, comparator, filters }) {
  const { name, roles } = filters;

  let permissions = inputData.flatMap(
    (role) =>
      role.permissions?.map((perm) => ({
        ...perm,
        roleName: role.name,
      })) || []
  );

  const stabilizedThis = permissions.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  permissions = stabilizedThis.map((el) => el[0]);

  if (name) {
    const lowerName = name.toLowerCase().replace(/\s/g, '');

    permissions = permissions.filter((perm) => {
      const prepareString = (str) => str?.toLowerCase().replace(/\s/g, '');

      const nameMatch = prepareString(perm.name)?.includes(lowerName);
      const descriptionMatch = prepareString(perm.description)?.includes(lowerName);
      const roleNameMatch = prepareString(perm.roleName)?.includes(lowerName);

      return nameMatch || descriptionMatch || roleNameMatch;
    });
  }

  if (roles.length) {
    permissions = permissions.filter((perm) => roles.includes(perm.roleName));
  }

  return permissions;
}
