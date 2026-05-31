import React, { useState, useRef, useMemo } from 'react';
import {
  Drawer,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useBoolean } from 'src/hooks/use-boolean';
import { MultiFilePreview } from 'src/components/upload/components/preview-multi-file';
import { EmptyContent } from 'src/components/empty-content';
import { getAccountById } from 'src/actions/accounts/accountActions';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Iconify } from 'src/components/iconify';

import { Field } from 'src/components/hook-form';

export function AccountDetails({ open: drawerOpen, onClose, account }) {
  const filePreview = useBoolean();
  const { accountDetails, accountDetailsLoading } = getAccountById(account?.id, drawerOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const chartRef = useRef(null);
  const filteredTransactions = useMemo(() => {
    const transactions = accountDetails?.transactions || [];

    return transactions
      .filter((trx) => {
        if (!trx.isPosted) return false; //

        const trxDate = new Date(trx.createdAt).setHours(0, 0, 0, 0);

        if (fromDate) {
          const from = new Date(fromDate).setHours(0, 0, 0, 0);
          if (trxDate < from) return false;
        }

        if (toDate) {
          const to = new Date(toDate).setHours(23, 59, 59, 999);
          if (trxDate > to) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [accountDetails, fromDate, toDate]);
  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    filteredTransactions.forEach((transaction) => {
      transaction.lines
        ?.filter((line) => line.accountId === account?.id)
        .forEach((line) => {
          totalDebit += Number(line.debit || 0);
          totalCredit += Number(line.credit || 0);
        });
    });

    return {
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit,
    };
  }, [filteredTransactions, account?.id]);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const prepareExportData = () => {
    const transactions = filteredTransactions;
    const exportData = [];

    transactions.forEach((transaction) => {
      const accountLines =
        transaction?.lines?.filter((line) => line.accountId === account?.id) || [];
      accountLines.forEach((line, index) => {
        exportData.push({
          'Sl.No': `${transactions.indexOf(transaction) + 1}.${index + 1}`,
          Date: new Date(transaction.date).toLocaleDateString(),
          'Reference No': transaction.referenceNo || '-',
          Description: line.description || '-',
          'Debit (AED)': line.debit ? Number(line.debit).toFixed(2) : '',
          'Credit (AED)': line.credit ? Number(line.credit).toFixed(2) : '',
        });
      });
    });

    return exportData;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(prepareExportData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Account Details');
    XLSX.writeFile(workbook, 'account-details.xlsx');
  };

  const exportToPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('account-details.pdf');
  };
  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };
  const handleResetFromDate = () => {
    setFromDate('');
  };

  const handleResetToDate = () => {
    setToDate('');
  };

  const handleResetAllDates = () => {
    setFromDate('');
    setToDate('');
  };
  const canReset = !!fromDate || !!toDate;

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isFullscreen ? '100%' : { xs: '100%', sm: 520, md: '82%', lg: '82%', xl: '82%' },
          boxShadow: '-1px 0px 8px rgb(142 142 142 / 50%)',
          p: 0,
          bgcolor: '#f8fafc',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Account Ledger
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {account?.code || 'N/A'} • {account?.name || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleOpenMenu}>
              Export
            </Button>

            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}>
              <MenuItem
                onClick={() => {
                  exportToExcel();
                  handleCloseMenu();
                }}
              >
                Export as Excel
              </MenuItem>
              <MenuItem
                onClick={() => {
                  exportToPDF();
                  handleCloseMenu();
                }}
              >
                Export as PDF
              </MenuItem>
            </Menu>

            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
              <IconButton onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Box ref={chartRef} sx={{ mx: 'auto' }}>
          {/* Ledger summary */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Ledger Information
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {account?.name || 'N/A'}
                </Typography>

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Account Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {account?.code || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Account Category
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {account?.fullPath
                        ? account.fullPath
                            .split('/')
                            .slice(0, -1)
                            .map((part) => part.trim())
                            .join(' / ')
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  bgcolor: '#fcfcfd',
                }}
              >
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Total Debit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totals.totalDebit)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Total Credit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totals.totalCredit)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: totals.balance >= 0 ? '#006A67' : 'error.main',
                      }}
                    >
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Math.abs(totals.balance))}{' '}
                      AED
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Filter section */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Ledger Filters
            </Typography>

            {accountDetailsLoading && (
              <Box mb={2}>
                <LinearProgress
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    '& .MuiLinearProgress-bar': { backgroundColor: '#2FBBA8' },
                    backgroundColor: 'rgba(47, 187, 168, 0.2)',
                  }}
                />
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                // flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Field.DatePicker
                name="fromDate"
                label="From Date"
                value={fromDate ? dayjs(fromDate) : null}
                sx={{
                  minWidth: 180,
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px',
                    fontSize: '10px',
                  },
                }}
                onDateChange={handleFromDateChange}
              />

              {fromDate && (
                <Tooltip title="Reset From Date">
                  <IconButton size="small" color="error" onClick={handleResetFromDate}>
                    <Iconify icon="mdi:close-circle-outline" width={18} />
                  </IconButton>
                </Tooltip>
              )}

              <Field.DatePicker
                name="toDate"
                label="To Date"
                value={toDate ? dayjs(toDate) : null}
                sx={{
                  minWidth: 180,
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px',
                    fontSize: '10px',
                  },
                }}
                onDateChange={handleToDateChange}
              />

              {toDate && (
                <Tooltip title="Reset To Date">
                  <IconButton size="small" color="error" onClick={handleResetToDate}>
                    <Iconify icon="mdi:close-circle-outline" width={18} />
                  </IconButton>
                </Tooltip>
              )}

              {canReset && (
                <Tooltip title="Reset All">
                  <IconButton size="small" color="error" onClick={handleResetAllDates}>
                    <Iconify icon="mdi:refresh" width={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Ledger table */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3,
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Ledger Entries
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Sl.No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}> Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Posting Date</TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>Reference No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Debit (AED)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Credit (AED)
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(filteredTransactions || []).map((transaction, idx) => {
                    const accountLines =
                      transaction?.lines?.filter((line) => line.accountId === account?.id) || [];

                    const mappedFiles =
                      transaction?.attachments?.length > 0
                        ? transaction.attachments.map((file) => ({
                            id: file.id,
                            name: file.fileName,
                            preview: file.fileUrl?.startsWith('http')
                              ? file.fileUrl
                              : `${file.fileUrl}`,
                            size: file.fileSize,
                            type: file.mimeType,
                            isExisting: true,
                          }))
                        : [];

                    return (
                      <React.Fragment key={transaction.id}>
                        {accountLines.map((line, lineIndex) => (
                          <TableRow key={line.id} hover>
                            <TableCell>
                              {idx + 1}.{lineIndex + 1}
                            </TableCell>

                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{transaction.referenceNo || '-'}</TableCell>
                            <TableCell>{line.description || '-'}</TableCell>
                            <TableCell align="right">
                              {line.debit
                                ? new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(line.debit)
                                : ''}
                            </TableCell>
                            <TableCell align="right">
                              {line.credit
                                ? new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(line.credit)
                                : ''}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}

                  <TableRow sx={{ bgcolor: 'rgba(145, 158, 171, 0.08)' }}>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totals.totalDebit)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(totals.totalCredit)}
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ bgcolor: 'rgba(47, 187, 168, 0.06)' }}>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>
                      Balance
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ fontWeight: 700 }}>
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Math.abs(totals.balance))}{' '}
                      AED
                    </TableCell>
                  </TableRow>
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <EmptyContent
                          filled
                          sx={{ py: 10 }}
                          title="No transactions available"
                          description="There are no posted transactions available for this account."
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
