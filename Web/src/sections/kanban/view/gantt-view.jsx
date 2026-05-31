import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import gantt from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import Box from '@mui/material/Box';

import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { lighten } from '@mui/system';
import { useTranslation } from 'react-i18next';

import { EmptyContent } from 'src/components/empty-content';
import { KanbanDetails } from 'src/sections/kanban/details/kanban-details';
import { updateTask } from 'src/actions/task/taskActions';
import { toast } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import dayjs from 'dayjs';

const GanttContainer = styled('div')({
  width: '100%',
  height: '600px',
  fontFamily: 'Montserrat',

  '& .gantt_task_line': {
    height: '24px !important',
    borderRadius: '6px',
    lineHeight: '21px!important',
    // marginTop: '0.2em',
    paddingLeft: '4px',
  },
  '& .gantt_task_content': {
    fontSize: 'smaller',
  },
  '& .gantt_tree_content': {
    fontSize: 'small',
  },

  '& .hexagon': {
    display: 'inline-block',
    marginLeft: '5px',
    fontSize: '16px',
    color: '#FF5733', // Customize hexagon color
  },
  '& .gantt_task_line:hover': {
    backgroundColor: '#22C55EE !important',
  },

  '& .gantt_grid_head_cell': {
    backgroundColor: '#006A67!important',
    color: '#FFFFFF!important',
    fontSize: 'x-small',
  },

  '& .gantt_task_scale': {
    backgroundColor: '#006A67!important',
    color: '#FFFFFF!important',
    fontSize: 'x-small',
  },

  // '& .gantt_last_cell': {
  //   color: '#1C252E!important',
  // },

  // '& .gantt_scale_cell': {
  //   color: '#1C252E!important',
  // },

  '& .gantt_container, & .gantt_tooltip': {
    backgroundColor: '#fff',
  },
  '& .gantt_milestone .gantt_task_content': {
    // Hide text in default milestone diamond
    display: 'none',
  },
  '& .gantt-missing-date .gantt_task_line': {
    background: '#FFF3CD !important',
    border: '1px dashed #F59E0B !important',
    color: '#92400E !important',
  },

  // '& .gantt-missing-date .gantt_task_content': {
  //   color: '#92400E !important',
  //   fontStyle: 'italic',
  // },

  '& .task-title': {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '16px',
  },

  '& .task-dates': {
    fontSize: '10px',
    color: '#637381',
    lineHeight: '14px',
  },
});

