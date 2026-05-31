'use client';
import { useState, useEffect } from 'react';

import { useTabs } from 'src/hooks/use-tabs';
import { DashboardContent } from 'src/layouts/dashboard';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import {
  getAllUserRoles,
  addRoles,
  deleteRole,
  unassignPermissionToRole,
} from 'src/actions/user-manage/userManageActions';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { AddPermissions } from './add-permissions';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function PermissionsView() {
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  const { userRolesList, mutate } = getAllUserRoles();

  const tabs = useTabs(null);
  const confirmDeleteRole = useBoolean();
  const confirmUnassign = useBoolean();
  const confirmUnassignAll = useBoolean();
  const [permissionToUnassign, setPermissionToUnassign] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleForDelete, setRoleForDelete] = useState(null);

  // new state for permissions dialog
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedRights, setSelectedRights] = useState([]);

  const handleToggleRights = (role) => {
    setSelectedRights((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(role);
      if (isAlreadySelected) {
        return prevSelected.filter((r) => r !== role);
      }
      return [...prevSelected, role];
    });
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

  const handleUnassignPermission = async () => {
    console.log('Unassign permission', permissionToUnassign, 'from role', tabs.value);

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

  useEffect(() => {
    if (userRolesList?.roles?.length > 0) {
      const stillExists = userRolesList.roles.some((r) => r.id === tabs.value);
      if (!stillExists) {
        tabs.onChange(null, userRolesList.roles[0].id);
      }
    } else {
      tabs.onChange(null, null);
    }
  }, [userRolesList, tabs]);

  const TABS =
    userRolesList?.roles?.map((data) => ({
      value: data?.id,
      label: data?.name,
    })) || [];

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
        handleCloseDialog();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add role:', error);
    }
  };

  // --- Add Permission Handlers ---
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
    console.log('Assign permissions to role:', selectedRoleId);
    // TODO: call API to assign selected permissions
    toast.success(t('roles.permissions_assigned'));
    handleClosePermissionDialog();
  };
  // group permissions into nested structure
  const groupPermissions = (permissions) => {
    const grouped = {};

    permissions?.forEach((perm) => {
      const parts = perm.name.split('.');
      let current = grouped;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? [] : {};
        }
        if (index === parts.length - 1) {
          current[part].push({ id: perm.id, name: perm.name });
        } else {
          current = current[part];
        }
      });
    });

    return grouped;
  };
  const formatPermissionName = (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  const renderPermissions = (permissionsObj) => {
    return Object.entries(permissionsObj).map(([key, value]) => {
      if (Array.isArray(value)) {
        // ✅ leaf-level permissions in flex row
        return (
          <Box key={key} sx={{ ml: 3, mt: 0.5 }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={3}>
              {value.map((perm) => (
                <Stack
                  key={perm.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 220 }}
                >
                  <Checkbox
                    checked
                    onClick={confirmUnassign.onTrue}
                    onChange={() => setPermissionToUnassign(perm)}
                  />
                  <Typography variant="body2">{formatPermissionName(key)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        );
      }

      // ✅ nested group with title + children
      return (
        <Box key={key} sx={{ ml: 2, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#006A67', mb: 1 }}>
            {formatPermissionName(key)}
          </Typography>

          {/* children flex */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', ml: 2 }}>{renderPermissions(value)}</Box>
        </Box>
      );
    });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb:2
        }}
      >
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ flexGrow: 1 }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Stack direction="row" alignItems="center" spacing={0.2}>
                  <Typography variant="subtitle2" sx={{ color: '#006A67' }}>
                    {formatPermissionName(tab.label)}
                  </Typography>
                  {/* <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoleForDelete(tab.value);
                      confirmDeleteRole.onTrue();
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={13} />
                  </IconButton> */}
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>
      {/* <Box display="flex" justifyContent="end">
        <Stack>
          <Button
            startIcon={<Iconify icon="mingcute:add-line" />}
            variant="contained"
            onClick={handleOpenDialog}
            sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}
          >
            {t('role.new_role')}
          </Button>
        </Stack>
      </Box> */}

      {tabs.value &&
        (() => {
          const currentRole = userRolesList?.roles?.find((r) => r.id === tabs.value);
          const grouped = groupPermissions(currentRole?.permissions || []);
          const hasPermissions = currentRole?.permissions?.length > 0;

          return (
            <>
              <Stack direction="row" spacing={2}>
                {hasPermissions ? (
                  <Button
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    variant="outlined"
                    onClick={() => handleOpenPermissionDialog(currentRole.id, currentRole.name)}
                  >
                    {t('role.EditPermissions')}
                  </Button>
                ) : (
                  <Button
                    startIcon={<Iconify icon="mdi:shield-plus-outline" />}
                    variant="outlined"
                    onClick={() => handleOpenPermissionDialog(currentRole.id, currentRole.name)}
                  >
                    {t('role.add_permission_role')}
                  </Button>
                )}
                {hasPermissions && (
                  <Button
                    startIcon={<Iconify icon="mdi:shield-off-outline" />}
                    variant="outlined"
                    color="error"
                    onClick={confirmUnassignAll.onTrue}
                  >
                    {t('role.unassignall')}
                  </Button>
                )}
              </Stack>

              {Object.keys(grouped || {}).length === 0 ? (
                <EmptyContent
                  filled
                  sx={{ py: 10, mt: 1 }}
                  title={t('role.no_permissions')}
                  description={t('role.no_permission_available_role')}
                />
              ) : (
                <Box
                  mt={3}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{t('role.assigned_permissions')}</Typography>
                    {renderPermissions(grouped)}
                  </Box>
                </Box>
              )}
            </>
          );
        })()}

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
        userRolesList={userRolesList}
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
        content="Are you sure you want to unassign this permission from this role?"
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
    </>
  );
}
