import React, { useState, useRef } from 'react';
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
  Tooltip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useBoolean } from 'src/hooks/use-boolean';
import { MultiFilePreview } from 'src/components/upload/components/preview-multi-file';
import { EmptyContent } from 'src/components/empty-content';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function JournalVoucherDetails({ open, onClose, voucher }) {
  const filePreview = useBoolean();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const chartRef = useRef(null);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const mappedFiles =
    voucher?.attachments?.length > 0
      ? voucher.attachments.map((file) => ({
          id: file.id,
          name: file.fileName,
          preview: file.fileUrl?.startsWith('http') ? file.fileUrl : `${file.fileUrl}`,
          size: file.fileSize,
          type: file.mimeType,
          isExisting: true,
        }))
      : [];

  const prepareExportData = () => {
    return voucher?.lines?.map((line) => ({
      'Account Number': String(line.accountCode),
      'Account Name': line.accountName || 'Not Available',
      'Account Category': line.accountPath
        ? line.accountPath
            .split('>')
            .slice(0, -1)
            .map((p) => p.trim())
            .join(' > ')
        : 'Not Available',
      Narration: line.description || '-',
      'Debit (AED)': line.debit ? Number(line.debit).toFixed(2) : '',
      'Credit (AED)': line.credit ? Number(line.credit).toFixed(2) : '',
    }));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(prepareExportData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Journal Voucher');
    XLSX.writeFile(workbook, 'journal-voucher.xlsx');
  };

  const exportToPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('journal-voucher.pdf');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isFullscreen ? '100%' : { xs: '100%', sm: 520, md: '78%', lg: '78%', xl: '78%' },
          boxShadow: '-1px 0px 8px rgb(142 142 142 / 50%)',
          p: 0,
          bgcolor: '#f8fafc',
        },
      }}
    >
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
              Transaction Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {voucher?.referenceNo || 'Not Available'} • Date:{' '}
              {voucher?.date ? new Date(voucher.date).toLocaleDateString() : 'Not Available'}
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

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Box ref={chartRef} sx={{ mx: 'auto' }}>
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
                  Transaction Summary
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {voucher?.referenceNo || 'Not Available'}
                </Typography>

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Transaction Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {voucher?.date
                        ? new Date(voucher.date).toLocaleDateString()
                        : 'Not Available'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Number of Entries
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {voucher?.lines?.length || 0}
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
                      {(voucher?.totalDebit || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Total Credit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {(voucher?.totalCredit || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {voucher?.isPosted ? 'Posted' : 'Draft'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>

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
                Transaction Entries
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Account Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Account Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Account Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Narration</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Debit (AED)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Credit (AED)
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {voucher?.lines?.map((line) => (
                    <TableRow key={line.id} hover>
                      <TableCell>{String(line.accountCode).padStart(8, '0')}</TableCell>
                      <TableCell>{line.accountName || 'Not Available'}</TableCell>
                      <TableCell>
                        {line.accountPath
                          ? line.accountPath
                              .split('>')
                              .slice(0, -1)
                              .map((part) => part.trim())
                              .join(' > ')
                          : 'Not Available'}
                      </TableCell>
                      <TableCell>{line.description || '-'}</TableCell>
                      <TableCell align="right">
                        {line.debit ? Number(line.debit).toFixed(2) : ''}
                      </TableCell>
                      <TableCell align="right">
                        {line.credit ? Number(line.credit).toFixed(2) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              mb: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Debit Summary
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {(voucher?.totalDebit || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Credit Summary
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {(voucher?.totalCredit || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Attachments
            </Typography>

            {mappedFiles.length > 0 ? (
              <MultiFilePreview files={mappedFiles} thumbnail={filePreview.value} sx={{ my: 2 }} />
            ) : (
              <EmptyContent
                filled
                sx={{ py: 8 }}
                title="No attachments available"
                description="There are no attachments available for this transaction."
              />
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
