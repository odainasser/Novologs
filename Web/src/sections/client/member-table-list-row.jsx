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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useMockedUser } from 'src/auth/hooks';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import { ClientMembers } from './client-members';

// ----------------------------------------------------------------------

export function MemberTableListRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
  onOpenRow,
}) {
  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();
  const [mode, setMode] = useState('view');

  const [members, setMembers] = useState(false);
  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  const { user } = useMockedUser();

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          onClick={onOpenRow}
        >
          {index + 1}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={onOpenRow}
        >
          {row?.groupId || '000'}
        </TableCell>
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          onClick={onOpenRow}
        >
          <Stack spacing={2} direction="row" alignItems="center" sx={{ display: '-webkit-box' }}>
            <Box>{row?.name || t('clients.labels.no_availble')}</Box>
          </Stack>
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
              <ClientMembers
                open={members}
                shared={row?.members.filter((member) => member.email !== user.email)}
                onClick={handleOpenMembers}
                handleClose={handleMemberDialogClose}
                mode={mode}
              />
            </>
          ) : (
            <Typography variant="caption" component="span">
            {t('clients.labels.no_availble')}
            </Typography>
          )}
        </TableCell>

        <TableCell align="center">
          <Stack direction="row" alignItems="center">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
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
            {t("clients.buttons.delete")}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t("clients.buttons.edit")}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title=     {t("clients.buttons.delete")}
        content=  {t("clients.dialog.delete_content2")}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
           {t("clients.buttons.delete")}
          </Button>
        }
      />
    </>
  );
}
