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

import { PaymentVoucherTableRow } from './payment-voucher-table-row';

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

import { getItemCost } from 'src/actions/time-sheet/timeSheetActions';

import { getUser } from 'src/actions/user-manage/userManageActions';
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
import { fDate } from 'src/utils/format-time';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDoubleClick } from 'src/hooks/use-double-click';
import { KanbanDetails } from 'src/sections/kanban/details/kanban-details';
import { AddPaymentVoucher } from './add-payment-voucher';

import { mock_payment_voucher, mock_posted_voucher } from './account-mock-data';
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function PaymentVoucher({
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
  isLocalPurchaseOrder,
  isInvoice,
  isPosted,
  isNote,
  isReceipt,
}) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser();
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
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditRow = (row) => {
    setSelectedRow(row);
    setSelectedButton('newJournal');
    setMode('invoice');
  };
  useEffect(() => {
    if (projectCategoryList?.categories?.length > 0 && !filters.state.category) {
      filters.setState({ category: projectCategoryList.categories[0].id });
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
  const [selectedButton, setSelectedButton] = useState('journal');

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.serial_no'), width: '6%', align: 'center' },
    {
      id: 'account',
      label: isInvoice ? t('tasks.date') : t('tasks.purchase_date'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'voucher',
      label: isReceipt ? t('tasks.receipt_number') : t('tasks.voucher_number'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'voucher',
      label: isClientView ? t('tasks.receiver') : t('tasks.vendor'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'voucher',
      label: t('tasks.accountdetails'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'voucher',
      label: t('tasks.payment_method'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'project', label: t('tasks.details'), width: '5%' },

    {
      id: 'credit',
      label: t('tasks.amount'),
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    ...(!isPosted
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
  const newAccount = useBoolean();
  const handleOpenAccountDetails = useDoubleClick({
    click: () => {
      newAccount.onTrue();
    },
    doubleClick: () => console.info('DOUBLE CLICK'),
  });

  const confirmDeleteMilestone = useBoolean();

  const confirmDeleteMilestoneTask = useBoolean();

  const [openMilestone, setOpenMilestone] = useState(false);
  const [mode, setMode] = useState('');

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
  function groupVouchers(vouchers) {
    const grouped = {};

    vouchers.forEach((v) => {
      if (!grouped[v.voucherNumber]) {
        grouped[v.voucherNumber] = {
          voucherNumber: v.voucherNumber,
          entries: [],
          totalDebit: 0,
          totalCredit: 0,
        };
      }
      grouped[v.voucherNumber].entries.push({
        accountNumber: v.accountNumber,
        accountName: v.accountName,
        narration: v.narration,
        debit: v.debit,
        credit: v.credit,
      });
      grouped[v.voucherNumber].totalDebit += Number(v.debit || 0);
      grouped[v.voucherNumber].totalCredit += Number(v.credit || 0);
    });

    return Object.values(grouped);
  }

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (!isInvoice) {
      setTableData(mock_payment_voucher);
    } else if (isInvoice) {
      setTableData(mock_payment_voucher);
    } else {
      setTableData([]);
    }
  }, [selectedButton]);

  console.log('Table data', tableData);

  const [categories, setCategories] = useState([]);
  const [pendingSwap, setPendingSwap] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    const CATEGORY_OPTIONS =
      projectCategoryList?.categories?.map((data) => ({
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

  console.log('this is the tabledata', dataFiltered);

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

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const renderView = (
    <>
      {selectedButton === 'journal' && (
        <>
          <Card sx={{ mt: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column' },
                justifyContent: 'space-between',
                // alignItems: 'center',
                p: isPosted ? 0 : 0.5,
                pt: 0,
              }}
            >
              <Dialog open={openConfirm} onClose={cancelSwap}>
                <DialogTitle>{t('tasks.confirm_swap')}</DialogTitle>
                <DialogContent> {t('tasks.are_you_want_swap')}</DialogContent>
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
            <Stack
              spacing={1}
              sx={{
                p: isPosted ? 0 : 1,
                pl: 0,
              }}
            >
              {' '}
              <Box
                display="flex"
                justifyContent={selectedButton === 'posted' ? 'space-between' : 'end'}
                sx={{ pl: 1 }}
              >
                {/* {selectedButton === 'journal' && (
                  <Button
                    sx={{ ml: 1 }}
                    variant="contained"
                    onClick={() => handleButtonClick('posted')}
                  >
                    Posted Journal Vouchers
                  </Button>
                )} */}

                {selectedButton === 'posted' && (
                  <>
                    <Button
                      onClick={() => {
                        setSelectedButton('journal');
                        setMode('');
                      }}
                      variant="outlined"
                      startIcon={
                        <Iconify
                          icon="eva:arrow-back-fill"
                          sx={{
                            transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                            ...(storedLang === 'ar' && { ml: 1 }),
                          }}
                        />
                      }
                    >
                      {t('tasks.Back')}
                    </Button>
                  </>
                )}
                {!isPosted && (
                  <Button
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    sx={{ ml: 1 }}
                    variant="contained"
                    onClick={() => {
                      handleButtonClick('newJournal');
                      setMode('order');
                    }}
                  >
                    {t('tasks.new')}
                  </Button>
                )}
              </Box>
            </Stack>

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
                      {dataFiltered.map((row, index) => (
                        <PaymentVoucherTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row)}
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
                          selectedButton={selectedButton}
                          setSelectedButton={setSelectedButton}
                          handleButtonClick={handleButtonClick}
                          isInvoice={isInvoice}
                          isPosted={isPosted}
                          isClientView={isClientView}
                          isNote={isNote}
                          isReceipt={isReceipt}
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

            {view === 'list' && (
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
      {selectedButton === 'newJournal' && (
        <>
          <Stack direction="row" alignItems="center" sx={{ mt: 1 }} gap={1}>
            <Button
              onClick={() => {
                setSelectedButton('journal');
              }}
              variant="outlined"
              startIcon={
                <Iconify
                  icon="eva:arrow-back-fill"
                  sx={{
                    transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
              }
            >
              {t('tasks.Back')}
            </Button>
          </Stack>
          <AddPaymentVoucher
            row={selectedRow}
            mode={mode}
            isInvoice={isInvoice}
            isClientView={isClientView}
            isReceipt={isReceipt}
          />
        </>
      )}
    </>
  );

  return (
    <>
      {isClient || isUser || isProject || isSubTask || isLead ? (
        <>{renderView}</>
      ) : (
        <>{renderView}</>
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
      effectiveStatusName = effectiveStatusName ?? t('tasks.kanban_details.statuses.not_started');

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
          ? t('tasks.mission')
          : task?.vendorContractId
            ? t('tasks.contract')
            : task?.vendorId
              ? t('tasks.vendor')
              : task?.clientLeadId
                ? t('tasks.lead')
                : task?.clientId
                  ? t('tasks.client')
                  : task?.projectId
                    ? t('tasks.project')
                    : t('tasks.general-o');
      return taskVariant.includes(eachVariant);
    });
  }

  if (priority.length) {
    inputData = inputData.filter((task) => priority.includes(task.priorityName?.value));
  }
  return inputData;
}
