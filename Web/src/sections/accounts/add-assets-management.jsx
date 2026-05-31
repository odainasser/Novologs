import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import {
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

import { mock_assets } from './account-mock-data';
// Sample accounts for dropdown

export function AddAssetsManagement({ row = null, mode, isInvoice, isClientView, isNote }) {
  const { t } = useTranslation('dashboard/accounts');

  const accounts = [
    { label: t('accounts.cash'), value: 'cash' },
    { label: t('accounts.bank'), value: 'bank' },
    { label: t('accounts.office_supplies_expense'), value: 'office_supplies' },
    { label: t('accounts.accounts_payable'), value: 'accounts_payable' },
  ];
  console.log('this is the row', row);
  const [rows, setRows] = useState([{ account: '', debit: '', credit: '' }]);
  const [selectedCurrency, setSelectedCurrency] = useState('AED');
  const [selectedInvoice, setSelectedInvoice] = useState('Tax Cash Invoice');
  const [selectedPurchase, setSelectedPurchase] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');

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
    { id: 'serialNo', label: t('accounts.serialno'), width: '4%', align: 'center' },

    {
      id: 'account',
      label: 'Assets',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'credit',
      label: 'Amount',
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
  const hasEntry = rows.some((row) => Number(row.debit || 0) > 0 || Number(row.credit || 0) > 0);
  const isBalanced =
    rows.reduce((acc, row) => acc + Number(row.debit || 0), 0) ===
    rows.reduce((acc, row) => acc + Number(row.credit || 0), 0);
  return (
    <Paper>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Assets"
            value={selectedPurchase}
            onChange={(e) => setSelectedPurchase(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
          >
            {mock_assets?.map((acc) => (
              <MenuItem key={acc.orderNumber} value={acc.orderNumber}>
                {acc.orderNumber}
              </MenuItem>
            ))}
          </TextField>
        </Grid> */}
        <Grid item xs={12} md={4} />
        <Grid item xs={12} md={4} />

        <Grid item xs={12} md={4} />

        <Grid item xs={12} md={4}>
          <DatePicker
            label="Date"
            onChange={handleDueDateChange}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
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
                          {mock_assets?.map((acc) => (
                            <MenuItem key={acc.orderNumber} value={acc.orderNumber}>
                              {acc.orderNumber}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
                    <TextField
                      size="small"
                      value={row.rate || ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        handleChange(index, 'credit', raw);
                        handleChange(index, 'rate', raw);
                      }}
                      onBlur={() => {
                        const raw = Number(row.credit || 0);
                        handleChange(
                          index,
                          'rate',
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

              <TableRow>
                <TableCell
                  colSpan={4}
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
                <TableCell>
                  {t('accounts.total')}: {selectedCurrency} {totalCredit.toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>


            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

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
