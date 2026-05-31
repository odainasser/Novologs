import { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Button,
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

import { Scrollbar } from 'src/components/scrollbar';

import { Iconify } from 'src/components/iconify';

import { useTable, TableHeadCustom } from 'src/components/table';
import { setOpeningBalance } from 'src/actions/accounts/accountActions';

import { toast } from 'src/components/snackbar';
export function AddOpeningBalance({
  rows,
  accountListMutate,
  setSelectedButton,
  mutateChartHierarchy,
}) {
  const { t } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });

  const [openMap, setOpenMap] = useState({});

  const toggleOpen = (id) => {
    setOpenMap((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const initializeTreeRows = (nodes = []) =>
    nodes.map((node) => ({
      ...node,

      originalOpeningDebit: node.openingDebit ?? 0,
      originalOpeningCredit: node.openingCredit ?? 0,

      openingDebit: node.openingDebit ?? 0,
      openingCredit: node.openingCredit ?? 0,

      debitInput: '',
      creditInput: '',

      children: initializeTreeRows(node.children || []),
    }));

  const [treeRows, setTreeRows] = useState(() => initializeTreeRows(rows || []));

  const syncRows = useMemo(() => initializeTreeRows(rows || []), [rows]);
  useEffect(() => {
    setTreeRows(syncRows);
  }, [syncRows]);

  const updateNodeValue = (nodes, id, field, value) =>
    nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          [field]: value,
        };
      }

      return {
        ...node,
        children: updateNodeValue(node.children || [], id, field, value),
      };
    });

  const handleChange = (id, field, value) => {
    setTreeRows((prev) => updateNodeValue(prev, id, field, value));
  };

  const flattenTree = (nodes = []) =>
    nodes.flatMap((node) => [node, ...flattenTree(node.children || [])]);

  const flatRows = useMemo(() => flattenTree(treeRows), [treeRows]);
  const totals = flatRows.reduce(
    (acc, row) => {
      const isLeaf = !row.children || row.children.length === 0;
      if (!isLeaf) return acc;

      const isLocked =
        Number(row.originalOpeningDebit || 0) > 0 || Number(row.originalOpeningCredit || 0) > 0;

      const debit = isLocked
        ? parseFloat(String(row.originalOpeningDebit || 0).replace(/,/g, '')) || 0
        : parseFloat(String(row.openingDebit || 0).replace(/,/g, '')) || 0;

      const credit = isLocked
        ? parseFloat(String(row.originalOpeningCredit || 0).replace(/,/g, '')) || 0
        : parseFloat(String(row.openingCredit || 0).replace(/,/g, '')) || 0;

      acc.debit += debit;
      acc.credit += credit;

      if (!isLocked && (debit > 0 || credit > 0)) {
        acc.count += 1;
      }

      return acc;
    },
    { debit: 0, credit: 0, count: 0 }
  );
  const isTally = totals.debit === totals.credit;
  const hasMinimumEntries = totals.count >= 2;
  const disableSave = !isTally || !hasMinimumEntries;
  const disabledFieldStyle = {
    '& .MuiInputBase-root.Mui-disabled': {
      backgroundColor: 'rgba(0,0,0,0.06)',
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#666',
      color: '#666',
      // fontWeight: 500,
    },
  };
  const TABLE_HEAD = [
    { id: 'serialNo', label: t('accounts.serial_no'), width: '4%', align: 'center' },
    {
      id: 'account',
      label: t('accounts.accountdetails'),
      width: '35%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'debit',
      label: t('accounts.Debit'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'credit',
      label: t('accounts.credit'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
  ];

  const handleSaveOpeningBalance = async () => {
    if (disableSave) return;

    try {
      const entries = flatRows
        .filter((row) => !row.children || row.children.length === 0)
        .map((row) => {
          const isLocked =
            Number(row.originalOpeningDebit || 0) > 0 || Number(row.originalOpeningCredit || 0) > 0;

          if (isLocked) return null;

          const debit = parseFloat(String(row.openingDebit || 0).replace(/,/g, '')) || 0;
          const credit = parseFloat(String(row.openingCredit || 0).replace(/,/g, '')) || 0;

          if (debit === 0 && credit === 0) return null;

          return {
            accountId: row.id,
            openingDebit: debit,
            openingCredit: credit,
          };
        })
        .filter(Boolean);

      const result = await setOpeningBalance({ entries });

      if (result.success) {
        toast.success('Opening balance added successfully');
        await accountListMutate();
        await mutateChartHierarchy();
        setSelectedButton('accountList');
      } else {
        toast.error(result.error || 'Error adding opening balance');
      }
    } catch (error) {
      console.error('Error adding opening balance:', error);
    }
  };

  let serial = 0;

  const renderTreeRows = (nodes = [], level = 0) =>
    nodes.map((row) => {
      const hasChildren = row.children && row.children.length > 0;
      const isOpen = openMap[row.id] !== false;
      const hasOpeningValue =
        Number(row.originalOpeningDebit || 0) > 0 || Number(row.originalOpeningCredit || 0) > 0;

      serial += 1;

      return (
        <>
          <TableRow key={row.id} hover>
            <TableCell align="center" sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
              {serial}
            </TableCell>

            <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', pl: `${level * 24}px` }}>
                {hasChildren && (
                  <IconButton size="small" onClick={() => toggleOpen(row.id)}>
                    <Iconify icon={isOpen ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
                  </IconButton>
                )}

                <Box sx={{ ml: hasChildren ? 0.5 : 0 }}>
                  {row?.code || ''} ({row?.name})
                </Box>
              </Box>
            </TableCell>

            <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }} align="right">
              <TextField
                size="small"
                disabled={hasOpeningValue}
                value={
                  hasOpeningValue
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(row.openingDebit || 0))
                    : row.debitInput
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  handleChange(row.id, 'debitInput', raw);
                }}
                onBlur={() => {
                  const raw = Number(row.debitInput || 0);
                  handleChange(row.id, 'openingDebit', raw);
                  handleChange(
                    row.id,
                    'debitInput',
                    raw
                      ? new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(raw)
                      : ''
                  );
                }}
                inputProps={{
                  style: {
                    textAlign: 'right',
                  },
                }}
                sx={disabledFieldStyle}
              />
            </TableCell>

            <TableCell align="right">
              <TextField
                size="small"
                disabled={hasOpeningValue}
                value={
                  hasOpeningValue
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(row.openingCredit || 0))
                    : row.creditInput
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  handleChange(row.id, 'creditInput', raw);
                }}
                onBlur={() => {
                  const raw = Number(row.creditInput || 0);
                  handleChange(row.id, 'openingCredit', raw);
                  handleChange(
                    row.id,
                    'creditInput',
                    raw
                      ? new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(raw)
                      : ''
                  );
                }}
                inputProps={{
                  style: {
                    textAlign: 'right',
                  },
                }}
                sx={disabledFieldStyle}
              />
            </TableCell>
          </TableRow>

          {hasChildren && isOpen ? renderTreeRows(row.children, level + 1) : null}
        </>
      );
    });

  return (
    <Paper>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Opening Balance
      </Typography>

      <Card sx={{ mt: 1 }}>
        <Scrollbar>
          <Table
            size={table.dense ? 'small' : 'medium'}
            sx={{
              minWidth: 960,
              tableLayout: 'fixed',
              '& td, & th': { padding: table.dense ? '4px' : '8px' },
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
              {renderTreeRows(treeRows)}

              <TableRow>
                <TableCell />
                <TableCell
                  align="right"
                  sx={{
                    borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    fontWeight: 'bold',
                  }}
                >
                  Total
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    fontWeight: 'bold',
                  }}
                >
                  {totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {!hasMinimumEntries && (
        <Typography color="warning.main" sx={{ p: 2 }} variant="caption">
          At least two accounts must have opening balance.
        </Typography>
      )}

      {hasMinimumEntries && !isTally && (
        <Typography color="warning.main" sx={{ p: 2 }} variant="caption">
          Total Debit and Credit must tally.
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSaveOpeningBalance}
          disabled={disableSave}
          sx={{ bgcolor: '#006A67' }}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
}
