import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Switch from '@mui/material/Switch';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  Box,
  Table,
  Stack,
  Paper,
  Select,
  Button,
  TableRow,
  MenuItem,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  FormControl,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable, TableHeadCustom } from 'src/components/table';
import { MultiFilePreview } from 'src/components/upload/components/preview-multi-file';

import { AddUserFiles } from 'src/sections/user/add-user-files';

import { mock_accounts } from './account-mock-data';
import { addTransaction, updateTransaction } from 'src/actions/transactions/transactionActions';
import { getAccounts } from 'src/actions/accounts/accountActions';
import { toast } from 'src/components/snackbar';
import dayjs from 'dayjs';
import FileDetailsDrawer from 'src/sections/file-manager/file-manager-file-details';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import { AccountTreeSelector } from './account-tree-option';

export function AddJournalVoucher({
  transactionListMutate,
  setSelectedButton,
  editData,
  currency,
}) {
  const { t } = useTranslation('dashboard/accounts');

  // Sample accounts for dropdown
  const accounts = [
    { label: t('accounts.cash'), value: 'cash' },
    { label: t('accounts.bank'), value: 'bank' },
    { label: t('accounts.office_supplies_expense'), value: 'office_supplies' },
    { label: t('accounts.accounts_payable'), value: 'accounts_payable' },
  ];
  const [rows, setRows] = useState([{ account: '', debit: '', credit: '' }]);
  const storedLang = localStorage.getItem('selectedLang');
  const [transactionId, setTransactionId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const getAccountsParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
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

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });
  const filePreview = useBoolean();

  const [openFiles, setOpenFiles] = useState(false);
  const handleOpenFile = () => {
    setOpenFiles(true);
  };
  const handleFileDialogClose = () => {
    setTimeout(() => {
      setOpenFiles(false);
    }, 100);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] = useState([]);
  console.log('this is the files', files);
  const handleRemoveFile = (inputFile) => {
    if (inputFile.isExisting) {
      setDeletedFileIds((prev) => [...prev, inputFile.id]);
    }

    const updated = files.filter((f) => f !== inputFile);
    setFiles(updated);
  };

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('accounts.serial_no'), width: '4%', align: 'center' },

    {
      id: 'account',
      label: t('accounts.accountdetails'),
      width: '25%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'debit',
      label: `${t('accounts.Debit')} (${currency || 'AED'})`,
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'credit',
      label: `${t('accounts.credit')} (${currency || 'AED'})`,
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'action',
      label: t('accounts.actions'),
      width: '5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
  ];

  const handleAddRow = () => {
    setRows([...rows, { account: '', debit: '', credit: '' }]);
  };

  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };
  const totalDebit = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rows.reduce((acc, row) => acc + Number(row.debit || 0), 0));

  const totalCredit = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rows.reduce((acc, row) => acc + Number(row.credit || 0), 0));
  useEffect(() => {
    if (!editData) return;

    setTransactionId(editData.id);
    setSelectedDate(dayjs(editData.date));
    setDescription(editData.description || '');
    setReferenceNo(editData.referenceNo || '');

    const mappedRows = editData.lines.map((line) => ({
      account: line.accountId,
      debit: line.debit,
      credit: line.credit,
      debitDisplay: line.debit
        ? new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(line.debit)
        : '',
      creditDisplay: line.credit
        ? new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(line.credit)
        : '',
      narration: line.description || '',
    }));

    setRows(mappedRows);

    if (editData.attachments?.length > 0) {
      const mappedFiles = editData.attachments.map((file) => ({
        id: file.id,
        name: file.fileName,
        preview: file.fileUrl.startsWith('http') ? file.fileUrl : `${file.fileUrl}`,
        size: file.fileSize,
        type: file.mimeType,
        isExisting: true,
      }));

      setFiles(mappedFiles);
    } else {
      setFiles([]);
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const totalDebit = rows.reduce((acc, row) => acc + Number(row.debit || 0), 0);
    const totalCredit = rows.reduce((acc, row) => acc + Number(row.credit || 0), 0);
    const existingFiles = files.filter((f) => f.isExisting);
    const newFiles = files.filter((f) => !f.isExisting);
    if (totalDebit !== totalCredit) {
      toast.warning(t('accounts.debitandcredit'));
      return;
    }

    if (rows.length < 2) {
      toast.warning('Minimum 2 lines required');
      return;
    }

    const payload = {
      date: selectedDate
        ? selectedDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description,
      lines: rows.map((row) => ({
        accountId: row.account,
        debit: Number(row.debit || 0),
        credit: Number(row.credit || 0),
        description: row.narration || '',
      })),
    };

    console.log('this is the transaction payload', payload, files);
    try {
      let response;

      if (transactionId) {
        response = await updateTransaction(payload, transactionId, newFiles, deletedFileIds);
      } else {
        response = await addTransaction(payload, newFiles);
      }

      if (response.success) {
        toast.success(transactionId ? 'Transaction updated' : 'Transaction created');
        setTransactionId(null);
        setRows([{ account: '', debit: '', credit: '' }]);
        setSelectedDate(null);
        setReferenceNo('');
        setDescription('');
        setFiles([]);
        await transactionListMutate();
        setSelectedButton('journal');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Transaction action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  const hasEntry = rows.some((row) => Number(row.debit || 0) > 0 || Number(row.credit || 0) > 0);
  const isBalanced =
    rows.reduce((acc, row) => acc + Number(row.debit || 0), 0) ===
    rows.reduce((acc, row) => acc + Number(row.credit || 0), 0);
  return (
    <Paper>
      <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
        <DatePicker
          label={t('accounts.date')}
          value={selectedDate}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
      </Stack>
      <Card sx={{ mt: 1, borderRadius: 1 }}>
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
              numSelected={table.selected.length}
              onSort={table.onSort}
            />
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell
                    align="center"
                    sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
                  >
                    {index + 1}
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <AccountTreeSelector
                        value={row.account}
                        onChange={(selectedId) => handleChange(index, 'account', selectedId)}
                        placeholder="Select account"
                      />
                    </FormControl>

                    {row.account && (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t('accounts.enter_narration')}
                        value={row.narration || ''}
                        onChange={(e) => handleChange(index, 'narration', e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <TextField
                      size="small"
                      value={row.debitDisplay || ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        handleChange(index, 'debit', raw);
                        handleChange(index, 'debitDisplay', raw);
                      }}
                      onBlur={() => {
                        const raw = Number(row.debit || 0);
                        handleChange(
                          index,
                          'debitDisplay',
                          new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(raw)
                        );
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <TextField
                      size="small"
                      value={row.creditDisplay || ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        handleChange(index, 'credit', raw);
                        handleChange(index, 'creditDisplay', raw);
                      }}
                      onBlur={() => {
                        const raw = Number(row.credit || 0);
                        handleChange(
                          index,
                          'creditDisplay',
                          new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(raw)
                        );
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <IconButton onClick={() => handleDeleteRow(index)} sx={{ color: 'error.main' }}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={13} height={13} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {/* Add Row Button */}
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="left"
                  onClick={handleAddRow}
                  sx={{ cursor: 'pointer' }}
                >
                  <Iconify
                    icon="mingcute:add-line"
                    width={13}
                    height={13}
                    sx={{ mr: 1 }}
                    color="#006A67"
                  />
                  {t('accounts.add_row')}
                </TableCell>
              </TableRow>

              {/* Totals */}
              <TableRow>
                <TableCell />
                <TableCell align="right">{t('accounts.total')}</TableCell>
                <TableCell>{totalDebit}</TableCell>
                <TableCell>{totalCredit}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
          <Box sx={{ m: 2 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={() => {
                setOpenFiles(true);
              }}
            >
              {t('accounts.upload_files')}
            </LoadingButton>

            {files.length > 0 && (
              <>
                <FormControlLabel
                  control={<Switch checked={filePreview.value} onClick={filePreview.onToggle} />}
                  label={t('accounts.show_thumbnail')}
                  sx={{ mb: 1, width: 1, justifyContent: 'flex-end' }}
                />
                <MultiFilePreview
                  files={files}
                  thumbnail={filePreview.value}
                  onRemove={handleRemoveFile}
                  sx={{ my: 3 }}
                />
              </>
            )}
          </Box>
        </Scrollbar>
      </Card>
      <AddUserFiles
        open={openFiles}
        onClick={handleOpenFile}
        handleClose={handleFileDialogClose}
        files={files}
        setFiles={setFiles}
        onRemove={handleRemoveFile}
        filePreview={filePreview}
      />
      <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: isSubmitting ? 'grey.500' : '#006A67',
            '&:hover': {
              bgcolor: isSubmitting ? 'grey.500' : '#005a57',
            },
          }}
          disabled={!hasEntry || !isBalanced || isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
          ) : editData?.id ? (
            t('accounts.save')
          ) : (
            'Add'
          )}
        </Button>
      </Stack>
    </Paper>
  );
}
