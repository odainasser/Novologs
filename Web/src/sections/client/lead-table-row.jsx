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
import { useTranslation } from 'react-i18next';

import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function LeadTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onOpenRow,
  isClientView,
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();

  return (
    <>
      <TableRow
        hover
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
        onClick={onOpenRow}
        sx={{ cursor: 'pointer', minWidth: { lg: '310px', xl: '370px' } }}
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
              {fDate(row?.created) || 'Not Available'}
            </Typography>
          </Box>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row?.name} sx={{ width: 50, height: 50 }}>
              {row?.name ? row?.name.charAt(0) : ''}
            </Avatar>

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Box color="#006A67">{String(row?.serial).padStart(4, '0')}</Box>

              <ListItemText
                sx={{ width: '185px' }}
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

              <Box
                component="span"
                sx={{
                  color: 'text.disabled',
                  fontSize: '0.87rem',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row?.client?.name}
              </Box>

              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <span>
                  <Typography variant="caption" color="text.secondary">
                    {t('leaddetails.common.value')} :{' '}
                  </Typography>
                  {`AED ${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(row?.value || 0)}`}
                  {row?.leadStatus === 0 && ' | '}
                </span>

                {row?.leadStatus === 0 && (
                  <Box
                    component="span"
                    sx={{
                      color: 'text.disabled',
                      fontSize: '0.87rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginLeft: 0.5,
                    }}
                  >
                    {row?.saleStatus?.name?.value || t('clients.labels.no_availble')}
                  </Box>
                )}
              </Box>

              {row?.leadStatus === 1 && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.87rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t('leaddetails.common.awarded_amount')} :{' '}
                  </Typography>
                  {`AED ${new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(row?.awardedValue || 0)}`}
                </Box>
              )}
              {row?.leadStatus === 2 && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.87rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '280px',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t('leaddetails.common.rejected_reason')} :{' '}
                  </Typography>
                  {row.rejectedReason}
                </Box>
              )}
            </Stack>
          </Stack>
          {row?.leadStatus === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Typography variant="caption" sx={{ color: '#003161' }}>
                {row?.probability != null ? `${row.probability}%` : '0%'}
              </Typography>
            </Box>
          )}
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
            {t('leaddetails.buttons.delete')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('clients.buttons.editButton')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('clients.dialog.delete_title')}
        content={t('clients.dialog.delete_content')}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('clients.dialog.delete_title')}
          </Button>
        }
      />
    </>
  );
}
