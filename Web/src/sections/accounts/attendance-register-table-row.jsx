import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export function AttendanceRegisterTableRow({
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
            <Tooltip title={t("actions.cancel")} arrow>
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
            {row.employeeName}
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
              {row.employeeEmail}
            </Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <Typography variant="body2" fontWeight="bold">
            {String(row?.id || '00000').padStart(5, '0')}
          </Typography>
        </TableCell>

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
              {row.designation}
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
              {row.department}
            </Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Label
              variant="soft"
              sx={{
                minWidth: 90,
                textTransform: 'none',
              }}
              color={
                row.attendanceCode === 'Present'
                  ? 'success'
                  : row.attendanceCode === 'Absent'
                    ? 'error'
                    : row.attendanceCode === 'Leave'
                      ? 'warning'
                      : row.attendanceCode === 'Weekly Off'
                        ? 'info'
                        : row.attendanceCode === 'Holiday'
                          ? 'secondary'
                          : 'default'
              }
            >
              {row.attendanceCode}
            </Label>
          </Box>
        </TableCell>

        {!isUser && (
          <>
            {newTimesheet?.id === row?.id ? (
              <TableCell align="center">
                <Tooltip title={t("actions.save")}>
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
                    {t("actions.update")}
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
          <MenuItem
            onClick={() => {
              // confirm.onTrue();
              popover.onClose();
            }}
          >
            {t('actions.any_actions')}
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
