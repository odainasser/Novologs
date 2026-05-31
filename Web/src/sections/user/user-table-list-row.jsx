'use client';

import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useDoubleClick } from 'src/hooks/use-double-click';

import { UserQuickEditForm } from './user-quick-edit-form';
import Typography from '@mui/material/Typography';
import { FaWindows, FaAndroid, FaApple, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme, useMediaQuery } from '@mui/material';
import TextField from '@mui/material/TextField';
import { toast } from 'src/components/snackbar';
import { designations, departments } from 'src/sections/user/user-mock-data';
import { AddUserImage } from './add-user-image';
import { AddUserDetails } from './add-user-details';
import {
  updateUser,
  deactivateUser,
  deleteUser,
  resendEmail,
} from 'src/actions/userSettings/userSettingsActions';
import { fDate } from 'src/utils/format-time';
import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ReactCountryFlag from 'react-country-flag';
import { countries } from 'src/assets/data';
import { getSalesTarget } from 'src/actions/client/clientActions';
import { AddTarget } from 'src/sections/client/add-target';
import { AddCurrency } from 'src/sections/settings/add-currency';
import { AddPermissions } from './add-permissions';

// ----------------------------------------------------------------------

export function UserTableListRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onAddMore,

  index,
  onOpenRow,
  onOpenPermissions,
  onOpenShowHideMenu,
  tableData,
  setTableData,
  isClientGroup,
  userRoles,
  userDepartments,
  userDesignations,
  mutate,
  hierarchyList,
  mutateHierarchyList,
}) {
  console.log('this is the departments', userDepartments);
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser, checkUserSession } = useAuthContext();
  const confirmDeactivate = useBoolean();
  const confirmActivate = useBoolean();
  const confirmDelete = useBoolean();
  const confirmResendEmail = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();
  const theme = useTheme();
  const [mode, setMode] = useState('add');

  const targetDetails = useBoolean();
  const handleOpenTargetDetails = useDoubleClick({
    click: () => {
      targetDetails.onTrue();
    },
    doubleClick: () => console.info('DOUBLE CLICK'),
  });
  const [year, setYear] = useState('2025');

  const getTargetParams = useMemo(() => {
    if (targetDetails.value && row?.id) {
      return {
        userId: row?.id,
        year,
      };
    }
    return null;
  }, [targetDetails.value, row?.id]);

  const {
    salesTarget,
    salesTargetLoading,
    salesTargetError,
    salesTargetValidating,
    salesTargetEmpty,
    mutate: mutateSalesTarget,
  } = getSalesTarget(getTargetParams);

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [editingUserId, setEditingUserId] = useState(null);
  const [newEmpId, setNewEmpId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [branch, setBranch] = useState('');
  const [openImage, setOpenImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [preview, setPreview] = useState('');
  const [profileImageFileId, setProfileImageFileId] = useState('');

  console.log('this is the avatar URL', avatarUrl);
  useEffect(() => {
    if (typeof avatarUrl === 'string') {
      setPreview(avatarUrl);
    } else if (avatarUrl instanceof File) {
      setPreview(URL.createObjectURL(avatarUrl));
    }
  }, [avatarUrl]);

  const handleOpenImage = () => {
    setOpenImage(true);
  };
  const handleImageDialogClose = () => {
    setTimeout(() => {
      setOpenImage(false);
    }, 100);
  };

  const [details, setDetails] = useState(false);
  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };

  const [permissions, setPermissions] = useState(false);
  const handleOpenPermissions = () => {
    setPermissions(true);
  };
  const handlePermissionsDialogClose = () => {
    setTimeout(() => {
      setPermissions(false);
    }, 100);
  };

  const [address, setAddress] = useState('');

  const [hourlyRate, setHourlyRate] = useState(0);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationality, setNationality] = useState('');

  const [isExternal, setIsExternal] = useState(false);

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

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setNewEmpId(user.code);
    setNewName(user.fullName);
    setNewEmail(user.email);
    setNewRole(user.designationId || '');
    setNewDepartment(user.departmentId || '');
    setAddress(user.address || '');
    setHourlyRate(user.hourlyRate || '');
    setPhoneNumber(user.phoneNumber || '');
    setNationality(user.country || '');
    setIsExternal(user.userType !== 0);
    setSelectedRights(user.roles || []);
    setBranch(user.companyBranchId || '');
  };

  const handleUpdateUser = async () => {
    const payload = {
      userId: editingUserId,
      code: newEmpId,
      fullName: newName,
      email: newEmail,
      designationId: newRole || row?.designationId,
      departmentId: newDepartment || row?.departmentId,
      profileImageFileId: profileImageFileId || row?.profileImageFileId,
      address: address || row.address,
      hourlyRate: parseFloat(hourlyRate) || row.hourlyRate,
      phoneNumber: phoneNumber,
      companyBranchId: branch || row?.companyBranchId,
      country: nationality || row?.country,
      userType: isExternal ? 1 : 0,
      roles: selectedRights,
    };

    console.log('this is the payload', payload);
    try {
      const response = await updateUser(payload);
      if (response.success) {
        toast.success(t('success_messages.user_updated'));

        setEditingUserId(null);
        setNewEmpId('');
        setNewName('');
        setNewEmail('');
        setNewRole('');
        setNewDepartment('');
        setAvatarUrl(null);
        setPreview('');
        setProfileImageFileId('');
        setSelectedRights([]);
        await mutate();
        await mutateHierarchyList();
        if (typeof checkUserSession === 'function') {
          await checkUserSession();
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add update failed:', error);
    }
  };
  const clearField = () => {
    setEditingUserId(null);
  };

  const handleSaveDetailsFromDialog = (detailsFromDialog) => {
    setAddress(detailsFromDialog.address);
    setHourlyRate(detailsFromDialog.hourlyRate);
    setPhoneNumber(detailsFromDialog.phoneNumber);
    setBranch(detailsFromDialog.branch);
    setNationality(detailsFromDialog.nationality);
    setSelectedRights(detailsFromDialog.roles);
    setIsExternal(detailsFromDialog.userType);
  };

  const [derivedHierarchyInfo, setDerivedHierarchyInfo] = useState({
    reporterId: '',
    reporterName: '',
  });
  const getAllDescendants = (hierarchy, employeeId) => {
    const descendants = [];

    const findChildren = (parentId) => {
      const children = hierarchy.filter((item) => item.parentStructureId === parentId);
      for (const child of children) {
        descendants.push(child.employeeId);
        findChildren(child.id);
      }
    };

    const userItem = hierarchy.find((item) => item.employeeId === employeeId);
    if (userItem) {
      findChildren(userItem.id);
    }

    return descendants;
  };
  useEffect(() => {
    let repId = '';

    let repName = '';
    let computedLevel = 0;

    if (hierarchyList?.hierarchy && row.id) {
      const hierarchy = hierarchyList.hierarchy;

      const userHierarchyItem = hierarchy.find((item) => item.employeeId === row.id);
      console.log('User Hierarchy Item:', userHierarchyItem);

      let currentItem = userHierarchyItem;
      while (currentItem) {
        computedLevel++;

        if (!currentItem.parentStructureId) break;
        currentItem = hierarchy.find((item) => item.id === currentItem.parentStructureId);
      }

      if (userHierarchyItem) {
        if (userHierarchyItem.parentStructureId) {
          const parentItem = hierarchy.find(
            (item) => item.id === userHierarchyItem.parentStructureId
          );
          repId = parentItem?.employeeId;

          repName = parentItem?.employee?.fullName
            ? `${parentItem.employee.fullName}`
            : parentItem
              ? t('teams.super_admin')
              : t('teams.parent_missing');
        } else {
          repName = t('teams.super_admin');
        }
      }
    }

    setDerivedHierarchyInfo({ reporterName: repName, level: computedLevel, reporterId: repId });
  }, [row, hierarchyList]);
  let hasAccess = false;
  let hasActionAccess = false;

  if (!isClientGroup) {
    const hierarchy = hierarchyList?.hierarchy || [];
    const allMyDescendants = getAllDescendants(hierarchy, zetaUser?.id);

    hasAccess =
      allMyDescendants.includes(row.id) ||
      row.id === zetaUser?.id ||
      zetaUser?.code === 'ADMIN_INIT';

    // hasActionAccess = allMyDescendants.includes(row.id) || zetaUser?.roles?.includes('SuperAdmin');
    hasActionAccess =
      zetaUser?.permissions?.includes('Users.UpdateEmployee') ||
      zetaUser?.permissions?.includes('Users.ActivateDeactivateUser') ||
      zetaUser?.code === 'ADMIN_INIT';
  } else {
    hasAccess = zetaUser?.permissions?.includes('UserGroups.ReadUserGroup');
  }

  const isSuperAdmin = row?.code === 'ADMIN_INIT';

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

  const onDeactivateRow = async () => {
    const payload = {
      userId: row?.id,
      isActive: false,
    };
    try {
      const response = await deactivateUser(payload);
      if (response.success) {
        toast.success('User deactivated successfully');
        await mutate();
        confirmDeactivate.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Deactivated user failed:', error);
    }
  };

  const onDeleteRow = async () => {
    const payload = {
      userId: row?.id,
    };
    try {
      const response = await deleteUser(payload);
      if (response.success) {
        toast.success('User deleted successfully');
        await mutate();
        confirmDelete.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Delete user failed:', error);
    }
  };
  const onResendEmail = async () => {
    const payload = {
      userId: row?.id,
    };
    try {
      const response = await resendEmail(payload);
      if (response.success) {
        toast.success('Email resent successfully');
        await mutate();
        confirmResendEmail.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Resend email failed:', error);
    }
  };
  const onActivateRow = async () => {
    const payload = {
      userId: row?.id,
      isActive: true,
    };
    try {
      const response = await deactivateUser(payload);
      if (response.success) {
        toast.success('User Activated successfully');
        await mutate();
        confirmActivate.onFalse();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Activate user failed:', error);
    }
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        {/* <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          <Box>{index + 1}</Box>
        </TableCell> */}

        <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          <Typography variant="body2" fontWeight="bold">
            {String(row?.serial).padStart(4, '0')}
          </Typography>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          {editingUserId === row.id ? (
            <TextField
              fullWidth
              size="small"
              value={newEmpId}
              onChange={(e) => setNewEmpId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateUser();
                }
              }}
              autoFocus
            />
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant={row?.code ? 'body1' : 'caption'}
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {row?.code || t('table.headings.not_available')}
              </Typography>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          <Box display="flex" gap={1} alignItems="center">
            {editingUserId === row.id ? (
              <Avatar
                onClick={() => {
                  setOpenImage(true);
                }}
                src={preview || row?.profileImageFileUrl}
                sx={{ width: 30, height: 30, cursor: 'pointer' }}
              />
            ) : (
              <Box>
                <Avatar
                  alt={row?.fullName}
                  src={row?.profileImageFileUrl || undefined}
                  sx={{ width: 30, height: 30 }}
                >
                  {!row?.profileImageFileUrl && row?.fullName?.[0]?.toUpperCase()}
                </Avatar>
              </Box>
            )}
            {editingUserId === row.id ? (
              <TextField
                fullWidth
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateUser();
                  }
                }}
                autoFocus
              />
            ) : (
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      direction: 'rtl',
                    }}
                  >
                    {row?.fullName || t('table.headings.not_available')}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Typography variant="caption">{t('table.headings.device')}:</Typography>
                  {row?.lastLoginInfo?.deviceType === 1 ? (
                    <FaAndroid style={{ width: '18px', height: '18px', color: '#3DDC84' }} />
                  ) : row?.lastLoginInfo?.deviceType === 2 ? (
                    <FaApple style={{ width: '18px', height: '18px', color: '#555555' }} />
                  ) : row?.lastLoginInfo?.deviceType === 3 ? (
                    <FaGlobe style={{ width: '18px', height: '18px', color: '#4285F4' }} />
                  ) : (
                    <FaWindows style={{ width: '18px', height: '18px', color: '#00A4EF' }} />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          <Box
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* {row?.isActive ? (
                <Tooltip title={t('teams.active_user')} arrow>
                  <Iconify
                    icon="mdi:check-circle"
                    sx={{ color: 'success.main' }}
                    width={13}
                    height={13}
                  />
                </Tooltip>
              ) : (
                <Tooltip title={t('teams.deactivated_user')} arrow>
                  <Iconify
                    icon="mdi:cancel"
                    sx={{ color: 'text.disabled' }}
                    width={13}
                    height={13}
                  />
                </Tooltip>
              )} */}
              {row?.emailConfirmed ? (
                <Tooltip title="Email Confirmed" arrow>
                  <Iconify
                    icon="solar:verified-check-bold"
                    sx={{ color: 'success.main', mt: 0.5 }}
                    width={13}
                    height={13}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Email Not Confirmed" arrow>
                  <Iconify
                    icon="solar:danger-triangle-bold"
                    sx={{ color: 'warning.main', mt: 0.5 }}
                    width={13}
                    height={13}
                  />
                </Tooltip>
              )}
              <Typography
                variant="body1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {row?.email || t('table.headings.not_available')}
              </Typography>
            </Box>

            {/* Created On */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {`${t('teams.created_on')}: ${
                !row?.created || row?.created.startsWith('0001-01-01')
                  ? t('table.headings.not_available')
                  : fDate(row.created)
              }`}
            </Typography>
          </Box>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          {editingUserId === row.id ? (
            <TextField
              select
              fullWidth
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateUser();
                }
              }}
              autoFocus
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
              {userDesignations?.map((designation) => (
                <MenuItem key={designation.id} value={designation.id}>
                  {storedLang === 'ar'
                    ? designation.name.localizedStrings?.find(
                        (ls) => ls.language.toLowerCase() === 'ar'
                      )?.value || designation.name.value
                    : designation.name.value}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {storedLang === 'ar'
                  ? row.designationName.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value || row.designationName.value
                  : row.designationName.value || t('table.headings.not_available')}
              </Typography>

              {/* Flex container for Label and Roles */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1, // take remaining space
                    minWidth: 0, // important for ellipsis to work with flex
                    color: '#006A67',
                  }}
                >
                  {t('role.roles')}:{' '}
                  {row?.roles?.length
                    ? row.roles.map((role) => role.replace(/([a-z])([A-Z])/g, '$1 $2')).join(', ')
                    : t('table.headings.not_available')}
                </Typography>
                <Label
                  variant="soft"
                  color={row?.roles?.includes('External') ? 'error' : 'success'}
                  sx={{
                    flexShrink: 0, // prevent shrinking
                  }}
                >
                  {/* {row.userType === 0
                    ? 'Internal'
                    : row.userType === 1
                      ? 'External'
                      : row.userType === 2
                        ? 'My Team'
                        : 'Internal'} */}
                  {row?.roles?.includes('External')
                    ? t('teams.tabs.external')
                    : t('teams.tabs.internal')}
                </Label>
              </Box>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          {editingUserId === row.id ? (
            <TextField
              select
              fullWidth
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateUser();
                }
              }}
              autoFocus
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
              {userDepartments.map((department) => {
                const displayName = getDepartmentPath(department, userDepartments);
                return (
                  <MenuItem key={department.id} value={department.id}>
                    {displayName}
                  </MenuItem>
                );
              })}
            </TextField>
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {storedLang === 'ar'
                  ? row.departmentName.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value || row.departmentName.value
                  : row.departmentName.value || t('table.headings.not_available')}
              </Typography>
              <Box display="flex" gap={1} alignItems="center" justifyContent="space-between">
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    display: 'block',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#006A67',
                  }}
                >
                  <Box component="span">{t('teams.branch')}:</Box>{' '}
                  {row?.companyBranchName || t('table.headings.not_available')}
                </Typography>
              </Box>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={editingUserId ? 'center' : ''}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
        >
          {editingUserId === row.id ? (
            <Tooltip title={t('tooltip.edit_user_details')} arrow>
              <IconButton
                onClick={() => {
                  setAddress(row.address || '');
                  setHourlyRate(row.hourlyRate || '');
                  setPhoneNumber(row.phoneNumber || '');
                  setBranch(row.companyBranchId || '');
                  setNationality(row.country || '');
                  setIsExternal(row.userType !== 0);
                  setSelectedRights(row.roles || []);
                  setDetails(true);
                }}
              >
                <Iconify icon="mdi:account-edit" sx={{ color: '#006A67' }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <ReactCountryFlag
                  countryCode={
                    countries?.find((country) => country.label === row.country)?.code || 'AE'
                  }
                  svg
                  style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                />
                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                  }}
                >
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
                    {row?.country || t('table.headings.not_available')}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Iconify icon="eva:phone-fill" width={13} color="#006A67" />

                <Box
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                  }}
                >
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
                    {row?.phoneNumber || t('table.headings.not_available')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
          align={storedLang === 'ar' ? 'right' : 'left'}
        >
          {row.code === 'ADMIN_INIT' ? (
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
              {t('teams.super_admin')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Box sx={{ display: 'flex' }}>
                  <Chip
                    label={
                      derivedHierarchyInfo?.level === 1
                        ? derivedHierarchyInfo.level
                        : derivedHierarchyInfo?.level - 1
                    }
                    color="success"
                    size="small"
                    sx={(theme) => ({
                      borderRadius: '50%',
                      px: 0,
                      backgroundColor: alpha(theme.palette.success.main, 0.25),
                      color: theme.palette.success.main,
                      fontWeight: 'bold',
                    })}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                    }}
                  >
                    {t('teams.reports_to')}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
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
                  {derivedHierarchyInfo.reporterName || t('teams.admin')}
                </Typography>
              </Box>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
            borderRight: isClientGroup
              ? '1px dotted rgba(200, 200, 200, 0.6)'
              : !isClientGroup
                ? '1px dotted rgba(200, 200, 200, 0.6)'
                : 'none',
          }}
          onClick={hasAccess && editingUserId !== row.id ? onOpenRow : undefined}
          align={storedLang === 'ar' ? 'right' : 'left'}
        >
          <Box
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            <Label
              variant="soft"
              color={
                !row.lastWorkStatus?.workStatus?.name?.value
                  ? 'success'
                  : row.lastWorkStatus.workStatus.name.value === 'On Duty'
                    ? 'success'
                    : 'warning'
              }
            >
              {
                storedLang === 'ar'
                  ? row.lastWorkStatus?.workStatus?.name.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value ||
                    row.lastWorkStatus?.workStatus?.name.value ||
                    'على رأس العمل' // Arabic fallback for "On Duty"
                  : row.lastWorkStatus?.workStatus?.name.value || 'On Duty' // English fallback
              }
            </Label>
          </Box>
        </TableCell>

        {!isClientGroup ? (
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
                gap: 1,
              }}
            >
              {editingUserId === row.id ? (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateUser}
                      size="small"
                      sx={{
                        bgcolor: '#006A67',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        textTransform: 'none',
                        padding: '4px 10px',
                      }}
                    >
                      {t('table.actions.update')}
                    </Button>
                    <Tooltip title={t('table.actions.cancel')} arrow>
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
                </>
              ) : (
                <>
                  {hasActionAccess && (
                    <IconButton
                      color={popover.open ? 'inherit' : 'default'}
                      onClick={hasActionAccess ? popover.onOpen : undefined}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
          </TableCell>
        ) : (
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
                gap: 1,
              }}
            >
              <IconButton onClick={handleOpenTargetDetails}>
                <Iconify icon="fa:bullseye" width={20} color="#006A67" />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: {
            placement: storedLang === 'ar' ? 'left-top' : 'right-top',
          },
        }}
        sx={{
          ...(storedLang === 'ar' && {
            direction: 'rtl',
            textAlign: 'right',
          }),
        }}
      >
        <MenuList>
          {zetaUser?.permissions?.includes('Users.UpdateEmployee') && (
            <>
              {!row?.roles?.includes('External') && (
                <MenuItem
                  // onClick={() => {
                  //   setPermissions(true);
                  // }}
                  onClick={onOpenPermissions}
                >
                  <Iconify
                    icon="mdi:key"
                    sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                  />
                  {t('role.permissions')}
                </MenuItem>
              )}

              {/* <MenuItem
                onClick={() => {
                  onAddMore();
                  popover.onClose();
                }}
              >
                <Iconify
                  icon="ic:round-add"
                  sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                {t('table.actions.addmore')}
              </MenuItem> */}
              <MenuItem
                onClick={() => {
                  handleEditUser(row);
                  popover.onClose();
                }}
              >
                <Iconify
                  icon="solar:pen-bold"
                  sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                {t('table.actions.edit')}
              </MenuItem>
              <MenuItem onClick={onOpenShowHideMenu}>
                <Iconify
                  icon="mdi:eye-settings-outline"
                  sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                Show/Hide Menu
              </MenuItem>
            </>
          )}

          {row.isActive &&
            zetaUser?.permissions?.includes('Users.ActivateDeactivateUser') &&
            row?.emailConfirmed &&
            !isSuperAdmin && (
              <>
                <MenuItem
                  onClick={() => {
                    confirmDeactivate.onTrue();
                    popover.onClose();
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Iconify
                    icon="mdi:account-off"
                    sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                  />
                  {t('table.actions.deactivate')}
                </MenuItem>
              </>
            )}
          {row.isActive && !row?.emailConfirmed && (
            <>
              <MenuItem
                onClick={() => {
                  confirmDelete.onTrue();
                  popover.onClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify
                  icon="solar:trash-bin-trash-bold"
                  sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                Delete
              </MenuItem>

              <MenuItem
                onClick={() => {
                  confirmResendEmail.onTrue();
                  popover.onClose();
                }}
              >
                <Iconify
                  icon="solar:letter-bold"
                  sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                Resend Email
              </MenuItem>
            </>
          )}
          {!row.isActive && zetaUser?.permissions?.includes('Users.ActivateDeactivateUser') && (
            <>
              <MenuItem
                onClick={() => {
                  confirmActivate.onTrue();
                  popover.onClose();
                }}
                sx={{ color: '#006A67' }}
              >
                <Iconify
                  icon="mdi:account-lock-open"
                  sx={{ mr: storedLang === 'ar' ? 0 : 0.5, ml: storedLang === 'ar' ? 1 : 0 }}
                />
                Activate
              </MenuItem>
            </>
          )}
        </MenuList>
      </CustomPopover>
      <ConfirmDialog
        open={confirmDeactivate.value}
        onClose={confirmDeactivate.onFalse}
        title={t('table.actions.deactivate')}
        content={t('table.deactivate_message')}
        action={
          <Button variant="contained" color="error" onClick={onDeactivateRow}>
            {t('table.actions.deactivate')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmActivate.value}
        onClose={confirmActivate.onFalse}
        title={t('profile.activate')}
        content={t('profile.are-you-sure-activated')}
        action={
          <Button variant="contained" sx={{ bgcolor: '#006A67' }} onClick={onActivateRow}>
            {t('profile.activate')}
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete User"
        content="Are you sure you want to delete this user? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmResendEmail.value}
        onClose={confirmResendEmail.onFalse}
        title="Resend Email"
        content="Are you sure you want to resend the activation email?"
        action={
          <Button variant="contained" sx={{ bgcolor: '#006A67' }} onClick={onResendEmail}>
            Resend Email
          </Button>
        }
      />
      <AddUserImage
        open={openImage}
        onClick={handleOpenImage}
        handleClose={handleImageDialogClose}
        avatarUrl={avatarUrl || row?.profileImageFileUrl}
        setAvatarUrl={setAvatarUrl}
        setProfileImageFileId={setProfileImageFileId}
      />
      <AddUserDetails
        mode="edit"
        open={details}
        shared={userRoles}
        selectedRights={selectedRights}
        setSelectedRights={setSelectedRights}
        onClick={handleOpenDetails}
        handleClose={handleDetailsDialogClose}
        onToggleRights={handleToggleRights}
        setAddress={setAddress}
        setHourlyRate={setHourlyRate}
        hourlyRate={hourlyRate}
        setPhoneNumber={setPhoneNumber}
        setNationality={setNationality}
        setBranch={setBranch}
        address={address}
        phoneNumber={phoneNumber}
        branch={branch}
        nationality={nationality}
        addNewDetails={handleSaveDetailsFromDialog}
        isExternal={isExternal}
        setIsExternal={setIsExternal}
        isSuperAdmin={isSuperAdmin}
      />
      <AddPermissions
        open={permissions}
        selectedRights={selectedRights}
        setSelectedRights={setSelectedRights}
        onClick={handleOpenPermissions}
        handleClose={handlePermissionsDialogClose}
        onToggleRights={handleToggleRights}
        addNewDetails={handleSaveDetailsFromDialog}
        mutateUserList={mutate}
        userId={row.id}
      />
      <AddTarget
        open={targetDetails.value}
        handleClose={targetDetails.onFalse}
        mode={mode}
        memberId={row?.id}
        memberName={row?.fullName}
        salesTargetLength={salesTarget?.totalTarget}
        mutateSalesTarget={mutateSalesTarget}
        existingTarget={salesTarget?.target || []}
      />
    </>
  );
}
