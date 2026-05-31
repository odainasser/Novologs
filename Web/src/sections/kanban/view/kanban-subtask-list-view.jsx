'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { _userList } from 'src/_mock';

import { Label } from 'src/components/label';
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

import { KanbanSubTaskTableRow } from '../kanban-subtask-table-row';
import { KanbanTableToolbar } from '../kanban-table-toolbar';
import { KanbanTableFiltersResult } from '../kanban-table-filters-result';

import { KanbanView } from './kanban-view';

import { useMockedUser } from 'src/auth/hooks';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import {
  _status,
  _projects,
  _categories,
  _members,
  _weight,
  tasks,
} from 'src/sections/kanban/kanban-mock-data';
import { KanbanCreateForm } from '../kanban-create-form';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function KanbanSubtaskListView({ subTask, taskMembers }) {
  const { user } = useMockedUser();

  const { t, i18n } = useTranslation('dashboard/tasks');

  const USER_STATUS_OPTIONS = [
    { value: 'assigned', label: t('tasks.subtasks.assigned') },
    { value: 'created', label: t('tasks.subtasks.created') },
    { value: 'backlog', label: t('tasks.subtasks.backlog') },
  ];

  const STATUS_OPTIONS = [...USER_STATUS_OPTIONS];

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.subtasks.sl_no'), width: '4%', align: 'center' },
    { id: 'id', label: t('tasks.subtasks.task_id'), width: '6%' },
    { id: 'title', label: t('tasks.subtasks.task_description'), width: '20%' },
    { id: 'members', label: t('tasks.subtasks.members'), width: '10%' },

    { id: 'startDate', label: t('tasks.subtasks.start_date'), width: '15%' },
    { id: 'endDate', label: t('tasks.subtasks.end_date'), width: '15%' },

    { id: 'category', label: t('tasks.subtasks.category'), width: '11%' },
    { id: 'priority', label: t('tasks.subtasks.priority'), width: '11%' },
    { id: '', label: t('tasks.subtasks.actions'), width: '8%' },
  ];

  const isSubTask = true;
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });

  const router = useRouter();

  const confirm = useBoolean();
  const openWeight = useBoolean();

  const [selectedWeight, setSelectedWeight] = useState([]);

  const handleToggleWeight = (weight) => {
    setSelectedWeight(weight);
  };

  const handleCloseWeightDialog = () => {
    openWeight.onFalse();
  };

  const [tableData, setTableData] = useState(subTask);

  const filters = useSetState({ name: '', role: [], status: 'assigned', member: [] });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });
  console.log('this is the data filtered', dataFiltered);
  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name || filters.state.role.length > 0 || filters.state.member.length > 0;

  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData?.filter((row) => row.id !== id);

      toast.success(t('tasks.toast.delete_success'));

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage?.length);
    },
    [dataInPage?.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData?.filter((row) => !table.selected.includes(row.id));

    toast.success(t('tasks.toast.delete_success'));

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage?.length,
      totalRowsFiltered: dataFiltered?.length,
    });
  }, [dataFiltered?.length, dataInPage?.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );
  const [view, setView] = useState('list');

  return (
    <>
      <>
        <Typography variant="subtitle1">{t('tasks.subtasks.subtasks')}</Typography>
        <Card sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            <Tabs value={filters.state.status} onChange={handleFilterStatus}>
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'assigned' && 'info') ||
                        (tab.value === 'created' && 'success') ||
                        (tab.value === 'backlog' && 'warning') ||
                        'default'
                      }
                    >
                      {['assigned', 'created', 'backlog'].includes(tab.value)
                        ? tableData?.filter((user) => user.type === tab.value).length
                        : tableData?.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <KanbanTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
              options={{ roles: _status }}
              memberOptions={{ members: _members }}
            />
          </Box>

          {canReset && (
            <KanbanTableFiltersResult
              filters={filters}
              totalResults={dataFiltered?.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          {view === 'list' ? (
            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered?.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered?.map((row) => row.id)
                  )
                }
                action={
                  <Tooltip title={t('tasks.subtasks.delete')}>
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
                    rowCount={dataFiltered?.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered?.map((row) => row.id)
                      )
                    }
                  />

                  <TableBody>
                    <KanbanCreateForm setTableData={setTableData} isSubTask={isSubTask} />
                    {dataFiltered
                      ?.slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row, index) => (
                        <KanbanSubTaskTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          index={index}
                          setTableData={setTableData}
                        />
                      ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered?.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </Box>
          ) : (
            <KanbanView />
          )}

          {view === 'list' && (
            <TablePaginationCustom
              page={table.page}
              rowsPerPageOptions={[100, 150, 250]}
              dense={table.dense}
              count={dataFiltered?.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onChangeDense={table.onChangeDense}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          )}
        </Card>
      </>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.subtasks.delete')}
        content={
          <>
            {t('tasks.subtasks.are_you_sure_want_to_delete')}{' '}
            <strong> {table.selected.length} </strong> {t('tasks.subtasks.items')}
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
            {t('tasks.subtasks.delete')}
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role, member } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (name) {
    inputData = inputData?.filter(
      (user) => user.title.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData?.filter((user) => user.type === status);
  }

  if (role.length) {
    inputData = inputData?.filter((user) => role.includes(user.status));
  }
  if (member.length) {
    inputData = inputData?.filter((user) =>
      user.members?.some((person) => member.includes(person.firstName))
    );
  }

  return inputData;
}
