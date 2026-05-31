'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import { useTabs } from 'src/hooks/use-tabs';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import { useTranslation } from 'react-i18next';

import { useSetState } from 'src/hooks/use-set-state';

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

import { JournalVoucherTableRow } from './journal-voucher-table-row';

import Stack from '@mui/material/Stack';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Form } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';

import LinearProgress from '@mui/material/LinearProgress';

import { AddJournalVoucher } from './add-journal-voucher.jsx';
import { AccountsFiltersResult } from './accounts-filters-result';

import {
  getTransactions,
  deleteTransaction,
  postTransaction,
} from 'src/actions/transactions/transactionActions';
import { getSettings } from 'src/actions/settings/settingActions';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function JournalVoucher({ isPosted }) {
  const storedLang = localStorage.getItem('selectedLang');

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { t, i18n } = useTranslation('dashboard/tasks');

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });

  const filters = useSetState({
    name: '',
  });

  const handleFilterName = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  const [view, setView] = useState('list');

  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;

  const getTransactionParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },
  };

  const {
    transactionList,
    transactionListLoading,
    transactionListError,
    transactionListValidating,
    transactionListEmpty,
    mutate: transactionListMutate,
  } = getTransactions(getTransactionParams);
  const {
    settingsList,

    mutate,
  } = getSettings();
  const tabs = useTabs(isPosted ? 'postedJournalAccount' : 'journalAccount');
  const [selectedButton, setSelectedButton] = useState(isPosted ? 'posted' : 'journal');
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    if (tabs.value === 'journalAccount') {
      setSelectedButton('journal');
    } else if (tabs.value === 'postedJournalAccount') {
      setSelectedButton('posted');
    }
  }, [tabs.value]);
  useEffect(() => {
    if (settingsList?.settings) {
      const currencySetting = settingsList.settings.find(
        (setting) => setting.key === 'defaultCurrency'
      );
      if (currencySetting) {
        setCurrency(currencySetting.value);
      }
    }
  }, [settingsList]);
  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.serial_no'), width: '6%', align: 'center' },
    // {
    //   id: 'date',
    //   label: 'Created Date',
    //   width: '12%',
    //   align: storedLang === 'ar' ? 'right' : 'left',
    // },
    {
      id: 'transactionDate',
      label: 'Date',
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'voucher',
      label: t('tasks.voucher_number'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'account',
      label: t('tasks.accountdetails'),
      width: '30%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'name',
      label: t('tasks.narration'),
      width: '30%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'debit',
      label: `${t('tasks.debit-a')} (${currency || 'AED'})`,
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'credit',
      label: `${t('tasks.credit-a')} (${currency || 'AED'})`,
      width: '20%',
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
    const items = transactionList?.transactions || [];
    if (selectedButton === 'journal') {
      setTableData(items.filter((item) => item.isPosted === false));
    } else if (selectedButton === 'posted') {
      setTableData(items.filter((item) => item.isPosted === true));
    } else {
      setTableData([]);
    }
  }, [selectedButton, transactionList]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const canReset = !!filters.state.name;
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handlePostRow = async (id) => {
    if (id) {
      try {
        const response = await postTransaction(id);
        if (response.success) {
          await transactionListMutate();
          tabs.onChange(null, 'postedJournalAccount');
          setSelectedButton('posted');
          toast.success('Transaction posted successfully');
        } else {
          toast.error(response.error || 'Posting transaction failed');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred while posting the transaction');
      }
    }
  };

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        const response = await deleteTransaction(id);
        if (response.success) {
          await transactionListMutate();
          toast.success('Transaction deleted successfully');
        } else {
          toast.error(response.error || 'Delete transaction failed');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred while deleting the transaction');
      }
    }
  };

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const TABS = [
    {
      value: 'journalAccount',
      label: 'Journal Voucher',
    },
    {
      value: 'postedJournalAccount',
      label: 'Posted Journal Voucher',
    },
  ];

  const renderView = (
    <>
      {(selectedButton === 'journal' || selectedButton === 'posted') && (
        <Card sx={{ mt: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column' },
              justifyContent: 'space-between',
              p: 0.5,
              pt: 0,
            }}
          ></Box>

          <Stack
            spacing={1}
            sx={{
              p: 1,
              pl: 0,
            }}
          >
            <Box>
              {selectedButton === 'posted' && (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                    sx={{ mx: 1 }}
                  >
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
                  </Box>
                </>
              )}

              {selectedButton !== 'posted' && (
                <Stack spacing={1} sx={{ pl: 0 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={2}
                    sx={{ mx: 1 }}
                  >
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

                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        sx={{ ml: 1 }}
                        variant="contained"
                        onClick={() => {
                          setSelectedTransaction(null);
                          handleButtonClick('newJournal');
                        }}
                      >
                        {t('tasks.new')}
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
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
                      <JournalVoucherTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onPostRow={() => handlePostRow(row.id)}
                        onEditRow={(data) => {
                          setSelectedTransaction(data);
                          setSelectedButton('newJournal');
                        }}
                        index={index + table.page * table.rowsPerPage}
                        isPosted={selectedButton === 'posted'}
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
              count={
                transactionList?.transactions
                  ? canReset
                    ? dataFiltered.length
                    : transactionList.transactions.filter((item) =>
                        selectedButton === 'posted'
                          ? item.isPosted === true
                          : item.isPosted === false
                      ).length
                  : 0
              }
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

      {selectedButton === 'newJournal' && (
        <>
          <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
            <Button
              onClick={() => {
                if (tabs.value === 'postedJournalAccount') {
                  setSelectedButton('posted');
                } else {
                  setSelectedButton('journal');
                }
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

          <AddJournalVoucher
            transactionListMutate={transactionListMutate}
            setSelectedButton={setSelectedButton}
            editData={selectedTransaction}
            currency={currency}
          />
        </>
      )}
    </>
  );

  if (transactionListLoading) {
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
  }

  return (
    <>
      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: 1 }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>
      {renderView}
    </>
  );
}

function applyFilter({ inputData, comparator, filters, zetaUser }) {
  const { name } = filters;

  let filteredData = [...inputData];

  if (name) {
    const lowerCaseName = name.toLowerCase();
    filteredData = filteredData.filter((transaction) => {
      const referenceMatch = transaction.referenceNo?.toLowerCase().includes(lowerCaseName);
      return referenceMatch;
    });
  }

  filteredData.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return filteredData;
}
