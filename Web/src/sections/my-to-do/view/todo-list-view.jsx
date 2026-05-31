'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import AvatarGroup from '@mui/material/AvatarGroup';
import Checkbox from '@mui/material/Checkbox';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { _userList } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useMockedUser } from 'src/auth/hooks';
import { Typography, Stack } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { KanbanAddRemainder } from 'src/sections/kanban/kanban-add-reminder';

import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
} from 'src/components/table';

import { TimeSheetCalendar } from 'src/sections/timesheet/timesheet-calendar';
import Grid from '@mui/material/Unstable_Grid2';
import { getTodo, changeTodoStatus, deleteTodo } from 'src/actions/task/taskActions';

import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useAuthContext } from 'src/auth/hooks';

export function ToDoListView({ isUser, userId }) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [calendarFocusDate, setCalendarFocusDate] = useState(dayjs().format('YYYY-MM-DD'));
  console.log('this is the selected date', selectedDate);

  const getDayRangeISO = (dateStr) => {
    const startOfDay = dayjs(dateStr).startOf('day').toISOString();
    const endOfDay = dayjs(dateStr).endOf('day').toISOString();
    return { startOfDay, endOfDay };
  };

  const getTodoParamsForList = useMemo(() => {
    const { startOfDay, endOfDay } = getDayRangeISO(selectedDate);

    const subFilters = [
      {
        fieldName: 'Created',
        operator: 4,
        fieldValue: endOfDay,
      },
    ];

    // subFilters.push({
    //   fieldName: 'UserId',
    //   fieldValue: isUser ? userId : zetaUser?.id,
    //   operator: 0,
    //   logicOperator: 0,
    // });

    return {
      search: {
        fieldName: 'Created',
        fieldValue: startOfDay,
        operator: 3,
        logicOperator: 0,
        subFilters,
      },
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
    };
  }, [selectedDate, isUser, userId]);

  const {
    todoList,
    todoListLoading,
    todoListError,
    todoListValidating,
    todoListEmpty,
    mutate: mutateTodo,
  } = getTodo(getTodoParamsForList);

  const handleCalendarViewDateChange = useCallback((newFocusDate) => {
    setCalendarFocusDate(newFocusDate);
  }, []);

  const getTodoForMonthParams = useMemo(() => {
    if (!calendarFocusDate) return null;

    const params = {
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
    };

    // params.search = {
    //   fieldName: 'UserId',
    //   fieldValue: isUser ? userId : zetaUser?.id,
    //   operator: 0,
    //   logicOperator: 0,
    // };

    return params;
  }, [calendarFocusDate, isUser, userId]);

  const { todoList: todoForMonthDots } = getTodo(getTodoForMonthParams);
  const completeConfirm = useBoolean();

  const { t, i18n } = useTranslation('dashboard/timesheet');

  const table = useTable({ defaultDense: true, defaultRowsPerPage: 100 });
  const isMyTodo = true;
  const confirm = useBoolean();

  const [checkedReminders, setCheckedReminders] = useState({});
  const [selectedReminderId, setSelectedReminderId] = useState(null);

  const [reminderData, setReminderData] = useState([]);
  const [reminderToCompleteIndex, setReminderToCompleteIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToggleChecked = (index) => {
    if (!checkedReminders[index]) {
      setReminderToCompleteIndex(index);
      completeConfirm.onTrue();
    } else {
      setCheckedReminders((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    }
  };

  useEffect(() => {
    if (todoList?.todos) {
      const sortedTodos = [...todoList.todos].sort((a, b) => {
        const dateA = new Date(a.lastModified);
        const dateB = new Date(b.lastModified);
        return dateB - dateA;
      });
      setReminderData(sortedTodos);

      const initialCheckedState = {};
      sortedTodos.forEach((reminder, index) => {
        initialCheckedState[index] = reminder.status === 2;
      });
      setCheckedReminders(initialCheckedState);
    } else {
      setReminderData([]);
      setCheckedReminders({});
    }
  }, [todoList]);
  const totalReminders = reminderData?.length || 0;
  const completedCount = reminderData?.filter((reminder) => reminder.status === 2).length || 0;
  const progressValue = totalReminders > 0 ? (completedCount / totalReminders) * 100 : 0;

  const datesWithData = useMemo(() => {
    if (!todoForMonthDots?.todos || todoForMonthDots.todos.length === 0) {
      return [];
    }
    const dates = todoForMonthDots.todos.map((item) =>
      dayjs(item.lastModified).format('YYYY-MM-DD')
    );
    return [...new Set(dates)]; // Return unique dates from the month's data
  }, [todoForMonthDots]);

  const filteredByDate = useMemo(() => {
    if (!selectedDate) return [];

    return reminderData.filter((row) => dayjs(row.lastModified).isSame(dayjs(selectedDate), 'day'));
  }, [selectedDate, reminderData]);

  const handleConfirmCompleteReminder = async () => {
    if (reminderToCompleteIndex !== null) {
      const reminderToComplete = reminderData[reminderToCompleteIndex];
      if (reminderToComplete) {
        console.log('Completing reminder with ID:', reminderToComplete.id);
        const payload = {
          id: reminderToComplete.id,
          status: 2,
        };
        try {
          const response = await changeTodoStatus(payload);

          if (response.success) {
            setLoading(false);
            setCheckedReminders((prev) => ({
              ...prev,
              [reminderToCompleteIndex]: true,
            }));
            completeConfirm.onFalse();
            setReminderToCompleteIndex(null);
            await mutateTodo();
            toast.success('Activity completed');
          } else {
            toast.error(response.error);
          }
        } catch (error) {
          console.error(error);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      }
    }
  };
  const handleDeleteReminder = async (id) => {
    if (id) {
      try {
        const response = await deleteTodo(id);
        if (response.success) {
          await mutateTodo();
          toast.success('Activity deleted successfully');
        } else {
          toast.error(response.error || 'Delete activity failed');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };
  if (todoListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  if (todoListError) {
    return <ErrorView errorCode={todoListError} />;
  }

  const renderView = (
    <>


      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 2.5,
            py: 0.5,

          }}
        ></Box>

        <Grid container sx={{ my: 2 }}>
          <Grid xs={12} md={3.5} sx={{ pl: 3 }}>
            <TimeSheetCalendar
              onDateSelect={setSelectedDate}
              datesWithData={datesWithData}
              onCalendarViewDateChange={handleCalendarViewDateChange}
              selectedDate={selectedDate} // Pass selectedDate down to the calendar component
            />
          </Grid>
          <Grid xs={12} md={8.5} sx={{ p: 3, pt: 0 }}>
            <KanbanAddRemainder
              userId={userId}
              isUser={isUser}
              selectedDate={selectedDate}
              isMyTodo={isMyTodo}
              getDayRangeISO={getDayRangeISO}
            />
          </Grid>
        </Grid>
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this activity?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedReminderId) {
                handleDeleteReminder(selectedReminderId);
                confirm.onFalse();
              }
            }}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Delete
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <ConfirmDialog
        open={completeConfirm.value}
        onClose={() => {
          completeConfirm.onFalse();
          setReminderToCompleteIndex(null);
        }}
        title="Confirm"
        content="Are you sure you want to complete this activity?"
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmCompleteReminder}
            sx={{ bgcolor: '#006A67', ...(storedLang === 'ar' && { ml: 1 }) }}
          >
            Complete
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );

  return <>{isUser ? <>{renderView}</> : <>{renderView}</>}</>;
}
