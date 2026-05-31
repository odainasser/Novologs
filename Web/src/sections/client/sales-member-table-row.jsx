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
import { FaWindows } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';


// ----------------------------------------------------------------------

export function SalesMemberTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
  onOpenRow,
}) {
  const{t ,i18n}=useTranslation('dashboard/client');

  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();

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
          {row?.empId || '000'}
        </TableCell>
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          onClick={onOpenRow}
        >
          <Stack spacing={2} direction="row" alignItems="center" sx={{ display: '-webkit-box' }}>
            <Avatar alt={row?.name} src={row?.avatarUrl} sx={{ width: 30, height: 30 }} />

            {row?.name || t('clients.labels.no_availble')}
          </Stack>
          <Stack spacing={2} direction="row" alignItems="center">
            <Typography variant="caption" sx={{ ml: 6 }}>
              Device:
            </Typography>

            <FaWindows style={{ width: '18px', height: '18px', color: '#00A4EF' }} />
          </Stack>
        </TableCell>


        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={onOpenRow}
        >
          {row?.role || t('clients.labels.no_availble')}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={onOpenRow}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">{row?.department ||  t('clients.labels.no_availble')}</Typography>
            <Typography variant="caption">Working under Nowshad RVP</Typography>
          </Box>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={onOpenRow}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Iconify icon="eva:email-fill" sx={{ mr: 1 }} width={13} />
              {row?.email || t('clients.labels.no_availble')}
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Iconify icon="eva:phone-fill" sx={{ mr: 1 }} width={13} />

              {row?.phoneNumber ||  t('clients.labels.no_availble')}
            </Stack>
          </Box>
        </TableCell>

        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          onClick={onOpenRow}
        >
          <Label
            variant="soft"
            color={
              (row?.empStatus === 'On Duty' && 'success') ||
              (row?.empStatus === 'Sick Leave' && 'warning') ||
              (row?.empStatus === 'Vacation' && 'error') ||
              'default'
            }
          >
            {row?.empStatus ? (
              row.empStatus
            ) : (
              <Typography variant="caption" component="span">
                On Duty
              </Typography>
            )}
          </Label>
        </TableCell>


      </TableRow>


    </>
  );
}
