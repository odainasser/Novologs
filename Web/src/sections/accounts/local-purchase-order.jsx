'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { _userList } from 'src/_mock';
import { fIsAfter } from 'src/utils/format-time';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
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
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

import { LocalPurchaseOrderTableRow } from './local-purchase-order-table-row';

import Stack from '@mui/material/Stack';

import { Form } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';

import { useAuthContext } from 'src/auth/hooks';

import { AddLocalPurchaseOrder } from './add-local-purchase-order';

import {
  getPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseInvoice,
  deletePurchaseInvoice,
  getSalesInvoice,
  deleteSalesInvoice,
  postPurchaseInvoice,
  postSalesInvoice,
  getDebitNote,
  deleteDebitNote,
  postDebitNote,
} from 'src/actions/purchase/purchaseActions';
import { getVendors } from 'src/actions/vendor/vendorActions';
import { getClients } from 'src/actions/client/clientActions';

import { varAlpha } from 'src/theme/styles';
import { LocalPurchaseOrderToolbar } from './local-purchase-order-table-toolbar';
import { LocalPurchaseOrderTableFiltersResult } from './local-purchase-order-table-filter-result';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function LocalPurchaseOrder({
  isClient,
  isUser,

  isSubTask,

  isClientView,
  userId,
  isLocalPurchaseOrder,
  isInvoice,
  isPosted,
  isNote,
}) {
  const { zetaUser } = useAuthContext();
  const storedLang = localStorage.getItem('selectedLang');
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });

  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const showPostedTabs = (isInvoice || isNote) && !isLocalPurchaseOrder;

  const TABS = [
    {
      value: 'journal',
      label: isNote
        ? isClientView
          ? 'Credit Notes'
          : 'Debit Notes'
        : isClientView
          ? 'Sales Invoices'
          : 'Purchase Invoices',
    },
    {
      value: 'posted',
      label: isNote
        ? isClientView
          ? 'Posted Credit Notes'
          : 'Posted Debit Notes'
        : isClientView
          ? 'Posted Sales Invoices'
          : 'Posted Purchase Invoices',
    },
  ];
  function useClientOrVendor(isClientView) {
    const payload = {
      pagination: {
        pageNumber: 1,
        pageSize: 200,
      },
    };
    payload.search = {
      fieldName: 'CreatorId',
      fieldValue: zetaUser?.id,
      operator: 0,
      logicOperator: 0,
    };
    payload.isAccount = true;

    const result = isClientView ? getClients(payload) : getVendors(payload);

    return {
      list: isClientView ? result.clientList.clients : result.vendorList.vendors,
      listLoading: isClientView ? result.clientListLoading : result.vendorListLoading,
      listError: isClientView ? result.clientListError : result.vendorListError,
      listValidating: isClientView ? result.clientListValidating : result.vendorListValidating,
      listEmpty: isClientView ? result.clientListEmpty : result.vendorListEmpty,
      mutate: result.mutate,
    };
  }

  const { list, listLoading, listError, listValidating, listEmpty, mutate } =
    useClientOrVendor(isClientView);

  console.log('this is the vendor list', list);

  const { t, i18n } = useTranslation('dashboard/tasks');

  const filters = useSetState({
    name: '',
    vendor: null,
    startDate: null,
    endDate: null,
  });
  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const [searchText, setSearchText] = useState(filters.state.name || '');
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      table.onResetPage();
      filters.setState({ name: searchText });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);
  const canReset =
    !!filters.state.name ||
    !!filters.state.vendor ||
    (!!filters.state.startDate && !!filters.state.endDate);
  const vendorId = filters.state.vendor?.id || '';
  const shouldLoadPurchaseOrder = !isInvoice && !isClientView && !isNote;
  const shouldLoadPurchaseInvoice = isInvoice && !isClientView && !isNote;
  const shouldLoadSalesInvoice = isInvoice && isClientView && !isNote;
  const shouldLoadDebitNote = isInvoice && !isClientView && isNote;

  const shouldLoadNotePurchaseInvoice = isNote && !isClientView;
  const shouldLoadNoteSalesInvoice = isNote && isClientView;
  const getPurchaseOrderParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },

    ...(vendorId && {
      vendorId: vendorId,
    }),
  };

  const {
    purchaseOrderList,
    purchaseOrderListLoading,
    purchaseOrderListError,
    purchaseOrderListEmpty,
    mutate: purchaseOrderListMutate,
  } = getPurchaseOrder(getPurchaseOrderParams, filters.state.name, shouldLoadPurchaseOrder);

  const getPurchaseInvoiceParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },

    ...(vendorId && {
      vendorId: vendorId,
    }),
  };

  const {
    purchaseInvoiceList,
    purchaseInvoiceListLoading,
    purchaseInvoiceListError,
    purchaseInvoiceListEmpty,
    mutate: purchaseInvoiceListMutate,
  } = getPurchaseInvoice(
    getPurchaseInvoiceParams,
    filters.state.name,
    shouldLoadPurchaseInvoice || shouldLoadNotePurchaseInvoice
  );

  const getDebitNoteParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },

    ...(vendorId && {
      vendorId: vendorId,
    }),
  };

  const {
    debitNoteList,
    debitNoteListLoading,
    debitNoteListError,
    debitNoteListEmpty,
    mutate: debitNoteListMutate,
  } = getDebitNote(getDebitNoteParams, filters.state.name, shouldLoadDebitNote);

  const getSalesInvoiceParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },

    ...(vendorId && {
      clientId: vendorId,
    }),
  };

  const {
    salesInvoiceList,
    salesInvoiceListLoading,
    salesInvoiceListError,
    salesInvoiceListEmpty,
    mutate: salesInvoiceListMutate,
  } = getSalesInvoice(
    getSalesInvoiceParams,
    filters.state.name,
    shouldLoadSalesInvoice || shouldLoadNoteSalesInvoice
  );

  const openDateRange = useBoolean();

  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditRow = (row) => {
    setSelectedRow(row);
    setSelectedButton('newJournal');
    setMode('invoice');
  };

  const [view, setView] = useState('list');

  const [selectedButton, setSelectedButton] = useState('journal');

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('tasks.serial_no'), width: '6%', align: 'center' },

    {
      id: 'voucher',
      label: isNote
        ? 'Note Number'
        : isInvoice
          ? t('tasks.invoice_number')
          : t('tasks.order_number'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'creator',
      label: 'Creator',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'orderType',
      label: isInvoice ? 'Invoice Type' : 'Order Type',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'vendor',
      label: isClientView ? t('tasks.client') : t('tasks.vendor'),
      width: '22%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'location',
      label: t('tasks.location'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'terms',
      label: t('tasks.terms'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'project', label: t('tasks.details'), width: '5%' },
    {
      id: 'account',
      label: isNote ? 'Note Date' : isInvoice ? t('tasks.invoice_date') : t('tasks.purchase_date'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'name',
      label: t('tasks.duedate'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'credit',
      label: t('tasks.totalamount'),
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
  console.log('this i the invoice list', purchaseInvoiceList?.purchaseInvoice);
  useEffect(() => {
    let data = [];

    if (shouldLoadPurchaseOrder) {
      data = purchaseOrderList?.purchaseOrder ?? [];
    } else if (shouldLoadPurchaseInvoice) {
      data = purchaseInvoiceList?.purchaseInvoice ?? [];
    } else if (shouldLoadSalesInvoice) {
      data = salesInvoiceList?.salesInvoice ?? [];
    } else if (shouldLoadDebitNote) {
      data = debitNoteList?.debitNote ?? [];
    }

    if (showPostedTabs) {
      if (selectedButton === 'posted') {
        data = data.filter((item) => item?.status === 'Posted');
      } else if (selectedButton === 'journal') {
        data = data.filter((item) => item?.status === 'Draft');
      }
    }

    setTableData(data);
  }, [
    shouldLoadPurchaseOrder,
    shouldLoadPurchaseInvoice,
    shouldLoadSalesInvoice,
    shouldLoadDebitNote,
    purchaseOrderList,
    purchaseInvoiceList,
    salesInvoiceList,
    debitNoteList,
    selectedButton,
    showPostedTabs,
  ]);
  const currentListLoading = shouldLoadPurchaseOrder
    ? purchaseOrderListLoading
    : shouldLoadPurchaseInvoice
      ? purchaseInvoiceListLoading
      : shouldLoadSalesInvoice
        ? salesInvoiceListLoading
        : shouldLoadDebitNote
          ? debitNoteListLoading
          : false;

  const currentListEmpty = shouldLoadPurchaseOrder
    ? purchaseOrderListEmpty
    : shouldLoadPurchaseInvoice
      ? purchaseInvoiceListEmpty
      : shouldLoadSalesInvoice
        ? salesInvoiceListEmpty
        : shouldLoadDebitNote
          ? debitNoteListEmpty
          : false;

  const currentTotalResults = shouldLoadPurchaseOrder
    ? purchaseOrderList?.total || purchaseOrderList?.purchaseOrder?.length || 0
    : shouldLoadPurchaseInvoice
      ? purchaseInvoiceList?.total || purchaseInvoiceList?.purchaseInvoice?.length || 0
      : shouldLoadSalesInvoice
        ? salesInvoiceList?.total || salesInvoiceList?.salesInvoice?.length || 0
        : shouldLoadDebitNote
          ? debitNoteList?.total || debitNoteList?.debitNote?.length || 0
          : 0;

  const currentMutate = shouldLoadPurchaseOrder
    ? purchaseOrderListMutate
    : shouldLoadPurchaseInvoice
      ? purchaseInvoiceListMutate
      : shouldLoadSalesInvoice
        ? salesInvoiceListMutate
        : shouldLoadDebitNote
          ? debitNoteListMutate
          : undefined;
  const currentDeleteFn = shouldLoadPurchaseOrder
    ? deletePurchaseOrder
    : shouldLoadPurchaseInvoice
      ? deletePurchaseInvoice
      : shouldLoadSalesInvoice
        ? deleteSalesInvoice
        : shouldLoadDebitNote
          ? deleteDebitNote
          : null;

  const currentDeleteLabel = shouldLoadPurchaseOrder
    ? 'Purchase Order'
    : shouldLoadPurchaseInvoice
      ? 'Purchase Invoice'
      : shouldLoadSalesInvoice
        ? 'Sales Invoice'
        : shouldLoadDebitNote
          ? 'Debit Note'
          : 'Record';
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = async (id) => {
    if (!id) {
      toast.error('Invalid ID');
      return;
    }

    if (!currentDeleteFn) {
      toast.error('No valid tab selected');
      return;
    }

    try {
      const response = await currentDeleteFn(id);

      if (response?.success) {
        if (currentMutate) {
          await currentMutate();
        }
        toast.success(`${currentDeleteLabel} deleted successfully`);
      } else {
        toast.error(response?.error || `Delete ${currentDeleteLabel.toLowerCase()} failed`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(
        `An unexpected error occurred while deleting the ${currentDeleteLabel.toLowerCase()}`
      );
    }
  };
  const handlePostRow = async (id) => {
    if (!id) {
      toast.error('Invalid ID');
      return;
    }

    if (!isInvoice && !isNote) {
      toast.error('Only invoices or notes can be posted');
      return;
    }

    try {
      const response = shouldLoadDebitNote
        ? await postDebitNote(id)
        : isClientView
          ? await postSalesInvoice(id)
          : await postPurchaseInvoice(id);

      if (response?.success) {
        if (currentMutate) {
          await currentMutate();
        }

        setSelectedButton('posted');

        toast.success(
          shouldLoadDebitNote
            ? 'Debit note posted successfully'
            : isClientView
              ? 'Sales invoice posted successfully'
              : 'Purchase invoice posted successfully'
        );
      } else {
        toast.error(
          response?.error ||
            (shouldLoadDebitNote
              ? 'Failed to post debit note'
              : isClientView
                ? 'Failed to post sales invoice'
                : 'Failed to post purchase invoice')
        );
      }
    } catch (error) {
      console.error('Unexpected error while posting:', error);

      toast.error(
        shouldLoadDebitNote
          ? 'An unexpected error occurred while posting the debit note'
          : isClientView
            ? 'An unexpected error occurred while posting the sales invoice'
            : 'An unexpected error occurred while posting the purchase invoice'
      );
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
              <Box
                sx={{
                  pl: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 1,
                  flexWrap: 'wrap',
                  boxShadow: (theme) =>
                    `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                }}
              >
                <LocalPurchaseOrderToolbar
                  filters={filters}
                  onResetPage={table.onResetPage}
                  sharedUsers={list}
                  openDateRange={openDateRange.value}
                  onOpenDateRange={openDateRange.onTrue}
                  onCloseDateRange={openDateRange.onFalse}
                  isClientView={isClientView}
                  searchText={searchText}
                  setSearchText={setSearchText}
                />

                {selectedButton === 'posted' && (
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
                )}

                {selectedButton !== 'posted' && (
                  <>
                    {/* {!isClientView && !isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Purchase Invoice
                      </Button>
                    )} */}

                    {/* {!isClientView && isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Debit Note
                      </Button>
                    )} */}

                    {/* {isClientView && !isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Sales Invoices
                      </Button>
                    )} */}

                    {/* {isClientView && isNote && !isLocalPurchaseOrder && (
                      <Button
                        startIcon={<Iconify icon="mdi:send" />}
                        variant="contained"
                        onClick={() => handleButtonClick('posted')}
                      >
                        Posted Credit Note
                      </Button>
                    )} */}

                    <Button
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      variant="contained"
                      onClick={() => {
                        setSelectedRow(null);
                        handleButtonClick('newJournal');
                      }}
                    >
                      {t('tasks.new')}
                    </Button>
                  </>
                )}
              </Box>

              {canReset && (
                <LocalPurchaseOrderTableFiltersResult
                  filters={filters}
                  totalResults={currentTotalResults}
                  onResetPage={table.onResetPage}
                  sx={{ px: 1, pt: 0 }}
                  searchText={searchText}
                  setSearchText={setSearchText}
                />
              )}
            </Stack>

            {view === 'list' && (
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
                      <Tooltip title={t('tasks.delete')}>
                        <IconButton color="primary" onClick={confirm.onTrue}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    }
                  />

                  <Scrollbar>
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
                            <LocalPurchaseOrderTableRow
                              key={row.id}
                              row={row}
                              selected={table.selected.includes(row.id)}
                              onSelectRow={() => table.onSelectRow(row.id)}
                              onDeleteRow={() => handleDeleteRow(row.id)}
                              onPostRow={() => handlePostRow(row.id)}
                              onEditRow={(data) => {
                                setSelectedRow(data);
                                setSelectedButton('newJournal');
                                // setMode('order');
                              }}
                              index={index + table.page * table.rowsPerPage}
                              setTableData={setTableData}
                              isUser={isUser}
                              tableData={tableData}
                              isSubTask={isSubTask}
                              selectedCategory={filters.state.status}
                              isClient={isClient}
                              userId={userId}
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
                    </TableContainer>
                  </Scrollbar>
                </Form>
              </Box>
            )}

            {view === 'list' && (
              <TablePaginationCustom
                page={table.page}
                rowsPerPageOptions={[50, 100, 150]}
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
      )}
      {selectedButton === 'newJournal' && (
        <>
          <Stack direction="row" alignItems="center" sx={{ mt: 1 }} gap={1}>
            <Button
              onClick={() => {
                setSelectedButton('journal');
                setSelectedRow(null);
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
          </Stack>

          <AddLocalPurchaseOrder
            open={selectedButton === 'newJournal'}
            row={selectedRow}
            mode={mode}
            isInvoice={isInvoice}
            isClientView={isClientView}
            isNote={isNote}
            listMutate={currentMutate}
            setSelectedButton={setSelectedButton}
            clientVendorList={list}
            clientVendorListEmpty={listEmpty}
            invoiceList={
              isClientView ? salesInvoiceList?.salesInvoice : purchaseInvoiceList?.purchaseInvoice
            }
          />
        </>
      )}
    </>
  );

  return (
    <>
      {showPostedTabs && selectedButton !== 'newJournal' && (
        <Tabs
          value={selectedButton}
          onChange={(event, newValue) => {
            setSelectedButton(newValue);
            setMode('');
            setSelectedRow(null);
          }}
          sx={{ mb: 1 }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      )}

      {renderView}
    </>
  );
}

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, role, member, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);
  if (!dateError) {
    if (startDate && endDate) {
      const startOfDay = dayjs(startDate).startOf('day');
      const endOfDay = dayjs(endDate).endOf('day');

      inputData = inputData.filter((file) => {
        const fileDate = dayjs(file.created);
        return fileDate.isBetween(startOfDay, endOfDay, null, '[]');
      });
    }
  }
  return inputData;
}
