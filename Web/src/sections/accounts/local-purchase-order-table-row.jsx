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
import { OrderDetails } from './order-details';

// ----------------------------------------------------------------------

export function LocalPurchaseOrderTableRow({
  row,
  selected,
  onEditRow,
  onDeleteRow,
  onPostRow,
  index,
  isInvoice,
  isPosted,
  isClientView,
  isNote,
}) {
  const popover = usePopover();
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');
  const confirm = useBoolean();
  const post = useBoolean();

  const [openDetails, setOpenDetails] = useState(false);

  const handleRowClick = () => setOpenDetails(true);
  const handleCloseDetails = () => setOpenDetails(false);
  return (
    <>
      <TableRow
        hover
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
        onClick={(e) => {
          if (!e.target.closest('button, svg, input')) {
            handleRowClick();
          }
        }}
      >
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
          {isNote ? row?.noteNumber : row?.invNumber ? row?.invNumber : row?.poNumber}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar
              alt={row?.createdByUser?.fullName}
              src={row?.createdByUser?.profileImageFileUrl}
              sx={{ width: 30, height: 30 }}
            >
              {!row?.createdByUser?.profileImageFileUrl && row?.createdByUser?.fullName?.charAt(0)}
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
                primary={row?.createdByUser?.fullName}
                secondary={`On: ${fDate(row?.created)}`}
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
        {isInvoice ? (
          <TableCell sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
            {row?.invoiceType}
          </TableCell>
        ) : (
          <TableCell
            sx={{
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          >
            {(() => {
              const arabicName = row?.orderType?.localizedStrings?.find(
                (l) => l.language === 'ar'
              )?.value;

              const englishName = row?.orderType?.value;

              if (storedLang === 'ar') {
                return arabicName || englishName || 'Not Available';
              }

              return englishName || arabicName || 'Not Available';
            })()}
          </TableCell>
        )}

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar
              alt={row?.vendor?.name || row?.client?.name || 'Not Available'}
              src={row?.vendor?.profileImageFileUrl || row?.client?.profileImageFileUrl || ''}
              sx={{ width: 40, height: 40 }}
            >
              {!row?.vendor?.profileImageFileUrl &&
                !row?.client?.profileImageFileUrl &&
                (row?.vendor?.name?.charAt(0) || row?.client?.name?.charAt(0) || 'N')}
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
                primary={row?.vendor?.name || row?.client?.name || 'Not Available'}
                secondary={`${row?.vendor?.email || row?.client?.email || 'Email not available'}`}
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
          {row?.location || 'Not Available'}
        </TableCell>

        <TableCell
          sx={{
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          {(() => {
            const arabicName = row?.terms?.localizedStrings?.find(
              (l) => l.language === 'ar'
            )?.value;

            const englishName = row?.terms?.value;

            if (storedLang === 'ar') {
              return arabicName || englishName || 'Not Available';
            }

            return englishName || arabicName || 'Not Available';
          })()}
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
          {fDate(isNote ? row?.noteDate : isInvoice ? row?.invoiceDate : row?.purchaseDate) ||
            'Not Available'}
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
          {fDate(row?.dueDate) || 'Not Available'}
        </TableCell>

        <TableCell
          align="right"
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
        >
          {' '}
          {row?.currency}{' '}
          {row?.grandTotal
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(row?.grandTotal))
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
                onClick={() => {
                  onEditRow(row);
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
            {!isInvoice ? (
              <>
                <Tooltip title={t('accounts.create_invoice')} arrow>
                  <Iconify
                    icon="mdi:receipt-text"
                    sx={{
                      mr: storedLang === 'ar' ? 0 : 1,
                      ml: storedLang === 'ar' ? 1 : 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onEditRow(row);
                    }}
                    width={15}
                    height={15}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                {/* {!isNote && (
                  <Tooltip
                    title={
                      isClientView ? t('accounts.make_credit_note') : t('accounts.make_debit_note')
                    }
                    arrow
                  >
                    <Iconify
                      icon="mdi:receipt-text"
                      sx={{
                        mr: storedLang === 'ar' ? 0 : 1,
                        ml: storedLang === 'ar' ? 1 : 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        onEditRow(row);
                      }}
                      width={15}
                      height={15}
                    />
                  </Tooltip>
                )} */}

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
                    onClick={() => {
                      post.onTrue();
                    }}
                  />
                </Tooltip>
              </>
            )}
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
            onClick={onDeleteRow}
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
      <ConfirmDialog
        open={post.value}
        onClose={post.onFalse}
        title={isNote ? 'Post Note' : 'Post Invoice'}
        content={
          isNote
            ? 'Are you sure you want to post this note?'
            : 'Are you sure you want to post this invoice?'
        }
        action={
          <Button
            variant="contained"
            onClick={onPostRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Post
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <OrderDetails
        open={openDetails}
        onClose={handleCloseDetails}
        row={row}
        isInvoice={isInvoice}
        isPosted={isPosted}
        isClientView={isClientView}
        isNote={isNote}
      />
    </>
  );
}
