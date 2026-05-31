'use client';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { _roles, _userList } from 'src/_mock';
import TableContainer from '@mui/material/TableContainer';

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
  TableSelectedAction,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { LeadTableRow } from '../lead-table-row';
import { LeadTableListRow } from '../lead-table-list-row';
import { LeadTableToolbar } from '../lead-table-toolbar';
import { LeadTableFiltersResult } from '../lead-table-filters-result';
import { useTheme, useMediaQuery, Stack } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import {
  mock_clients,
  clients,
  locations,
  status,
  emirates,
  mock_leads,
  leads,
} from 'src/sections/client/client-mock-data';
import { TextField, MenuItem } from '@mui/material';
import { Form, Field } from 'src/components/hook-form';
import { useForm, Controller } from 'react-hook-form';
import { LeadCreateForm } from '../lead-create-form';
import {
  getLeads,
  getSharedLeads,
  deleteLead,
  getSources,
  getSaleStatuses,
} from 'src/actions/client/clientActions';

import {
  getContracts,
  deleteContract,
  getContractStatus,
  getContractType,
} from 'src/actions/vendor/vendorActions';
import { getCurrencies } from 'src/actions/settings/settingActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useAuthContext } from 'src/auth/hooks';
import { getUser } from 'src/actions/user-manage/userManageActions';

