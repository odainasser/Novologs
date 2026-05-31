'use client';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import { useTheme, useMediaQuery } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { getUser } from 'src/actions/userManage/userManageActions';
import { getDepartments } from 'src/actions/department/departmentActions';
import { getProjects, deleteProject } from 'src/actions/project/projectActions';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';
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

import { ErrorView } from 'src/sections/error/error-view';
import { status, statusAr } from 'src/sections/project/project-mock-data';
import { UserSettingsButton } from 'src/sections/user/view/user-settings-button';

import { useAuthContext } from 'src/auth/hooks';

import { ProjectTableRow } from '../project-table-row';
import { ProjectCreateForm } from '../project-create-form';
import { ProjectSettingsView } from './project-settings-view';
import { ProjectTableToolbar } from '../project-table-toolbar';
import { ProjectTableListRow } from '../project-table-list-row';
import { ProjectTableFiltersResult } from '../project-table-filters-result';
import Chip from '@mui/material/Chip';

export function ProjectListView({ isMission, isTicket }) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const [isArchivedView, setIsArchivedView] = useState(false);
  const filters = useSetState({ name: '', status: [], type: 'internal', department: '' });

  const getProjectParams = useMemo(
    () => ({
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
      search: {
        logicOperator: 0,
        operator: 0,
        fieldName: 'LifeCycle',
        fieldValue: isArchivedView ? 1 : 0,
      },
      type: isMission ? 0 : isTicket ? 2 : 1,
    }),
    [isArchivedView, isMission, isTicket]
  );
  const {
    projectList,
    projectListLoading,
    projectListError,
    projectListValidating,
    projectListEmpty,
    mutate,
  } = getProjects(getProjectParams, filters.state.department);

  const {
    departmentsList,
    departmentsListLoading,
    departmentsListError,
    departmentsListValidating,
    departmentsListEmpty,
  } = getDepartments();
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
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('projects.table.serial_no'), width: '5%', align: 'center' },
    { id: 'Id', label: t('projects.table.id'), width: '5%' },
    {
      id: 'code',
      label: t('projects.table.code'),
      width: '5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'created',
      label: t('projects.table.creator'),
      width: '11%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'name',
      label: isTicket ? t('projects.category_name') : t('projects.table.name'),
      width: isTicket ? '42%' : '16%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'departmentId',
      label: t('projects.table.department'),
      width: '11%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(!isTicket
      ? [
          {
            id: 'startDate',
            label: t('projects.table.startDate'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            id: 'endDate',
            label: t('projects.table.endDate'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),

    {
      id: 'members',
      label: t('projects.table.members'),
      width: '8%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'owners',
      label: t('projects.table.owners'),
      width: '8%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(!isTicket
      ? [
          {
            id: 'initiativeId',
            label: t('projects.table.details'),
            width: '13%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            id: 'status',
            label: t('projects.table.status'),
            width: '7%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),

    { id: '', label: t('projects.table.actions'), width: '10%', align: 'center' },
  ];
  const STATUS_OPTIONS = [
    { code: 0, en: 'Created', ar: 'تم الإنشاء' },
    { code: 1, en: 'Started', ar: 'تم البدء' },
    { code: 2, en: 'Closed', ar: 'مغلق' },
    { code: 3, en: 'Cancelled', ar: 'ملغى' },
    { code: 4, en: 'In progress', ar: 'قيد التنفيذ' },
    { code: 5, en: 'Postponed', ar: 'مؤجَّل' },
    { code: 6, en: 'Amended', ar: 'معدَّل' },
    { code: 7, en: 'Reopened', ar: 'أُعيد فتحه' },
    { code: 8, en: 'Stopped', ar: 'متوقّف' },
  ];

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
    defaultOrderBy: 'created',
    defaultOrder: 'desc',
  });
  const router = useRouter();

  const confirm = useBoolean();

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
  // const [tableData, setTableData] = useState(() => projects.filter((project) => project.isActive));
  const searchParams = useSearchParams();
  const isMissionParam = searchParams.get('isMission');

  const isMissionFromParam = isMissionParam === 'true';

  // Use param value if present, otherwise use local isMission variable
  const effectiveIsMission = isMissionParam !== null ? isMissionFromParam : isMission;

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (projectList?.projects?.length) {
      const sortedProjects = [...projectList.projects].sort(
        (a, b) => new Date(b.created) - new Date(a.created)
      );
      setTableData(sortedProjects);
    } else {
      setTableData([]);
    }
  }, [projectList]);
  console.log('this is the projectList', tableData);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    projectDepartments: departmentsList?.departments,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name || filters.state.status.length > 0 || filters.state.department;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;
  // (!isMission && !zetaUser?.permissions?.includes('Project.ViewAll')) ||
  // (isMission && !zetaUser?.permissions?.includes('Mission.ViewAll'));

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        const response = await deleteProject(id);
        if (response.success) {
          await mutate();
          toast.success('Project archived successfully');
        } else {
          toast.error(response.error || t('projects.toast.failed_add'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('projects.toast.expected_error'));
      }
    }
  };

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success(t('projects.toast.delete_success'));

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

  const handleAddMoreRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.more(id));
    },
    [router]
  );

  const handleOpenRow = useCallback(
    (row) => {
      if (isTicket) {
        router.push(paths.dashboard.ticketing.details(row.id));
      } else {
        router.push(paths.dashboard.project.details(row.id));
      }
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ type: newValue });
    },
    [filters, table]
  );

  const [view, setView] = useState('list');
  useEffect(() => {
    const handleReset = () => {
      setView('list');
      setSelectedButton('projectList');
      setIsArchivedView(false);
    };
    window.addEventListener('reset-project-view', handleReset);
    localStorage.removeItem('editorContentDocs');

    return () => window.removeEventListener('reset-project-view', handleReset);
  }, []);

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const [selectedButton, setSelectedButton] = useState('projectList');

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const handleArchiveClick = async () => {
    setIsArchivedView(true);
    await mutate();
  };

  const handleActiveClick = async () => {
    setIsArchivedView(false);
    await mutate();
  };

  if (projectListLoading)
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
  if (projectListError) {
    return <ErrorView errorCode={projectListError} />;
  }
  return (
    <>
      <DashboardContent>
        {!isTicket && (
          <CustomBreadcrumbs
            heading={
              isArchivedView
                ? effectiveIsMission
                  ? t('projects.missions.archived_missions')
                  : t('projects.archived_projects')
                : effectiveIsMission
                  ? t('projects.missions.missions')
                  : t('projects.projects')
            }
            links={[
              { name: t('projects.dashboard'), href: paths.dashboard.root },
              effectiveIsMission
                ? { name: t('projects.missions.missions'), href: paths.dashboard.mission.list }
                : { name: t('projects.projects'), href: paths.dashboard.project.list },
              { name: t('projects.list') },
            ]}
            sx={{ mb: 1 }}
          />
        )}
        {isTicket && (
          <CustomBreadcrumbs
            heading={t('projects.project_details.tabs.ticketing')}
            links={[
              { name: t('projects.dashboard'), href: paths.dashboard.root },
              {
                name: t('projects.project_details.tabs.ticketing'),
                href: paths.dashboard.ticketing.list,
              },
              { name: t('projects.list') },
            ]}
            sx={{ mb: 1 }}
          />
        )}

        <Box sx={{ mb: 1 }} display="flex" justifyContent="space-between">
          <Box onClick={() => handleButtonClick('projectList')}>
            <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
              <Tooltip title={t('projects.tooltip.list')} arrow>
                <ToggleButton value="list">
                  <Iconify icon="solar:list-bold" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title={t('projects.tooltip.grid')} arrow>
                <ToggleButton value="grid">
                  <Iconify icon="mingcute:dot-grid-fill" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
          {isTicket && (
            <Chip
              label={`${t('projects.total_categories')}: ${projectList?.totalProjects || 0} `}
              size="small"
              variant="soft"
              color="info"
              sx={{
                ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                '& .MuiChip-icon': {
                  ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                },
              }}
            />
          )}

          {!isTicket && (
            <Box sx={{ mb: 1 }} display="flex" alignItems="center" gap={1}>
              {!isArchivedView ? (
                <Tooltip
                  title={
                    isMission
                      ? t('projects.missions.archived_missions')
                      : t('projects.tooltip.view_archived_projects')
                  }
                  arrow
                >
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="mdi:archive-outline" />}
                    onClick={() => handleArchiveClick()}
                    sx={{
                      '& .MuiButton-startIcon': {
                        margin: '0',
                      },
                      background: '#006A67',
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip
                  title={
                    isMission
                      ? t('projects.missions.active_missions')
                      : t('projects.tooltip.view_active_projects')
                  }
                  arrow
                >
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="mdi:checkbox-marked-circle-outline" />}
                    onClick={() => handleActiveClick()}
                    sx={{
                      '& .MuiButton-startIcon': {
                        margin: '0',
                      },
                      background: '#006A67',
                    }}
                  />
                </Tooltip>
              )}
              {zetaUser?.permissions?.includes('General.ProjectSettings') && !isMission && (
                <Tooltip title={t('projects.tooltip.settings')} arrow>
                  <UserSettingsButton
                    sx={{ color: '#006A67' }}
                    onClick={() => handleButtonClick('settings')}
                  />
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {selectedButton === 'settings' && <ProjectSettingsView isMission={isMission} />}
        {selectedButton === 'projectList' && (
          <Card>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                px: 2.5,
                py: 0.5,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              <ProjectTableToolbar
                filters={filters}
                onResetPage={table.onResetPage}
                options={{
                  status: STATUS_OPTIONS.map((s) => ({
                    label: storedLang === 'ar' ? s.ar : s.en,
                    value: s.code,
                  })),
                }}
                STATUS_OPTIONS={STATUS_OPTIONS}
                departments={{ departments: departmentsList?.departments }}
                isTicket={isTicket}
              />
            </Box>

            {canReset && (
              <ProjectTableFiltersResult
                filters={filters}
                totalResults={dataFiltered.length}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
                STATUS_OPTIONS={STATUS_OPTIONS}
                departments={{ departments: departmentsList?.departments }}
              />
            )}

            <Box sx={{ position: 'relative' }}>
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
                    <Tooltip title={t('projects.table.actions_delete')}>
                      <IconButton color="primary" onClick={confirm.onTrue}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  }
                />

                <Scrollbar>
                  {view === 'list' ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        width: '100%',
                        overflowX: 'auto',
                      }}
                    >
                      <Table
                        size={table.dense ? 'small' : 'medium'}
                        sx={{
                          width: '100%',
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
                          {!isArchivedView &&
                            ((!isMission &&
                              !isTicket &&
                              zetaUser?.permissions?.includes('Project.Create')) ||
                              (isMission &&
                                !isTicket &&
                                zetaUser?.permissions?.includes('Mission.Create')) ||
                              (!isMission &&
                                isTicket &&
                                zetaUser?.permissions?.includes('TicketingProject.Create'))) && (
                              <ProjectCreateForm
                                setTableData={setTableData}
                                projectDepartments={departmentsList?.departments}
                                mutate={mutate}
                                allUsers={usersList?.users}
                                isMission={isMission}
                                isTicket={isTicket}
                              />
                            )}

                          {dataFiltered
                            .slice(
                              table.page * table.rowsPerPage,
                              table.page * table.rowsPerPage + table.rowsPerPage
                            )
                            .map((row, index) => (
                              <ProjectTableListRow
                                key={row.id}
                                row={row}
                                selected={table.selected.includes(row.id)}
                                onSelectRow={() => table.onSelectRow(row.id)}
                                onDeleteRow={() => handleDeleteRow(row.id)}
                                onEditRow={() => handleEditRow(row.id)}
                                onAddMore={() => handleAddMoreRow(row.id)}
                                index={index + table.page * table.rowsPerPage}
                                onOpenRow={() => handleOpenRow(row)}
                                tableData={tableData}
                                setTableData={setTableData}
                                isArchivedView={isArchivedView}
                                projectDepartments={departmentsList?.departments}
                                isMission={isMission}
                                allUsers={usersList?.users}
                                mutate={mutate}
                                isTicket={isTicket}
                                projectList={projectList?.projects}
                              />
                            ))}

                          <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              dataFiltered.length
                            )}
                          />

                          <TableNoData notFound={notFound} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, my: 1 }}>
                        <TableBody>
                          {Array.from({
                            length: Math.ceil(dataFiltered.length / (isLargeScreen ? 4 : 3)),
                          }).map((_, index) => {
                            const startIdx = index * (isLargeScreen ? 4 : 3);
                            const rows = dataFiltered.slice(
                              startIdx,
                              startIdx + (isLargeScreen ? 4 : 3)
                            );

                            return (
                              <TableRow key={index}>
                                <TableCell colSpan={isLargeScreen ? 4 : 3}>
                                  <Grid container spacing={2} sx={{ ml: 0, mt: 1 }}>
                                    {rows.map((row, rowIndex) => (
                                      <Box
                                        key={row.id}
                                        sx={{ display: 'flex', alignItems: 'center' }}
                                      >
                                        <Card
                                          sx={{
                                            width: 'auto',
                                            minWidth: 200,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            my: 1,
                                          }}
                                        >
                                          <ProjectTableRow
                                            row={row}
                                            selected={table.selected.includes(row.id)}
                                            onSelectRow={() => table.onSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(row.id)}
                                            onEditRow={() => handleEditRow(row.id)}
                                            onOpenRow={() => handleOpenRow(row)}
                                            projectDepartments={departmentsList?.departments}
                                            isMission={isMission}
                                            isTicket={isTicket}
                                          />
                                        </Card>

                                        {rowIndex < rows.length - 1 && (
                                          <Box
                                            sx={{
                                              height: '100px',
                                              width: '1px',
                                              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                              marginX: 2,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    ))}
                                  </Grid>
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              dataFiltered.length
                            )}
                          />
                          <TableNoData notFound={notFound} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Scrollbar>
              </Form>
            </Box>
            {view === 'list' && (
              <TablePaginationCustom
                page={table.page}
                rowsPerPageOptions={[100, 150, 250]}
                dense={table.dense}
                count={canReset ? dataFiltered.length : projectList.totalProjects}
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
        )}
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('projects.table.actions_delete')}
        content={
          <>
            {t('projects.table.confirm_delete')} <strong> {table.selected.length} </strong> items?
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
            {t('projects.table.actions_delete')}
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters, projectDepartments }) {
  const getDepartmentName = (departmentId) =>
    projectDepartments?.find((dep) => dep.id === departmentId)?.name?.value || 'Not Available';

  const { name, type, status, department } = filters;
  const STATUS_MAP = {
    Created: 0,
    Started: 1,
    Closed: 2,
    Cancelled: 3,
    InProgress: 4,
    Postpone: 5,
    Amended: 6,
    Reopened: 7,
    Stopped: 8,
  };

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);
  inputData = inputData.filter(
    (project) =>
      project?.name.toLowerCase().includes(name.toLowerCase()) ||
      project?.code.toLowerCase().includes(name.toLowerCase()) ||
      project?.initiative?.name?.value.toLowerCase().includes(name.toLowerCase()) ||
      project?.goal?.name?.value.toLowerCase().includes(name.toLowerCase())
  );

  // if (status.length) {
  //   const statusCodes = status.map((label) => STATUS_MAP[label]).filter((v) => v !== undefined);
  //   inputData = inputData.filter((project) => statusCodes.includes(project.status));
  // }
  if (status.length) {
    inputData = inputData.filter((project) => status.includes(project.status));
  }

  // if (department?.length) {
  //   inputData = inputData.filter((project) => {
  //     const userDeptName = getDepartmentName(project.departmentId);

  //     const selectedDepartments = department.map((d) => d.split(' / ').pop().trim());
  //     return selectedDepartments.includes(userDeptName);
  //   });
  // }

  return inputData;
}
