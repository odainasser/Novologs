import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog'; // For High priority
import { useTranslation } from 'react-i18next';

// For Medium priority

// ----------------------------------------------------------------------

export function AssetsManagementTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  isUser,
  tableData,
  hierarchyList,
  allUsers,
  priorityList,
  priorityListEmpty,
  isSubTask,
  index,
  mutate,
  parentTaskId,
  statusList,
  selectedCategory,
  isProject,
  isClient,
  isLead,
  userId,
  isMilestone,
  mutateMilestone,
  categoryList,
  categoryListEmpty,
  setTotalCounts,
  mutateMilestoneTasks,
  selectedButton,
  setSelectedButton,
  handleButtonClick,
  isInvoice,
  isPosted,
  isClientView,
  isNote,
}) {
  const popover = usePopover();
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell
          align="center"
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
        >
          {index + 1}
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          {row.orderNumber}
        </TableCell>




        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date())}
        </TableCell>



        <TableCell
          align="right"
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
        >
          {' '}
          AED{' '}
          {row.amount
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(row.amount))
            : ''}
        </TableCell>
        {!isPosted && (
          <TableCell align="center">
            <Tooltip title={t('accounts.edit')} arrow>
              <Iconify
                icon="solar:pen-bold"
                color="#006A67"
                sx={{
                  mr: storedLang === 'ar' ? 0 : 1,
                  ml: storedLang === 'ar' ? 1 : 0,
                  cursor: 'pointer',
                }}
                width={15}
                height={15}
              />
            </Tooltip>
            <Tooltip title={t('accounts.delete')} arrow>
              <Iconify
                icon="solar:trash-bin-trash-bold"
                onClick={() => {
                  confirm.onTrue();
                }}
                sx={{
                  mr: storedLang === 'ar' ? 0 : 1,
                  ml: storedLang === 'ar' ? 1 : 0,
                  cursor: 'pointer',
                  color: 'error.main',
                }}
                width={15}
                height={15}
              />
            </Tooltip>
           
          </TableCell>
        )}
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('accounts.delete')}
        content={t('accounts.are_you_sure_want')}
        action={
          <Button
            variant="contained"
            color="error"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('accounts.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}
