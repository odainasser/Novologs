'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import { useTranslation } from 'react-i18next';

import { useRouter } from 'src/routes/hooks';

import { useSetState } from 'src/hooks/use-set-state';

import { _userList } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { TreeRow } from './chart-tree';

import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import { Form } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';

import LinearProgress from '@mui/material/LinearProgress';

import { AccountsFiltersResult } from './accounts-filters-result';

import { AddChartAccount } from './add-chart-account';
import { AddOpeningBalance } from './add-opening-balance';

import { getAccounts, deleteAccount, getHierarchyChart } from 'src/actions/accounts/accountActions';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ChartAccount({}) {
  const storedLang = localStorage.getItem('selectedLang');

  const { t, i18n } = useTranslation('dashboard/tasks');
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 250,
  });

  const filters = useSetState({
    name: '',
  });

  const [view, setView] = useState('list');

  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;

  const getAccountsParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },
    // sort: {
    //   fieldName: 'Created',
    //   sortDirection: 1,
    // },
    isActive: true,
  };
  const {
    accountList,
    accountListLoading,
    accountListError,
    accountListValidating,
    accountListEmpty,
    mutate: accountListMutate,
  } = getAccounts(getAccountsParams);
  console.log('this is the accounts', accountList);
  const { allCategories, mutate: mutateChartHierarchy } = getHierarchyChart();

  const maxTypeDepth = 4;

  const dynamicTypeHeaders = Array.from({ length: maxTypeDepth }, (_, i) => ({
    id: `typeLevel${i + 1}`,
    label: i === 0 ? 'Main Category' : `Sub Category ${i}`,
    width: `${60 / maxTypeDepth}%`,
    align: storedLang === 'ar' ? 'right' : 'left',
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const handleEditClick = () => {
    setIsEditing((prev) => {
      if (prev) {
        setEditingCategoryId(null);
      }
      return !prev;
    });
  };
  const TABLE_HEAD = [
    {
      id: 'code',
      label: t('tasks.account_number'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'name',
      label: t('tasks.account_name'),
      width: '75%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'debit',
      label: t('tasks.debit'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'credit',
      label: t('tasks.credit'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    ...(isEditing
      ? [
          {
            id: '',
            label: t('tasks.actions'),
            width: '8%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
  ];

  const router = useRouter();

  const [openAccounts, setOpenAccounts] = useState(false);

  const handleOpenAccounts = () => {
    setOpenAccounts(true);
  };
  const handleAccountsDialogClose = () => {
    setTimeout(() => {
      setOpenAccounts(false);
    }, 100);
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

  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    if (allCategories?.categories && allCategories?.categories.length) {
      setTableData(allCategories?.categories);
    } else {
      setTableData([]);
    }
  }, [allCategories?.categories]);

  console.log('Table data', tableData);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  console.log('this is the dataFiltered', dataFiltered);

  const canReset = !!filters.state.name;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const calculateTotals = (node) => {
    let debit = Number(node.totalDebit ?? node.openingDebit ?? 0);
    let credit = Number(node.totalCredit ?? node.openingCredit ?? 0);

    const children = node.children?.length
      ? node.children.map((child) => calculateTotals(child).node)
      : [];

    return {
      node: {
        ...node,
        children,
        totalDebit: debit,
        totalCredit: credit,
      },
      debit,
      credit,
    };
  };
  const dataWithTotals = useMemo(() => {
    return dataFiltered.map((item) => calculateTotals(item).node);
  }, [dataFiltered]);

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        const response = await deleteAccount(id);
        if (response.success) {
          await accountListMutate();
          await mutateChartHierarchy();
          toast.success('Account deleted successfully');
        } else {
          toast.error(response.error || 'Delete account failed');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred while deleting the account');
      }
    } else {
      console.log('No Id found');
    }
  };

  const handleFilterName = useCallback(
    (event) => {
      table.onResetPage();

      filters.setState({ name: event.target.value });
    },
    [filters, table.onResetPage]
  );

  const [selectedButton, setSelectedButton] = useState('accountList');
  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const grandTotals = useMemo(() => {
    let debit = 0;
    let credit = 0;

    const accumulate = (nodes) => {
      nodes.forEach((node) => {
        debit += Number(node.totalDebit || 0);
        credit += Number(node.totalCredit || 0);

        // if (node.children && node.children.length > 0) {
        //   accumulate(node.children);
        // }
      });
    };

    accumulate(dataWithTotals);

    return { debit, credit };
  }, [dataWithTotals]);
  const renderView = (
    <>
      {selectedButton === 'accountList' && (
        <>
          <Card sx={{ mt: 1 }}>
            <Stack spacing={1} sx={{ p: 1, pl: 0 }}>
              {' '}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
                sx={{ mx: 1 }}
              >
                {/* Search Field */}
                <TextField
                  value={filters.state.name}
                  onChange={handleFilterName}
                  placeholder={t('tasks.search')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 1,
                    minWidth: { xs: '100%', sm: 300, md: 400, xl: 600 },
                    '& .MuiInputBase-input': {
                      py: 1.2,
                    },
                  }}
                />

                {/* Buttons */}
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    variant="contained"
                    onClick={() => handleButtonClick('openingBalance')}
                  >
                    {t('tasks.add_opening_balance')}
                  </Button>

                  <Button
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    variant="contained"
                    onClick={() => setOpenAccounts(true)}
                  >
                    {t('tasks.new')}
                  </Button>
                  <Button
                    startIcon={<Iconify icon={isEditing ? 'mdi:cancel' : 'solar:pen-bold'} />}
                    variant="contained"
                    color={isEditing ? 'error' : 'inherit'}
                    onClick={handleEditClick}
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit'}
                  </Button>
                </Box>
              </Box>
              <AddChartAccount
                openDetails={openAccounts}
                onClick={handleOpenAccounts}
                onCloseDetails={handleAccountsDialogClose}
                anchor={storedLang === 'ar' ? 'left' : 'right'}
                mutate={accountListMutate}
              />
            </Stack>
            {canReset && (
              <AccountsFiltersResult
                filters={filters}
                totalResults={dataFiltered.length}
                onResetPage={table.onResetPage}
                sx={{ p: 2.5, pt: 0 }}
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
                />

                <Scrollbar>
                  <Table
                    size={table.dense ? 'small' : 'medium'}
                    sx={{
                      minWidth: 960,
                      tableLayout: 'fixed',
                      '& td, & th': {
                        padding: table.dense ? '6px' : '12px',
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
                      <TableRow
                        sx={{
                          backgroundColor: '#F5F5F5',
                          fontWeight: 'bold',
                        }}
                      >
                        <TableCell />
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">
                          Total
                        </TableCell>

                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(grandTotals.debit)}
                        </TableCell>

                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(grandTotals.credit)}
                        </TableCell>

                        <TableCell />
                      </TableRow>
                      {dataWithTotals.map((row, index) => (
                        <TreeRow
                          key={row.id}
                          row={row}
                          level={0}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={handleDeleteRow}
                          index={index + table.page * table.rowsPerPage}
                          mutate={accountListMutate}
                          mutateChartHierarchy={mutateChartHierarchy}
                          accountList={accountList.accounts}
                          isEditing={isEditing}
                          onEditClick={handleEditClick}
                          editingCategoryId={editingCategoryId}
                          setEditingCategoryId={setEditingCategoryId}
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
                rowsPerPageOptions={[250, 300, 500]}
                dense={table.dense}
                count={canReset ? dataFiltered.length : allCategories.categories.length}
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
      {selectedButton === 'openingBalance' && (
        <>
          <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
            <Button
              onClick={() => {
                handleButtonClick('accountList');
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
              {t('tasks.back')}
            </Button>
          </Stack>

          <AddOpeningBalance
            rows={allCategories?.categories || []}
            accountListMutate={accountListMutate}
            setSelectedButton={setSelectedButton}
            mutateChartHierarchy={mutateChartHierarchy}
          />
        </>
      )}
    </>
  );

  if (accountListLoading)
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
  return <>{renderView}</>;
}

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  let filteredData = [...inputData];

  if (!name?.trim()) {
    return filteredData;
  }

  const searchValue = name.trim().toLowerCase();

  const filterTree = (accounts) => {
    return accounts.reduce((acc, account) => {
      const codeMatch = account.code?.toLowerCase().includes(searchValue);
      const nameMatch = account.name?.toLowerCase().includes(searchValue);

      const filteredChildren = account.children?.length ? filterTree(account.children) : [];

      if (codeMatch || nameMatch || filteredChildren.length > 0) {
        acc.push({
          ...account,
          children: filteredChildren,
        });
      }

      return acc;
    }, []);
  };

  return filterTree(filteredData);
}
