'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { UserQuickEditForm } from './user-quick-edit-form';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onOpenRow,
  userDepartments,
  userDesignations,
  hierarchyList,
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const confirm = useBoolean();
  const storedLang = localStorage.getItem('selectedLang');

  const popover = usePopover();

  const quickEdit = useBoolean();
  const { zetaUser } = useAuthContext();

  const getDepartmentName = (departmentId) => {
    return userDepartments?.find((dep) => dep.id === departmentId)?.name?.value || 'Not Available';
  };

  const getDesignationName = (designationId) => {
    return (
      userDesignations?.find((des) => des.id === designationId)?.name?.value || 'Not Available'
    );
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
              ? 'Super Admin'
              : 'Parent Missing';
        } else {
          repName = 'Super Admin';
        }
      }
    }

    setDerivedHierarchyInfo({ reporterName: repName, level: computedLevel, reporterId: repId });
  }, [row, hierarchyList]);
  const hierarchy = hierarchyList?.hierarchy || [];

  const allMyDescendants = getAllDescendants(hierarchy, zetaUser?.id);

  const hasAccess =
    allMyDescendants.includes(row.id) || row.id === zetaUser?.id || zetaUser?.code === 'ADMIN_INIT';

  return (
    <>
      <TableRow
        hover
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
        onClick={hasAccess ? onOpenRow : undefined}
        sx={{
          opacity: hasAccess ? 1 : 0.8,
          cursor: hasAccess ? 'pointer' : 'not-allowed',
          minWidth: { lg: '320px', xl: '390px' },
        }}
      >
        <TableCell
          sx={{
            border: 'none',
            py: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.8,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Label variant="soft" color={row?.roles?.includes('External') ? 'error' : 'success'}>
              {row?.roles?.includes('External')
                ? t('teams.tabs.external')
                : t('teams.tabs.internal')}
            </Label>

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
              {storedLang === 'ar'
                ? row.lastWorkStatus?.workStatus?.name.localizedStrings?.find(
                    (ls) => ls.language.toLowerCase() === 'ar'
                  )?.value ||
                  row.lastWorkStatus?.workStatus?.name.value ||
                  'على رأس العمل'
                : row.lastWorkStatus?.workStatus?.name.value || 'On Duty'}
            </Label>
          </Box>

          {/* Avatar + Info */}
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar
              alt={row?.fullName}
              src={row?.profileImageFileUrl || ''}
              sx={{ width: 50, height: 50 }}
            >
              {!row?.profileImageFileUrl && row?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Stack sx={{ typography: 'body2', flex: 1, alignItems: 'flex-start' }}>
              <Box color="#006A67">{String(row?.serial).padStart(4, '0')}</Box>
              <ListItemText
                primary={row?.fullName}
                primaryTypographyProps={{
                  typography: 'h6',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                  sx: { direction: 'rtl' },
                }}
                secondaryTypographyProps={{
                  color: 'inherit',
                  component: 'span',
                  typography: 'body2',
                  sx: { opacity: 0.48 },
                }}
              />

              <Box
                component="span"
                sx={{
                  color: 'text.disabled',
                  fontSize: '0.87rem',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '185px', lg: '250px' },
                }}
              >
                {storedLang === 'ar'
                  ? row.departmentName.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value || row.departmentName.value
                  : row.departmentName.value || t('table.headings.not_available')}{' '}
                -{' '}
                {storedLang === 'ar'
                  ? row.designationName.localizedStrings?.find(
                      (ls) => ls.language.toLowerCase() === 'ar'
                    )?.value || row.designationName.value
                  : row.designationName.value || t('table.headings.not_available')}
              </Box>

              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Hierarchy Level" arrow>
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
                      mr: 1,
                    })}
                  />
                </Tooltip>
                <Box
                  component="span"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.87rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: { xs: '185px', lg: '250px' },
                  }}
                >
                  {t('teams.reports_to')} {derivedHierarchyInfo.reporterName || 'Admin'}
                </Box>
              </Box>
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />
    </>
  );
}
