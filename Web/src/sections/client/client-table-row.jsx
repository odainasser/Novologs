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
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function ClientTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onOpenRow,
  isClientView,
  isPurchaseClient,
}) {
  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();
  const { t, i18n } = useTranslation('dashboard/client');

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
          onClick={!isPurchaseClient ? onOpenRow : undefined}
          kutt
          sx={{
            cursor: !isPurchaseClient ? 'pointer' : 'default',
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
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row?.creator?.fullName || t('clients.labels.no_availble')}
              </Typography>
            </Box>
            <Stack spacing={2} direction="row" alignItems="center">
              <Avatar alt={row?.name} src={row?.logoFileUrl} sx={{ width: 50, height: 50 }}>
                {!row?.logoFileUrl && row?.name?.charAt(0)}
              </Avatar>

              <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                <Box color="#006A67">{String(row?.serial).padStart(4, '0')}</Box>
                <ListItemText
                  primary={row?.name}
                  primaryTypographyProps={{
                    typography: 'h6',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
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
                    maxWidth: '180px',
                  }}
                >
                  <Iconify
                    icon="material-symbols:location-on-outline"
                    sx={{ mr: 1, color: '#006A67' }}
                    width={15}
                  />

                  {row?.address || t('clients.labels.no_availble')}
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.87rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    // maxWidth: '180px',
                  }}
                >
                  <Iconify icon="eva:phone-outline" sx={{ mr: 1, color: '#006A67' }} width={15} />

                  {row?.phonenumber || t('clients.labels.no_availble')}
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.87rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    // maxWidth: '180px',
                  }}
                >
                  <Iconify icon="eva:email-outline" sx={{ mr: 1, color: '#006A67' }} width={15} />

                  {row?.email || t('clients.labels.no_availble')}
                </Box>

                <Box
                  component="span"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.87rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    // maxWidth: '180px',
                  }}
                >
                  <Iconify icon="eva:link-2-fill" sx={{ mr: 1, color: '#006A67' }} width={15} />

                  {row?.website || t('clients.labels.no_availble')}
                </Box>
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>
        {isClientView && (
          <TableRow
            selected={selected}
            aria-checked={selected}
            tabIndex={-1}
            onClick={!isPurchaseClient ? onOpenRow : undefined}
            sx={{
              cursor: !isPurchaseClient ? 'pointer' : 'default',
              minWidth: { lg: '320px', xl: '390px' },
            }}
          >
            <TableCell sx={{ border: 'none', pb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Tooltip title="Leads Amount" arrow>
                  <Label variant="soft" color="info">
                    AED {new Intl.NumberFormat().format(row?.leadAmount ?? 0)}
                  </Label>
                </Tooltip>

                <Tooltip title="Sales Amount" arrow>
                  <Label variant="soft" color="success">
                    AED {new Intl.NumberFormat().format(row?.salesAmount ?? 0)}
                  </Label>
                </Tooltip>

                <Tooltip title="Rejected Amount" arrow>
                  <Label variant="soft" color="error">
                    AED {new Intl.NumberFormat().format(row?.rejectedAmount ?? 0)}
                  </Label>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        )}
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
        title={t('clients.buttons.delete')}
        content={t('clients.buttons.delete_content2')}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('clients.buttons.delete')}
          </Button>
        }
      />
    </>
  );
}
