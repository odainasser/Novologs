import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { varBgColor } from 'src/components/animate';
import dayjs from 'dayjs';

// Generate 15-minute interval time slots
const generateTimeSlots = () => {
  const slots = [];
  let hour = 7;
  let minute = 0;

  while (hour < 23 || (hour === 23 && minute <= 30)) {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const formatted = `${displayHour}:${minute === 0 ? '00' : minute} ${period}`;
    slots.push(formatted);


    minute += 30;
    if (minute === 60) {
      minute = 0;
      hour += 1;
    }
  }

  return slots;
};

const timeSlots = generateTimeSlots();

// Converts time string (e.g., "1:15 PM") to total minutes since midnight
const convertToMinutes = (time) => {
  const [hm, period] = time.split(' ');
  const [h, m] = hm.split(':').map(Number);
  const hour = period === 'PM' && h !== 12 ? h + 12 : h === 12 && period === 'AM' ? 0 : h;
  return hour * 60 + m;
};

// Calculate readable duration
const calculateDuration = (start, end) => {
  const total = convertToMinutes(end) - convertToMinutes(start);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
};

export function TimeSlotSelector({
  open,
  onClose,
  onSelectTime,
  initialStartTimeISO,
  initialDurationMinutes,
  bookedEntries, // Array of { id: string, timeSlots: [{ startTime: string, durationInMinutes: number }] }
  currentEditingTimesheetId, // string | null
}) {
  const { t, i18n } = useTranslation('dashboard/timesheet');
  const storedLang = localStorage.getItem('selectedLang');

  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  // Helper to convert minutes since midnight back to "H:MM AM/PM" string
  const minutesToTimeSlotString = (totalMinutes) => {
    const h24 = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    const period = h24 < 12 || h24 === 24 ? 'AM' : 'PM';
    let displayHour = h24 % 12;
    if (displayHour === 0) displayHour = 12;

    return `${displayHour}:${min < 10 ? '0' : ''}${min} ${period}`;
  };

  // Helper function to check if a specific 15-minute slot string is unavailable
  const isSlotUnavailable = (timeSlotString) => {
    if (!bookedEntries || bookedEntries.length === 0) {
      return false;
    }

    const targetSlotStartMinute = convertToMinutes(timeSlotString);
    const targetSlotEndMinute = targetSlotStartMinute + 15; // Interval is [start, end)

    for (const entry of bookedEntries) {
      if (entry.id === currentEditingTimesheetId) {
        continue; // Skip the timesheet entry currently being edited
      }

      // Ensure entry.timeSlots is an array (even if empty) before iterating
      for (const bookedTS of entry?.timeSlots || []) {
        const bookedStartDayjs = dayjs(bookedTS.startTime);
        const bookedTSStartMinute = bookedStartDayjs.hour() * 60 + bookedStartDayjs.minute();
        const bookedTSEndMinute = bookedTSStartMinute + bookedTS.durationInMinutes;

        // Check for overlap: (A.start < B.end) && (A.end > B.start)
        if (
          targetSlotStartMinute < bookedTSEndMinute &&
          targetSlotEndMinute > bookedTSStartMinute
        ) {
          return true; // This slot overlaps with a booked slot
        }
      }
    }
    return false;
  };

  // Helper function to check if the selected range is valid (no overlaps)
  const isRangeValid = (startStr, endStr) => {
    if (!startStr || !endStr) return false;

    const startMinute = convertToMinutes(startStr);
    const endMinute = convertToMinutes(endStr);

    if (endMinute <= startMinute) return false;

    for (let m = startMinute; m < endMinute; m += 15) {
      const intermediateSlotStr = minutesToTimeSlotString(m);
      if (isSlotUnavailable(intermediateSlotStr)) {
        return false; // A slot within the selected range is already booked
      }
    }
    return true;
  };

  const formatToDisplayTime = (isoString) => {
    if (!isoString) return null;
    return dayjs(isoString).format('h:mm A');
  };

  const calculateEndTimeString = (startTimeISO, durationMinutes) => {
    if (!startTimeISO || typeof durationMinutes !== 'number') return null;
    const startTime = dayjs(startTimeISO);
    const endTime = startTime.add(durationMinutes, 'minute');
    return endTime.format('h:mm A');
  };

  useEffect(() => {
    if (open) {
      if (
        initialStartTimeISO &&
        typeof initialDurationMinutes === 'number' &&
        initialDurationMinutes > 0
      ) {
        const initialStartDisplay = formatToDisplayTime(initialStartTimeISO);
        const initialEndDisplay = calculateEndTimeString(
          initialStartTimeISO,
          initialDurationMinutes
        );
        setSelectedStart(initialStartDisplay);
        setSelectedEnd(initialEndDisplay);
      } else {
        setSelectedStart(null);
        setSelectedEnd(null);
      }
    }
  }, [open, initialStartTimeISO, initialDurationMinutes]);

  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      const duration = calculateDuration(selectedStart, selectedEnd);
      onSelectTime(`${selectedStart} to ${selectedEnd}`, duration);
      onClose();
    }
  };
  const confirmButtonDisabled =
    !selectedStart || !selectedEnd || !isRangeValid(selectedStart, selectedEnd);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
    >
      <DialogTitle>{t('form.select_time_slot')}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Start Time Column */}
          <Grid item xs={6}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {t('form.start_time')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((time) => {
                    const timeMin = convertToMinutes(time);
                    const startMin = selectedStart ? convertToMinutes(selectedStart) : null;
                    const endMin = selectedEnd ? convertToMinutes(selectedEnd) : null;

                    const isInRange =
                      startMin !== null &&
                      endMin !== null &&
                      timeMin >= startMin &&
                      timeMin <= endMin;

                    const isActive = selectedStart === time || isInRange;
                    const isBooked = isSlotUnavailable(time);

                    return (
                      <TableRow
                        key={time}
                        onClick={() => {
                          if (!isBooked) {
                            // Only allow selection if not booked
                            setSelectedStart(time);
                          }
                        }}
                        sx={{
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: isBooked ? 'rgba(255, 0, 0, 0.08)' : undefined }}
                        >
                          <FormControlLabel
                            control={
                              <Radio
                                checked={isActive}
                                disabled={isBooked}
                                sx={{
                                  color: isBooked ? 'red' : isActive ? '#006A67' : undefined,
                                  '&.Mui-checked:not(.Mui-disabled)': {
                                    // Style for checked and not disabled
                                    color: '#006A67',
                                  },
                                }}
                              />
                            }
                            label={
                              <span
                                style={{
                                  color: isBooked ? 'red' : isActive ? '#006A67' : 'inherit',
                                }}
                              >
                                {time}
                              </span>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* End Time Column */}
          <Grid item xs={6}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {t('form.end_time')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((time) => {
                    const timeMin = convertToMinutes(time);
                    const startMin = selectedStart ? convertToMinutes(selectedStart) : null;
                    const endMin = selectedEnd ? convertToMinutes(selectedEnd) : null;

                    const isInRange =
                      startMin !== null &&
                      endMin !== null &&
                      timeMin >= startMin &&
                      timeMin <= endMin;

                    const isActive = selectedEnd === time || isInRange;
                    const isBooked = isSlotUnavailable(time);
                    const isDisabledBySelection =
                      !selectedStart ||
                      timeMin <= (selectedStart ? convertToMinutes(selectedStart) : -1);

                    return (
                      <TableRow
                        key={time}
                        onClick={() => {
                          // Allow setting end time only if not booked and not disabled by start time selection
                          if (!isBooked && !isDisabledBySelection) {
                            setSelectedEnd(time);
                          }
                        }}
                        sx={{
                          cursor: isDisabledBySelection || isBooked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <TableCell
                          align="center"
                          sx={{ backgroundColor: isBooked ? 'rgba(255, 0, 0, 0.08)' : undefined }}
                        >
                          <FormControlLabel
                            control={
                              <Radio
                                checked={isActive}
                                disabled={isDisabledBySelection || isBooked}
                                sx={{
                                  color: isBooked ? 'red' : isActive ? '#006A67' : undefined,
                                  '&.Mui-checked:not(.Mui-disabled)': {
                                    // Style for checked and not disabled
                                    color: '#006A67',
                                  },
                                }}
                              />
                            }
                            label={
                              <span
                                style={{
                                  color: isBooked ? 'red' : isActive ? '#006A67' : 'inherit',
                                }}
                              >
                                {time}
                              </span>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        >
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={confirmButtonDisabled}
          sx={{ bgcolor: '#006A67' }}
        >
          {t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
