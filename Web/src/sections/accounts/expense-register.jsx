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

import { ExpenseRegisterTableRow } from './expense-register-table-row';

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
import { AddAssetsManagement } from './add-assets-management';

import { mock_assets, mock_posted_voucher, expense_register } from './account-mock-data';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ExpenseRegister({
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
}) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');

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

  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditRow = (row) => {
    setSelectedRow(row);
    setSelectedButton('newJournal');
    setMode('invoice');
  };

  const [view, setView] = useState('list');

  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;

  const [selectedButton, setSelectedButton] = useState('journal');

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.serial_no'), width: '6%', align: 'center' },
    {
      id: 'date',
      label: 'Date',
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'id',
      label: 'Expense ID',
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'description',
      label: 'Description',
      width: '25%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'paidTo',
      label: 'Paid To',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'paymentMode',
      label: 'Payment Mode',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'amount',
      label: 'Amount',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'tax',
      label: 'Tax',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'total',
      label: 'Total',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(selectedButton !== 'posted'
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

  const confirm = useBoolean();

  const [mode, setMode] = useState('');

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
    if (!isInvoice) {
      setTableData(expense_register);
    } else if (isInvoice) {
      setTableData(expense_register);
    } else {
      setTableData([]);
    }
  }, [selectedButton]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    zetaUser,
  });

  const canReset =
    !!filters.state.name ||
    filters.state.role.length > 0 ||
    filters.state.member.length > 0 ||
    filters.state.taskStatus.length > 0 ||
    filters.state.taskVariant.length > 0 ||
    filters.state.priority.length > 0;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = async (id) => {
    if (id) {
      console.log('this is the id', id);
    }
  };

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const renderView = (
    <>
      {(selectedButton === 'journal' || selectedButton === 'posted') && (
        <>
          <Card sx={{ mt: 1 }}>
            <Stack
              spacing={1}
              sx={{
                p: 1,
                pl: 0,
              }}
            >
              {' '}
              <Box
                display="flex"
                justifyContent={selectedButton === 'posted' ? 'space-between' : 'end'}
                sx={{ pl: 1 }}
              >
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
                {selectedButton !== 'posted' && (
                  <>
                    {!isClientView && !isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        sx={{ ml: 1 }}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Purchase Invoice
                      </Button>
                    )}

                    {!isClientView && isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        sx={{ ml: 1 }}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Debit Note
                      </Button>
                    )}
                    {isClientView && !isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        sx={{ ml: 1 }}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Sales Invoices
                      </Button>
                    )}
                    {isClientView && isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        sx={{ ml: 1 }}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Credit Note
                      </Button>
                    )}
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
                  </>
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
                        <ExpenseRegisterTableRow
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
                          isSubTask={isSubTask}
                          parentTaskId={parentTaskId}
                          selectedCategory={filters.state.status}
                          isProject={isProject}
                          isClient={isClient}
                          isLead={isLead}
                          userId={userId}
                          isMilestone={isMilestone}
                          selectedButton={selectedButton}
                          setSelectedButton={setSelectedButton}
                          handleButtonClick={handleButtonClick}
                          isInvoice={isInvoice}
                          isPosted={selectedButton === 'posted'}
                          isClientView={isClientView}
                          isNote={isNote}
                        />
                      ))}

                      <TableNoData notFound={notFound} />
                    </TableBody>
                  </Table>
                </Scrollbar>
              </Form>
            )}

            {view === 'list' && (
              <TablePaginationCustom
                page={table.page}
                rowsPerPageOptions={[50, 100, 150]}
                dense={table.dense}
                count="50"
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
          <AddAssetsManagement
            row={selectedRow}
            mode={mode}
            isInvoice={isInvoice}
            isClientView={isClientView}
            isNote={isNote}
          />
        </>
      )}
    </>
  );

  return <>{renderView}</>;
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
