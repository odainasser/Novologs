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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';


// ----------------------------------------------------------------------

export function GroupMemberTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onOpenRow,

}) {
  const{t,i18n}=useTranslation('dashboard/client');
  const confirm = useBoolean();

  const popover = usePopover();



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
            width: '387px',
            py: 1,
          }}
        >
          <TableCell
            sx={{
              width: '100%',
              border: 'none',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Label
                variant="soft"
                color={
                  (row.empStatus === 'On Duty' && 'success') ||
                  (row.empStatus === 'Sick Leave' && 'warning') ||
                  (row.empStatus === 'Vacation' && 'error') ||
                  'default'
                }
              >
                {row.empStatus}
              </Label>
            </Box>
            <Stack spacing={2} direction="row" alignItems="center">
              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <Avatar alt={row.name} src={row.avatarUrl} />
                <Box color="#006A67">{row.empId}</Box>

                <ListItemText
                  primary={row?.name}
                  primaryTypographyProps={{
                    typography: 'h6',
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
                  {row.department} - {row.role}
                </Box>
                <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.87rem' }}>
                  Reporting to : Nowshad RVP
                </Box>
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
        title=  {t("clients.buttons.delete")}
        content= {t("clients.dialog.delete_content2")}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
         {t("clients.buttons.delete")}
          </Button>
        }
      />
    </>
  );
}