export function LeadView({ isClient, isClientView, clientId, isShared }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const LEAD_OPTIONS = [
    { value: 0, label: t('leaddetails.tabs.leads') },
    { value: 1, label: t('leaddetails.tabs.awarded') },
    { value: 2, label: t('leaddetails.tabs.rejected') },
  ];
  const filters = useSetState({ name: '', status: [], type: 0, myLead: [], members: [] });
  const { zetaUser } = useAuthContext();

  function useLeadOrContract(isClientView, clientId, myLeadArray, isShared) {
    const isMyLead =
      myLeadArray?.[0] === 'My Leads' || !zetaUser?.permissions?.includes('Lead.ViewAll');

    let result;

    if (isClientView) {
      if (isShared) {
        result = getSharedLeads({ clientId });
      } else {
        result = getLeads(clientId, isMyLead);
      }
    } else {
      result = getContracts(clientId);
    }

    return {
      list: isClientView
        ? isShared
          ? result.sharedLeadList.sharedLeads
          : result.leadList.leads
        : result.contractList.contracts,

      listLoading: isClientView
        ? isShared
          ? result.sharedLeadListLoading
          : result.leadListLoading
        : result.contractListLoading,

      listError: isClientView
        ? isShared
          ? result.sharedLeadListError
          : result.leadListError
        : result.contractListError,

      listValidating: isClientView
        ? isShared
          ? result.sharedLeadListValidating
          : result.leadListValidating
        : result.contractListValidating,

      listEmpty: isClientView
        ? isShared
          ? result.sharedLeadListEmpty
          : result.leadListEmpty
        : result.contractListEmpty,

      mutate: result.mutate,
    };
  }

  const { list, listLoading, listError, listValidating, listEmpty, mutate } = useLeadOrContract(
    isClientView,
    clientId,
    filters.state.myLead,
    isShared
  );
  const {
    currencyList,
    currencyListLoading,
    currencyListError,
    currencyListValidating,
    currencyListEmpty,
  } = getCurrencies();

  const { sourceList, sourceListLoading, sourceListError, sourceListValidating, sourceListEmpty } =
    getSources();

  const {
    contractTypeList,
    contractTypeListLoading,
    contractTypeListError,
    contractTypeListValidating,
    contractTypeListEmpty,
  } = getContractType();

  const {
    salesStatusList,
    salesStatusListLoading,
    salesStatusListError,
    salesStatusListValidating,
    salesStatusListEmpty,
  } = getSaleStatuses();

  const {
    contractStatusList,
    contractStatusListLoading,
    contractStatusListError,
    contractStatusListValidating,
    contractStatusListEmpty,
  } = getContractStatus();
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
  const { usersList, usersListEmpty } = getUser(getUsersParams);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
    defaultOrderBy: 'created',
    defaultOrder: 'desc',
  });

  const router = useRouter();

  const confirm = useBoolean();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [totalAmountsByStatus, setTotalAmountsByStatus] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ' AED'
    );
  };
  useEffect(() => {
    if (list?.length) {
      const sortedList = [...list].sort((a, b) => {
        const dateA = new Date(a.created);
        const dateB = new Date(b.created);
        return dateB - dateA;
      });
      setTableData([...list]);

      const totals = sortedList.reduce((acc, item) => {
        const status = item.leadStatus;
        const value = Number(item.value || 0);
        acc[status] = (acc[status] || 0) + value;
        acc['all'] = (acc['all'] || 0) + value;
        return acc;
      }, {});
      const total = sortedList.reduce((sum, item) => {
        return sum + Number(item.value || 0);
      }, 0);
      console.log('this is the total', total);
      setTotalAmount(total);
      setTotalAmountsByStatus(totals);
    } else {
      setTableData([]);
      setTotalAmountsByStatus({});
      setTotalAmount(0);
    }
  }, [list]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    isClientView: isClientView,
  });

  const shouldShowProbability = filters.state.type === 0;

  const dynamicLabel = () => {
    if (filters.state.type === 0) {
      return t('leaddetails.common.status'); // Translates 'Status'
    }
    if (filters.state.type === 1) {
      return t('leaddetails.common.awarded_amount'); // Translates 'Awarded Amount'
    }
    if (filters.state.type === 2) {
      return t('leaddetails.common.rejected_reason'); // Translates 'Rejected Reason'
    }
  };

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('leaddetails.common.sl_no'), width: '6%', align: 'center' },
    { id: 'id', label: t('clients.columns.id'), width: '6%' },

    ...[
      isClientView
        ? {
            id: 'code',
            label: t('clients.columns.code'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          }
        : {
            id: 'code',
            label: t('clients.columns.code'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
    ],

    {
      id: 'created',
      label: t('leaddetails.common.creator'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...[
      isClientView
        ? {
            id: 'name',
            label: t('leaddetails.common.lead_name'),
            width: '20%',
            align: storedLang === 'ar' ? 'right' : 'left',
          }
        : {
            id: 'name',
            label: t('leaddetails.common.contract_name'),
            width: '20%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
    ],
    ...(isClientView
      ? [
          {
            id: 'leadMembers',
            label: 'Lead Members',
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),

    ...(isClientView
      ? []
      : [
          {
            id: 'expectedStartDate',
            label: t('leaddetails.common.delivery_date'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]),

    ...(!clientId
      ? [
          isClientView
            ? {
                id: 'clientId',
                label: t('leaddetails.common.client_name'),
                width: '13%',
                align: storedLang === 'ar' ? 'right' : 'left',
              }
            : {
                id: 'vendorId',
                label: t('leaddetails.common.vendorname'),
                width: '13%',
                align: storedLang === 'ar' ? 'right' : 'left',
              },
        ]
      : []),

    {
      id: 'value',
      label: t('leaddetails.common.value'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(isClientView
      ? [
          {
            id: 'leadSourceId',
            label: t('leaddetails.common.source'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : [
          {
            id: 'vendorContractTypeId',
            label: t('leaddetails.common.contract_type'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]),

    ...(shouldShowProbability && isClientView
      ? [
          {
            id: 'probability',
            label: t('leaddetails.common.probability'),
            width: '8%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    {
      id: isClientView
        ? filters.state.type === 0
          ? 'saleStatusId'
          : filters.state.type === 1
            ? 'awardedValue'
            : 'rejectionReasonId'
        : 'vendorContractStatusId',
      label: dynamicLabel(),
      width: '18%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(isClientView && filters.state.type === 0
      ? [
          {
            id: 'award',
            label: t('leaddetails.common.award_reject'),
            width: '15%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    {
      id: 'actions',
      label: t('leaddetails.common.actions'),
      width: '11%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
  ];

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.status.length > 0 ||
    filters.state.myLead.length > 0 ||
    filters.state.members.length > 0;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = async (id) => {
    if (id) {
      let response;
      try {
        if (isClientView) {
          response = await deleteLead(id);
        } else {
          response = await deleteContract(id);
        }
        if (response.success) {
          await mutate();
          toast.success(
            isClientView
              ? t('leaddetails.toast.lead_deleted')
              : t('leaddetails.toast.contarct_deleted')
          );
        } else {
          if (isClientView) {
            toast.error(response.error || t('leaddetails.toast.failed_to_delete_lead'));
          } else {
            toast.error(response.error || t('leaddetails.toast.failed_delete_contract'));
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('leaddetails.toast.unexpected_error'));
      }
    }
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

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success(t('leaddetails.common.delete_success'));

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

  const handleOpenRow = useCallback(
    (id, leadName, clientName, businessLeadClientId) => {
      if (leadName) {
        localStorage.setItem('leadName', leadName);
        localStorage.setItem('clientVendorId', clientId || businessLeadClientId);
        localStorage.setItem('clientName', clientName);
        localStorage.setItem('isBusinessLead', clientId ? 'false' : 'true');
      }
      isClientView
        ? router.push(paths.dashboard.leadDetails.details(id))
        : router.push(paths.dashboard.contractDetails.details(id));
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

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);
  if (listLoading)
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
  if (listError) {
    return <ErrorView errorCode={listError} />;
  }
  return (
    <>
      <Box sx={{ mb: 1 }}>
        <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
          <Tooltip title={t('leaddetails.buttons.list_view')} arrow>
            <ToggleButton value="list">
              <Iconify icon="solar:list-bold" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('leaddetails.buttons.grid_view')} arrow>
            <ToggleButton value="grid">
              <Iconify icon="mingcute:dot-grid-fill" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isClientView ? 'space-between' : 'space-between',
            alignItems: 'center',
            px: 1,
            pt: 0.2,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          {isClientView ? (
            <Tabs value={filters.state.type} onChange={handleFilterStatus}>
              {LEAD_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <>
                      <Label
                        sx={{ ml: 1, ...(storedLang === 'ar' && { mr: 1 }) }}
                        variant={
                          ((tab.value === 'all' || tab.value === filters.state.type) && 'filled') ||
                          'soft'
                        }
                        color={
                          (tab.value === 0 && 'info') ||
                          (tab.value === 1 && 'success') ||
                          (tab.value === 2 && 'error') ||
                          'default'
                        }
                      >
                        {[0, 1, 2].includes(tab.value)
                          ? tableData.filter((user) => user.leadStatus === tab.value).length
                          : tableData.length}
                      </Label>

                      <Label
                        sx={{ ml: 1 }}
                        variant={
                          ((tab.value === 'all' || tab.value === filters.state.type) && 'filled') ||
                          'soft'
                        }
                        color={
                          (tab.value === 0 && 'info') ||
                          (tab.value === 1 && 'success') ||
                          (tab.value === 2 && 'error') ||
                          'default'
                        }
                      >
                        {formatCurrency(totalAmountsByStatus[tab.value] || 0)}
                      </Label>
                    </>
                  }
                />
              ))}
            </Tabs>
          ) : (
            <Box display="flex" gap={1}>
              <Label color="info">
                {t('leaddetails.common.contract')} {list?.length || 0}
              </Label>

              <Label color="success">
                {t('leaddetails.common.total_amount')} {formatCurrency(totalAmount || 0)}
              </Label>
            </Box>
          )}

          <LeadTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ status: status }}
            leads={{ leads: leads }}
            isClientView={isClientView}
            allUsers={{
              allUsers: usersList?.users.map((user) => user.fullName),
            }}
          />
        </Box>

        {canReset && (
          <LeadTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
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
                <Tooltip title={t('clients.buttons.delete')}>
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
                      {filters.state.type === 0 &&
                        isClient &&
                        ((isClientView && zetaUser?.permissions?.includes('Lead.Add')) ||
                          (!isClientView && zetaUser?.permissions?.includes('Contract.Add'))) && (
                          <LeadCreateForm
                            setTableData={setTableData}
                            isClient={isClient}
                            clientId={clientId}
                            mutate={mutate}
                            isClientView={isClientView}
                            currencyList={currencyList}
                            sourceList={
                              isClientView ? sourceList?.sources : contractTypeList?.contractType
                            }
                            sourceListEmpty={isClientView ? sourceListEmpty : contractTypeListEmpty}
                            salesStatusList={isClientView ? salesStatusList : contractStatusList}
                            statusEmpty={
                              isClientView ? salesStatusListEmpty : contractStatusListEmpty
                            }
                            filters={filters}
                          />
                        )}

                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row, index) => (
                          <LeadTableListRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            index={index + table.page * table.rowsPerPage}
                            onOpenRow={() =>
                              handleOpenRow(row?.id, row?.name, row?.client?.name, row?.clientId)
                            }
                            isClient={isClient}
                            setTableData={setTableData}
                            tableData={tableData}
                            isClientView={isClientView}
                            mutate={mutate}
                            clientId={clientId}
                            currencyList={currencyList}
                            sourceList={
                              isClientView ? sourceList?.sources : contractTypeList?.contractType
                            }
                            sourceListEmpty={isClientView ? sourceListEmpty : contractTypeListEmpty}
                            salesStatusList={isClientView ? salesStatusList : contractStatusList}
                            statusEmpty={
                              isClientView ? salesStatusListEmpty : contractStatusListEmpty
                            }
                            filters={filters}
                            isShared={isShared}
                          />
                        ))}

                      <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
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
                                  <Box key={row.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Card
                                      sx={{
                                        width: 'auto',
                                        minWidth: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        m: 1,
                                      }}
                                    >
                                      <LeadTableRow
                                        row={row}
                                        selected={table.selected.includes(row.id)}
                                        onSelectRow={() => table.onSelectRow(row.id)}
                                        onDeleteRow={() => handleDeleteRow(row.id)}
                                        onEditRow={() => handleEditRow(row.id)}
                                        onOpenRow={() =>
                                          handleOpenRow(
                                            row?.id,
                                            row?.name,
                                            row?.client?.name,
                                            row?.clientId
                                          )
                                        }
                                        isClientView={isClientView}
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
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
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
            count={dataFiltered.length}
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
  );
}

function applyFilter({ inputData, comparator, filters, isClientView }) {
  const { name, type, status, myLead, members } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  inputData = inputData.filter(
    (user) =>
      user.client?.name.toLowerCase().includes(name.toLowerCase()) ||
      user.vendor?.name.toLowerCase().includes(name.toLowerCase()) ||
      user.name.toLowerCase().includes(name.toLowerCase()) ||
      user.code.toLowerCase().includes(name.toLowerCase())
  );

  if (status.length) {
    inputData = inputData.filter((user) => status.includes(user.status));
  }

  // if (myLead.length) {
  //   inputData = inputData.filter((user) => myLead.includes(user.myLead));
  // }
  if (isClientView) {
    if (type !== 'all') {
      inputData = inputData.filter((user) => user.leadStatus === type);
    }
  } else {
    if (type) {
      inputData = inputData.filter((user) => user.leadStatus === type);
    }
  }
  if (members.length) {
    inputData = inputData.filter((user) => members.includes(user.creator.fullName));
  }
  return inputData;
}
