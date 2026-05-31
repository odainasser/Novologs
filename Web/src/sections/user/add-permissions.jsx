import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslation } from 'react-i18next';
import {
  getPermissionList,
  assignPermissionToUser,
  assignPermissionToRole,
  updateUserPermission,
  updateRolePermission,
} from 'src/actions/userManage/userManageActions';
import { toast } from 'src/components/snackbar';
import { getUserDetail } from 'src/actions/userManage/userManageActions';

// ----------------------------------------------------------------------

export function AddPermissions({
  open,
  handleClose,
  selectedRights,
  setSelectedRights,
  onToggleRights,
  addNewDetails,
  mutateUserList,
  userId,
  mutateRolesList,
  roleId,
  userRolesList,
  isRolePermission,
  ...other
}) {
  const { t } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const shouldFetchUser = open && !isRolePermission && userId;

  const {
    userDetails,
    userDetailsLoading,
    userDetailsError,
    mutate: mutateUserDetails,
  } = getUserDetail(shouldFetchUser ? userId : null);
  console.log('this is the user details', userDetails?.details);

  const {
    permissionList,
    permissionListLoading,
    permissionListError,
    permissionListValidating,
    permissionListEmpty,
    mutate: mutatePermissions,
  } = getPermissionList();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter permissions by search
  const filteredShared =
    permissionList.permissions?.filter((right) =>
      right.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  useEffect(() => {
    if (!open) return;

    if (isRolePermission && roleId) {
      const currentRole = userRolesList?.roles?.find((r) => r.id === roleId);

      if (currentRole?.permissions?.length > 0) {
        const assignedPermissions =
          permissionList.permissions
            ?.filter((right) => currentRole.permissions.some((perm) => perm.name === right.name))
            .map((right) => right.id) || [];

        setSelectedRights(assignedPermissions);
      } else {
        setSelectedRights([]);
      }
    } else if (userDetails?.details?.permissions?.length > 0) {
      const assignedPermissions =
        permissionList.permissions
          ?.filter((right) => userDetails.details.permissions.includes(right.name))
          .map((right) => right.id) || [];

      setSelectedRights(assignedPermissions);
    }
  }, [open, isRolePermission, roleId, permissionList, userDetails, mutateRolesList]);

  const handleCloseDialog = () => {
    setSearchQuery('');
    handleClose();
  };

  const handleCancelDialog = () => {
    setSearchQuery('');
    handleClose();
    setSelectedRights([]);
  };
  const handleAddDetail = async () => {
    const detail = { permissionIds: selectedRights };
    console.log('this is the details', detail);

    if (isRolePermission) {
      const payload = {
        roleId,
        permissionIds: detail.permissionIds,
      };

      try {
        let response;

        const currentRole = userRolesList?.roles?.find((r) => r.id === roleId);

        if (!currentRole?.permissions || currentRole.permissions.length === 0) {
          response = await assignPermissionToRole(payload);
        } else {
          response = await updateRolePermission(payload);
        }

        if (response.success) {
          toast.success(
            !currentRole?.permissions || currentRole.permissions.length === 0
              ? t('role.permissions_added_role')
              : t('role.permissions_updated_role')
          );

          setSelectedRights([]);
          await mutateRolesList();
          handleCloseDialog();
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add/Update Role Permissions failed:', error);
      }
    } else {
      let payload = {
        permissionIds: detail.permissionIds,
      };

      if (userDetails?.details?.permissions.length === 0) {
        payload.userIds = [userId];
      } else {
        payload.userId = userId;
      }
      console.log('this is the payload', payload);

      try {
        let response;
        if (userDetails?.details?.permissions.length === 0) {
          response = await assignPermissionToUser(payload);
        } else {
          response = await updateUserPermission(payload);
        }

        if (response.success) {
          toast.success(
            userDetails?.details?.permissions.length === 0
              ? t('role.permissions_added_user')
              : t('role.permissions_updated')
          );

          setSelectedRights([]);
          await mutateUserDetails();
          await mutateUserList();
          handleCloseDialog();
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add/Update User Permissions failed:', error);
      }
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleCloseDialog}
      sx={{
        '& .MuiDialog-paper': {
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      <DialogTitle>{t('role.permissions')}</DialogTitle>
      <Box sx={{ px: 3 }}>
        <TextField
          fullWidth
          placeholder={t('role.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 1,
            '& .MuiInputBase-input': {
              padding: '10px 14px',
            },
            '& .MuiInputLabel-root': {
              top: '-7px',
            },
          }}
        />
      </Box>

      {filteredShared.length > 0 ? (
        <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            <Box display="flex" justifyContent="flex-end" sx={{ my: 1 }}>
              <FormControlLabel
                label={t('role.select_all')}
                control={
                  <Checkbox
                    checked={
                      filteredShared.length > 0 && selectedRights.length === filteredShared.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRights(filteredShared.map((r) => r.id));
                      } else {
                        setSelectedRights([]);
                      }
                    }}
                  />
                }
              />
            </Box>

            {Object.entries(
              filteredShared.reduce((acc, right) => {
                const [category, ...rest] = right.name.split('.');
                const rawAction = rest.join('.');

                // Function to format: remove dots and split PascalCase
                const formatAction = (str) =>
                  str
                    .replace(/\./g, ' ') // replace dots with spaces
                    .replace(/([a-z])([A-Z])/g, '$1 $2'); // split camelCase / PascalCase

                const action = formatAction(rawAction);

                if (!acc[category]) acc[category] = [];
                acc[category].push({ ...right, action });
                return acc;
              }, {})
            ).map(([category, rights]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#006A67' }}>
                  {category}
                </Typography>

                {rights.map((right) => (
                  <SelectUserDetails
                    key={right.id}
                    right={{ ...right, name: right.action }}
                    isSelected={selectedRights.includes(right.id)}
                    onToggleRights={() => onToggleRights(right.id)}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Scrollbar>
      ) : (
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {t('role.no_permissions_available')}
          </Typography>
        </Box>
      )}

      <DialogActions>
        <Button
          variant="contained"
          onClick={handleCancelDialog}
          sx={storedLang === 'ar' ? { ml: 2 } : {}}
        >
          {t('role.cancel')}
        </Button>
        {isRolePermission && (
          <Button variant="contained" onClick={handleAddDetail} sx={{ bgcolor: '#006A67' }}>
            {selectedRights.length === 0 ? t('role.Add') : t('table.actions.save')}
          </Button>
        )}
        {!isRolePermission && (
          <>
            {userDetails?.details?.permissions.length === 0 && (
              <Button variant="contained" onClick={handleAddDetail} sx={{ bgcolor: '#006A67' }}>
                {t('role.Add')}
              </Button>
            )}
            {userDetails?.details?.permissions.length > 0 && (
              <Button variant="contained" onClick={handleAddDetail} sx={{ bgcolor: '#006A67' }}>
                {t('table.actions.save')}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function SelectUserDetails({ right, isSelected, onToggleRights }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <ListItemText
        primary={right.name}
        primaryTypographyProps={{ noWrap: true, typography: 'body2', color: 'text.secondary' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />
      <Checkbox checked={isSelected} onChange={onToggleRights} />
    </Box>
  );
}
