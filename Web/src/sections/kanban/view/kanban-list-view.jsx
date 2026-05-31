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

import { KanbanTableRow } from '../kanban-table-row';
import { KanbanTableToolbar } from '../kanban-table-toolbar';
import { KanbanTableFiltersResult } from '../kanban-table-filters-result';

import { KanbanAddWeight } from '../kanban-add-weight';

import { KanbanView } from './kanban-view';
import GanttView from './gantt-view';

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
  taskVariantAr,
} from 'src/sections/kanban/kanban-mock-data';
import { Form } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { KanbanCreateForm } from '../kanban-create-form';
import { KanbanSettingsView } from './kanban-settings-view';
import { UserSettingsButton } from 'src/sections/user/view/user-settings-button';
import { getTasks } from 'src/actions/task/taskActions';

import { getItemCost } from 'src/actions/time-sheet/timeSheetActions';

import { getUser } from 'src/actions/user-manage/userManageActions';
import { getAvailableUser } from 'src/actions/task/taskActions';

import {
  getPriorities,
  deleteTask,
  getStatus,
  getCategories,
  getProjectCategories,
} from 'src/actions/task/taskActions';
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
import { fDate, fIsAfter } from 'src/utils/format-time';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Switch from '@mui/material/Switch';
import { getDepartments } from 'src/actions/department/departmentActions';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function KanbanListView({
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
  isTicket,
  projectMembers,
}) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');
  const { t, i18n } = useTranslation('dashboard/tasks');
  const openDateRange = useBoolean();
  const subFilters = [
    {
      fieldName: 'emailConfirmed',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    },
  ];
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
  };
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser(getUsersParams);
  const {
    departmentsList,
    departmentsListLoading,
    departmentsListError,
    departmentsListValidating,
    departmentsListEmpty,
  } = getDepartments();
  const getAvailableUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
    employeeId: zetaUser?.id,
  };

  const { availableUsersList, mutate: mutateAvailableUsers } =
    getAvailableUser(getAvailableUsersParams);
  const { statusList, statusListLoading, statusListError, mutate: mutateStatuses } = getStatus();

  const { priorityList, priorityListEmpty } = getPriorities();
  const { categoryList, categoryListEmpty } = getCategories();

  const getCategoriesParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    projectId: projectId,
  };
  const { categoryList: projectCategoryList, categoryListEmpty: projectCategoryListEmpty } =
    getProjectCategories(getCategoriesParams);
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
    milestoneListLoading,
    milestoneListError,
    mutate: mutateMilestone,
  } = getMilestone(isProject && isMilestone ? getMilestoneParams : null);

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });
  const [tableData, setTableData] = useState([]);
  let TICKET_STATUS_OPTIONS = [];

  let isCreator = false;
  let isMember = false;

  if (isTicket) {
    isCreator = tableData.some((row) => row.creatorId === zetaUser?.id);

    isMember = tableData.some((row) => row.members?.some((m) => m.memberId === zetaUser?.id));

    if (isCreator) {
      TICKET_STATUS_OPTIONS.push({ value: 'created', label: t('tasks.tabs.created') });
    }

    if (isMember) {
      TICKET_STATUS_OPTIONS.push({ value: 'backlog', label: t('tasks.tabs.tickets') });
    }
  }
  console.log('this is the table data', tableData);
  const filters = useSetState({
    name: '',
    role: [],
    status: zetaUser?.roles?.includes('External') ? 1 : isTicket ? 3 : 0,
    category: undefined,
    milestone: undefined,
    member: '',
    assignedFrom: [],
    assignedTo: [],
    taskStatus: [],
    taskVariant: [],
    priority: [],
    startDate: null,
    endDate: null,
  });
  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [targetMilestoneIdForDelete, setTargetMilestoneIdForDelete] = useState(null);
  const [matchingChildren, setMatchingChildren] = useState([]);
  const [derivedHierarchyInfo, setDerivedHierarchyInfo] = useState({
    level: 0,
    childEmployeeIds: [],
    sameLevelEmployeeIds: [],
  });
  const [matchingChildrenEmployeeIds, setMatchingChildrenEmployeeIds] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [toolbarUsers, setToolbarUsers] = useState([]);
  useEffect(() => {
    if (!hierarchyList?.hierarchy) return;

    const hierarchy = hierarchyList.hierarchy;
    const matchingChildrenTemp = [];
    const generalDept = departmentsList?.departments?.find((dep) => dep.name?.value === 'General');
    const generalDeptId = generalDept?.id;

    hierarchy
      .filter((item) => item.parentStructureId !== null)
      .forEach((item) => {
        if (item.departmentId === generalDeptId) {
          const children = hierarchy.filter(
            (child) =>
              child.parentStructureId === item.id &&
              child.employeeId &&
              child.employee?.isActive &&
              child?.employee?.emailConfirmed
          );
          matchingChildrenTemp.push(...children);
        }
      });

    setMatchingChildren(matchingChildrenTemp);

    const idToItemMap = new Map(hierarchy.map((item) => [item.id, item]));
    const getLevel = (item) => {
      let level = 0;
      let current = item;
      while (current) {
        level++;
        if (!current.parentStructureId) break;
        current = idToItemMap.get(current.parentStructureId);
      }
      return level;
    };

    const userHierarchyItem = hierarchy.find((item) => item.employeeId === zetaUser?.id);

    let computedLevel = 0;
    let childEmployeeIds = [];
    let sameLevelEmployeeIds = [];

    const getAllChildEmployeeIds = (parentId, hierarchyData) => {
      let result = [];

      const directChildren = hierarchyData.filter((item) => item.parentStructureId === parentId);

      directChildren.forEach((child) => {
        if (child.employeeId && child.employee?.isActive && child?.employee?.emailConfirmed) {
          result.push(child.employeeId);
        }

        const nestedChildren = getAllChildEmployeeIds(child.id, hierarchyData);

        result.push(...nestedChildren);
      });

      return result;
    };

    if (userHierarchyItem) {
      computedLevel = getLevel(userHierarchyItem);

      childEmployeeIds = getAllChildEmployeeIds(userHierarchyItem.id, hierarchy);

      sameLevelEmployeeIds = hierarchy
        .filter((item) => item.employeeId && getLevel(item) === computedLevel)
        .map((item) => item.employeeId);
    }

    setDerivedHierarchyInfo({
      level: computedLevel,
      childEmployeeIds,
      sameLevelEmployeeIds,
    });
    const matchingChildrenEmployeeIds = matchingChildrenTemp
      .map((c) => c.employeeId)
      .filter(Boolean);

    const userList = isTicket ? usersList?.users : availableUsersList?.users;

    const toolbarOnlyChildUsers = userList?.filter(
      (user) => childEmployeeIds.includes(user.id) && user.emailConfirmed
    );

    const sameLevelAndTheirChildIds = hierarchy
      .filter((item) => getLevel(item) === computedLevel)
      .flatMap((item) => [item.employeeId, ...getAllChildEmployeeIds(item.id, hierarchy)]);

    const allowedSharedIds = [...new Set([...childEmployeeIds, ...sameLevelAndTheirChildIds])];

    const shared =
      userHierarchyItem?.parentStructureId === null
        ? userList
        : userList?.filter((user) => allowedSharedIds.includes(user.id));

    setToolbarUsers(toolbarOnlyChildUsers);
    setSharedUsers(shared);
    setMatchingChildrenEmployeeIds(matchingChildrenTemp.map((c) => c.employeeId).filter(Boolean));
  }, [hierarchyList, departmentsList, zetaUser?.id, usersList?.users, availableUsersList?.users]);

  useEffect(() => {
    const validCategories = projectCategoryList?.categories?.filter(
      (c) => c.id !== '00000000-0000-0000-0000-000000000000'
    );

    if (validCategories?.length > 0 && !filters.state.category) {
      filters.setState({ category: validCategories[0].id });
    }
  }, [projectCategoryList, filters]);

  useEffect(() => {
    if (milestoneList?.milestone?.length > 0 && !filters.state.milestone) {
      filters.setState({ milestone: milestoneList.milestone[0].id });
    } else if (
      filters.state.milestone &&
      milestoneList?.milestone &&
      !milestoneList.milestone.some((m) => m.id === filters.state.milestone)
    ) {
      filters.setState({ milestone: undefined });
    }
  }, [milestoneList, filters]);

  const CREAT_FILTER_MAP = {
    created: 0,
    assigned: 1,
    backlog: 3,
    assignedAll: 5,
  };
  const [totalCounts, setTotalCounts] = useState({
    created: null,
    assigned: null,
    backlog: null,
    assignedAll: null,
  });
  const [view, setView] = useState('list');

  const currentCreatFilter = CREAT_FILTER_MAP[filters.state.status] ?? 0;
  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const [isOverdue, setIsOverdue] = useState(false);
  const handleOverdueToggle = (event) => {
    setIsOverdue(event.target.checked);
  };

  const [isLate, setIsLate] = useState(false);
  const handleLateToggle = (event) => {
    setIsLate(event.target.checked);
  };
  const memberMap = usersList?.users?.reduce((acc, user) => {
    acc[user.fullName] = user.id;
    return acc;
  }, {});
  const assignedByIds = filters.state.assignedFrom?.map((user) => user.id) || [];

  const assignedToIds = filters.state.assignedTo?.map((user) => user.id) || [];

  const getTasksParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: view === 'gantt' ? 200 : currentPageSize,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
    ...(isOverdue && { overdue: true }),
    ...(isLate && { isLate: true }),

    ...(assignedByIds.length > 0 && { assignedByIds: assignedByIds }),
    ...(assignedToIds.length > 0 && { assignedToIds: assignedToIds }),
  };
  if (
    !isTaskCategory &&
    !isMilestone &&
    !filters.state.assignedFrom.length &&
    !filters.state.assignedTo.length
  ) {
    getTasksParams.creatFilter = filters.state.status;
  }
  if (
    !isTaskCategory &&
    !isMilestone &&
    (filters.state.assignedFrom.length || filters.state.assignedTo.length)
  ) {
    getTasksParams.creatFilter = 7;
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
    getTasksParams.creatFilter = 4;
    getTasksParams.controlEntity = 3;
    getTasksParams.controlEntityId = filters.state.milestone;
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
  } = getTasks(shouldFetchTasks ? getTasksParams : null, filters.state.member);

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
  const isProjectMember = projectMembers?.some((m) => m.memberId === zetaUser?.id);
  console.log('this is the project members', projectMembers);
  const isProjectOwner = projectMembers?.some(
    (m) => m.memberId === zetaUser?.id && m.isOwner === true
  );

  const USER_STATUS_OPTIONS = !isTicket
    ? [
        { value: 'created', label: t('tasks.tabs.created') },
        { value: 'assigned', label: t('tasks.tabs.assigned') },
        { value: 'backlog', label: isTicket ? t('tasks.tabs.tickets') : t('tasks.unassigned') },
      ]
    : [
        {
          value: 'backlog',
          label: isProjectMember ? t('tasks.tabs.tickets') : t('tasks.tabs.created'),
        },

        ...(!isProjectMember ? [{ value: 'assigned', label: t('tasks.tabs.assigned') }] : []),
        ...(!isProjectMember
          ? [{ value: 'assignedAll', label: t('tasks.tabs.allocatedtickets') }]
          : []),

        ...(isProjectMember
          ? [{ value: 'assignedAll', label: t('tasks.tabs.allocatedtickets') }]
          : []),
      ];

  const STATUS_OPTIONS = !isUser
    ? zetaUser?.roles?.includes('External')
      ? [{ value: 'assigned', label: t('tasks.tabs.assigned') }]
      : [...USER_STATUS_OPTIONS]
    : [
        { value: 'created', label: t('tasks.tabs.created') },
        { value: 'assigned', label: t('tasks.tabs.assigned') },
      ];

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.serial_no'), width: '4.5%', align: 'center' },
    {
      id: 'serial',
      label: isTicket ? t('tasks.ticket_id') : t('tasks.task_id'),
      width: '6%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'created',
      label: isTicket ? t('tasks.createdOn') : t('tasks.source'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'description',
      label: t('tasks.description'),
      width: isTicket ? '70%' : '25%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    ...(isTicket && isProjectMember
      ? [
          {
            id: 'members',
            label: t('tasks.members'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(isTicket && filters.state.status === 0
      ? [
          {
            id: 'members',
            label: t('tasks.members'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(isTicket && !isProjectMember && (filters.state.status === 5 || filters.state.status === 1)
      ? [
          {
            id: 'members',
            label: t('tasks.members'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),

    ...(!isTicket
      ? [
          {
            id: 'members',
            label: t('tasks.members'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            id: 'childTaskCount',
            label: t('tasks.sub_tasks'),
            width: '3.5%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            id: 'startDate',
            label: t('tasks.start_date'),
            width: '9%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            id: 'endDate',
            label: t('tasks.end_date'),
            width: '9%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            id: 'categoryId',
            label: t('tasks.type'),
            width: '9%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
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

  const [categories, setCategories] = useState([]);
  const [pendingSwap, setPendingSwap] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    const CATEGORY_OPTIONS =
      projectCategoryList?.categories
        ?.filter((data) => data?.name?.value !== 'No Category')
        .map((data) => ({
          value: data?.id,
          label: data?.name?.value,
        })) || [];
    setCategories(CATEGORY_OPTIONS);
  }, [projectCategoryList]);

  // Sensors for drag
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.value === active.id);
    const newIndex = categories.findIndex((c) => c.value === over.id);

    setPendingSwap({ oldIndex, newIndex });
    setOpenConfirm(true);
  };

  // Confirm swap
  const confirmSwap = () => {
    if (!pendingSwap) return;
    const { oldIndex, newIndex } = pendingSwap;

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);
    setPendingSwap(null);
    setOpenConfirm(false);
  };

  const cancelSwap = () => {
    setPendingSwap(null);
    setOpenConfirm(false);
  };

  // Sortable Tab component
  function SortableTab({ tab }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: tab.value,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab',
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Tab
          value={tab.value}
          label={tab.label}
          onClick={() => handleCategoryClick(tab)}
          sx={{
            borderBottom: filters.state.category === tab.value ? '2px solid black' : 'none',
            color: filters.state.category === tab.value ? 'black' : 'text.primary',
          }}
        />
      </div>
    );
  }
  const MILESTONE_OPTIONS = milestoneList?.milestone.map((data) => ({
    value: data?.id,
    label: data?.name,
    startDate: fDate(data?.startDate),
    dueDate: fDate(data?.dueDate),
  }));

  const UNCATEGORIZED_TAB = {
    value: 'uncategorized',
    label: t('tasks.uncategorized'),
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
    dateError,
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
    filters.state.member ||
    filters.state.assignedFrom.length > 0 ||
    filters.state.assignedTo.length > 0 ||
    filters.state.taskStatus.length > 0 ||
    filters.state.taskVariant.length > 0 ||
    (!!filters.state.startDate && !!filters.state.endDate) ||
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
        else if (filters.state.status === 5) newState.assignedAll = currentCount;

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
      toast.error(t('tasks.no_milestone_deleted'));
      confirmDeleteMilestone.onFalse();
      return;
    }

    try {
      const response = await deleteMilestone(targetMilestoneIdForDelete);
      if (response.success) {
        await mutateMilestone();
        await combinedMutate();
        toast.success(t('tasks.delete_milestone'));

        if (filters.state.milestone === targetMilestoneIdForDelete) {
          filters.setState({ milestone: undefined });
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(t('tasks.unexpected_error'));
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
        toast.success(t('tasks.task_cleared'));
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
  const handleOpenRow = useCallback(
    (id) => {
      router.push(paths.dashboard.kanban.details(id));
    },
    [router]
  );
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

  useEffect(() => {
    const handleReset = () => {
      setView('list');
      setSelectedButton('kanbanList');
    };
    window.addEventListener('reset-kanban-view', handleReset);
    localStorage.removeItem('editorContentDocs');

    return () => window.removeEventListener('reset-kanban-view', handleReset);
  }, []);

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
  const taskStatusOptions = {
    taskStatus: statusList?.status.map((s) =>
      storedLang === 'ar'
        ? s?.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')?.value
        : s?.name?.value
    ),
  };
  const handleReportClick = () => {
    router.push(paths.dashboard.kanban.report);
  };

  const renderView = (
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

      <Box sx={{ mb: 1 }} display="flex" justifyContent="space-between">
        <Box onClick={() => handleButtonClick('kanbanList')}>
          <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
            <Tooltip title={t('tasks.views.list')} arrow>
              <ToggleButton value="list">
                <Iconify icon="solar:list-bold" />
              </ToggleButton>
            </Tooltip>
            {!isTicket && filters.state.status !== 3 && (
              <Tooltip title={t('tasks.views.grid')} arrow>
                <ToggleButton value="grid">
                  <Iconify icon="mingcute:dot-grid-fill" />
                </ToggleButton>
              </Tooltip>
            )}

            {isTicket && (
              <Tooltip title={t('tasks.views.grid')} arrow>
                <ToggleButton value="grid">
                  <Iconify icon="mingcute:dot-grid-fill" />
                </ToggleButton>
              </Tooltip>
            )}

            {!isTicket && (
              <Tooltip title={t('tasks.views.gantt')} arrow>
                <ToggleButton value="gantt">
                  <Iconify icon="mdi:chart-gantt" />
                </ToggleButton>
              </Tooltip>
            )}
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

        {!isClient &&
          !isUser &&
          !isProject &&
          !isSubTask &&
          !isLead &&
          zetaUser?.permissions?.includes('General.TaskSettings') && (
            <Box sx={{ mb: 1 }} display="flex" alignItems="center" gap={1}>
              {/* <Tooltip title="Task Report" arrow>
                <Button
                  onClick={handleReportClick}
                  variant="contained"
                  startIcon={<Iconify icon="mdi:chart-bar" />}
                >
                  {t('tasks.Task_Report')}
                </Button>
              </Tooltip> */}
              <Tooltip title={t('tasks.settings')} arrow>
                <UserSettingsButton
                  sx={{ color: '#006A67' }}
                  onClick={() => handleButtonClick('settings')}
                />
              </Tooltip>
            </Box>
          )}

        {isMilestone && isProjectOwner && (
          <Stack spacing={1} sx={{ pt: 1 }}>
            {' '}
            <Box display="flex" justifyContent="end">
              <Button
                startIcon={
                  <Iconify
                    icon="mingcute:add-line"
                    sx={{
                      ...(storedLang === 'ar' && { ml: 1 }),
                    }}
                  />
                }
                sx={{ ml: 1 }}
                variant="contained"
                onClick={() => {
                  setOpenMilestone(true);
                }}
              >
                {t('tasks.AddMilestone')}
              </Button>
              <AddMilestoneDialog
                open={openMilestone}
                onClick={handleOpenMilestone}
                handleMilestoneDialogClose={handleMilestoneDialogClose}
                projectId={projectId}
                mutateMilestone={mutateMilestone}
              />
            </Box>
          </Stack>
        )}
      </Box>
      {selectedButton === 'kanbanList' && (
        <KanbanTableToolbar
          filters={filters}
          onResetPage={table.onResetPage}
          options={{ roles: _status }}
          taskStatusOptions={taskStatusOptions}
          taskVariantOptions={{ taskVariant: storedLang === 'ar' ? taskVariantAr : taskVariant }}
          priorityOptions={{
            priorities: priorityList?.priorities.map((priority) => {
              const name = priority.name;

              if (storedLang === 'ar') {
                const arValue = name.localizedStrings?.find(
                  (l) => l.language?.toLowerCase() === 'ar'
                )?.value;

                return arValue || name.value;
              }

              return name.value;
            }),
          }}
          memberOptions={{
            members: usersList?.users,
          }}
          memberOptionsAssigned={{
            members: availableUsersList?.users.map((user) => user.fullName),
          }}
          memberIds={{
            ids: usersList?.users.map((user) => user.id),
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
          isTicket={isTicket}
          hierarchyList={hierarchyList}
          allUsers={availableUsersList?.users}
          sharedUsers={toolbarUsers}
          openDateRange={openDateRange.value}
          onOpenDateRange={openDateRange.onTrue}
          onCloseDateRange={openDateRange.onFalse}
          dateError={dateError}
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
              {!isTaskCategory && !isMilestone && !isTicket && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      !filters.state.assignedFrom.length && !filters.state.assignedTo.length
                        ? 'space-between'
                        : 'flex-end',
                  }}
                >
                  {!filters.state.assignedFrom.length && !filters.state.assignedTo.length && (
                    <Tabs value={filters.state.status} onChange={handleFilterStatus}>
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
                    </Tabs>
                  )}

                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="subtitle2" color="error.main">
                      {t('tasks.filters.overdue')}
                    </Typography>
                    <Switch checked={isOverdue} onChange={handleOverdueToggle} />

                    <Typography variant="subtitle2" color="warning.main">
                      {t('tasks.filters.completed_late')}
                    </Typography>
                    <Switch checked={isLate} onChange={handleLateToggle} />
                  </Box>
                </Box>
              )}
              {isTicket && (
                <Tabs value={filters.state.status} onChange={handleFilterStatus}>
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
                            (tab.value === 'assignedAll' && 'secondary') ||
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
                              : tab.value === 'assignedAll'
                                ? totalCounts.assignedAll !== null
                                  ? totalCounts.assignedAll
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
                </Tabs>
              )}
              {isTaskCategory && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.value)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <Tabs value={filters.state.category}>
                      {categories.map((tab) => (
                        <SortableTab key={tab.value} tab={tab} />
                      ))}
                    </Tabs>
                  </SortableContext>
                </DndContext>
              )}

              {isMilestone && (
                <Tabs value={filters.state.milestone} onChange={handleFilterStatus}>
                  {MILESTONE_OPTIONS.map((tab) => (
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
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {tab.startDate} - {tab.dueDate}
                            </Typography>
                          </Stack>

                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetMilestoneIdForDelete(tab.value);
                              confirmDeleteMilestone.onTrue();
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={13} />
                          </IconButton>
                        </Stack>
                      }
                      onClick={() => handleMilestoneClick(tab)}
                      sx={{
                        borderBottom:
                          filters.state.milestone === tab.value ? '2px solid black' : 'none',
                        color: filters.state.milestone === tab.value ? 'black' : 'text.primary',
                        minHeight: '64px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                      }}
                    />
                  ))}
                </Tabs>
              )}
              <Dialog open={openConfirm} onClose={cancelSwap}>
                <DialogTitle>{t('tasks.confirm_swap')}</DialogTitle>
                <DialogContent>{t('tasks.are_you_sure_want_swap')}</DialogContent>
                <DialogActions>
                  <Button onClick={cancelSwap}>{t('tasks.cancel')}</Button>
                  <Button onClick={confirmSwap} variant="contained" color="primary">
                    {t('tasks.yes')}
                  </Button>
                </DialogActions>
              </Dialog>
              <ConfirmDialog
                open={confirmDeleteMilestone.value}
                onClose={confirmDeleteMilestone.onFalse}
                title={t('tasks.delete')}
                content={t('tasks.are_you_sure_want_to_delete')}
                action={
                  <Button variant="contained" color="error" onClick={handleDeleteMilestone}>
                    {t('tasks.delete')}
                  </Button>
                }
              />
            </Box>
            {isMilestone && milestoneList?.milestone?.length > 0 && (
              <Stack spacing={1} sx={{ p: 1, pl: 0 }}>
                {' '}
                <Box display="flex" justifyContent="end">
                  <Button
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    sx={{ ml: 1 }}
                    variant="contained"
                    onClick={() => {
                      setOpenTasks(true);
                      setSelectedMilestoneId(filters.state.milestone);
                    }}
                  >
                    {t('tasks.add_tasks')}
                  </Button>
                  {tableData?.length > 0 && (
                    <Button
                      sx={{ ml: 1 }}
                      variant="contained"
                      onClick={() => {
                        setSelectedMilestoneId(filters.state.milestone);
                        confirmDeleteMilestoneTask.onTrue();
                      }}
                    >
                      {t('tasks.clear_all')}
                    </Button>
                  )}

                  <ConfirmDialog
                    open={confirmDeleteMilestoneTask.value}
                    onClose={confirmDeleteMilestoneTask.onFalse}
                    title={t('tasks.delete')}
                    content={t('tasks.are_you_sure_want_milestone')}
                    action={
                      <Button variant="contained" color="error" onClick={handleClearMilestoneTasks}>
                        {t('tasks.delete')}
                      </Button>
                    }
                  />
                  <AddMilestoneTask
                    open={openTasks}
                    shared={dataFiltered}
                    selectedTasks={selectedTasks}
                    setSelectedTasks={setSelectedTasks}
                    onClick={handleOpenTasks}
                    handleClose={handleTasksDialogClose}
                    onToggleTasks={handleToggleTasks}
                    selectedMilestoneId={selectedMilestoneId}
                    projectId={projectId}
                    mutateTasks={combinedMutate}
                    mutateMilestoneTasks={mutateMilestoneTasks}
                    taskList={milestoneTaskList}
                  />
                </Box>
              </Stack>
            )}

            {canReset && (
              <KanbanTableFiltersResult
                filters={filters}
                totalResults={dataFiltered.length}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
                view={view}
                memberOptions={{
                  members: usersList?.users,
                }}
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

                <Scrollbar>
                  {!taskListError && (
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
                        {!isUser &&
                          !isTaskCategory &&
                          !isMilestone &&
                          !isTicket &&
                          filters.state.status === 0 &&
                          zetaUser?.permissions?.includes('Task.AddTask') && (
                            <KanbanCreateForm
                              setTableData={setTableData}
                              mutate={combinedMutate}
                              allUsers={availableUsersList?.users}
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
                              isTicket={isTicket}
                              sharedUsers={sharedUsers}
                            />
                          )}

                        {isTicket &&
                          filters.state.status === 3 &&
                          zetaUser?.permissions?.includes('TicketingProject.AddTicket') &&
                          projectMembers?.every((m) => m.memberId !== zetaUser?.id) && (
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
                              isTicket={isTicket}
                              selectedCategory={filters.state.status}
                              isProjectMember={isProjectMember}
                              sharedUsers={sharedUsers}
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
                            onOpenRow={() => handleOpenRow(row.id)}
                            index={index + table.page * table.rowsPerPage}
                            setTableData={setTableData}
                            isUser={isUser}
                            tableData={tableData}
                            allUsers={isTicket ? usersList?.users : availableUsersList?.users}
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
                            isTicket={isTicket}
                            isProjectMember={isProjectMember}
                            projectMembers={projectMembers}
                            sharedUsers={sharedUsers}
                            derivedHierarchyInfo={derivedHierarchyInfo}
                            matchingChildrenEmployeeIds={matchingChildrenEmployeeIds}
                          />
                        ))}

                        {/* <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      /> */}

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                  )}
                  {taskListError && !isTaskCategory && <ErrorView errorCode={taskListError} />}
                </Scrollbar>
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
                isTicket={isTicket}
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
                isTicket={isTicket}
              />
            )}

            {view === 'list' && (
              <TablePaginationCustom
                page={table.page}
                rowsPerPageOptions={[50, 100, 150]}
                dense={table.dense}
                count={canReset ? dataFiltered.length : taskList.totalTasks}
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

      {selectedButton === 'settings' && (
        <KanbanSettingsView mutateAvailableUsers={mutateAvailableUsers} />
      )}
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

  if (milestoneListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)',
          }}
        />
      </div>
    );
  if (milestoneListError) {
    return <ErrorView errorCode={milestoneListError} />;
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

function applyFilter({ inputData, comparator, filters, zetaUser, dateError }) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const {
    name,
    status,
    role,
    member,
    taskStatus,
    taskVariant,
    priority,
    category,
    assignedFrom,
    assignedTo,
    startDate,
    endDate,
  } = filters;

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
  if (filters.startDate && filters.endDate) {
    inputData = inputData.filter((task) => {
      if (!task.endDate) return false;

      const taskEndDate = dayjs(task.endDate).startOf('day');
      const filterStartDate = dayjs(filters.startDate).startOf('day');
      const filterEndDate = dayjs(filters.endDate).endOf('day');

      return taskEndDate.isBetween(filterStartDate, filterEndDate, null, '[]');
    });
  }
  if (role.length) {
    const getLocalizedValue = (obj, lang) => {
      if (!obj) return undefined;

      if (lang === 'ar') {
        return obj?.localizedStrings?.find((ls) => ls.language?.toLowerCase() === 'ar')?.value;
      }

      return obj?.value;
    };
    inputData = inputData.filter((task) => {
      let effectiveStatusName;

      if (zetaUser && task.creatorId === zetaUser?.id) {
        effectiveStatusName = getLocalizedValue(task.statusName, storedLang);
      } else if (zetaUser) {
        const matchedMember = task.members?.find((m) => m.memberId === zetaUser?.id);

        if (matchedMember) {
          effectiveStatusName = getLocalizedValue(matchedMember.statusName, storedLang);
        } else {
          effectiveStatusName = getLocalizedValue(task.statusName, storedLang);
        }
      } else {
        effectiveStatusName = getLocalizedValue(task.statusName, storedLang);
      }

      // Fallback
      effectiveStatusName =
        effectiveStatusName ?? (storedLang === 'ar' ? 'لم يبدأ' : 'Not Started');

      return role.includes(effectiveStatusName);
    });
  }

  if (assignedFrom.length) {
    inputData = inputData.filter((task) => assignedFrom.some((user) => user.id === task.creatorId));
  }
  if (assignedTo.length) {
    inputData = inputData.filter((task) =>
      task.members?.some((person) => assignedTo.some((user) => user.id === person.memberId))
    );
  }
  if (taskStatus.length) {
    inputData = inputData.filter((task) => taskStatus.includes(task.taskStatus));
  }

  if (taskVariant.length) {
    inputData = inputData.filter((task) => {
      const eachVariant =
        task?.projectId && task?.type === 0
          ? t('tasks.mission')
          : task?.vendorContractId
            ? t('tasks.contract')
            : task?.vendorId
              ? t('tasks.vendor')
              : task?.clientLeadId
                ? t('tasks.lead')
                : task?.clientId
                  ? t('tasks.client')
                  : task?.projectId && task?.type === 1
                    ? t('tasks.projects')
                    : t('tasks.general-o');
      return taskVariant.includes(eachVariant);
    });
  }
  function getPriorityNameByLang(priorityName, lang) {
    const DEFAULT_EN = 'Low';
    const DEFAULT_AR = 'منخفض';

    if (!priorityName) {
      return lang === 'ar' ? DEFAULT_AR : DEFAULT_EN;
    }

    if (lang === 'ar') {
      return (
        priorityName.localizedStrings?.find((l) => l.language?.toLowerCase() === 'ar')?.value ||
        DEFAULT_AR
      );
    }

    return priorityName.value || DEFAULT_EN;
  }

  if (priority.length) {
    inputData = inputData.filter((task) => {
      const taskPriorityName = getPriorityNameByLang(task.priorityName, storedLang);

      return priority.includes(taskPriorityName);
    });
  }

  return inputData;
}
