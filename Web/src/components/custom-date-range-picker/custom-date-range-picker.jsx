import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { useResponsive } from 'src/hooks/use-responsive';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
// ----------------------------------------------------------------------

export function CustomDateRangePicker({
  open,
  error,
  endDate,
  onClose,
  startDate,
  PaperProps,
  onChangeEndDate,
  variant = 'input',
  onChangeStartDate,
  title = '',
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/date');
  const mdUp = useResponsive('up', 'md');

  const isCalendarView = variant === 'calendar';

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth={isCalendarView ? false : 'xs'}
      PaperProps={{
        ...PaperProps,
        sx: {
          ...(isCalendarView && { maxWidth: 720 }),
          ...PaperProps?.sx,
        },
      }}
      {...other}
    >
      <DialogTitle sx={{ pb: 2 }}>{title || t('date.title')}</DialogTitle>

      <DialogContent sx={{ ...(isCalendarView && mdUp && { overflow: 'unset' }) }}>
        <Stack
          justifyContent="center"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && mdUp ? 'row' : 'column'}
          sx={{ pt: 1 }}
        >
          {isCalendarView ? (
            <>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  From Date:
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'divider',
                    borderStyle: 'dashed',
                  }}
                >
                  <DateCalendar value={startDate} onChange={onChangeStartDate} />
                </Paper>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  To Date:
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'divider',
                    borderStyle: 'dashed',
                  }}
                >
                  <DateCalendar value={endDate} onChange={onChangeEndDate} />
                </Paper>
              </Box>
            </>
          ) : (
            <>
              <DatePicker
                label={t('date.start_date')}
                value={startDate}
                onChange={onChangeStartDate}
              />

              <DatePicker label={t('date.end_date')} value={endDate} onChange={onChangeEndDate} />
            </>
          )}
        </Stack>

        {error && (
          <FormHelperText error sx={{ px: 2 }}>
            {t('date.end_date_validation')}
          </FormHelperText>
        )}
      </DialogContent>
      {startDate && endDate && (
        <Box sx={{ px: 3, pb: 1, mt:1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              textAlign: 'center',
              color: '#006A67',
              fontWeight: 700,
            }}
          >
            {dayjs(startDate).format('DD-MM-YYYY')} - {dayjs(endDate).format('DD-MM-YYYY')}
          </Typography>
        </Box>
      )}
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t('date.cancel')}
        </Button>
        <Button disabled={error} variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
