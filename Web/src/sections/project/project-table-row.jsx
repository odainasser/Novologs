import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useAuthContext } from 'src/auth/hooks';

import { AddMemberDetails } from './add-member-details';

// ----------------------------------------------------------------------

export function ProjectTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onOpenRow,
  projectDepartments,
  isMission,
  isTicket,
}) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const confirm = useBoolean();

  const popover = usePopover();
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const quickEdit = useBoolean();
  const getDepartmentName = (departmentId) =>
    projectDepartments?.find((dep) => dep.id === departmentId)?.name?.value ||
    'Department not available';

  const projectStatusConfig = {
    0: { text: 'Created', textAr: 'تم الإنشاء', color: 'success' },
    1: { text: 'Started', textAr: 'تم البدء', color: 'info' },
    2: { text: 'Closed', textAr: 'مغلق', color: 'default' },
    3: { text: 'Cancelled', textAr: 'تم الإلغاء', color: 'error' },
    4: { text: 'InProgress', textAr: 'قيد التنفيذ', color: 'warning' },
    5: { text: 'Postpone', textAr: 'مؤجل', color: 'secondary' },
    6: { text: 'Amended', textAr: 'معدَّل', color: 'primary' },
    7: { text: 'Reopened', textAr: 'أُعيد فتحه', color: 'info' },
    8: { text: 'Stopped', textAr: 'متوقف', color: 'error' },
  };
  const statusNumber = row?.status;
  let statusText;
  let statusColor;

  if (
    statusNumber !== undefined &&
    statusNumber !== null &&
    projectStatusConfig.hasOwnProperty(statusNumber)
  ) {
    const statusData = projectStatusConfig[statusNumber];

    statusText = storedLang === 'ar' ? statusData?.textAr || statusData?.text : statusData?.text;

    statusColor = projectStatusConfig[statusNumber].color;
  } else {
    statusText = t('projects.fields.created');
    statusColor = 'success';
  }

  const hasAccess =
    row?.projectMembers?.some((member) => member?.memberId === zetaUser?.id) ||
    row?.creator?.id === zetaUser?.id ||
    zetaUser?.permissions?.includes('Project.Read');
  const [isOwner, setIsOwner] = useState(false);

  const [members, setMembers] = useState(false);
  const [owners, setOwners] = useState(false);
  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  const handleOpenOwners = () => {
    setOwners(true);
  };
  const handleOwnerDialogClose = () => {
    setTimeout(() => {
      setOwners(false);
    }, 100);
  };

  const [mode, setMode] = useState('');
  const viewMembers = row?.projectMembers?.filter((member) => !member.isOwner);

  const viewOwners = row?.projectMembers?.filter((member) => member.isOwner);
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
          <Stack spacing={2} direction="row" alignItems="flex-start">
            {!isTicket && (
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: row?.color || 'grey',
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  mt: 1,
                }}
              />
            )}

            <Stack
              sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start', minWidth: 0 }}
            >
              <Box color="#006A67">{String(row?.serial).padStart(4, '0')}</Box>

              <ListItemText
                sx={{
                  width: {
                    xs: '100%',
                    lg: '150px',
                    xl: '180px',
                    textAlign : 'justify'
                  },
                }}
                primary={row?.name}
                primaryTypographyProps={{
                  typography: 'h6',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
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
                }}
              >
                {getDepartmentName(row?.departmentId) || 'Department not available'}
                {/* {!isMission && ` - ${row?.clientName || 'Client not available'}`} */}
              </Box>

              {/* <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:calendar-date-bold" sx={{ color: 'warning.main' }} />
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
                    {`${
                      !row?.startDate || row?.startDate.startsWith('0001-01-01')
                        ? t('projects.employee_card.start_date_not')
                        : fDate(row?.startDate)
                    } - ${
                      !row?.endDate || row?.endDate.startsWith('0001-01-01')
                        ? t('projects.employee_card.end_date_not')
                        : fDate(row?.endDate)
                    }`}
                  </Typography>
                </Stack> */}
              <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                <Box display="flex" flexDirection="column">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Creator: </Typography>
                    <Tooltip key={row?.creator?.id} title={`${row?.creator.fullName}`} arrow>
                      <Avatar
                        alt={row?.creator?.fullName}
                        src={row?.creator?.profileImageFileUrl}
                        sx={{ width: 30, height: 30 }}
                      >
                        {!row?.creator?.profileImageFileUrl && row?.creator?.fullName?.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Owners: </Typography>
                    {row?.projectMembers?.filter((member) => member.isOwner).length > 0 ? (
                      <Box
                        alignItems="center"
                        spacing={1}
                        onClick={() => {
                          setMembers(true);
                          setMode('view');
                          setIsOwner(false);
                        }}
                      >
                        <AvatarGroup sx={{ cursor: 'pointer' }}>
                          {row?.projectMembers
                            .filter((member) => member.isOwner)
                            .slice(0, 2)
                            .map((member) => (
                              <Tooltip key={member?.id} title={`${member?.member.fullName}`} arrow>
                                <Avatar
                                  alt={member.member.fullName}
                                  src={member.member.profileImageFileUrl}
                                  sx={{ width: 30, height: 30 }}
                                >
                                  {!member.member.profileImageFileUrl &&
                                    member.member.fullName?.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          {row?.projectMembers?.filter((member) => member.isOwner).length > 3 && (
                            <Avatar sx={{ width: 30, height: 30 }}>
                              +{row?.projectMembers?.filter((member) => member.isOwner).length - 2}
                            </Avatar>
                          )}
                        </AvatarGroup>
                      </Box>
                    ) : (
                      <Typography variant="caption" component="span">
                        No owners available
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Members: </Typography>
                    {row?.projectMembers?.filter((member) => !member.isOwner).length > 0 ? (
                      <Box
                        alignItems="center"
                        spacing={1}
                        onClick={() => {
                          setMembers(true);
                          setMode('view');
                          setIsOwner(false);
                        }}
                      >
                        <AvatarGroup sx={{ cursor: 'pointer' }}>
                          {row?.projectMembers
                            .filter((member) => !member.isOwner)
                            .slice(0, 2)
                            .map((member) => (
                              <Tooltip key={member?.id} title={`${member?.member.fullName}`} arrow>
                                <Avatar
                                  alt={member.member.fullName}
                                  src={member.member.profileImageFileUrl}
                                  sx={{ width: 30, height: 30 }}
                                >
                                  {!member.member.profileImageFileUrl &&
                                    member.member.fullName?.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          {row?.projectMembers?.filter((member) => !member.isOwner).length > 3 && (
                            <Avatar sx={{ width: 30, height: 30 }}>
                              +{row?.projectMembers?.filter((member) => !member.isOwner).length - 2}
                            </Avatar>
                          )}
                        </AvatarGroup>
                      </Box>
                    ) : (
                      <Typography variant="caption" component="span">
                        {t('projects.status.no_members_available')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Stack>
            <Stack spacing={13}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {(() => {
                  const member = row?.projectMembers?.find((m) => m.memberId === zetaUser?.id);
                  const isCreator = row?.creatorId === zetaUser?.id;

                  if (member) {
                    const { isOwner } = member;
                    return (
                      <Chip
                        label={isOwner ? t('projects.owner') : 'Member'}
                        size="small"
                        icon={
                          <Iconify
                            icon={isOwner ? 'mdi:account-eye' : 'mdi:account-group'}
                            width={16}
                            style={{
                              marginRight: storedLang === 'ar' ? 8 : 0,
                            }}
                          />
                        }
                        sx={{
                          fontWeight: 'bold',
                          borderRadius: '16px',
                          mt: 1,
                          ml: 1,
                          bgcolor: '#006A67',
                          color: 'white',
                        }}
                      />
                    );
                  }

                  if (isCreator) {
                    return (
                      <Chip
                        label="Creator"
                        size="small"
                        icon={
                          <Iconify
                            icon="mdi:account-star"
                            width={16}
                            style={{
                              marginRight: storedLang === 'ar' ? 8 : 0,
                            }}
                          />
                        }
                        sx={{
                          fontWeight: 'bold',
                          borderRadius: '16px',
                          mt: 1,
                          bgcolor: '#006A67',
                          color: 'white',
                        }}
                      />
                    );
                  }

                  return null;
                })()}
              </Box>
              <Box display="flex" justifyContent="right">
                <Tooltip title="Project status" arrow>
                  <Label variant="soft" color={statusColor}>
                    <Typography variant="caption" component="span">
                      {statusText}
                    </Typography>
                  </Label>
                </Tooltip>
              </Box>
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('projects.actions_delete')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('projects.edit')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('projects.actions_delete')}
        content={t('projects.toast.confirm_delete')}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('projects.actions_delete')}
          </Button>
        }
      />
      <AddMemberDetails
        open={owners}
        shared={viewOwners}
        onClick={handleOpenOwners}
        handleClose={handleOwnerDialogClose}
        isOwner={isOwner}
        mode={mode}
      />
      <AddMemberDetails
        open={members}
        shared={viewMembers}
        onClick={handleOpenMembers}
        handleClose={handleMemberDialogClose}
        mode={mode}
        isOwner={isOwner}
      />
    </>
  );
}
