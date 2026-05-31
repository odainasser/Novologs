'use client';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import {
  getTimesheet,
  addTimesheet,
  updateTimesheet,
  deleteTimesheet,
} from 'src/actions/timeSheet/timeSheetActions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ErrorView } from 'src/sections/error/error-view';
import { taskVariant } from 'src/sections/kanban/kanban-mock-data';
import { _tasks, _status, _projects } from 'src/sections/timesheet/timesheet-mock-data';

import { useMockedUser, useAuthContext } from 'src/auth/hooks';

import { attendance_register } from '../account-mock-data';
import { AttendanceRegisterCalendar } from '../attendance-register-calendar';
import { AttendanceRegisterTableRow } from '../attendance-register-table-row';
import { AttendanceRegisterTableToolbar } from '../attendance-register-table-toolbar';
import { AttendanceRegisterFiltersResult } from '../attendance-rgister-table-filters-result';

export function AttendanceRegisterView({ isUser, userId }) {
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

  const getTimesheetParamsForTable = useMemo(() => {
    const { startOfDay, endOfDay } = getDayRangeISO(selectedDate);

    const subFilters = [
      {
        fieldName: 'Date',
        operator: 4,
        fieldValue: endOfDay,
      },
    ];

    subFilters.push({
      fieldName: 'UserId',
      fieldValue: isUser ? userId : zetaUser?.id,
      operator: 0,
      logicOperator: 0,
    });

    return {
      search: {
        fieldName: 'Date',
        fieldValue: startOfDay,
        operator: 5,
        logicOperator: 0,
        subFilters,
      },
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
      sort: {
        fieldName: 'Date',
        sortDirection: 1,
      },
    };
  }, [selectedDate, isUser, userId]);

  const {
    timesheetsList: timesheetsForSelectedDate,
    timesheetsListLoading,
    timesheetsListError,
    mutate: mutateTimesheetTable,
  } = getTimesheet(getTimesheetParamsForTable);

  const handleCalendarViewDateChange = useCallback((newFocusDate) => {
    setCalendarFocusDate(newFocusDate);
  }, []);

  const getTimesheetsForMonthParams = useMemo(() => {
    if (!calendarFocusDate) return null;

    const params = {
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
      sort: {
        fieldName: 'Date',
        sortDirection: 1,
      },
    };

    params.search = {
      fieldName: 'UserId',
      fieldValue: isUser ? userId : zetaUser?.id,
      operator: 0,
      logicOperator: 0,
    };

    return params;
  }, [calendarFocusDate, isUser, userId]);

  // Fetch timesheets for the current calendar month view (for dots)
  const { timesheetsList: timesheetsForMonthDots } = getTimesheet(getTimesheetsForMonthParams);

  const { user } = useMockedUser();
  const { t, i18n } = useTranslation('dashboard/timesheet');

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('table.sl_no'), width: '5%', align: 'center' },

    // { id: 'project', label: t('table.project'), width: '20%' },
    {
      id: 'name',
      label: t('table.employee'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'id',
      label: t('table.employee_id'),
      width: '7%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'designation',
      label: t('table.designation&department'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'notes', label: t('table.notes'), width: '25%' },
    {
      id: 'code',
      label: t('table.code'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(!isUser
      ? [
          {
            id: '',
            label: t('table.actions'),
            width: '5%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
  ];

  const USER_STATUS_OPTIONS = [{ value: 'All Timesheets', label: t('tabs.all') }];

  const table = useTable({ defaultDense: true, defaultRowsPerPage: 100 });
  const router = useRouter();

  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(attendance_register);
  }, [timesheetsForSelectedDate]);
  console.log('this is the table data', tableData);

  const [newTimesheet, setNewTimesheet] = useState({
    id: '',
    project: '',
    task: '',
    startDate: '',
    status: '',
    duration: '',
    notes: '',
  });
  const isTimeSheetView = true;

  const [variant, setVariant] = useState('General');

  const [taskId, setTaskId] = useState('');
  const [taskName, setTaskName] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectMilestone, setProjectMilestone] = useState('');
  const [clientName, setClientName] = useState('');
  const [taskModules, setTaskModules] = useState('');
  const [taskTypes, setTaskTypes] = useState('');

  const [missionName, setMissionsName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [businessLead, setBusinessLead] = useState('');
  const [contract, setContract] = useState('');

  const [details, setDetails] = useState(false);
  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };
  const addNewDetails = (details) => {
    details.variant = variant;
    details.projectName = projectName;
    details.projectMilestone = projectMilestone;
    details.clientName = clientName;
    details.taskTypes = taskTypes;
    details.taskModules = taskModules;
    details.vendorName = vendorName;
    details.businessLead = businessLead;
    details.missionName = missionName;
    details.contract = contract;
  };

  const [idError, setIdError] = useState('');

  const [selectedStartTimeString, setSelectedStartTimeString] = useState(null);
  const [mode, setMode] = useState('add');

  const parseDuration = useCallback((duration) => {
    if (!duration || typeof duration !== 'string') return 0;
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
  }, []);

  function toISODateTime(date) {
    const d = new Date(date);
    return d.toISOString();
  }

  const addNewTimesheet = async () => {
    const hasError = false;

    // if (!selectedDate) {
    //   toast.error(t('toast.calendar_error'));
    //   return;
    // }
    if (!selectedStartTimeString) {
      toast.error(t('toast.startTimeMissing', 'Please select a time slot.'));
      return;
    }
    if (!newTimesheet.duration) {
      toast.error(t('toast.durationMissing', 'Duration is missing. Please select a time slot.'));
      return;
    }
    // if (mode === 'add') {
    //   if (!newTimesheet.id || !newTimesheet.id.trim()) {
    //     setIdError(t('toast.id_error'));
    //     hasError = true;
    //   } else {
    //     setIdError('');
    //   }
    // }

    if (hasError) return;

    // Inject the selected date
    const updatedTimesheet = {
      ...newTimesheet,
      startDate: selectedDate,
    };

    const payload = {
      taskId,
      date: toISODateTime(selectedDate) || new Date().toISOString(),
      timeSlots: [
        {
          startTime: (() => {
            const datePart = dayjs(selectedDate);

            const timePart = dayjs(selectedStartTimeString, 'hh:mm A');

            const combinedDateTime = datePart
              .hour(timePart.hour())
              .minute(timePart.minute())
              .second(0)
              .millisecond(0);
            return combinedDateTime.toISOString();
          })(),
          durationInMinutes: parseDuration(newTimesheet.duration),
        },
      ],
    };

    if (mode === 'edit') {
      payload.id = newTimesheet?.id;
      if (payload.timeSlots && payload.timeSlots.length > 0) {
        payload.timeSlots[0].id = newTimesheet?.timeSlots?.[0]?.id;
      }

      console.log('this is the updated timesheet', payload);
      try {
        const response = await updateTimesheet(payload);
        if (response.success) {
          toast.success('Timesheet updated successfully');
          setTableData((prevData) =>
            prevData.map((row) => (row.id === updatedTimesheet.id ? updatedTimesheet : row))
          );
          setVariant('General');
          setProjectName('');
          setProjectMilestone('');
          setClientName('');
          setTaskModules('');
          setTaskTypes('');
          setMissionsName('');
          setVendorName('');
          setBusinessLead('');
          setContract('');
          setSelectedStartTimeString(null);
          setTaskId('');
          setTaskName('');
          clearTimesheet();
          setMode('add');
          setIdError('');
          await mutateTimesheetTable();
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Update timesheet failed:', error);
      }
    } else {
      try {
        const response = await addTimesheet(payload);
        if (response.success) {
          toast.success('Timesheet created successfully');
          setTableData((prevData) => [updatedTimesheet, ...prevData]);
          setVariant('General');
          setProjectName('');
          setProjectMilestone('');
          setClientName('');
          setTaskModules('');
          setTaskTypes('');
          setMissionsName('');
          setVendorName('');
          setBusinessLead('');
          setContract('');
          setSelectedStartTimeString(null);
          setTaskId('');
          setTaskName('');

          clearTimesheet();
          setMode('add');
          setIdError('');
          await mutateTimesheetTable();
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add timesheet failed:', error);
      }
    }
  };

  const clearTimesheet = () => {
    setNewTimesheet({
      id: '',
      project: '',
      task: '',
      startDate: '',
      status: '',
      duration: '',
      notes: '',
    });
    setIdError('');
    setVariant('General');
    setProjectName('');
    setProjectMilestone('');
    setClientName('');
    setTaskModules('');
    setTaskTypes('');
    setMissionsName('');
    setVendorName('');
    setBusinessLead('');
    setContract('');
    setSelectedStartTimeString(null);
    setTaskId('');
    setTaskName('');
  };

  // Helper to create ISO string from selectedDate and a time string like "9:30 AM"
  const createISOFromDateAndTime = useCallback((dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const datePart = dayjs(dateStr);
    const timePart = dayjs(timeStr, 'h:mm A');

    if (!datePart.isValid() || !timePart.isValid()) return null;

    return datePart
      .hour(timePart.hour())
      .minute(timePart.minute())
      .second(0)
      .millisecond(0)
      .toISOString();
  }, []);

  const initialStartTimeISOForSelector = useMemo(() => {
    if (selectedStartTimeString && selectedDate) {
      return createISOFromDateAndTime(selectedDate, selectedStartTimeString);
    }
    if (mode === 'edit' && newTimesheet?.id && newTimesheet?.timeSlots?.[0]?.startTime) {
      return newTimesheet.timeSlots[0].startTime;
    }
    return null;
  }, [selectedStartTimeString, selectedDate, mode, newTimesheet, createISOFromDateAndTime]);

  const initialDurationMinutesForSelector = useMemo(() => {
    if (newTimesheet?.duration) {
      return parseDuration(newTimesheet.duration);
    }
    if (
      mode === 'edit' &&
      newTimesheet?.id &&
      typeof newTimesheet?.timeSlots?.[0]?.durationInMinutes === 'number'
    ) {
      return newTimesheet.timeSlots[0].durationInMinutes;
    }
    return null;
  }, [newTimesheet, mode, parseDuration]);

  const filters = useSetState({
    status: 'All Timesheets',
    project: 'All Projects',
    task: 'All Tasks',
    startDate: null,
    name: '',
    taskVariant: [],
  });
  const [showTimeSlot, setShowTimeSlot] = useState(false);

  const datesWithData = useMemo(() => {
    // Use timesheetsForMonthDots for populating dots across the calendar month
    if (!timesheetsForMonthDots?.timesheets || timesheetsForMonthDots.timesheets.length === 0) {
      return [];
    }
    const dates = timesheetsForMonthDots.timesheets.map((item) =>
      dayjs(item.date).format('YYYY-MM-DD')
    );
    return [...new Set(dates)]; // Return unique dates from the month's data
  }, [timesheetsForMonthDots]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });
  const filteredByDate = useMemo(() => {
    if (!selectedDate) return [];

    return dataFiltered.filter((row) => dayjs(row.date).isSame(dayjs(selectedDate), 'day'));
  }, [selectedDate, dataFiltered]);

  const dataInPage = rowInPage(filteredByDate, table.page, table.rowsPerPage);
  const canReset =
    filters.state.status !== 'All Timesheets' ||
    filters.state.project !== 'All Projects' ||
    filters.state.task !== 'All Tasks' ||
    filters.state.taskVariant.length > 0 ||
    !!filters.state.name;
  const notFound = (!filteredByDate.length && canReset) || !filteredByDate.length;

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        const response = await deleteTimesheet(id);
        if (response.success) {
          await mutateTimesheetTable();
          toast.success('Timesheet deleted successfully');
        } else {
          toast.error(response.error || 'Delete failed');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditRow = useCallback(
    (row) => {
      const initialStartTimeISO = row.timeSlots?.[0]?.startTime;
      const initialDurationMinutes = row.timeSlots?.[0]?.durationInMinutes;

      let durationString = ''; // Default to empty string
      if (typeof initialDurationMinutes === 'number' && initialDurationMinutes > 0) {
        const hours = Math.floor(initialDurationMinutes / 60);
        const minutes = initialDurationMinutes % 60;
        if (hours > 0 && minutes > 0) {
          durationString = `${hours}h ${minutes}m`;
        } else if (hours > 0) {
          durationString = `${hours}h`;
        } else if (minutes > 0) {
          durationString = `${minutes}m`;
        }
      }

      const initialStartDisplayTime = initialStartTimeISO
        ? dayjs(initialStartTimeISO).format('h:mm A')
        : null;

      setNewTimesheet({
        ...row, // This includes the original timeSlots
        duration: durationString,
      });

      setSelectedDate(dayjs(row.date).format('YYYY-MM-DD'));
      setTaskId(row.taskId);
      setTaskName(row?.description);
      setSelectedStartTimeString(initialStartDisplayTime);

      setMode('edit');
    },
    [setNewTimesheet, setSelectedDate, setTaskId, setTaskName, setSelectedStartTimeString, setMode]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );
  const [view, setView] = useState('list');

  const bookedTimesheetSlots = useMemo(() => {
    if (!tableData) return [];

    return tableData?.map((entry) => ({
      id: entry.id,
      timeSlots: entry?.timeSlots?.map((ts) => ({
        startTime: ts.startTime,
        durationInMinutes: ts.durationInMinutes,
      })),
    }));
  }, [tableData]);

  const [timesheetList, setTimesheetList] = useState('timesheetList');

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const handleBacklogView = useCallback((event, newView) => {
    if (newView !== null) {
      setTimesheetList(newView);
      if (newView === 'timesheetList') {
        setTableData(Timesheets.filter((Timesheet) => Timesheet.members.length > 0));
      } else if (newView === 'backlog') {
        setTableData(Timesheets.filter((Timesheet) => Timesheet.members.length === 0));
      }
    }
  }, []);

  const [projectSearch, setProjectSearch] = useState('');
  const filteredProjects = _projects.filter((project) =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const [taskSearch, setTaskSearch] = useState('');
  const filteredTasks = _tasks.filter((task) =>
    task.toLowerCase().includes(taskSearch.toLowerCase())
  );

  const handleIdChange = (e) => {
    setNewTimesheet({ ...newTimesheet, id: e.target.value });
    setIdError('');
  };
  if (timesheetsListLoading)
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
  if (timesheetsListError) {
    return <ErrorView errorCode={timesheetsListError} />;
  }
  const renderView = (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: 2.5,
          py: 0.5,
        }}
      >
        <AttendanceRegisterTableToolbar
          filters={filters}
          taskVariantOptions={{ taskVariant }}
          onResetPage={table.onResetPage}
          options={{ status: _status, projects: _projects, tasks: _tasks }}
          view={view}
        />
      </Box>

      {canReset && (
        <AttendanceRegisterFiltersResult
          filters={filters}
          totalResults={filteredByDate.length}
          onResetPage={table.onResetPage}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Grid container sx={{ my: 2 }}>
        <Grid xs={12} md={3.5} sx={{ pl: 3 }}>
          <AttendanceRegisterCalendar
            onDateSelect={setSelectedDate}
            datesWithData={datesWithData}
            onCalendarViewDateChange={handleCalendarViewDateChange}
            selectedDate={selectedDate} // Pass selectedDate down to the calendar component
          />
        </Grid>
        <Grid xs={12} md={8.5} sx={{ p: 3, pt: 0 }}>
          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={filteredByDate.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  filteredByDate.map((row) => row.id)
                )
              }
              action={
                <Tooltip title={t('actions.delete')}>
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={filteredByDate.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      filteredByDate.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {filteredByDate
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <AttendanceRegisterTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row)} // pass the full row
                        index={index}
                        isUser={isUser}
                        newTimesheet={newTimesheet}
                        setShowTimeSlot={setShowTimeSlot}
                        clearTimesheet={clearTimesheet}
                        addNewTimesheet={addNewTimesheet}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, filteredByDate.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>
          {view === 'list' && (
            <TablePaginationCustom
              page={table.page}
              rowsPerPageOptions={[100, 150, 250]}
              dense={table.dense}
              count={filteredByDate.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onChangeDense={table.onChangeDense}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              sx={{
                borderTopColor: 'transparent',
                '& .MuiTablePagination-actions > button svg': {
                  transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                },
              }}
            />
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('actions.delete')}
        content={
          <span>
            {' '}
            {t('dialogs.comfirm_delete')}
            <strong>{table.selected.length}</strong> {t('dialogs.items')}
          </span>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            {t('actions.delete')}
          </Button>
        }
      />
    </>
  );

  return <>{renderView}</>;
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, project, task, taskVariant } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((item) => item.employeeName === name);
  }

  // 📌 Project Filter
  if (project && project !== 'All Projects') {
    inputData = inputData.filter((item) => item.project === project);
  }

  // 📌 Status Filter
  if (status && status !== 'All Timesheets') {
    inputData = inputData.filter((item) => item.status === status);
  }

  // 📌 Task Filter
  if (task && task !== 'All Tasks') {
    inputData = inputData.filter((item) => item.task?.toLowerCase().includes(task.toLowerCase()));
  }

  if (filters.startDate) {
    inputData = inputData.filter((item) =>
      dayjs(item.startDate).isSame(dayjs(filters.startDate), 'day')
    );
  }
  if (taskVariant.length) {
    inputData = inputData.filter((item) => {
      const eachVariant =
        item?.task?.projectId && item?.task?.type === 0
          ? 'Mission'
          : item?.task?.vendorContractId
            ? 'Contract'
            : item?.task?.vendorId
              ? 'Vendor'
              : item?.task?.clientLeadId
                ? 'Lead'
                : item?.task?.clientId
                  ? 'Client'
                  : item?.task?.projectId && row?.task?.type === 1
                    ? 'Project'
                    : 'General';
      return taskVariant.includes(eachVariant);
    });
  }

  return inputData;
}
