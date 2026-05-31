'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  rectIntersection,
  getFirstCollision,
  MeasuringStrategy,
} from '@dnd-kit/core';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { hideScrollY } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { moveColumn } from 'src/actions/kanban';

import { useBoolean } from 'src/hooks/use-boolean';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { toast } from 'src/components/snackbar';

import { kanbanClasses } from '../classes';
import { coordinateGetter } from '../utils';
import { changeStatus } from 'src/actions/task/taskActions';
import { KanbanColumn } from '../column/kanban-column';
import { KanbanTaskItem } from '../item/kanban-task-item';
import { KanbanColumnAdd } from '../column/kanban-column-add';
import { KanbanColumnSkeleton } from '../components/kanban-skeleton';
import { KanbanDragOverlay } from '../components/kanban-drag-overlay';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks'; // Added
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

const PLACEHOLDER_ID = 'placeholder';

const cssVars = {
  '--item-gap': '16px',
  '--item-radius': '12px',
  '--column-gap': '24px',
  '--column-width': '18%', // Adjust as needed, or make dynamic
  '--column-radius': '16px',
  '--column-padding': '20px 16px 16px 16px',
};

// ----------------------------------------------------------------------

export function KanbanView({
  taskList,
  taskListLoading,
  taskListError,
  mutateTasks,
  statusList,
  isTicket,
  statusListLoading,
  statusListError,
  mutateStatuses,
  isUser,
}) {
  const { zetaUser } = useAuthContext(); // Added
  const { t, i18n } = useTranslation('dashboard/tasks');

  const boardLoading = taskListLoading;

  const confirmStatusChangeDialog = useBoolean();
  const [statusChangeDetails, setStatusChangeDetails] = useState(null);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    scrollRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; // scroll-fast factor
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  // Transform API data into the board structure
  const board = useMemo(() => {
    if (boardLoading || taskListError) {
      return { columns: [], tasks: {} };
    }

    const apiStatuses = statusList?.status || [];
    const apiTasks = taskList?.tasks || [];

    // Determine a fallback "Not Started" status ID and Name from the global status list
    const notStartedStatusFromList = apiStatuses.find(
      (s) => s.name?.value?.toLowerCase() === 'not started'
    );
    const NOT_STARTED_FALLBACK_ID = notStartedStatusFromList
      ? String(notStartedStatusFromList.id)
      : null;
    const NOT_STARTED_FALLBACK_NAME = notStartedStatusFromList
      ? notStartedStatusFromList.name?.value
      : 'Not Started';

    const columns = apiStatuses
      // .filter((statusItem) => statusItem.status !== 5)
      .map((statusItem) => ({
        id: String(statusItem.id), // Ensure ID is string
        name: statusItem.name.value,
      }));

    const tasksByColumn = {};
    columns.forEach((col) => {
      tasksByColumn[col.id] = [];
    });

    apiTasks.forEach((apiTask) => {
      let effectiveStatusId = apiTask.statusId ? String(apiTask.statusId) : null;
      let effectiveStatusName = apiTask.statusName?.value;

      if (zetaUser && String(apiTask.creatorId) === String(zetaUser?.id)) {
        // User is the creator, use the task's main status
        effectiveStatusId = apiTask.statusId ? String(apiTask.statusId) : null;
        effectiveStatusName = apiTask.statusName?.value;
      } else if (zetaUser && apiTask.members?.length > 0) {
        // User is not the creator, check if they are a member with a specific status
        const matchedMember = apiTask.members.find(
          (m) => String(m.memberId) === String(zetaUser?.id)
        );
        if (matchedMember && matchedMember.statusId) {
          effectiveStatusId = String(matchedMember.statusId);
          // Try to get the name from the global status list for consistency
          const memberStatusObj = apiStatuses.find((s) => String(s.id) === effectiveStatusId);
          effectiveStatusName = memberStatusObj
            ? memberStatusObj.name?.value
            : matchedMember.statusName?.value;
        } else {
          // User is a member but no specific status, or not listed as member, use task's main status
          effectiveStatusId = apiTask.statusId ? String(apiTask.statusId) : null;
          effectiveStatusName = apiTask.statusName?.value;
        }
      } else {
        // No zetaUser or not creator/member, use task's main status
        effectiveStatusId = apiTask.statusId ? String(apiTask.statusId) : null;
        effectiveStatusName = apiTask.statusName?.value;
      }

      // Fallback if effectiveStatusId or effectiveStatusName is still null/undefined
      effectiveStatusId = effectiveStatusId ?? NOT_STARTED_FALLBACK_ID;
      effectiveStatusName = effectiveStatusName ?? NOT_STARTED_FALLBACK_NAME;

      if (effectiveStatusId && tasksByColumn[effectiveStatusId]) {
        const kanbanTask = {
          id: String(apiTask.id), // Ensure ID is string
          name: apiTask.description,
          reporter: apiTask.creatorId
            ? {
                id: String(apiTask.creatorId),
                name: apiTask.creatorName,
              }
            : undefined,
          assignee:
            apiTask.members?.map((member) => ({
              id: String(member.memberId),
              name: member.memberName,
              avatarUrl: member.memberPhotoPath,
            })) || [],
          description: apiTask.description,
          priority: apiTask.priorityName?.value,
          labels: apiTask.projectName ? [apiTask.projectName] : [],
          comments: [],
          due:
            apiTask.startDate && apiTask.endDate ? [apiTask.startDate, apiTask.endDate] : undefined,
          attachments: [],
          status: effectiveStatusName, // Use the determined effective status name
          ...apiTask, // Pass other properties from the original API task
          statusId: effectiveStatusId, // Store the effective status ID on the task object
        };
        tasksByColumn[effectiveStatusId].push(kanbanTask);
      } else if (effectiveStatusId) {
        // This case handles if a task's effectiveStatusId doesn't match any column
        // Potentially log this or decide on a default column (e.g., a "General" or first column)
        // For now, we'll assume all valid effectiveStatusIds have a corresponding column
        console.warn(
          `Task ${apiTask.id} with effective status ${effectiveStatusId} has no matching column.`
        );
      }
    });

    return { columns, tasks: tasksByColumn };
  }, [boardLoading, taskList, statusList, taskListError, zetaUser]); // Added zetaUser

  const boardEmpty = !boardLoading && !board.columns.length;

  const [columnFixed, setColumnFixed] = useState(true);
  const recentlyMovedToNewContainer = useRef(false);
  const lastOverId = useRef(null);
  const [activeId, setActiveId] = useState(null); // Can be column ID or task ID

  const columnIds = useMemo(
    () => board.columns.map((column) => String(column.id)),
    [board.columns]
  );
  const isSortingContainer = activeId ? columnIds.includes(String(activeId)) : false;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter })
  );

  const findColumn = useCallback(
    (id) => {
      if (!id) return null;
      const idStr = String(id);

      if (board.tasks && idStr in board.tasks) {
        // id is a columnId
        return idStr;
      }
      // id is a taskId, find its column
      for (const columnId of Object.keys(board.tasks)) {
        if (board.tasks[columnId]?.some((task) => String(task.id) === idStr)) {
          return columnId;
        }
      }
      return null;
    },
    [board.tasks]
  );

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeId && board.tasks && String(activeId) in board.tasks) {
        // Dragging a column
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in board.tasks
          ),
        });
      }

      // Dragging a task item
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);

      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        const overColumnId = findColumn(overId); // overId could be a task or a column
        if (overColumnId) {
          // If overId is a column or a task within a column
          lastOverId.current = overColumnId;
          return [{ id: overColumnId }];
        }
        // Fallback if overId is not directly a column or task (should be rare with current findColumn)
        lastOverId.current = String(overId);
        return [{ id: String(overId) }];
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, board.tasks, findColumn]
  );

  const onDragStart = ({ active }) => {
    setActiveId(String(active.id));
    recentlyMovedToNewContainer.current = false;
  };

  const onDragOver = ({ active, over }) => {
    const overId = over?.id ? String(over.id) : null;
    const currentActiveId = String(active.id);

    if (!overId || currentActiveId in board.tasks) {
      return;
    }

    const activeColumnId = findColumn(currentActiveId);
    const overColumnId = findColumn(overId);

    if (!activeColumnId || !overColumnId) {
      return;
    }

    if (activeColumnId !== overColumnId) {
      recentlyMovedToNewContainer.current = true;
    }
  };

  const onDragEnd = ({ active, over }) => {
    const currentActiveId = String(active.id);
    const overId = over?.id ? String(over.id) : null;

    setActiveId(null);
    recentlyMovedToNewContainer.current = false;

    if (!overId) {
      console.log('[DragEnd] No over.id, operation cancelled or invalid drop.');
      return;
    }

    if (currentActiveId in board.tasks) {
      console.log('[DragEnd] Column drag detected and ended.');
      return;
    }

    const originalColumnId = findColumn(currentActiveId);
    const targetColumnId = findColumn(overId);

    if (!originalColumnId || !targetColumnId) {
      console.error('[DragEnd] Could not determine original or target column.', {
        originalColumnId,
        targetColumnId,
        currentActiveId,
        overId,
      });
      return;
    }

    if (originalColumnId !== targetColumnId) {
      const taskToUpdate = board.tasks[originalColumnId]?.find(
        (task) => String(task.id) === currentActiveId
      );

      if (!taskToUpdate) {
        console.error(
          `[DragEnd] Task ${currentActiveId} not found in its original column ${originalColumnId}.`
        );
        toast.error(
          t(
            'tasks.kanban.error_task_not_found_on_drag',
            'Error processing drag: Task details not found.'
          )
        );
        return;
      }

      const apiTargetStatusId = targetColumnId;

      const isValidApiStatus = (statusList?.status || []).some(
        (s) => String(s.id) === apiTargetStatusId
      );
      if (!isValidApiStatus) {
        console.error(
          `[DragEnd] Invalid target API status ID: ${apiTargetStatusId} for task ${taskToUpdate.id}.`
        );
        toast.error(
          t(
            'tasks.kanban.error_invalid_target_status',
            'The target status for the task is invalid.'
          )
        );
        return;
      }

      const uiTargetColumn = board.columns.find((c) => String(c.id) === targetColumnId);
      const newStatusNameForDialog = uiTargetColumn ? uiTargetColumn.name : apiTargetStatusId;

      setStatusChangeDetails({
        taskId: taskToUpdate.id,
        newStatusId: apiTargetStatusId,
        taskName: taskToUpdate.name,
        newStatusName: newStatusNameForDialog,
      });
      confirmStatusChangeDialog.onTrue();
    } else {
      console.log(
        `[DragEnd] Task ${currentActiveId} reordered within column ${originalColumnId} or drag ended over same column. No status change.`
      );
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    recentlyMovedToNewContainer.current = false;
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeDetails) return;

    const { taskId, newStatusId } = statusChangeDetails;
    const payload = { taskId, statusId: newStatusId };

    confirmStatusChangeDialog.onFalse();

    try {
      const response = await changeStatus(payload);
      if (response.success) {
        toast.success(t('projects.status.task_status'));
        await mutateTasks();
      } else {
        toast.error(response.error || 'Failed to change task status.');
      }
    } catch (error) {
      console.error('Change Status API call failed:', error);
      toast.error(t('projects.status.task_status_error'));
    } finally {
      setStatusChangeDetails(null);
    }
  };

  const renderLoading = (
    <Stack direction="row" alignItems="flex-start" sx={{ gap: 'var(--column-gap)' }}>
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </Stack>
  );

  const renderEmpty = <EmptyContent filled sx={{ py: 10, maxHeight: { md: 480 } }} />;

  if (taskListError) {
    return <Typography color="error">{String(taskListError)}</Typography>;
  }

  const renderList = (
    <DndContext
      id="dnd-kanban"
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <Stack
        sx={{ flex: '1 1 auto', overflowX: 'auto', ml: -3 }}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Stack
          sx={{
            pb: 3,
            display: 'unset',
            ...(columnFixed && { minHeight: 0, display: 'flex', flex: '1 1 auto' }),
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: 'var(--column-gap)',
              ...(columnFixed && {
                minHeight: 0,
                flex: '1 1 auto',
                [`& .${kanbanClasses.columnList}`]: { ...hideScrollY, flex: '1 1 auto' },
              }),
            }}
          >
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {board?.columns.map((column) => (
                <KanbanColumn key={column.id} column={column} tasks={board.tasks[column.id] || []}>
                  <SortableContext
                    items={(board.tasks[column.id] || []).map((task) => String(task.id))}
                    strategy={verticalListSortingStrategy}
                  >
                    {(board.tasks[column.id] || []).map((task) => (
                      <KanbanTaskItem
                        task={task}
                        key={task.id}
                        columnId={column.id}
                        disabled={isSortingContainer}
                        isTicket={isTicket}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              ))}
            </SortableContext>
          </Stack>
        </Stack>
      </Stack>

      <KanbanDragOverlay
        columns={board?.columns}
        tasks={board?.tasks}
        activeId={activeId}
        sx={cssVars}
      />
    </DndContext>
  );

  return (
    <>
      <DashboardContent
        maxWidth={false}
        sx={{
          ...cssVars,
          pb: 0,
          pl: { sm: 3 },
          pr: { sm: 0 },
          flex: '1 1 0',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: { xs: 3, md: 2 } }}
        ></Stack>

        {boardLoading ? renderLoading : <>{boardEmpty ? renderEmpty : renderList}</>}
      </DashboardContent>

      {statusChangeDetails && (
        <ConfirmDialog
          open={confirmStatusChangeDialog.value}
          onClose={() => {
            confirmStatusChangeDialog.onFalse();
            setStatusChangeDetails(null);
          }}
          title="Confirm Status Change"
          content={
            <Typography>
              {`Are you sure you want to move task to status "${statusChangeDetails.newStatusName}"?`}
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={handleConfirmStatusChange}
              sx={{ bgcolor: '#006A67' }}
            >
              Confirm
            </Button>
          }
        />
      )}
    </>
  );
}
