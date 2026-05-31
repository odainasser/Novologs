'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { _userList } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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

import { KanbanTableRow } from 'src/sections/kanban/kanban-table-row';
import { KanbanTableToolbar } from 'src/sections/kanban/kanban-table-toolbar';
import { KanbanTableFiltersResult } from 'src/sections/kanban/kanban-table-filters-result';

import { KanbanAddWeight } from 'src/sections/kanban/kanban-add-weight';

import { KanbanView } from 'src/sections/kanban/view/kanban-view';
import GanttView from 'src/sections/kanban/view/gantt-view';

import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';

import {
  _status,
  _projects,
  _categories,
  _members,
  _weight,
  priorityOptions,
  tasks,
  taskStatus,
  taskVariant,
} from 'src/sections/kanban/kanban-mock-data';
import { Form } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { KanbanCreateForm } from 'src/sections/kanban/kanban-create-form';
import { KanbanSettingsView } from 'src/sections/kanban/view/kanban-settings-view';
import { UserSettingsButton } from 'src/sections/user/view/user-settings-button';
import { getTasks } from 'src/actions/task/taskActions';

import { getItemCost } from 'src/actions/timeSheet/timeSheetActions';

import { getUser } from 'src/actions/userManage/userManageActions';
import { getPriorities, deleteTask, getStatus, getCategories } from 'src/actions/task/taskActions';
import {
  deleteMilestone,
  addMilestoneTasks,
  getMilestone,
} from 'src/actions/project/projectActions';
import { getHierarchy } from 'src/actions/hierarchy/hierarchyActions';

import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useAuthContext } from 'src/auth/hooks';
import { AddMilestoneDialog } from 'src/sections/project/add-milestone';
import { AddMilestoneTask } from 'src/sections/project/add-milestone-task';

import Typography from '@mui/material/Typography';
import { fDate } from 'src/utils/format-time';