export function formatDateGanttChart(dateInput) {
  const { t } = useTranslation('dashboard/gantt');

  console.log('formatDateGanttChart received:', dateInput);
  if (!dateInput) return null;

  let d;
  if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    d = new Date(dateInput); // Attempt to parse if it's a string
  }

  // Check if the date is valid
  if (isNaN(d.getTime())) {
    // console.warn(`formatDateGanttChart received an invalid date: ${dateInput}. Returning null.`);
    return null;
  }

  if (gantt && gantt.date && gantt.date.date_to_str) {
    return gantt.date.date_to_str(gantt.config.date_format || '%d-%m-%Y')(d);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function ConfirmDateChangeDialog({
  openDialog,
  handleDialogClose,
  updatedField,
  handleChangeTaskDate,
  confirmLoading,
}) {
  const { t } = useTranslation('dashboard/gantt');

  if (!openDialog) return null;
  return (
    <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
      <DialogTitle>{t('gantt.title')}</DialogTitle>
      <DialogContent>
        <p>{`Are you sure you want to change the ${updatedField || 'date'}?`}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleDialogClose(false)}>{t('gantt.cancel')}</Button>
        <LoadingButton loading={confirmLoading} onClick={handleChangeTaskDate} color="primary">
          {t('gantt.confirm')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmPercentageChangeDialog({
  openDialog,
  handleDialogClose,
  textShow,
  handleChangePercentage,
  confirmLoading,
}) {
  const { t } = useTranslation('dashboard/gantt');

  if (!openDialog) return null;
  return (
    <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
      <DialogTitle>{textShow || t('gantt.confirm._progress')}</DialogTitle>
      <DialogContent>{!textShow && <p>{t('gantt.are_you_sure_update_task')}</p>}</DialogContent>
      <DialogActions>
        <Button onClick={() => handleDialogClose(false)}>{t('gantt.cancel')}</Button>
        {!textShow && ( // Only show confirm button if there's no prohibitive message
          <LoadingButton loading={confirmLoading} onClick={handleChangePercentage} color="primary">
            {t('gantt.confirm')}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function GanttView({
  tasks,
  isSubTask,
  taskListLoading,
  taskListEmpty,
  initialTasksData = tasks,
  isLoading = false,
  currentEmployeeId = 'current_user_mock_id',
  mutate,
  isUser,
  userId,
  allUsers,
  isTicket,
  // projectData = null, // Kept if used for default values not covered by tasks
}) {
  console.log('this is the tasks', initialTasksData);
  const theme = useTheme();
  const { t } = useTranslation('dashboard/gantt');
  const { zetaUser } = useAuthContext();

  const storedLang = localStorage.getItem('selectedLang');

  const ganttContainerRef = useRef(null);

  const [selectedTaskFullData, setSelectedTaskFullData] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDateChangeDialog, setOpenDateChangeDialog] = useState(false);
  const [openPercentageDialog, setOpenPercentageDialog] = useState(false);
  const [permissionDeniedDialog, setPermissionDeniedDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [ganttRenderLoading, setGanttRenderLoading] = useState(true);

  const [updatedFieldText, setUpdatedFieldText] = useState(null);
  const [previousTaskGanttState, setPreviousTaskGanttState] = useState(null);
  const [taskPendingUpdate, setTaskPendingUpdate] = useState(null);
  const [confirmActionLoading, setConfirmActionLoading] = useState(false);

  const [ganttTasks, setGanttTasks] = useState([]);
  // Store the full task data separately for detailed views or complex logic
  const [fullTasksData, setFullTasksData] = useState([]);

  const taskDescriptionStrForDetails = useMemo(() => {
    if (!selectedTaskFullData || !selectedTaskFullData.description) {
      return selectedTaskFullData?.name || 'Unnamed Task';
    }
    try {
      const parsedDesc = JSON.parse(selectedTaskFullData.description);
      return (
        parsedDesc.TranscriptStr ||
        parsedDesc.TranscriptEnglishStr ||
        selectedTaskFullData.description
      );
    } catch (e) {
      return selectedTaskFullData.description;
    }
  }, [selectedTaskFullData]);
  const transcriptStr = useMemo(() => {
    if (!selectedTaskFullData?.description) return '';

    try {
      const parsedDesc = JSON.parse(selectedTaskFullData.description);
      return parsedDesc?.TranscriptStr || '';
    } catch (err) {
      console.warn('Failed to parse description', err);
      return '';
    }
  }, [selectedTaskFullData]);

  console.log('this is the task desc str', taskDescriptionStrForDetails);

  const notFound = !isLoading && (!ganttTasks || ganttTasks.length === 0);

  const taskStatusColors = {
    // Define colors based on your theme or fixed values
    Completed: lighten(theme.palette.tasks?.completed || '#4CAF50', 0.3),
    'On Hold': lighten(theme.palette.tasks?.hold || '#FF9800', 0.3),
    'In Progress': lighten(theme.palette.tasks?.inProgress || '#2196F3', 0.3),
    Submitted: lighten(theme.palette.tasks?.submitted || '#00BCD4', 0.3),
    'Not Started': lighten(theme.palette.tasks?.notStarted || '#9E9E9E', 0.3),
  };

  useEffect(() => {
    if (initialTasksData) {
      // console.log('GanttView - initialTasksData received:', JSON.parse(JSON.stringify(initialTasksData)));
      setFullTasksData(
        initialTasksData.map((task) => ({
          ...task,
          // Ensure necessary fields for logic are present
          ownerId: task.ownerId || currentEmployeeId,
          members: task.members || [
            { id: currentEmployeeId, name: 'Current User', employeeId: currentEmployeeId },
          ],
          status: task.status !== undefined ? task.status : 6, // Default to Not Started
        }))
      );

      const mappedToGantt = initialTasksData.map((task) => {
        const hasStartDate = !!task.startDate;
        const hasEndDate = !!task.endDate;
        const hasBothDates = hasStartDate && hasEndDate;

        let startDateObj = hasStartDate
          ? new Date(task.startDate)
          : new Date(task.created || new Date());
        let endDateObj = hasEndDate
          ? new Date(task.endDate)
          : dayjs(startDateObj).add(1, 'day').toDate();

        let taskDisplayText = 'Unnamed Task';
        if (task.description) {
          try {
            const parsedDesc = JSON.parse(task.description);
            taskDisplayText =
              parsedDesc.TranscriptStr || parsedDesc.TranscriptEnglishStr || task.description;
          } catch (e) {
            taskDisplayText = task.description;
          }
        }

        // Validate and set defaults for startDate
        if (!startDateObj || isNaN(startDateObj.getTime())) {
          // console.warn(`Invalid or missing startDate for task ${task.id}: '${task.startDate}'. Defaulting to today.`);
          startDateObj = new Date(); // Default to today
        }
        const ganttFormattedTask = {
          id: task.id,
          display_id: String(task.serial).padStart(5, '0') || task.id,
          text: !task?.audioFileId ? taskDisplayText : 'Audio File...',
          start_date: startDateObj,
          rawStartDate: task.startDate,
          rawEndDate: task.endDate,
          hasBothDates,
          progress:
            task.progress !== undefined
              ? task.progress
              : task.percentageOfCompletion
                ? task.percentageOfCompletion / 100
                : 0,
          parent: task.parentTaskId || 0, // This should be the ID (UUID) of the parent if subtasks exist
          color: taskStatusColors[task?.statusName?.value] || '#E0E0E0',
        };

        if (task.type === 'milestone' || (task.endDate === null && task.duration === 0)) {
          ganttFormattedTask.type = gantt.config.types.milestone;
          ganttFormattedTask.duration = 0; // Milestones have 0 duration
        } else if (task.endDate) {
          const endDateObj = new Date(task.endDate);
          // dhtmlx-gantt's end_date is exclusive for duration calculation.
          // If task ends on 10th, end_date should be 11th for correct visual length.
          endDateObj.setDate(endDateObj.getDate() + 1);
          ganttFormattedTask.end_date = endDateObj;
        } else if (task.duration !== undefined) {
          ganttFormattedTask.duration = task.duration;
        } else {
          ganttFormattedTask.duration = 1; // Default duration if no end_date or duration
        }
        return ganttFormattedTask;
      });
      setGanttTasks(mappedToGantt);
    }
  }, [initialTasksData, currentEmployeeId]); // theme.palette for taskStatusColors if it changes

  useEffect(() => {
    if (isLoading || !ganttContainerRef.current || !gantt) return;
    setGanttRenderLoading(true);

    gantt.config.columns = [
      { name: 'display_id', label: t('gantt.ID'), align: 'center', width: 90, resize: true },
      {
        name: 'text',
        label: t('gantt.task_name'),
        tree: true,
        width: 280,
        resize: true,
        template: (task) => {
          const start = task.rawStartDate
            ? dayjs(task.rawStartDate).format('DD-MM-YYYY')
            : 'Not available';

          const end = task.rawEndDate
            ? dayjs(task.rawEndDate).format('DD-MM-YYYY')
            : 'Not available';

          return `
      <div>
        <div class="task-title">${task.text}</div>
        <div class="task-dates">
          ${t('gantt.start_date')}: ${start} | ${t('gantt.end_date')}: ${end}
        </div>
      </div>
    `;
        },
      },
      // {
      //   name: 'start_date',
      //   label: t('gantt.start_date'),
      //   align: 'center',
      //   width: 120,
      //   resize: true,
      // },
      // {
      //   name: 'end_date',
      //   label: t('gantt.end_date'),
      //   align: 'center',
      //   width: 120,
      //   resize: true,
      // },
      // { name: 'duration', label: 'Duration', align: 'center', width: 70, resize: true },
      // {
      //   name: 'progress',
      //   label: 'Progress',
      //   template: (task) => `${(task.progress * 100).toFixed(0)}%`,
      //   align: 'center', width: 70, resize: true
      // },
    ];
    gantt.config.date_format = '%d-%m-%Y';
    gantt.config.xml_date = '%Y-%m-%d %H:%i:%s'; // For parsing ISO strings if needed
    gantt.config.scale_unit = 'day';
    gantt.config.date_scale = '%d %M';
    gantt.config.subscales = [{ unit: 'month', step: 1, date: '%F %Y' }];

    gantt.config.drag_progress = false;

    if (zetaUser?.roles?.includes('External')) {
      gantt.config.readonly = true;
      gantt.config.drag_move = false;
      gantt.config.drag_resize = false;
      gantt.config.drag_links = false;
    } else {
      gantt.config.readonly = false;
      gantt.config.drag_move = true;
      gantt.config.drag_resize = true;
      gantt.config.drag_links = false;
    }

    gantt.config.min_column_width = 50;
    gantt.config.row_height = 48;
    gantt.config.bar_height = 15;
    gantt.config.task_height_offset = 5; // Padding around task bars
    gantt.config.bar_height = 25;

    // Initialize or re-initialize Gantt in the container.
    // This sets up the necessary DOM structure.
    gantt.templates.task_class = function (start, end, task) {
      return task.hasBothDates ? '' : 'gantt-missing-date';
    };
    gantt.init(ganttContainerRef.current);

    // Clear any existing data from the Gantt instance *after* it's initialized.
    gantt.clearAll();

    if (ganttTasks.length > 0 && !notFound) {
      const links = ganttTasks
        .filter(
          (task) => task.parent && task.parent !== 0 && ganttTasks.find((p) => p.id === task.parent)
        ) // Ensure parent exists
        .map((task) => ({
          id: `link_${task.id}_${task.parent}`,
          source: task.parent,
          target: task.id,
          type: gantt.config.links.finish_to_start,
        }));
      gantt.parse({ data: ganttTasks, links });
      ganttTasks.forEach((task) => {
        if (gantt.isTaskExists(task.id)) gantt.open(task.id);
      });
    }
    gantt.render();
    setTimeout(() => setGanttRenderLoading(false), 100);

    const onTaskClickHandler = gantt.attachEvent('onTaskClick', (id) => {
      const clickedFullTask = fullTasksData.find((t) => String(t.id) === String(id));
      if (clickedFullTask) {
        setSelectedTaskFullData(clickedFullTask);
        setOpenDetails(true);
      }
      return true;
    });

    const onTaskDragHandler = gantt.attachEvent('onTaskDrag', (id, mode, task) => {
      const currentFullTask = fullTasksData.find((t) => String(t.id) === String(id));
      if (currentFullTask && !previousTaskGanttState) {
        setPreviousTaskGanttState({
          id: task.id, // Store id for easier access
          start_date: new Date(task.start_date),
          end_date: new Date(task.end_date),
          progress: task.progress,
          fullData: { ...currentFullTask }, // Store original full data
        });
      }
      return true;
    });

    const onAfterTaskDragHandler = gantt.attachEvent('onAfterTaskDrag', (id, mode) => {
      const draggedFullTask = previousTaskGanttState?.fullData; // Use stored full data
      const currentGanttTask = gantt.getTask(id);

      if (!draggedFullTask) {
        if (previousTaskGanttState && gantt.isTaskExists(id)) {
          // Revert if no original data found (should not happen)
          const taskToRevert = gantt.getTask(id);
          taskToRevert.start_date = previousTaskGanttState.start_date;
          taskToRevert.end_date = previousTaskGanttState.end_date;
          taskToRevert.progress = previousTaskGanttState.progress;
          gantt.updateTask(id);
        }
        setPreviousTaskGanttState(null);
        return true;
      }

      setTaskPendingUpdate({
        id,
        mode,
        ganttTask: currentGanttTask,
        fullTaskData: draggedFullTask,
      });

      // const isOwner = draggedFullTask.ownerId === currentEmployeeId;
      const isMember = draggedFullTask.members?.some((m) => m.employeeId === currentEmployeeId);

      // if (mode === 'progress') {
      //   if (isOwner || isMember) {
      //     if (draggedFullTask.status !== 0) {
      //       // Assuming 0 is 'In Progress'
      //       setDialogMessage('Task not "In Progress", cannot update progress.');
      //       setOpenPercentageDialog(true); // Will show message, no confirm button
      //     } else {
      //       setDialogMessage(''); // Clear message, allow confirmation
      //       setOpenPercentageDialog(true);
      //     }
      //   } else {
      //     setDialogMessage('You do not have permission to edit progress.');
      //     setOpenPercentageDialog(true); // Show message, no confirm
      //   }
      // }
      if (mode === 'move' || mode === 'resize') {
        if (!isUser) {
          let field = 'dates';
          if (mode === 'resize') {
            if (
              currentGanttTask.start_date.valueOf() !== previousTaskGanttState.start_date.valueOf()
            )
              field = 'start date';
            else if (
              currentGanttTask.end_date.valueOf() !== previousTaskGanttState.end_date.valueOf()
            )
              field = 'end date';
          }
          setUpdatedFieldText(field);
          setOpenDateChangeDialog(true);
        } else {
          // Revert unauthorized drag for dates
          if (previousTaskGanttState && gantt.isTaskExists(id)) {
            const taskToRevert = gantt.getTask(id);
            taskToRevert.start_date = previousTaskGanttState.start_date;
            taskToRevert.end_date = previousTaskGanttState.end_date;
            taskToRevert.progress = previousTaskGanttState.progress; // Also revert progress if it was part of the drag state
            gantt.updateTask(id);
          }
          setDialogMessage('p');
          // setPermissionDeniedDialog(true);
          setPreviousTaskGanttState(null);
        }
      }
      return true;
    });

    return () => {
      gantt.detachEvent(onTaskClickHandler);
      gantt.detachEvent(onTaskDragHandler);
      gantt.detachEvent(onAfterTaskDragHandler);
      // The check for gantt.getGanttInstance() was causing an error.
      // If specific cleanup like clearAll or destructor is needed,
      // it should be done based on ganttContainerRef.current existing
      // and potentially other state indicating initialization.
      // if (ganttContainerRef.current) {
      // gantt.clearAll(); // Clears data, keeps config. Useful if re-parsing.
      // gantt.destructor(); // If component truly unmounts and gantt instance is not needed.
      // }
    };
  }, [
    ganttTasks,
    isLoading,
    notFound,
    // t,
    fullTasksData,
    currentEmployeeId,
    previousTaskGanttState,
  ]);

  const revertGanttTaskChange = () => {
    if (previousTaskGanttState && gantt.isTaskExists(previousTaskGanttState.id)) {
      const task = gantt.getTask(previousTaskGanttState.id);
      task.start_date = new Date(previousTaskGanttState.start_date);
      task.end_date = new Date(previousTaskGanttState.end_date);
      task.progress = previousTaskGanttState.progress;
      gantt.updateTask(previousTaskGanttState.id);
    }
  };

  const handleDateChangeDialogClose = (confirmed) => {
    if (!confirmed) revertGanttTaskChange();
    setOpenDateChangeDialog(false);
    setUpdatedFieldText(null);
    setPreviousTaskGanttState(null);
    setTaskPendingUpdate(null);
    setConfirmActionLoading(false);
  };

  const handlePercentageDialogClose = (confirmed) => {
    if (!confirmed && !dialogMessage) revertGanttTaskChange(); // Only revert if it was a confirmable action
    setOpenPercentageDialog(false);
    setDialogMessage('');
    setPreviousTaskGanttState(null);
    setTaskPendingUpdate(null);
    setConfirmActionLoading(false);
  };

  const handleSimulatedTaskDateUpdate = async () => {
    setConfirmActionLoading(true);
    console.log('Simulating: Initial task data', initialTasksData);

    let payload;

    if (taskPendingUpdate && taskPendingUpdate.id && Array.isArray(initialTasksData)) {
      const matchingTask = initialTasksData.find((task) => task.id === taskPendingUpdate.id);
      console.log('this is the matchingTask', matchingTask);
      if (matchingTask) {
        payload = {
          ...matchingTask,
          startDate: taskPendingUpdate.ganttTask.start_date.toISOString(),
          endDate: taskPendingUpdate.ganttTask.end_date.toISOString(),
          membersIds: matchingTask.members.map((person) => person.memberId),
        };
      } else {
        console.error('Matching task not found for update.');
        setConfirmActionLoading(false);
        return;
      }
    } else {
      console.log(
        'Could not perform search: taskPendingUpdate or initialTasksData is not in the expected format.'
      );
      setConfirmActionLoading(false);
      return;
    }
    payload.description = transcriptStr;

    console.log('this is the payload being sent to updateTask', payload);
    try {
      const response = await updateTask(payload);

      if (response && response.success && taskPendingUpdate) {
        // const updatedFullTasks = fullTasksData.map((ft) =>
        //   ft.id === taskPendingUpdate.id
        //     ? {
        //         ...ft,
        //         startDate: taskPendingUpdate.ganttTask.start_date,
        //         endDate: taskPendingUpdate.ganttTask.end_date,
        //       }
        //     : ft
        // );
        toast.success('Task updated successfully');
        // setFullTasksData(updatedFullTasks);
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
    handleDateChangeDialogClose(true); // Pass true as it was "confirmed"
  };

  const handleSimulatedPercentageUpdate = async () => {
    setConfirmActionLoading(true);
    console.log('Simulating: Update task percentage for', taskPendingUpdate);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (taskPendingUpdate) {
      const updatedFullTasks = fullTasksData.map((ft) =>
        ft.id === taskPendingUpdate.id
          ? {
              ...ft,
              progress: taskPendingUpdate.ganttTask.progress,
              percentageOfCompletion: taskPendingUpdate.ganttTask.progress * 100,
            }
          : ft
      );
      setFullTasksData(updatedFullTasks);
    }
    handlePercentageDialogClose(true);
  };

  if (taskListLoading)
    return (
      <LinearProgress
        sx={{
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#2FBBA8',
          },
          backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
        }}
      />
    );

  return (
    <>
      {notFound ? (
        <EmptyContent
          filled
          sx={{ py: 10 }}
          title={t('gantt.timeline_not_found')}
          description={t('gantt.no_tasks_display')}
        />
      ) : (
        <GanttContainer ref={ganttContainerRef} id="ganttStaticDisplayContainer" />
      )}

      {openDetails && selectedTaskFullData && (
        <KanbanDetails
          key={selectedTaskFullData.id}
          task={selectedTaskFullData}
          openDetails={openDetails}
          onCloseDetails={() => {
            setOpenDetails(false);
            setSelectedTaskFullData(null);
          }}
          taskDescriptionStr={taskDescriptionStrForDetails}
          isUser={isUser}
          userId={userId}
          allUsers={allUsers}
          anchor={storedLang === 'ar' ? 'left' : 'right'}
          isTicket={isTicket}
          // mainListMutate={() => console.log("Mock mutate from KanbanDetails")} // Mock if needed
        />
      )}

      <ConfirmDateChangeDialog
        openDialog={openDateChangeDialog}
        handleDialogClose={handleDateChangeDialogClose}
        updatedField={updatedFieldText}
        handleChangeTaskDate={handleSimulatedTaskDateUpdate}
        confirmLoading={confirmActionLoading}
      />
      <ConfirmPercentageChangeDialog
        openDialog={openPercentageDialog}
        handleDialogClose={handlePercentageDialogClose}
        textShow={dialogMessage}
        handleChangePercentage={handleSimulatedPercentageUpdate}
        confirmLoading={confirmActionLoading}
      />
      <Dialog open={permissionDeniedDialog} onClose={() => setPermissionDeniedDialog(false)}>
        <DialogTitle>{t('gantt.permission_denied')}</DialogTitle>
        <DialogContent>
          <p>{dialogMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDeniedDialog(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
