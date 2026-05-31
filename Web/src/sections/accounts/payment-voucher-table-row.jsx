import { useState, useMemo, useCallback, useEffect } from 'react';

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
import { fDate, fTime } from 'src/utils/format-time';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { background } from 'src/theme/core';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'; // For High priority
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'; // For Medium priority
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDoubleClick } from 'src/hooks/use-double-click';
import { useMockedUser } from 'src/auth/hooks';

import TextField from '@mui/material/TextField';
import { toast } from 'src/components/snackbar';

import {
  _status,
  _projects,
  _categories,
  _members,
  priorityOptions,
} from 'src/sections/kanban/kanban-mock-data';
import { Field } from 'src/components/hook-form';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { updateTask, changeStatus, addTask } from 'src/actions/task/taskActions';

import { useAuthContext } from 'src/auth/hooks';
import { getDocument } from 'src/actions/document/documentActions';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import ReactPlayer from 'react-player';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { addFile } from 'src/actions/file/fileActions';
import CircularProgress from '@mui/material/CircularProgress';
import { addMilestoneTasks } from 'src/actions/project/projectActions';
import { AddLocalPurchaseOrder } from './add-local-purchase-order';

// ----------------------------------------------------------------------

export function PaymentVoucherTableRow({
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
  isReceipt,
}) {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const popover = usePopover();
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
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date())}
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
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar alt={row?.vendor} src={row?.profileImageFileUrl} sx={{ width: 40, height: 40 }}>
              {!row?.profileImageFileUrl && row?.vendor?.charAt(0)}
            </Avatar>

            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <ListItemText
                primary={row?.vendor}
                secondary={`${row?.address || t('accounts.not_available')}`}
                primaryTypographyProps={{
                  typography: 'body1',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
                secondaryTypographyProps={{
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
            </Box>
          </Box>
        </TableCell>
        <TableCell sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          {/* {row.location} */}
          {String(row.accNumber).padStart(8, '0')} ({row.accName})
        </TableCell>
        <TableCell sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          {row.terms}
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
            <Tooltip title={t('accounts.post')} arrow>
              <Iconify
                icon="mdi:send"
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
