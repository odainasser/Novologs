'use client';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { varAlpha, stylesMode } from 'src/theme/styles';
import { useTranslation } from 'react-i18next';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { deleteUserFromHierarchy } from 'src/actions/hierarchy/hierarchyActions';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function UserGroupNode({
  sx,
  name,
  id,
  role,
  depth,
  group,
  avatarUrl,
  totalChildren,
  email,
  emailConfirmed,
  isVacant,
  newEmployee,
  addBeforeSave,
  userDepartments,
  mutate,
  onAddEmployee,
  setOpenMembers,
  setDestinationParentNodeId,
  data,
  setIsVacant,
  setNodeDepth,
  isCollapsed,
  handleToggleCollapse,
}) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('dashboard/teams');

  const popover = usePopover();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const onDelete = async () => {
    popover.onClose();
    // if (totalChildren === 0) {
    console.log(`Deleting: ${name} (ID: ${id})`);
    try {
      const response = await deleteUserFromHierarchy(id);
      if (response.success) {
        await mutate();

        toast.success(t('hierarchy.toast.user_success'));
      } else {
        toast.error(response.error || t('hierarchy.toast.user_success'));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
    // }
  };

  const onEdit = () => {
    popover.onClose();
    toast.info(`onEdit: ${name}`);
  };

  const styles = (color) => ({
    color: theme.vars.palette[color].darker,
    bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.08),
    border: `solid 1px ${varAlpha(theme.vars.palette[color].mainChannel, 0.24)}`,
    [stylesMode.dark]: { color: theme.vars.palette[color].lighter },
  });

  const isLabel = depth === 1;

  const rootGr = group === 'root';

  const productGr = group === 'product design';

  const developmentGr = group === 'development';

  const marketingGr = group === 'marketing';
  const muiColors = ['primary', 'info', 'warning', 'success', 'secondary', 'error'];

  const departmentColorMap =
    userDepartments?.reduce((acc, dept, index) => {
      const nameValue =
        storedLang === 'ar'
          ? dept.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')?.value ||
            dept.name?.value
          : dept.name?.value;

      if (nameValue) {
        acc[nameValue] = muiColors[index % muiColors.length];
      }
      return acc;
    }, {}) || {};

  // Get department name in correct language for matching
  const getDeptName = (dept) => {
    return storedLang === 'ar'
      ? dept.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')?.value ||
          dept.name?.value
      : dept.name?.value;
  };

  // Match department using language-based name
  const matchedDepartment = userDepartments?.find((dep) => {
    const depName = getDeptName(dep)?.toLowerCase();
    return depName === group?.toLowerCase();
  });

  // Get correct key for color map
  const matchedName = matchedDepartment ? getDeptName(matchedDepartment) : null;

  const groupColor = departmentColorMap[matchedName] || 'default';

  const handleClick = () => {
    if (newEmployee.fullName && newEmployee.email && addBeforeSave) {
      onAddEmployee(data);
    } else {
      console.log('onClick', data);
      setOpenMembers(true);
      setIsVacant('vacant');
      setDestinationParentNodeId(data?.id);
    }
  };

  return (
    <>
      <Stack sx={{ position: 'relative', display: 'inline-flex' }} alignItems="center">
        {!isLabel && (
          <Avatar
            alt={name}
            src={avatarUrl || ''}
            sx={{
              mt: -3.5,
              zIndex: 9,
              width: 56,
              height: 56,
              position: 'absolute',
              border: `solid 4px ${theme.vars.palette.background.paper}`,
              bgcolor: name ? '' : '#006A67',
            }}
          >
            {!avatarUrl && name?.charAt(0)?.toUpperCase()}
            {!name && (
              <IconButton
                size="small"
                color="primary"
                onClick={
                  addBeforeSave || !zetaUser?.permissions?.includes('Users.AddEmployee')
                    ? undefined
                    : handleClick
                }
                sx={{
                  width: 20,
                  height: 20,
                  // bgcolor: addBeforeSave ? theme.palette.action.disabledBackground : '#006A67',
                  color: 'white',
                  cursor:
                    addBeforeSave || !zetaUser?.permissions?.includes('Users.AddEmployee')
                      ? 'default'
                      : 'pointer',
                }}
              >
                {zetaUser?.permissions?.includes('Users.AddEmployee') ? (
                  <Iconify icon="mingcute:add-line" />
                ) : (
                  <Iconify icon="material-symbols:person" />
                )}
              </IconButton>
            )}
          </Avatar>
        )}

        <Card
          sx={{
            pt: 3,
            pb: 1,
            minWidth: 160,
            borderRadius: 1.5,
            ...(isLabel && { py: 2 }),
            ...(isLabel && groupColor !== 'default' && styles(groupColor)),
            ...sx,
          }}
        >
          {group != 'root' &&
            !addBeforeSave &&
            !isLabel &&
            name &&
            zetaUser?.permissions?.includes('Users.DeleteEmployee') && (
              <IconButton
                size="small"
                onClick={() => setConfirmOpen(true)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main',
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={13} height={13} />
              </IconButton>
            )}

          {/* <IconButton
            disabled={rootGr}
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            sx={{
              top: 8,
              right: 8,
              position: 'absolute',
              ...(isLabel && { display: 'none' }),
            }}
          >
            <Iconify icon="eva:more-horizontal-fill" />
          </IconButton> */}

          {depth !== 1 && !rootGr && (
            <Box
              sx={{
                top: 0,
                left: 0,
                width: 1,
                height: 4,
                position: 'absolute',
                borderRadius: 1.5,
                ...(groupColor !== 'default' && { bgcolor: `${groupColor}.light` }),
              }}
            />
          )}
          {totalChildren > 0 && (
            <IconButton
              size="small"
              onClick={handleToggleCollapse}
              sx={{
                position: 'absolute',
                top: 4.5,
                left: 4,
                bgcolor: 'background.paper',
                color: '#006A67',
                border: `1px solid ${theme.vars.palette.divider}`,
                zIndex: 1, // Ensure it's above other elements
                width: 13,
                height: 13,
                padding: 1,
              }}
            >
              <Iconify icon={isCollapsed ? 'ic:round-plus' : 'ic:round-minus'} />
            </IconButton>
          )}

          {totalChildren > 0 && ( // Keep this IconButton here, now using the props
            <IconButton
              size="small"
              onClick={handleToggleCollapse} // This will now be defined
              sx={{
                position: 'absolute',
                top: 4.5,
                left: 4,
                bgcolor: 'background.paper',
                color: '#006A67',
                border: `1px solid ${theme.vars.palette.divider}`,
                zIndex: 1, // Ensure it's above other elements
                width: 13,
                height: 13,
                padding: 1,
              }}
            >
              <Iconify icon={isCollapsed ? 'ic:round-plus' : 'ic:round-minus'} />
            </IconButton>
          )}

          <Typography
            variant={isLabel ? 'subtitle1' : 'subtitle2'}
            noWrap
            color={name ? 'text.primary' : 'error'}
            sx={{ display: 'flex', alignItems: 'center', maxWidth: 160, justifyContent: 'center' }}
          >
            <Box
              component="span"
              sx={{
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                mt: 0.5,
                direction: 'rtl',
              }}
            >
              {name || 'Vacant'}
            </Box>

            {group !== 'root' && (
              <Label color={groupColor !== 'default' ? groupColor : 'default'} sx={{ ml: 1 }}>
                {totalChildren}
              </Label>
            )}
          </Typography>

          {!isLabel && (
            <Typography
              noWrap
              component="div"
              variant="caption"
              sx={{
                mt: 0.5,
                color: 'text.secondary',
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {role}
            </Typography>
          )}
          {!isLabel && (
            <Typography
              noWrap
              component="div"
              variant="caption"
              sx={{
                mt: 0.5,
                color: 'text.secondary',
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              {email}
            </Typography>
          )}
          {!isLabel && name !== undefined && name !== null && (
            <Box
              sx={{
                mt: 0.7,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  px: 0.9,
                  py: 0.3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  borderRadius: 5,
                  bgcolor: emailConfirmed ? 'rgba(34,197,94,0.10)' : 'rgba(255,152,0,0.10)',
                  color: emailConfirmed ? 'success.main' : 'warning.main',
                  maxWidth: '90%',
                }}
              >
                <Iconify
                  width={12}
                  icon={emailConfirmed ? 'solar:verified-check-bold' : 'solar:danger-triangle-bold'}
                />

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {emailConfirmed ? 'Email Confirmed' : 'Email Not Confirmed'}
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'left-center' } }}
      >
        <MenuList>
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('hierarchy.toast.delete')}
          </MenuItem>

          <MenuItem onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
            {t('hierarchy.toast.edit')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogTitle> {t('hierarchy.toast.are_sure')}</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('hierarchy.toast.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmOpen(false);
              onDelete(); // call the deletion logic
            }}
          >
            {t('hierarchy.toast.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
