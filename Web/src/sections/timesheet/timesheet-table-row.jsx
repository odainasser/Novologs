import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fDate, fTime, fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { TextField } from '@mui/material';

export function TimesheetTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  isUser,
  newTimesheet,
  addNewTimesheet,
  setShowTimeSlot,
  clearTimesheet,
  index,
}) {
  const confirm = useBoolean();
  const { t, i18n } = useTranslation('dashboard/timesheet');
  const popover = usePopover();
  console.log('this is the row newTimesheet', newTimesheet);
  const storedLang = localStorage.getItem('selectedLang');

  const {
    primaryDescription,
    secondaryDescription,
    descriptionStr,
    descriptionEng,
    descriptionArabic,
  } = useMemo(() => {
    let fullDescription = '';
    let englishDescription = '';
    let arabicDescription = '';

    try {
      const parsedDescription = JSON.parse(row?.task?.description);

      if (parsedDescription?.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }

      if (parsedDescription?.TranscriptEnglishStr) {
        englishDescription = parsedDescription.TranscriptEnglishStr;
      }

      if (parsedDescription?.TranscriptArabicStr) {
        arabicDescription = parsedDescription.TranscriptArabicStr;
      }
    } catch (e) {
      fullDescription = row?.task?.description || '';
    }

    const descriptionStr = fullDescription;
    const words = fullDescription.split(' ');
    const descriptionEng = englishDescription;
    const descriptionArabic = arabicDescription;

    return {
      primaryDescription: words.slice(0, 5).join(' '),
      secondaryDescription: words.slice(5).join(' '),
      descriptionStr,
      descriptionEng,
      descriptionArabic,
    };
  }, [row?.task?.description]);

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        {/* Sl No. */}
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align="center"
        >
          {newTimesheet?.id === row?.id ? (
            <Tooltip title="Cancel" arrow>
              <Iconify
                icon="mdi:close-circle"
                color="error.main"
                onClick={() => clearTimesheet()}
                sx={{ cursor: 'pointer', mt: 0.5, height: 18, width: 18 }}
              />
            </Tooltip>
          ) : (
            <Box>{index + 1}</Box>
          )}
        </TableCell>

        {/* Timesheet ID */}
        <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <Typography variant="body2" fontWeight="bold">
            {String(row?.task?.serial || '00000').padStart(5, '0')}
          </Typography>
          <Box sx={{ maxWidth: 240 }}>
            {' '}
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {descriptionStr || t('table.not_available')}
            </Typography>
          </Box>
        </TableCell>

        {/* Project */}
        {/* <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <Typography variant="body2">{row?.project || 'Not Available'}</Typography>
        </TableCell> */}
        {/* Project */}

        {/* <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <ListItemText
            primary={row?.startDate ? fDate(row.startDate) : 'Not Available'}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell> */}

        {/* Duration */}
        <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          {' '}
          {row?.task?.projectId && row?.task?.type === 0
            ? 'Mission'
            : row?.task?.vendorContractId
              ? 'Contract'
              : row?.task?.vendorId
                ? 'Vendor'
                : row?.task?.clientLeadId
                  ? 'Lead'
                  : row?.task?.clientId
                    ? 'Client'
                    : row?.task?.projectId && row?.task?.type === 1
                      ? 'Project'
                      : 'General'}
        </TableCell>

        {/* {!newTimesheet?.id && (
          <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                Start Time : {fDateTime(row?.timeSlots?.length > 0 && row.timeSlots[0]?.startTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duration{' '}
                {(row?.timeSlots?.length > 0 && row.timeSlots[0]?.durationInMinutes) || '-'} Min
              </Typography>
            </Box>
          </TableCell>
        )} */}

        {newTimesheet?.id === row?.id ? (
          <TableCell sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }} align="center">
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {newTimesheet.duration && (
                <TextField
                  size="small"
                  value={newTimesheet.duration}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 170 }}
                />
              )}
              <Tooltip title="Edit time slot">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => setShowTimeSlot(true)}
                  sx={{
                    width: 24,
                    height: 24,
                    ml: 2,
                    mt: 1,
                    bgcolor: '#006A67',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <Iconify icon="mdi:edit-outline" />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        ) : (
          <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                Start Time : {fDateTime(row?.timeSlots?.length > 0 && row.timeSlots[0]?.startTime)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                End Time :{' '}
                {(() => {
                  const slot = row?.timeSlots?.[0];
                  if (slot?.startTime && typeof slot?.durationInMinutes === 'number') {
                    const start = new Date(slot.startTime);
                    const end = new Date(start.getTime() + slot.durationInMinutes * 60000);
                    return fDateTime(end);
                  }
                  return '-';
                })()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duration:{' '}
                {(() => {
                  const durationInMinutes = row?.timeSlots?.[0]?.durationInMinutes;
                  if (typeof durationInMinutes === 'number' && durationInMinutes > 0) {
                    if (durationInMinutes >= 60) {
                      const hours = Math.floor(durationInMinutes / 60);
                      const minutes = durationInMinutes % 60;
                      return (
                        <>
                          <Box
                            component="span"
                            fontWeight="bold"
                            display="inline"
                            sx={{ color: '#000000' }}
                          >
                            {hours}
                          </Box>
                          <Box
                            component="span"
                            display="inline"
                            fontWeight="bold"
                            sx={{ color: '#000000' }}
                          >
                            hrs
                          </Box>
                          {minutes > 0 ? (
                            <>
                              <Box
                                component="span"
                                display="inline"
                                fontWeight="bold"
                                sx={{ color: '#000000' }}
                              >
                                {' '}
                                {minutes}min
                              </Box>
                            </>
                          ) : (
                            ''
                          )}
                        </>
                      );
                    }
                    return `${durationInMinutes} Min`;
                  }
                  return '-';
                })()}
              </Typography>
            </Box>
          </TableCell>
        )}

        {/* Notes */}
        {/* <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
            {row?.notes || t('table.no_notes')}
          </Typography>
        </TableCell> */}

        {/* Actions */}
        <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              Created on {fDate(row?.created)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              Modified on {fDate(row?.lastModified)}
            </Typography>
          </Box>
        </TableCell>
        {!isUser && (
          <>
            {newTimesheet?.id === row?.id ? (
              <TableCell align="center">
                <Tooltip title="Save">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={addNewTimesheet}
                    sx={{
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      bgcolor: '#006A67',

                      padding: '4px 25px',
                    }}
                  >
                    Update
                  </Button>
                </Tooltip>
              </TableCell>
            ) : (
              <TableCell align="center">
                <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </TableCell>
            )}
          </>
        )}
      </TableRow>

      {/* Popover Actions */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: {
            placement: storedLang === 'ar' ? 'left-top' : 'right-top',
          },
        }}
        sx={{
          ...(storedLang === 'ar' && {
            direction: 'rtl',
            textAlign: 'right',
          }),
        }}
      >
        <MenuList>
          {/* <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('actions.edit')}
          </MenuItem> */}
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {t('actions.delete')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('actions.delete')}
        content={t('dialogs.confirm_delete_single')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('actions.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}
