import { useState } from 'react';

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
import { useTranslation } from 'react-i18next';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { fDate, fTime } from 'src/utils/format-time';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { background } from 'src/theme/core';
import { KanbanMembers } from './kanban-members';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'; // For High priority
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'; // For Medium priority
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDoubleClick } from 'src/hooks/use-double-click';
import { KanbanDetails } from './details/kanban-details';
import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function KanbanSubTaskTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
}) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const details = useBoolean();

  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();
  const [mode, setMode] = useState('view');
  const { user } = useMockedUser();
  const [members, setMembers] = useState(false);

  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };

  const handleClick = useDoubleClick({
    click: () => {
      details.onTrue();
    },
    doubleClick: () => console.info('DOUBLE CLICK'),
  });
  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell
          onClick={handleClick}
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align='center'
        >
          {index + 1}
        </TableCell>

        <TableCell
          onClick={handleClick}
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
        >
          {row.isSubTask ? (
            <Stack alignItems="center">
              <Typography variant="caption" color="textSecondary">
                {String(row?.parentTaskId).padStart(5, '0')}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {String(row?.taskId).padStart(5, '0')}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" fontWeight="bold">
              {String(row?.taskId).padStart(5, '0')}
            </Typography>
          )}
        </TableCell>

        <TableCell
          onClick={handleClick}
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
        >
          <ListItemText
            primary={row?.title?.split(' ').slice(0, 5).join(' ')}
            secondary={row?.title?.split(' ').slice(5).join(' ')}
            primaryTypographyProps={{
              typography: 'body2',
              sx: {
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
            }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              sx: {
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
            }}
          />
        </TableCell>

        <TableCell
          sx={{ whiteSpace: 'nowrap', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          onClick={() => {
            setMembers(true);
          }}
        >
          {row?.members && row?.members.length > 0 ? (
            <>
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title={`${user?.displayName}`} arrow>
                  <Avatar
                    alt={user?.displayName}
                    src={user?.photoURL}
                    sx={{ width: 30, height: 30 }}
                  />
                </Tooltip>
                <AvatarGroup sx={{ cursor: 'pointer' }}>
                  {row?.members.slice(0, 2).map((person) => (
                    <Tooltip key={person?.id} title={`${person?.firstName}`} arrow>
                      <Avatar
                        key={person.id}
                        alt={person.firstName}
                        src={person.photoPath}
                        sx={{ width: 30, height: 30 }}
                      />
                    </Tooltip>
                  ))}
                  {row?.members.length > 3 && (
                    <Avatar sx={{ width: 30, height: 30 }}>+{row?.members.length - 2}</Avatar>
                  )}
                </AvatarGroup>
              </Box>
              <KanbanMembers
                open={members}
                shared={row?.members}
                onClick={handleOpenMembers}
                handleClose={handleMemberDialogClose}
                mode={mode}
              />
            </>
          ) : (
            <Typography variant="caption" component="span">
              {t("tasks.not_available")}
            </Typography>
          )}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={handleClick}
        >
          <ListItemText
            primary={`${fDate(row?.startDate || '2025-03-25T11:28:34+04:00')}, ${fTime(row?.startDate || '2025-03-25T11:28:34+04:00')}`}
            secondary={`${fDate(row?.startDate || '2025-03-25T11:28:34+04:00')}, ${fTime(row?.startDate || '2025-03-25T11:28:34+04:00')}`}
            primaryTypographyProps={{
              typography: 'body2',
              sx: {
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
            }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              sx: {
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
            }}
          />
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={handleClick}
        >
          <ListItemText
            primary={`${fDate(row?.endDate || '2025-03-25T11:28:34+04:00')}, ${fTime(row?.endDate || '2025-03-25T11:28:34+04:00')}`}
            secondary={`${fDate(row?.endDate || '2025-03-25T11:28:34+04:00')}, ${fTime(row?.endDate || '2025-03-25T11:28:34+04:00')}`}
            primaryTypographyProps={{
              typography: 'body2',
              sx: {
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
            }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              sx: {
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              },
            }}
          />
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={handleClick}
        >
          {row?.category ? (
            row.category
          ) : (
            <Typography variant="caption" component="span">
               {t("tasks.not_available")}
            </Typography>
          )}
        </TableCell>

        <TableCell
          onClick={handleClick}
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
        >
          <Label
            variant="soft"
            color={
              row?.priority === 'High'
                ? 'error'
                : row?.priority === 'Low'
                  ? 'info'
                  : row?.priority === 'Medium'
                    ? 'warning'
                    : 'info'
            }
            sx={{
              minWidth: '70px',
            }}
          >
            {row?.priority || 'Low'}
          </Label>
        </TableCell>

        {/* <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={handleClick}
        >
          {row?.weight || 0}
        </TableCell> */}

        <TableCell align="center">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      <KanbanDetails
        task={row}
        openDetails={details.value}
        onCloseDetails={details.onFalse}
        // onUpdateTask={handleUpdateTask}
        // onDeleteTask={handleDeleteTask}
      />

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
            {t('tasks.delete')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('tasks.edit')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.delete')}
        content={t('tasks.comfirm_delete')}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('tasks.delete')}
          </Button>
        }
      />
    </>
  );
}
