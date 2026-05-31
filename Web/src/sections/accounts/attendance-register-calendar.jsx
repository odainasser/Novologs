'use client';

import dayjs from 'dayjs';
import { useEffect } from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state'; // Ensure dayjs is imported if not already
import Box from '@mui/material/Box';

import { fDate, fIsAfter, fIsBetween } from 'src/utils/format-time';

import { updateEvent, useGetEvents } from 'src/actions/calendar';

import { StyledCalendar } from 'src/sections/calendar/styles';
import { useCalendar } from 'src/sections/calendar/hooks/use-calendar';

import { AttendanceRegisterCalendarToolbar } from './attendance-register-calendar-toolbar';

// ----------------------------------------------------------------------

export function AttendanceRegisterCalendar({
  onDateSelect,
  datesWithData = [],
  onCalendarViewDateChange,
  selectedDate,
}) {
  const theme = useTheme();
  const handleSelectRange = (arg) => {
    const selectedDateStr = arg.startStr;
    if (onDateSelect) {
      onDateSelect(selectedDateStr);
    }
    console.log('this is the arg', arg);
  };
  const openFilters = useBoolean();

  const { events, eventsLoading } = useGetEvents();

  const filters = useSetState({
    colors: [],
    startDate: null,
    endDate: null,
  });

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  } = useCalendar();

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  useEffect(() => {
    // Also, inform the parent component about the calendar's current focus date (e.g., for fetching month-wide data for dots)
    if (date && onCalendarViewDateChange) {
      onCalendarViewDateChange(dayjs(date).format('YYYY-MM-DD'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, onCalendarViewDateChange]);

  useEffect(() => {
    if (calendarRef.current && selectedDate) {
      const calendarApi = calendarRef.current.getApi();
      // Add a small delay to ensure the calendar is ready
      const timer = setTimeout(() => {
        calendarApi.select(selectedDate); // FullCalendar's select method handles date strings
      }, 0); // Use 0ms delay to schedule at the next tick
      return () => clearTimeout(timer); // Cleanup the timer on unmount or dependency change
    }
  }, [selectedDate]); // Re-run when the selectedDate prop changes

  const canReset =
    filters.state.colors.length > 0 || (!!filters.state.startDate && !!filters.state.endDate);

  const dataFiltered = applyFilter({ inputData: events, filters: filters.state, dateError });

  const dayCellContent = (arg) => {
    const dateStr = dayjs(arg.date).format('YYYY-MM-DD');
    const hasData = datesWithData.includes(dateStr);

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {arg.dayNumberText}
        {hasData && (
          <Box
            sx={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: theme.palette.warning.main,
              right: '15px',
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '650px' /* Adjust as needed */ }}>
      {/* Calendar Section */}
      <StyledCalendar
        sx={{
          flex: '1 1 auto', // Allows StyledCalendar to grow/shrink within the Card
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // Style for the selected date background and text color
          '.fc .fc-highlight': {
            background: '#006A67',
            color: 'white', // Ensure text color is white for selected date
          },
        }}
      >
        <AttendanceRegisterCalendarToolbar
          date={fDate(date)}
          view={view} // Toolbar will take its natural height
          canReset={canReset}
          loading={eventsLoading}
          onNextDate={() => {
            onDateNext(); // Trigger the useCalendar hook's next date logic
            // After the useCalendar hook updates its internal 'date',
            // get the new date from the calendar API and update the parent's selectedDate.
            const newViewDate = calendarRef.current?.getApi().getDate();
            if (newViewDate && onDateSelect) {
              onDateSelect(dayjs(newViewDate).format('YYYY-MM-DD'));
            }
          }}
          onPrevDate={() => {
            onDatePrev(); // Trigger the useCalendar hook's previous date logic
            const newViewDate = calendarRef.current?.getApi().getDate();
            if (newViewDate && onDateSelect) {
              onDateSelect(dayjs(newViewDate).format('YYYY-MM-DD'));
            }
          }}
          onToday={() => {
            onDateToday(); // Trigger the useCalendar hook's today logic
            // For 'Today', we can confidently use new Date()
            if (onDateSelect) onDateSelect(dayjs(new Date()).format('YYYY-MM-DD'));
          }}
          onChangeView={onChangeView}
          onOpenFilters={openFilters.onTrue}
        />

        <Box
          sx={{
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <Calendar
            weekends
            editable
            droppable
            selectable
            unselectAuto={false} // Prevents unselecting when clicking outside
            rerenderDelay={10} // Small delay for performance
            allDayMaintainDuration
            eventResizableFromStart
            ref={calendarRef}
            initialDate={date}
            initialView={view}
            dayMaxEventRows={3}
            eventDisplay="block"
            dayCellContent={dayCellContent}
            select={handleSelectRange}
            headerToolbar={false}
            eventClick={onClickEvent}
            height="100%"
            eventDrop={(arg) => {
              onDropEvent(arg, updateEvent);
            }}
            eventResize={(arg) => {
              onResizeEvent(arg, updateEvent);
            }}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
          />
        </Box>
      </StyledCalendar>
    </Card>
  );
}

function applyFilter({ inputData, filters, dateError }) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((event) => fIsBetween(event.start, startDate, endDate));
    }
  }

  return inputData;
}
