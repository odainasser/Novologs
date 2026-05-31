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

import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import AvatarGroup from '@mui/material/AvatarGroup';
import { useMockedUser } from 'src/auth/hooks';
import IconButton from '@mui/material/IconButton';
import {useTranslation} from 'react-i18next';



// ----------------------------------------------------------------------

export function MemberTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onOpenRow }) {
  const confirm = useBoolean();

  const popover = usePopover();

  const { user } = useMockedUser();
  const{t,i18n}=useTranslation('dashboard/client');

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TableRow
          hover
          selected={selected}
          aria-checked={selected}
          tabIndex={-1}
          onClick={onOpenRow}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            py: 1,
            width: '390px',
          }}
        >
          <TableCell
            sx={{
              width: '100%',
              border: 'none',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <IconButton
                size="small"
                sx={{
                  cursor: 'pointer',
                }}
              >
                <Iconify icon="solar:pen-bold" width={15} />
              </IconButton>

              <IconButton
                size="small"
                color="error"
                sx={{
                  cursor: 'pointer',
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={15} />
              </IconButton>
            </Box>

            <Stack spacing={2} direction="row" alignItems="center">
              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <Box color="#006A67">{row.groupId}</Box>
                <ListItemText
                  primary={row?.name}
                  primaryTypographyProps={{
                    typography: 'h6',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    // maxWidth: '180px',
                  }}
                  secondaryTypographyProps={{
                    color: 'inherit',
                    component: 'span',
                    typography: 'body2',
                    sx: { opacity: 0.48 },
                  }}
                />
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
                        {row?.members.map((person) => (
                          <Tooltip key={person?.id} title={`${person?.firstName}`} arrow>
                            <Avatar
                              key={person.id}
                              alt={person.firstName}
                              src={person.photoPath}
                              sx={{ width: 30, height: 30 }}
                            />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </Box>
                  </>
                ) : (
                  <Typography variant="caption" component="span">
      {t('clients.labels.no_members_available')}
                 
                  </Typography>
                )}
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>
      </Box>

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
           {t('clients.buttons.delete')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('clients.buttons.edit')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title=      {t('clients.buttons.delete')}
        content=      {t('clients.dialog.delete_content2')}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
         {t('clients.buttons.delete')}
          </Button>
        }
      />
    </>
  );
}
