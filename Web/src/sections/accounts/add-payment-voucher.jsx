import React, { useState } from 'react';
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
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Button,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import Card from '@mui/material/Card';
import {
  payment_method,
  quantity_measurements,
  locations,
  lpo_terms,
  mock_vendors,
  currencies,
  order_type,
  invoice_type,
  mock_accounts,
  payment_receivers,
  mock_employees,
} from './account-mock-data';
import { Field } from 'src/components/hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { AddUserFiles } from 'src/sections/user/add-user-files';
import LoadingButton from '@mui/lab/LoadingButton';
import { MultiFilePreview } from 'src/components/upload/components/preview-multi-file';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useBoolean } from 'src/hooks/use-boolean';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';

export function AddPaymentVoucher({ row = null, mode, isInvoice, isClientView, isReceipt }) {
  const { t } = useTranslation('dashboard/accounts');
   // Sample accounts for dropdown
const accounts = [
  { label: t('accounts.cash'), value: t('accounts.cash') },
  { label: t('accounts.bank'), value: t('accounts.bank') },
  { label: t('accounts.office_supplies_expense'), value: t('accounts.office_supplies_expense') },
  { label: t('accounts.accounts_payable'), value: t('accounts.accounts_payable') },
];

  console.log('this is the row', row);
 

  const [rows, setRows] = useState([{ account: '', debit: '', credit: '' }]);
  const [selectedCurrency, setSelectedCurrency] = useState('AED');
  const [selectedInvoice, setSelectedInvoice] = useState('Tax Cash Invoice');
  const [selectedReceiver, setSelectedReceiver] = useState('Clients');

  const [selectedUnit, setSelectedUnit] = useState('');

  const storedLang = localStorage.getItem('selectedLang');

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

  const [files, setFiles] = useState([]);
  console.log('this is the files', files);
  const handleRemoveFile = (inputFile) => {
    const filesFiltered = files.filter((fileFiltered) => fileFiltered !== inputFile);
    setFiles(filesFiltered);
  };

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('accounts.serial_no'), width: '4%', align: 'center' },

    {
      id: 'account',
      label: t('accounts.payment_method'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'debit',
      label: t('accounts.reference_number'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'credit',
      label: t('accounts.description'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'amount',
      label: t('accounts.amount'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'action',
      label: t('accounts.action'),
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
    if (field === 'measurement') {
      console.log(`Row ${index} selected measurement:`, value);
      setSelectedUnit(value);
    }
  };
  const totalDebit = rows.reduce((acc, row) => acc + Number(row.quantity || 0), 0);

  const totalCredit = rows.reduce(
    (acc, row) => acc + Number(row.quantity || 0) * Number(row.rate || 0),
    0
  ); // keep number

  const discount = totalCredit * 0.1; // 10%
  const tax = totalCredit * 0.12; // 12%
  const grandTotal = totalCredit - discount + tax;

  const handleSubmitData = () => {
    const totalDebit = rows.reduce((acc, row) => acc + Number(row.quantity || 0), 0);
    const totalCredit = rows.reduce((acc, row) => acc + Number(row.amount || 0), 0);

    console.log('Journal Voucher Data:', rows);
  };

  const handleInvoiceDateChange = (newDate) => {
    console.log('this is the new date', newDate);
  };
  const handleDueDateChange = (newDate) => {
    console.log('this is the new date', newDate);
  };
  const hasEntry = rows.some((row) => Number(row.quantity || 0) > 0);
  const isBalanced =
    rows.reduce((acc, row) => acc + Number(row.debit || 0), 0) ===
    rows.reduce((acc, row) => acc + Number(row.credit || 0), 0);
  return (
    <Paper>
      <Typography variant="h4" sx={{ my: 1 }}>
        {isReceipt ? t('accounts.receipt_voucher') : t('accounts.payment_voucher')}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={2}>
          <TextField
            disabled
            fullWidth
            size="small"
            sx={{
              p: 1,
              bgcolor: 'background.neutral',
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
            value="V-003"
          />
        </Grid>
        {!isReceipt && (
          <>
            <Grid item xs={12} md={2}>
              {' '}
              <TextField
                select
                fullWidth
                label={t('accounts.payment_to')}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px',
                    fontSize: '10px',
                  },
                  mt: 1,
                }}
                value={selectedReceiver}
                onChange={(e) => setSelectedReceiver(e.target.value)}
              >
                {payment_receivers?.map((acc) => (
                  <MenuItem key={acc.name} value={acc.name}>
                    {acc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              {selectedReceiver === t('accounts.clients') && (
                <TextField
                  select
                  fullWidth
                  label={t('accounts.clients')}
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '9px 14px',
                    },
                    '& .MuiInputLabel-root': {
                      top: '-5px',
                      fontSize: '10px',
                    },
                    mt: 1,
                  }}
                >
                  {mock_vendors?.map((acc) => (
                    <MenuItem key={acc.name} value={acc.name}>
                      {acc.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {selectedReceiver === t('accounts.employees') && (
                <TextField
                  select
                  fullWidth
                  label={t('accounts.employees')}
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '9px 14px',
                    },
                    '& .MuiInputLabel-root': {
                      top: '-5px',
                      fontSize: '10px',
                    },
                    mt: 1,
                  }}
                >
                  {mock_employees?.map((acc) => (
                    <MenuItem key={acc.name} value={acc.name}>
                      {acc.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {selectedReceiver === 'Other' && (
                <TextField fullWidth size="small" placeholder={t('accounts.enter_to_name')} sx={{ mt: 1 }} />
              )}
            </Grid>
          </>
        )}

        <Grid item xs={12} md={2} sx={{ mt: 1 }}>
          <DatePicker
            label={isInvoice ? t('accounts.date') : t('accounts.purchase_date')}
            onChange={handleInvoiceDateChange}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          {' '}
          <TextField
            select
            fullWidth
            label={t('accounts.account_details')}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
              mt: 1,
            }}
          >
            {mock_accounts.map((acc) => (
              <MenuItem key={acc.accountNumber} value={acc.accountNumber}>
                {String(acc.accountNumber).padStart(8, '0')} ({acc.accountName})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Card sx={{ mt: 1 }}>
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
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
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

                  <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
                    <Stack spacing={1}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.account}
                          onChange={(e) => handleChange(index, 'account', e.target.value)}
                        >
                          {payment_method?.map((acc) => (
                            <MenuItem key={acc.name} value={acc.name}>
                              {acc.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.ref || ''}
                      onChange={(e) => handleChange(index, 'ref', e.target.value)}
                    />
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.narration || ''}
                      onChange={(e) => handleChange(index, 'narration', e.target.value)}
                    />
                  </TableCell>

                  <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.quantity || ''}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        handleChange(index, 'quantity', numericValue);
                      }}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <IconButton onClick={() => handleDeleteRow(index)} sx={{ color: 'error.main' }}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={13} height={13} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell
                  colSpan={6}
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

              <TableRow>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell>
                  {t('accounts.total')}: {selectedCurrency} {totalDebit.toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>
      <Grid container spacing={2} mt={0.1}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" placeholder={t('accounts.amount_in_words')} />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.1}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" placeholder={t('accounts.prepared_by')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" placeholder={t('accounts.received_by')} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 1 }}>
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
              sx={{ width: 1, justifyContent: 'flex-end' }}
            />
            <MultiFilePreview
              files={files}
              thumbnail={filePreview.value}
              onRemove={handleRemoveFile}
              sx={{ my: 1 }}
            />
          </>
        )}
      </Box>

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
          onClick={handleSubmitData}
          sx={{ bgcolor: '#006A67' }}
          disabled={!hasEntry}
        >
          {t('accounts.save')}
        </Button>
      </Stack>
    </Paper>
  );
}