import { AddProjectWorkflow } from '../add-project-workflow';
import { workflow_mock_data } from '../workflow-mock-data';
import { WorkflowFileView } from './workflow-file-view';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function WorkflowDetailsView({
  isClient,
  isUser,
  isProject,
  isTaskCategory,
  isMilestone,
  isSubTask,
  parentTaskId,
  parentTask,
  projectId,
  isClientView,
  clientId,
  isLead,
  leadId,
  userId,
  passedMainListMutate,
}) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser();
  const { statusList, statusListLoading, statusListError, mutate: mutateStatuses } = getStatus();

  const { priorityList, priorityListEmpty } = getPriorities();

  const { categoryList, categoryListEmpty } = getCategories();
  const { hierarchyList } = getHierarchy();

  const getMilestoneParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 50,
    },
  };
  if (projectId) {
    getMilestoneParams.projectId = projectId;
  }
  const {
    milestoneList,
    milestoneListEmpty,
    mutate: mutateMilestone,
  } = getMilestone(isProject && isMilestone ? getMilestoneParams : null);

  const { t, i18n } = useTranslation('dashboard/tasks');
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });

  const filters = useSetState({
    name: '',
    role: [],
    status: 0,
    category: undefined,
    milestone: undefined,
    member: [],
    taskStatus: [],
    taskVariant: [],
    priority: [],
  });
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [targetMilestoneIdForDelete, setTargetMilestoneIdForDelete] = useState(null);

  useEffect(() => {
    if (categoryList?.categories?.length > 0 && !filters.state.category) {
      filters.setState({ category: categoryList.categories[0].id });
    }
  }, [categoryList, filters]);

  useEffect(() => {
    if (milestoneList?.milestone?.length > 0 && !filters.state.milestone) {
      filters.setState({ milestone: workflow_mock_data.items[0].id });
    } else if (
      filters.state.milestone &&
      workflow_mock_data.items &&
      !workflow_mock_data.items.some((m) => m.id === filters.state.milestone)
    ) {
      filters.setState({ milestone: undefined });
    }
  }, [milestoneList, filters]);

  const CREAT_FILTER_MAP = {
    created: 0,
    assigned: 1,
    backlog: 3,
  };
  const [totalCounts, setTotalCounts] = useState({
    created: null,
    assigned: null,
    backlog: null,
  });
  const [view, setView] = useState('list');

  const currentCreatFilter = CREAT_FILTER_MAP[filters.state.status] ?? 0;
  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const getTasksParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: view === 'gantt' ? 200 : currentPageSize,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
  };
  if (!isTaskCategory && !isMilestone) {
    getTasksParams.creatFilter = filters.state.status;
  }
  if (isTaskCategory) {
    getTasksParams.creatFilter = 4;
    getTasksParams.categoryId = [filters.state.category];
  }

  if (isSubTask) {
    getTasksParams.controlEntity = 1;
    getTasksParams.controlEntityId = parentTaskId;
  }
  if (isProject && !isMilestone) {
    getTasksParams.controlEntity = 2;
    getTasksParams.controlEntityId = projectId;
  }
  if (isMilestone) {
    getTasksParams.controlEntity = 2;
    getTasksParams.controlEntityId = projectId;
  }
  if (isClient) {
    if (isClientView) {
      getTasksParams.controlEntity = 4;
    } else {
      getTasksParams.controlEntity = 6;
    }
    getTasksParams.controlEntityId = clientId;
  }
  if (isLead) {
    if (isClientView) {
      getTasksParams.controlEntity = 5;
    } else {
      getTasksParams.controlEntity = 7;
    }
    getTasksParams.controlEntityId = leadId;
  }
  if (isUser) {
    getTasksParams.userIds = [userId];
  }

  let shouldFetchTasks;
  if (isTaskCategory) {
    shouldFetchTasks = Boolean(filters.state.category);
  } else if (isMilestone) {
    shouldFetchTasks = Boolean(filters.state.milestone);
  } else {
    shouldFetchTasks = true;
  }

  const {
    taskList,
    taskListLoading,
    taskListError,
    taskListValidating,
    taskListEmpty,
    mutate: localListMutate,
  } = getTasks(shouldFetchTasks ? getTasksParams : null);

  const { taskList: milestoneTaskList, mutate: mutateMilestoneTasks } = getTasks({
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
    creatFilter: 4,
    controlEntity: 2,
    controlEntityId: projectId,
  });

  const shouldFetchCost = Boolean(leadId);

  const getTaskCostParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },
    creatFilter: 7,
    controlEntityId: leadId,
  };
  if (isClientView) {
    getTaskCostParams.controlEntity = 5;
  } else {
    getTaskCostParams.controlEntity = 7;
  }

  const {
    costList,
    costListLoading,
    costListError,
    costListValidating,
    costListEmpty,
    mutate: mutateCost,
  } = getItemCost(shouldFetchCost ? getTaskCostParams : null);

  const combinedMutate = useCallback(async () => {
    await localListMutate();
    if (passedMainListMutate) {
      await passedMainListMutate();
    }
  }, [localListMutate, passedMainListMutate]);

  const USER_STATUS_OPTIONS = [
    { value: 'created', label: t('tasks.tabs.created') },
    { value: 'assigned', label: t('tasks.tabs.assigned') },
    { value: 'backlog', label: t('tasks.tabs.backlog') },
  ];

  const STATUS_OPTIONS = !isUser
    ? [...USER_STATUS_OPTIONS]
    : [
        { value: 'created', label: t('tasks.tabs.created') },
        { value: 'assigned', label: t('tasks.tabs.assigned') },
      ];

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.serial_no'), width: '4.5%', align: 'center' },
    {
      id: 'serial',
      label: t('tasks.task_id'),
      width: '6%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'project', label: t('tasks.details'), width: '5%' },
    {
      id: 'created',
      label: 'Source',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'description',
      label: t('tasks.description'),
      width: '25%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'members',
      label: t('tasks.members'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'childTaskCount',
      label: t('tasks.sub_tasks'),
      width: '3.5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'startDate',
      label: t('tasks.start_date'),
      width: '9%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'endDate',
      label: t('tasks.end_date'),
      width: '9%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'categoryId',
      label: t('tasks.type'),
      width: '9%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'status', label: t('tasks.status'), width: '10%' },

    ...(filters.state.status !== 3
      ? [
          {
            id: 'statusId',
            label: t('tasks.status'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    {
      id: 'projectId',
      label: t('tasks.priority'),
      width: '9%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'cost', label: t('tasks.cost_time'), width: '6%' },

    ...(!isUser
      ? [
          {
            id: '',
            label: t('tasks.actions'),
            width: '12%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
  ];

  const router = useRouter();

  const confirm = useBoolean();
  const openWeight = useBoolean();

  const confirmDeleteMilestone = useBoolean();

  const confirmDeleteMilestoneTask = useBoolean();

  const isDetailsView = true;
  const [openMilestone, setOpenMilestone] = useState(false);

  const handleOpenMilestone = () => {
    setOpenMilestone(true);
  };
  const handleMilestoneDialogClose = () => {
    setTimeout(() => {
      setOpenMilestone(false);
    }, 100);
  };

  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedWeight, setSelectedWeight] = useState([]);

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [openTasks, setOpenTasks] = useState(false);

  const handleToggleTasks = (task) => {
    setSelectedTasks((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(task);
      if (isAlreadySelected) {
        return prevSelected.filter((t) => t !== task);
      }
      return [...prevSelected, task];
    });
  };
  const handleOpenTasks = () => {
    setOpenTasks(true);
  };
  const handleTasksDialogClose = () => {
    setTimeout(() => {
      setOpenTasks(false);
    }, 100);
  };

  const handleToggleWeight = (weight) => {
    setSelectedWeight(weight);
  };

  const handleCloseWeightDialog = () => {
    openWeight.onFalse();
  };
  const [selectedView, setSelectedView] = useState('tasks');

  const MILESTONE_OPTIONS = workflow_mock_data?.items.map((data) => ({
    value: data?.id,
    label: data?.name,
  }));

  const methods = useForm({
    mode: 'onSubmit',
  });
  const {
    reset,
    watch,
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = (data) => {
    console.log('Form Data:', data);
  };

  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    if (taskList.tasks && taskList.tasks.length) {
      const sortedUsers = [...taskList.tasks].sort((a, b) => {
        const dateA = new Date(a.created);
        const dateB = new Date(b.created);
        return dateB - dateA;
      });
      setTableData(sortedUsers);
    } else {
      setTableData([]);
    }
  }, [taskList.tasks]);

  console.log('Table data', tableData);

  const CATEGORY_OPTIONS = categoryList?.categories.map((data) => ({
    value: data?.id,
    label: data?.name?.value,
  }));

  const UNCATEGORIZED_TAB = {
    value: 'uncategorized',
    label: 'Uncategorized',
  };

  const flattenTasks = (tasks) => {
    const result = [];
    tasks.forEach((task) => {
      result.push(task);
      if (task.subTasks && task.subTasks.length > 0) {
        task.subTasks.forEach((subTask) => {
          result.push({
            ...subTask,
            isSubTask: true,
            parentTaskId: task.taskId,
          });
        });
      }
    });
    return result;
  };

  const flattenedData = flattenTasks(tableData);

  const filteredDataWithoutCosts = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    zetaUser,
  });

  // const costMap = useMemo(() => {
  //   if (!costList?.costs) {
  //     return new Map();
  //   }
  //   return costList.costs.reduce((acc, costItem) => {
  //     acc.set(costItem.taskId, costItem.cost);
  //     return acc;
  //   }, new Map());
  // }, [costList?.costs]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    zetaUser,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.role.length > 0 ||
    filters.state.member.length > 0 ||
    filters.state.taskStatus.length > 0 ||
    filters.state.taskVariant.length > 0 ||
    filters.state.priority.length > 0;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  useEffect(() => {
    if (!taskListLoading && taskList?.totalTasks) {
      const currentCount = taskList.totalTasks;

      setTotalCounts((prev) => {
        const newState = { ...prev };
        if (filters.state.status === 0) newState.created = currentCount;
        else if (filters.state.status === 1) newState.assigned = currentCount;
        else if (filters.state.status === 3) newState.backlog = currentCount;
        return newState;
      });
    }
  }, [taskList, taskListLoading, filters.state.status]);
  const handleTabClick = (tab) => {
    filters.setState({ status: CREAT_FILTER_MAP[tab.value] });
  };

  const handleCategoryClick = (tab) => {
    filters.setState({ category: tab.value });
  };

  const handleMilestoneClick = (tab) => {
    filters.setState({ milestone: tab.value });
  };

  const handleDeleteMilestone = async () => {
    if (!targetMilestoneIdForDelete) {
      toast.error('No milestone selected for deletion.');
      confirmDeleteMilestone.onFalse();
      return;
    }

    try {
      const response = await deleteMilestone(targetMilestoneIdForDelete);
      if (response.success) {
        await mutateMilestone();
        await combinedMutate();
        toast.success('Milestone deleted successfully');

        if (filters.state.milestone === targetMilestoneIdForDelete) {
          filters.setState({ milestone: undefined });
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred while deleting the milestone.');
    } finally {
      confirmDeleteMilestone.onFalse();
      setTargetMilestoneIdForDelete(null);
    }
  };
  const handleClearMilestoneTasks = async () => {
    const selectedIds = tableData.map((task) => task.id);
    console.log('Selected IDs:', selectedIds);
    const payload = {
      milestoneId: null,
      taskIds: selectedIds,
    };

    try {
      const response = await addMilestoneTasks(payload);
      if (response.success) {
        toast.success('Tasks cleared from milestone successfully');
        confirmDeleteMilestoneTask.onFalse();
        await combinedMutate();
        await mutateMilestone();
        await mutateMilestoneTasks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error added milestone:', error);
    }
  };

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        const response = await deleteTask(id);
        if (response.success) {
          await combinedMutate();
          toast.success(t('tasks.toast.task_deleted'));
        } else {
          toast.error(response.error || t('tasks.toast.failed_deleted'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('tasks.category-toast.unexpected_error'));
      }
    }
  };

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success(t('tasks.toast.delete_success'));

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      if (!isTaskCategory && !isMilestone) {
        filters.setState({ status: newValue });
      }
      if (isMilestone) {
        filters.setState({ milestone: newValue });
      } else {
        filters.setState({ category: newValue });
      }
    },
    [filters, table]
  );

  const [tasksList, setTaskList] = useState('taskList');

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const handleBacklogView = useCallback((event, newView) => {
    if (newView !== null) {
      setTaskList(newView);
      if (newView === 'taskList') {
        setTableData(tasks.filter((task) => task.members.length > 0));
      } else if (newView === 'backlog') {
        setTableData(tasks.filter((task) => task.members.length === 0));
      }
    }
  }, []);

  const [selectedButton, setSelectedButton] = useState('kanbanList');
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const renderView = (
    <>
      <>
        {!isClient && !isUser && !isProject && !isSubTask && !isLead && (
          <CustomBreadcrumbs
            heading={t('tasks.heading')}
            links={[
              { name: t('tasks.dashboard'), href: paths.dashboard.root },
              { name: t('tasks.heading'), href: paths.dashboard.kanban.list },
              { name: t('tasks.list') },
            ]}
            sx={{ mb: 1 }}
          />
        )}
        {selectedView === 'tasks' && (
          <Box sx={{ mb: 1 }} display="flex" justifyContent="space-between">
            <Box onClick={() => handleButtonClick('kanbanList')}>
              <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
                <Tooltip title={t('tasks.views.list')} arrow>
                  <ToggleButton value="list">
                    <Iconify icon="solar:list-bold" />
                  </ToggleButton>
                </Tooltip>
                {filters.state.status !== 3 && (
                  <Tooltip title={t('tasks.views.grid')} arrow>
                    <ToggleButton value="grid">
                      <Iconify icon="mingcute:dot-grid-fill" />
                    </ToggleButton>
                  </Tooltip>
                )}

                <Tooltip title={t('tasks.views.gantt')} arrow>
                  <ToggleButton value="gantt">
                    <Iconify icon="mdi:chart-gantt" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
            {isClientView && leadId && (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={<Iconify icon="mdi:cash" />}
                  label={`${t('tasks.cost', t('tasks.total_task'))}: ${costList?.costObject?.totalCost || 0} AED`}
                  size="small"
                  variant="soft"
                  color="default"
                  sx={{
                    ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                    '& .MuiChip-icon': {
                      ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                    },
                  }}
                />
                {costList?.costObject?.totalDuration !== undefined &&
                  costList?.costObject?.totalDuration !== null && (
                    <Chip
                      icon={<Iconify icon="mdi:timer-outline" />}
                      label={`${t('tasks.duration', t('tasks.total_duration'))}: ${costList?.costObject?.totalDuration} ${t('tasks.days', 'hrs')}`}
                      size="small"
                      variant="soft"
                      sx={{
                        ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                        '& .MuiChip-icon': {
                          ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                        },
                      }}
                    />
                  )}
              </Box>
            )}

            {!isClient && !isUser && !isProject && !isSubTask && !isLead && (
              <Box sx={{ mb: 1 }} display="flex" alignItems="center" gap={1}>
                <Tooltip title={t('tasks.settings')} arrow>
                  <UserSettingsButton
                    sx={{ color: '#006A67' }}
                    onClick={() => handleButtonClick('settings')}
                  />
                </Tooltip>
              </Box>
            )}
          </Box>
        )}
        {selectedButton === 'kanbanList' && selectedView === 'tasks' && (
          <KanbanTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles: _status }}
            taskStatusOptions={{
              taskStatus: statusList?.status.map((s) => s.name.value),
            }}
            taskVariantOptions={{ taskVariant: taskVariant }}
            priorityOptions={{
              priorities: priorityList?.priorities.map((priority) => priority.name.value),
            }}
            memberOptions={{
              members: usersList?.users.map((user) => user.fullName),
            }}
            view={view}
            isUser={isUser}
            isSubTask={isSubTask}
            isClient={isClient}
            isLead={isLead}
            isProject={isProject}
            isTaskCategory={isTaskCategory}
            isMilestone={isMilestone}
            selectedCategory={filters.state.status}
          />
        )}

        {selectedButton === 'kanbanList' && (
          <>
            <Card>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column' },
                  justifyContent: 'space-between',
                  // alignItems: 'center',

                  px: 1,
                  py: 0.5,
                  boxShadow: (theme) =>
                    `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                }}
              >
                <Tabs
                  value={
                    isTaskCategory
                      ? filters.state.category
                      : isMilestone
                        ? filters.state.milestone
                        : filters.state.status
                  }
                  onChange={handleFilterStatus}
                >
                  {!isTaskCategory && !isMilestone && (
                    <>
                      {STATUS_OPTIONS.map((tab) => (
                        <Tab
                          key={tab.value}
                          iconPosition="end"
                          value={tab.value}
                          label={tab.label}
                          onClick={() => handleTabClick(tab)}
                          icon={
                            <Label
                              variant={tab.value === 'created' ? 'filled' : 'soft'}
                              color={
                                (tab.value === 'created' && 'success') ||
                                (tab.value === 'assigned' && 'info') ||
                                (tab.value === 'backlog' && 'warning') ||
                                'default'
                              }
                              sx={{
                                ...(storedLang === 'ar' && { mr: 1 }),
                              }}
                            >
                              {tab.value === 'created'
                                ? totalCounts.created !== null
                                  ? totalCounts.created
                                  : '...'
                                : tab.value === 'assigned'
                                  ? totalCounts.assigned !== null
                                    ? totalCounts.assigned
                                    : '...'
                                  : totalCounts.backlog !== null
                                    ? totalCounts.backlog
                                    : '...'}
                            </Label>
                          }
                          sx={{
                            borderBottom:
                              filters.state.status === CREAT_FILTER_MAP[tab.value]
                                ? '2px solid black'
                                : 'none',
                            color:
                              filters.state.status === CREAT_FILTER_MAP[tab.value]
                                ? 'black'
                                : 'text.primary',
                          }}
                        />
                      ))}
                    </>
                  )}
                  {isTaskCategory && (
                    <>
                      {[...CATEGORY_OPTIONS].map((tab) => {
                        return (
                          <Tab
                            key={tab.value}
                            iconPosition="end"
                            value={tab.value}
                            label={tab.label}
                            onClick={() => handleCategoryClick(tab)}
                            sx={{
                              borderBottom:
                                filters.state.category === tab.value ? '2px solid black' : 'none',
                              color:
                                filters.state.category === tab.value ? 'black' : 'text.primary',
                            }}
                          />
                        );
                      })}
                    </>
                  )}
                  {isMilestone && (
                    <>
                      {[...MILESTONE_OPTIONS].map((tab) => {
                        const isActiveMilestone = filters.state.milestone === tab.value;

                        return (
                          <Tab
                            key={tab.value}
                            iconPosition="end"
                            value={tab.value}
                            label={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Stack alignItems="center">
                                  <Typography variant="subtitle2" sx={{ color: '#006A67' }}>
                                    {tab.label}
                                  </Typography>

                                  <Box display="flex" sx={{ mt: 1 }}>
                                    <Button
                                      sx={{ ml: 1 }}
                                      variant={
                                        isActiveMilestone && selectedView === 'tasks'
                                          ? 'contained'
                                          : 'outlined'
                                      }
                                      size="small"
                                      onClick={() => setSelectedView('tasks')}
                                    >
                                      Tasks
                                    </Button>

                                    <Button
                                      sx={{ ml: 1 }}
                                      variant={
                                        isActiveMilestone && selectedView === 'files'
                                          ? 'contained'
                                          : 'outlined'
                                      }
                                      size="small"
                                      onClick={() => setSelectedView('files')}
                                    >
                                      Files
                                    </Button>
                                  </Box>
                                </Stack>
                              </Stack>
                            }
                            onClick={() => handleMilestoneClick(tab)}
                            sx={{
                              borderBottom:
                                filters.state.milestone === tab.value ? '2px solid black' : 'none',
                              color:
                                filters.state.milestone === tab.value ? 'black' : 'text.primary',
                              minHeight: '64px',
                              paddingTop: '8px',
                              paddingBottom: '8px',
                            }}
                          />
                        );
                      })}

                      <ConfirmDialog
                        open={confirmDeleteMilestone.value}
                        onClose={confirmDeleteMilestone.onFalse}
                        title="Delete"
                        content="Are you sure you want to delete this milestone?"
                        action={
                          <Button variant="contained" color="error" onClick={handleDeleteMilestone}>
                            Delete
                          </Button>
                        }
                      />
                    </>
                  )}
                </Tabs>
              </Box>

              {canReset && (
                <KanbanTableFiltersResult
                  filters={filters}
                  totalResults={dataFiltered.length}
                  onResetPage={table.onResetPage}
                  sx={{ p: 2.5, pt: 0 }}
                  view={view}
                />
              )}

              {view === 'list' && (
                <Form methods={methods} onSubmit={onSubmit}>
                  <TableSelectedAction
                    dense={table.dense}
                    numSelected={table.selected.length}
                    rowCount={dataFiltered.length}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered.map((row) => row.id)
                      )
                    }
                    action={
                      <Tooltip title={t('tasks.delete')}>
                        <IconButton color="primary" onClick={confirm.onTrue}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  {selectedView === 'tasks' && (
                    <Scrollbar>
                      <Table
                        size={table.dense ? 'small' : 'medium'}
                        sx={{
                          minWidth: 960,
                          tableLayout: 'fixed',
                          '& td, & th': {
                            padding: table.dense ? '4px' : '8px',
                          },
                        }}
                      >
                        <TableHeadCustom
                          order={table.order}
                          orderBy={table.orderBy}
                          headLabel={TABLE_HEAD}
                          rowCount={dataFiltered.length}
                          numSelected={table.selected.length}
                          onSort={table.onSort}
                          onSelectAllRows={(checked) =>
                            table.onSelectAllRows(
                              checked,
                              dataFiltered.map((row) => row.id)
                            )
                          }
                        />

                        <TableBody>
                          {!isUser && !isTaskCategory && filters.state.status === 0 && (
                            <KanbanCreateForm
                              setTableData={setTableData}
                              mutate={combinedMutate}
                              allUsers={usersList?.users}
                              priorityList={priorityList}
                              priorityListEmpty={priorityListEmpty}
                              isSubTask={isSubTask}
                              parentTaskId={parentTaskId}
                              parentTask={parentTask}
                              categoryList={categoryList}
                              categoryListEmpty={categoryListEmpty}
                              projectId={projectId}
                              isProject={isProject}
                              isClient={isClient}
                              isLead={isLead}
                              clientId={clientId}
                              leadId={leadId}
                              isClientView={isClientView}
                              hierarchyList={hierarchyList}
                            />
                          )}

                          {dataFiltered.map((row, index) => (
                            <KanbanTableRow
                              key={row.id}
                              row={row}
                              selected={table.selected.includes(row.id)}
                              onSelectRow={() => table.onSelectRow(row.id)}
                              onDeleteRow={() => handleDeleteRow(row.id)}
                              onEditRow={() => handleEditRow(row.id)}
                              index={index + table.page * table.rowsPerPage}
                              setTableData={setTableData}
                              isUser={isUser}
                              tableData={tableData}
                              allUsers={usersList?.users}
                              priorityList={priorityList}
                              priorityListEmpty={priorityListEmpty}
                              mutate={combinedMutate}
                              isSubTask={isSubTask}
                              parentTaskId={parentTaskId}
                              statusList={statusList?.status}
                              selectedCategory={filters.state.status}
                              isProject={isProject}
                              isClient={isClient}
                              isLead={isLead}
                              userId={userId}
                              isMilestone={isMilestone}
                              mutateMilestone={mutateMilestone}
                              categoryList={categoryList}
                              categoryListEmpty={categoryListEmpty}
                              hierarchyList={hierarchyList}
                              setTotalCounts={setTotalCounts}
                              mutateMilestoneTasks={mutateMilestoneTasks}
                            />
                          ))}

                          {/* <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      /> */}

                          <TableNoData notFound={notFound} />
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  )}
                  {selectedView === 'files' && <WorkflowFileView isDetailsView={isDetailsView} />}
                </Form>
              )}

              {view === 'grid' && (
                <KanbanView
                  mutateTasks={combinedMutate}
                  taskList={{ ...taskList, tasks: dataFiltered }}
                  taskListLoading={taskListLoading}
                  taskListError={taskListError}
                  statusList={statusList}
                  statusListLoading={statusListLoading}
                  statusListError={statusListError}
                  mutateStatuses={mutateStatuses}
                  isSubTask={isSubTask}
                  isUser={isUser}
                />
              )}
              {view === 'gantt' && (
                <GanttView
                  isSubTask={isSubTask}
                  tasks={dataFiltered}
                  taskListLoading={taskListLoading}
                  taskListEmpty={taskListEmpty}
                  mutate={combinedMutate}
                  isUser={isUser}
                  userId={userId}
                  allUsers={usersList?.users}
                />
              )}

              {view === 'list' && selectedView === 'tasks' && (
                <TablePaginationCustom
                  page={table.page}
                  rowsPerPageOptions={[50, 100, 150]}
                  dense={table.dense}
                  count={taskList.totalTasks}
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
            </Card>
          </>
        )}

        {selectedButton === 'settings' && <KanbanSettingsView />}
      </>
    </>
  );

  if (taskListLoading)
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
  if (taskListError) {
    return <ErrorView errorCode={taskListError} />;
  }
  return (
    <>
      {isClient || isUser || isProject || isSubTask || isLead ? (
        <>{renderView}</>
      ) : (
        <DashboardContent>{renderView}</DashboardContent>
      )}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.delete')}
        content={
          <>
            {t('tasks.confirm_delete')} <strong>{table.selected.length}</strong> {t('tasks.items')}
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            {t('tasks.delete')}
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters, zetaUser }) {
  const { name, status, role, member, taskStatus, taskVariant, priority, category } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);
  if (name) {
    const lowerCaseName = name.toLowerCase();
    inputData = inputData.filter((task) => {
      const serialMatch = String(task.serial)
        .padStart(5, '0')
        .toLowerCase()
        .includes(lowerCaseName);
      if (serialMatch) return true;

      if (task.description) {
        try {
          const parsedDescription = JSON.parse(task.description);
          if (parsedDescription) {
            const transcriptStrMatch =
              parsedDescription.TranscriptStr?.toLowerCase().includes(lowerCaseName);
            const transcriptEnglishStrMatch =
              parsedDescription.TranscriptEnglishStr?.toLowerCase().includes(lowerCaseName);
            const transcriptArabicStrMatch =
              parsedDescription.TranscriptArabicStr?.toLowerCase().includes(lowerCaseName);
            return transcriptStrMatch || transcriptEnglishStrMatch || transcriptArabicStrMatch;
          }
        } catch (e) {
          return task.description.toLowerCase().includes(lowerCaseName);
        }
      }
      return false;
    });
  }

  // if (status !== 'all') {
  //   inputData = inputData.filter((task) => task.type === status);
  // }
  // if (category) {
  //   inputData = inputData.filter((task) => task.categoryId === category);
  // }

  if (role.length) {
    console.log('this is the role', role);
    inputData = inputData.filter((task) => {
      let effectiveStatusName;

      if (zetaUser && task.creatorId === zetaUser?.id) {
        effectiveStatusName = task.statusName?.value;
      } else if (zetaUser) {
        // Current user is not the creator, check if they are a member
        const matchedMember = task.members?.find((m) => m.memberId === zetaUser?.id);
        if (matchedMember) {
          // User is a member, use their status for the task
          effectiveStatusName = matchedMember.statusName?.value;
        } else {
          // User is not the creator and not a  member, task's main status
          effectiveStatusName = task.statusName?.value;
        }
      } else {
        // Not logged-in user, task's main status
        effectiveStatusName = task.statusName?.value;
      }

      // If the determined status is null or undefined
      effectiveStatusName = effectiveStatusName ?? 'Not Started';

      return role.includes(effectiveStatusName);
    });
  }
  if (member.length) {
    inputData = inputData.filter((task) =>
      task.members?.some((person) => member.includes(person.memberName))
    );
  }

  if (taskStatus.length) {
    inputData = inputData.filter((task) => taskStatus.includes(task.taskStatus));
  }

  if (taskVariant.length) {
    inputData = inputData.filter((task) => {
      const eachVariant =
        task?.projectId && task?.isMission
          ? 'Mission'
          : task?.vendorContractId
            ? 'Contract'
            : task?.vendorId
              ? 'Vendor'
              : task?.clientLeadId
                ? 'Lead'
                : task?.clientId
                  ? 'Client'
                  : task?.projectId
                    ? 'Project'
                    : 'General';
      return taskVariant.includes(eachVariant);
    });
  }

  if (priority.length) {
    inputData = inputData.filter((task) => priority.includes(task.priorityName?.value));
  }
  return inputData;
}
