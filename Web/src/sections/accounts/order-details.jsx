import React, { useState, useRef, useEffect } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import { fDate } from 'src/utils/format-time';
import CkEditorComponent from 'src/components/htmlEditor/CkEditorComponent';
import EditIcon from '@mui/icons-material/Edit';
import {
  getPurchaseOrderById,
  getPurchaseInvoiceById,
  getSalesInvoiceById,
  getDebitNoteById,
} from 'src/actions/purchase/purchaseActions';
import { getSettings } from 'src/actions/settings/settingActions';
import { CONFIG } from 'src/config-global';
import { toWords } from 'number-to-words';
export function OrderDetails({ open, onClose, row, isInvoice, isPosted, isClientView, isNote }) {
  const shouldLoadPurchaseOrder = !isInvoice && !isClientView && !isNote;
  const shouldLoadPurchaseInvoice = isInvoice && !isClientView && !isNote;
  const shouldLoadSalesInvoice = isInvoice && isClientView && !isNote;
  const shouldLoadDebitNote = isInvoice && !isClientView && isNote;
  const { purchaseOrderDetails, purchaseOrderDetailsLoading } = getPurchaseOrderById(
    row?.id,
    !!open && !!row?.id && shouldLoadPurchaseOrder
  );

  const { purchaseInvoiceDetails, purchaseInvoiceDetailsLoading } = getPurchaseInvoiceById(
    row?.id,
    !!open && !!row?.id && shouldLoadPurchaseInvoice
  );

  const { salesInvoiceDetails, salesInvoiceDetailsLoading } = getSalesInvoiceById(
    row?.id,
    !!open && !!row?.id && shouldLoadSalesInvoice
  );
  const { debitNoteDetails, debitNoteDetailsLoading } = getDebitNoteById(
    row?.id,
    !!open && !!row?.id && shouldLoadDebitNote
  );
  const currentDetails = shouldLoadPurchaseOrder
    ? purchaseOrderDetails
    : shouldLoadPurchaseInvoice
      ? purchaseInvoiceDetails
      : shouldLoadSalesInvoice
        ? salesInvoiceDetails
        : shouldLoadDebitNote
          ? debitNoteDetails
          : null;

  const currentDetailsLoading = shouldLoadPurchaseOrder
    ? purchaseOrderDetailsLoading
    : shouldLoadPurchaseInvoice
      ? purchaseInvoiceDetailsLoading
      : shouldLoadSalesInvoice
        ? salesInvoiceDetailsLoading
        : shouldLoadDebitNote
          ? debitNoteDetailsLoading
          : false;
  const { settingsList } = getSettings();
  const storedLang = localStorage.getItem('selectedLang');

  const filePreview = useBoolean();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const chartRef = useRef(null);
  const exportRef = useRef(null);
  const [editorData, setEditorData] = useState('');
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [templateColor, setTemplateColor] = useState('#006a67');
  useEffect(() => {
    if (settingsList?.settings) {
      const companyLogoSetting = settingsList.settings.find(
        (setting) => setting.key === 'companyLogo'
      );

      const templateColorSetting = settingsList.settings.find(
        (setting) => setting.key === 'invoiceThemeColor'
      );

      const logoUrl = companyLogoSetting?.value || `${CONFIG.assetsDir}/logo/novo.svg`;
      const selectedColor = templateColorSetting?.value || '#006a67';

      setAvatarUrl(logoUrl);
      setTemplateColor(selectedColor);

      if (logoUrl && logoUrl.toLowerCase().endsWith('.svg')) {
        setAvatarDataUrl(null);

        fetch(logoUrl)
          .then((res) => {
            if (!res.ok) throw new Error('SVG fetch failed');
            return res.text();
          })
          .then((svgText) => {
            const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
            setAvatarDataUrl(dataUrl);
          })
          .catch((err) => {
            console.warn('Could not inline SVG, falling back to src URL:', err);
            setAvatarDataUrl(null);
          });
      } else {
        setAvatarDataUrl(null);
      }
    }
  }, [settingsList]);
  const finalSrc = avatarDataUrl || avatarUrl;
  const brandColor = templateColor || '#006a67';
  const branding = useBoolean();
  const fileInputRef = useRef(null);
  const [draftColor, setDraftColor] = useState('#006a67');
  const [draftLogo, setDraftLogo] = useState(null);
  const [draftLogoPreview, setDraftLogoPreview] = useState(null);
  useEffect(() => {
    if (branding.value) {
      setDraftColor(templateColor || '#006a67');
      setDraftLogo(null);
      setDraftLogoPreview(finalSrc || null);
    }
  }, [branding.value, templateColor, finalSrc]);
  const convertAmountToWords = (amount, currency = 'AED') => {
    if (!amount) return '';

    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);

    const words = toWords(integerPart);

    let result = `${words} ${currency}`;

    if (decimalPart > 0) {
      result += ` and ${toWords(decimalPart)} fils`; // UAE style
    }

    return result.toUpperCase();
  };
  const getInvoiceTemplate = () => {
    return `
    <div style="font-family: Arial; padding: 20px;">

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2>INVOICE</h2>
          <p><strong>Invoice:</strong> ${row?.poNumber || ''}</p>
          <p><strong>Date:</strong> ${fDate(new Date())}</p>
        </div>
      </div>

      <hr/>

      <p><strong>${isClientView ? 'Client' : 'Vendor'}:</strong> ${row?.vendor.name || ''}</p>
      <p><strong>Location:</strong> ${row?.location || ''}</p>

    <table style="
  width:100%;
  border-collapse: collapse;
  margin-top:20px;
  font-size:14px;
">
  <thead>
    <tr style="background:#f4f6f8; color:#637381; text-align:left;">
      <th style="padding:12px; border-bottom:1px solid #e0e0e0;">Product Name</th>
      <th style="padding:12px; border-bottom:1px solid #e0e0e0;">Unit</th>
      <th style="padding:12px; border-bottom:1px solid #e0e0e0; text-align:right;">Quantity</th>
      <th style="padding:12px; border-bottom:1px solid #e0e0e0; text-align:right;">Rate</th>
      <th style="padding:12px; border-bottom:1px solid #e0e0e0; text-align:right;">Amount</th>
    </tr>
  </thead>

</table>



    </div>
  `;
  };
  useEffect(() => {
    if (open && isEditing && !editorData) {
      setEditorData(getInvoiceTemplate());
    }
  }, [open, isEditing]);
  const mappedFiles =
    currentDetails?.attachments?.length > 0
      ? currentDetails.attachments.map((file) => ({
          id: file.id,
          name: file.fileName,
          preview: file.fileUrl?.startsWith('http') ? file.fileUrl : `${file.fileUrl}`,
          size: file.fileSize,
          type: file.mimeType,
          isExisting: true,
        }))
      : [];
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const prepareExportData = () => {
    const currency = currentDetails?.currency || 'AED';

    const headerRows = [
      {
        [isInvoice ? 'Inv Number' : 'PO Number']: isInvoice
          ? row?.invNumber || 'Not Available'
          : row?.poNumber || 'Not Available',
        'Created Date': row?.created ? fDate(row.created) : 'Not Available',
        'Product Name': '',
        Unit: '',
        Quantity: '',
        Rate: '',
        [`Amount (${currency})`]: '',
        'Discount Type': '',
        [`Discount Amount (${currency})`]: '',
        [`Amount after discount (${currency})`]: '',
        'Tax Percent (%)': '',
        [`Tax Amount (${currency})`]: '',
        [`Net Total (${currency})`]: '',
      },
      {
        [isInvoice ? 'Inv Number' : 'PO Number']: '',
        'Created Date': '',
        'Product Name': '',
        Unit: '',
        Quantity: '',
        Rate: '',
        [`Amount (${currency})`]: '',
        'Discount Type': '',
        [`Discount Amount (${currency})`]: '',
        [`Amount after discount (${currency})`]: '',
        'Tax Percent (%)': '',
        [`Tax Amount (${currency})`]: '',
        [`Net Total (${currency})`]: '',
      },
    ];

    const itemRows =
      currentDetails?.items?.map((line) => ({
        [isInvoice ? 'Inv Number' : 'PO Number']: '',
        'Created Date': '',
        'Product Name': line.productName || 'Not Available',
        Unit: line?.unit?.name || '-',
        Quantity: line.quantity || 0,
        Rate: Number(line.unitPrice || 0),
        [`Amount (${currency})`]: Number(line.lineBase || 0),
        'Discount Type':
          line.lineDiscountType === 'Percentage'
            ? `${line.lineDiscountType} (${line.lineDiscountPercent || 0}%)`
            : line.lineDiscountType || '-',
        [`Discount Amount (${currency})`]: Number(line.lineDiscountValue || 0),
        [`Amount after discount (${currency})`]: Number(line.taxableAmount || 0),
        'Tax Percent (%)': Number(line.taxPercent || 0),
        [`Tax Amount (${currency})`]: Number(line.taxAmount || 0),
        [`Net Total (${currency})`]: Number(line.lineTotal || 0),
      })) || [];

    itemRows.push({
      [isInvoice ? 'Inv Number' : 'PO Number']: '',
      'Created Date': '',
      'Product Name': 'TOTAL',
      Unit: '',
      Quantity: '',
      Rate: '',
      [`Amount (${currency})`]: Number(currentDetails?.subtotal || 0),
      'Discount Type': '',
      [`Discount Amount (${currency})`]: Number(currentDetails?.overallDiscountAmount || 0),
      [`Amount after discount (${currency})`]: Number(
        currentDetails?.subtotalAfterLineDiscounts || 0
      ),
      'Tax Percent (%)': '',
      [`Tax Amount (${currency})`]: Number(currentDetails?.totalTax || 0),
      [`Net Total (${currency})`]: Number(currentDetails?.grandTotal || 0),
    });

    return [...headerRows, ...itemRows];
  };
  const documentLabel = isNote
    ? isClientView
      ? 'Credit Note'
      : 'Debit Note'
    : isInvoice
      ? isClientView
        ? 'Sales Invoice'
        : 'Purchase Invoice'
      : 'Purchase Order';

  const documentFileName = documentLabel.toLowerCase().replace(/\s+/g, '-');
  const exportToExcel = () => {
    const data = prepareExportData();
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length + 2, ...data.map((row) => String(row[key] ?? '').length + 2)),
    }));

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${documentLabel} Details`);

    XLSX.writeFile(
      workbook,
      `${documentFileName}-${row?.poNumber || row?.invNumber || 'details'}.xlsx`
    );
  };

  const exportToPDF = async () => {
    const element = exportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (contentHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(`${documentFileName}-${row?.poNumber || row?.invNumber || 'details'}.pdf`);
  };
  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDraftLogo(file);

    const previewUrl = URL.createObjectURL(file);
    setDraftLogoPreview(previewUrl);
  };

  const handleApplyBranding = () => {
    setTemplateColor(draftColor || '#006a67');

    if (draftLogoPreview) {
      setAvatarDataUrl(draftLogoPreview);
      setAvatarUrl(draftLogoPreview);
    }

    branding.onFalse();
  };

  const handleResetBranding = () => {
    setDraftColor('#006a67');
    setDraftLogo(null);
    setDraftLogoPreview(`${CONFIG.assetsDir}/logo/novo.svg`);
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isFullscreen ? '100%' : { xs: '100%', sm: 520, md: '90%', lg: '90%', xl: '90%' },
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
            {!isNote && (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isInvoice
                  ? isClientView
                    ? 'Sales Invoice Details'
                    : 'Purchase Invoice Details'
                  : 'Purchase Order Details'}
              </Typography>
            )}

            {isNote && (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isClientView ? 'Credit Note Details' : 'Debit Note Details'}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {row?.invNumber || row?.poNumber || 'Not Available'} • Created Date:{' '}
              {row?.created ? fDate(row.created) : 'Not Available'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* {isInvoice && (
              <Tooltip title="Click here to edit the Invoice" arrow>
                <IconButton onClick={() => setIsEditing(true)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )} */}
            {isClientView && isInvoice && (
              <Button variant="outlined" onClick={branding.onTrue}>
                Edit Branding
              </Button>
            )}

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
        <Box
          ref={exportRef}
          sx={{
            // maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {/* {!isInvoice && (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 3,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {isInvoice ? 'Invoice Summary' : 'Order Summary'}
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {row?.invNumber || row?.poNumber || 'Not Available'}
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {isClientView ? 'Client' : 'Vendor'}
                      </Typography>

                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 0.5 }}>
                        <Avatar
                          alt={row?.vendor?.name || row?.client?.name || 'Not Available'}
                          src={
                            row?.vendor?.profileImageFileUrl ||
                            row?.client?.profileImageFileUrl ||
                            ''
                          }
                          sx={{ width: 32, height: 32 }}
                        >
                          {!row?.vendor?.profileImageFileUrl &&
                            !row?.client?.profileImageFileUrl &&
                            (row?.vendor?.name?.charAt(0) || row?.client?.name?.charAt(0) || 'N')}
                        </Avatar>

                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {row?.vendor?.name || row?.client?.name || 'Not Available'}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Billing Address
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {row?.billingAddress || 'Not Available'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {row?.location || 'Not Available'}
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
                        {isInvoice ? 'Invoice Type' : 'Order Type'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {isInvoice
                          ? row?.invoiceType || 'Not Available'
                          : (() => {
                              const arabicName = row?.orderType?.localizedStrings?.find(
                                (l) => l.language === 'ar'
                              )?.value;
                              const englishName = row?.orderType?.value;

                              if (storedLang === 'ar') {
                                return arabicName || englishName || 'Not Available';
                              }

                              return englishName || arabicName || 'Not Available';
                            })()}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Currency
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentDetails?.currency || 'Not Available'}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Our Ref
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {currentDetails?.ourRef || 'Not Available'}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Your Ref
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {currentDetails?.yourRef || 'Not Available'}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        {isInvoice ? 'Invoice Date' : 'Purchase Date'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentDetails?.purchaseDate || currentDetails?.invoiceDate
                          ? fDate(currentDetails?.purchaseDate || currentDetails?.invoiceDate)
                          : 'Not Available'}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentDetails?.dueDate ? fDate(currentDetails?.dueDate) : 'Not Available'}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Terms
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {(() => {
                          const arabicName = row?.terms?.localizedStrings?.find(
                            (l) => l.language === 'ar'
                          )?.value;
                          const englishName = row?.terms?.value;

                          if (storedLang === 'ar') {
                            return arabicName || englishName || 'Not Available';
                          }

                          return englishName || arabicName || 'Not Available';
                        })()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          )} */}

          {!isEditing ? (
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 2, md: 5 },
                mb: 3,
                minHeight: '100vh',
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 180,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={finalSrc}
                      alt="logo"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                      {isInvoice ? 'Invoice No.' : 'Order No.'}{' '}
                      {row?.invNumber || row?.poNumber || 'Not Available'}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: '0.8fr 1.2fr 1fr',
                    gap: 3,
                    alignItems: 'start',
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        bgcolor: brandColor,
                        color: '#fff',
                        px: 1,
                        py: 0.3,
                        fontWeight: 600,
                        fontSize: 15,
                        textTransform: 'uppercase',
                        mb: 2,
                        borderRadius: 1,
                      }}
                    >
                      COMPANY DETAILS
                    </Box>

                    <Box display="flex" sx={{ flexDirection: 'column', mb: 2 }}>
                      <Typography variant="body2"> NovaTech Solutions LLC</Typography>
                      <Typography variant="body2">Office 102, Al Saaha Offices</Typography>
                      <Typography variant="body2">Souk Al Bahar, Downtown Dubai</Typography>
                      <Typography variant="body2">Dubai, United Arab Emirates</Typography>
                      <Typography variant="body2">P.O. Box 123456</Typography>
                      <Typography variant="body2">Phone: +971 4 123 4567</Typography>
                      <Typography variant="body2">Email: info@novatech.ae</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        bgcolor: brandColor,
                        color: '#fff',
                        px: 1,
                        py: 0.3,
                        fontWeight: 600,
                        fontSize: 15,
                        textTransform: 'uppercase',
                        mb: 2,
                        borderRadius: 1,
                      }}
                    >
                      BILL TO
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>
                      {row?.client?.name || row?.vendor?.name || 'Not Available'}
                    </Typography>
                    <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Billing Address:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {row?.billingAddress || 'Not Available'}
                      </Typography>
                    </Box>
                    <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Location:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {row?.location || 'Not Available'}
                      </Typography>
                    </Box>
                    <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Reg nr:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {row?.client?.registrationNumber ||
                          row?.vendor?.registrationNumber ||
                          'Not Available'}
                      </Typography>
                    </Box>
                    <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        TAX nr:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {row?.client?.taxNumber || row?.vendor?.taxNumber || 'Not Available'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        bgcolor: brandColor,
                        color: '#fff',
                        px: 1,
                        py: 0.3,
                        fontWeight: 600,
                        fontSize: 15,
                        mb: 1,
                        // mt: 9,
                        borderRadius: 1,
                      }}
                    >
                      {/* {row?.vendor?.name || row?.client?.name || '[Vendor company name]'} */}
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Typography variant="body2">
                          {isInvoice ? 'Invoice Type:' : 'Order Type:'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {isInvoice
                            ? row?.invoiceType || 'Not Available'
                            : (() => {
                                const arabicName = row?.orderType?.localizedStrings?.find(
                                  (l) => l.language === 'ar'
                                )?.value;
                                const englishName = row?.orderType?.value;

                                if (storedLang === 'ar') {
                                  return arabicName || englishName || 'Not Available';
                                }

                                return englishName || arabicName || 'Not Available';
                              })()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Currency:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentDetails?.currency || 'Not Available'}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Our Ref:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentDetails?.ourRef || 'Not Available'}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Your Ref:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentDetails?.yourRef || 'Not Available'}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Terms:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {(() => {
                          const arabicName = row?.terms?.localizedStrings?.find(
                            (l) => l.language === 'ar'
                          )?.value;
                          const englishName = row?.terms?.value;

                          if (storedLang === 'ar') {
                            return arabicName || englishName || 'Not Available';
                          }

                          return englishName || arabicName || 'Not Available';
                        })()}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" gap={1}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                          {isInvoice ? 'Invoice Date:' : 'Purchase Date:'}
                        </Typography>

                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                          {currentDetails?.invoiceDate
                            ? fDate(currentDetails.invoiceDate)
                            : currentDetails?.purchaseDate
                              ? fDate(currentDetails.purchaseDate)
                              : 'Not Available'}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        Due Date:{' '}
                        {currentDetails?.dueDate ? fDate(currentDetails.dueDate) : 'Not Available'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                          {currentDetails?.bankName || '[Bank name]'}
                        </Typography>

                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                          SWIFT / ABA: {currentDetails?.swiftCode || '[SWIFT / BIC]'}
                        </Typography>

                        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                          Bank account number: {currentDetails?.bankAccountNumber || '—'}
                        </Typography>
                      </Box>
                      {isInvoice && (
                        <Box>
                          <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                              Contact Person:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Nowshad RVP
                            </Typography>
                          </Box>
                          <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                              Designation:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Employee
                            </Typography>
                          </Box>

                          <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                              Phone/Mobile:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              0556786651
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  mb: 2,
                  alignItems: 'center',
                }}
              ></Box>
              {/* Desktop invoice-style table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  sx={{
                    border: '1px solid #7d365c',
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '0.5fr 1fr 0.8fr 0.8fr 1fr 1fr 1fr 1fr 1fr 0.8fr 1fr 1fr',
                      bgcolor: brandColor,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>S.NO</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>PRODUCT NAME</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>UNIT</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>QTY</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>RATE</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>
                      AMOUNT ({currentDetails?.currency || 'AED'})
                    </Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>DISCOUNT TYPE</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>
                      DISCOUNT AMOUNT ({currentDetails?.currency || 'AED'})
                    </Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>
                      AMOUNT AFTER DISCOUNT ({currentDetails?.currency || 'AED'})
                    </Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>TAX %</Box>
                    <Box sx={{ pt: 1, borderRight: '1px solid #7d365c' }}>
                      TAX AMOUNT ({currentDetails?.currency || 'AED'})
                    </Box>
                    <Box sx={{ pt: 1 }}>NET TOTAL ({currentDetails?.currency || 'AED'})</Box>
                  </Box>

                  {/* Rows */}
                  {(currentDetails?.items || []).map((line, index) => {
                    const productName =
                      storedLang === 'ar'
                        ? line?.product?.localizedStrings?.find((l) => l.language === 'ar')
                            ?.value ||
                          line?.product?.value ||
                          'Not Available'
                        : line?.product?.value ||
                          line?.product?.localizedStrings?.find((l) => l.language === 'ar')
                            ?.value ||
                          'Not Available';

                    const unitName =
                      storedLang === 'ar'
                        ? line?.unit?.localizedStrings?.find((l) => l.language === 'ar')?.value ||
                          line?.unit?.value ||
                          'Not Available'
                        : line?.unit?.value ||
                          line?.unit?.localizedStrings?.find((l) => l.language === 'ar')?.value ||
                          'Not Available';

                    return (
                      <Box
                        key={index}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            '0.5fr 1fr 0.8fr 0.8fr 1fr 1fr 1fr 1fr 1fr 0.8fr 1fr 1fr',
                          borderTop: index > 0 ? '1px solid #7d365c' : 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRight: '1px solid #7d365c',
                            textAlign: 'center',
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c' }}>{productName}</Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c' }}>{unitName}</Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'center' }}>
                          {line?.quantity || 0}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'right' }}>
                          {formatCurrency(line?.unitPrice)}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'right' }}>
                          {formatCurrency(line?.lineBase)}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c' }}>
                          {line?.lineDiscountType === 'Percentage'
                            ? `${line.lineDiscountType} (${line.lineDiscountPercent || 0}%)`
                            : line?.lineDiscountType || '-'}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'right' }}>
                          - {formatCurrency(line?.lineDiscountValue)}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'right' }}>
                          {formatCurrency(line?.taxableAmount)}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'center' }}>
                          {line?.taxPercent || 0}
                        </Box>

                        <Box sx={{ p: 1, borderRight: '1px solid #7d365c', textAlign: 'right' }}>
                          + {formatCurrency(line?.taxAmount)}
                        </Box>

                        <Box sx={{ p: 1, textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(line?.lineTotal)}
                        </Box>
                      </Box>
                    );
                  })}

                  {/* Empty space like template only for desktop */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '0.5fr 1fr 0.8fr 0.8fr 1fr 1fr 1fr 1fr 1fr 0.8fr 1fr 1fr',
                      minHeight: 280,
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          borderRight: i !== 11 ? '1px solid #7d365c' : 'none',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Small screen clean table */}
              <Box
                sx={{
                  display: { xs: 'block', md: 'none' },
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f9fafb' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Unit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                          Amount
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {(currentDetails?.items || []).map((line, index) => {
                        const productName =
                          storedLang === 'ar'
                            ? line?.product?.localizedStrings?.find((l) => l.language === 'ar')
                                ?.value ||
                              line?.product?.value ||
                              'Not Available'
                            : line?.product?.value ||
                              line?.product?.localizedStrings?.find((l) => l.language === 'ar')
                                ?.value ||
                              'Not Available';

                        const unitName =
                          storedLang === 'ar'
                            ? line?.unit?.localizedStrings?.find((l) => l.language === 'ar')
                                ?.value ||
                              line?.unit?.value ||
                              'Not Available'
                            : line?.unit?.value ||
                              line?.unit?.localizedStrings?.find((l) => l.language === 'ar')
                                ?.value ||
                              'Not Available';

                        return (
                          <TableRow key={index} hover>
                            <TableCell sx={{ fontSize: 12 }}>{productName}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{unitName}</TableCell>
                            <TableCell align="right" sx={{ fontSize: 12 }}>
                              {line?.quantity || 0}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 12 }}>
                              {formatCurrency(line?.lineBase)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>
                              {formatCurrency(line?.lineTotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  py: 1,
                  px: 2,
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {isInvoice ? 'Message on Invoice' : 'Message on Purchase'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {currentDetails?.messageOnPurchase ||
                    currentDetails?.messageOnInvoice ||
                    'Not Available'}
                </Typography>
              </Box>

              <Box display="flex" sx={{ alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Total Amount in Words:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 16 }}>
                  {currentDetails?.grandTotal
                    ? `${convertAmountToWords(
                        currentDetails.grandTotal,
                        currentDetails?.currency || 'AED'
                      )} ONLY`
                    : 'TOTAL AMOUNT'}
                </Typography>
              </Box>
              {/* Totals */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ width: { xs: '100%', sm: 360 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Subtotal</Typography>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
                      {formatCurrency(currentDetails?.subtotal)} {''}
                      {currentDetails?.currency || 'AED'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Discount</Typography>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
                      {formatCurrency(currentDetails?.overallDiscountAmount)} {''}
                      {currentDetails?.currency || 'AED'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>After Discount</Typography>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
                      {formatCurrency(currentDetails?.subtotalAfterLineDiscounts)} {''}
                      {currentDetails?.currency || 'AED'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Tax</Typography>
                    <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
                      {formatCurrency(currentDetails?.totalTax)} {''}
                      {currentDetails?.currency || 'AED'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      bgcolor: brandColor,
                      color: '#fff',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Total</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                      {formatCurrency(currentDetails?.grandTotal)} {''}
                      {currentDetails?.currency || 'AED'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 4,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr 1fr 1.2fr' },
                  border: '1px solid #000',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {/* Company Stamp */}
                <Box
                  sx={{
                    borderRight: '1px solid #000',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: brandColor,
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottom: '1px solid #000',
                    }}
                  >
                    Company Stamp
                  </Box>
                  <Box sx={{ height: 35 }} />
                </Box>

                {/* Received By */}
                <Box
                  sx={{
                    borderRight: '1px solid #000',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: brandColor,
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottom: '1px solid #000',
                    }}
                  >
                    Received By
                  </Box>
                  <Box sx={{ height: 35 }} />
                </Box>

                {/* Date */}
                <Box
                  sx={{
                    borderRight: '1px solid #000',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: brandColor,
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottom: '1px solid #000',
                    }}
                  >
                    Date
                  </Box>
                  <Box sx={{ height: 35 }} />
                </Box>

                {/* Sign */}
                <Box
                  sx={{
                    borderRight: '1px solid #000',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: brandColor,
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottom: '1px solid #000',
                    }}
                  >
                    Sign
                  </Box>
                  <Box sx={{ height: 35 }} />
                </Box>

                {/* Phone / Mobile No. */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: brandColor,
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottom: '1px solid #000',
                    }}
                  >
                    Phone / Mobile No.
                  </Box>
                  <Box sx={{ height: 35 }} />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 3,
                mb: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Edit Invoice
                </Typography>

                <Button variant="contained" onClick={() => setIsEditing(false)}>
                  Back
                </Button>
              </Stack>

              <CkEditorComponent data={editorData} onChange={(data) => setEditorData(data)} />

              <div
                id="invoice-editor-preview"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  top: 0,
                }}
                dangerouslySetInnerHTML={{ __html: editorData }}
              />
            </Box>
          )}
          {/* Attachments */}
          {!isClientView && (
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Attachments
              </Typography>

              {mappedFiles.length > 0 ? (
                <MultiFilePreview
                  files={mappedFiles}
                  thumbnail={filePreview.value}
                  sx={{ my: 2 }}
                />
              ) : (
                <EmptyContent
                  filled
                  sx={{ py: 6 }}
                  title="No attachments available"
                  description={
                    isInvoice
                      ? 'There are no attachments available for this invoice.'
                      : 'There are no attachments available for this order.'
                  }
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
      <Dialog open={branding.value} onClose={branding.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>Edit Branding</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Logo
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Box
                  sx={{
                    width: 180,
                    height: 70,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    bgcolor: '#fff',
                  }}
                >
                  {draftLogoPreview ? (
                    <img
                      src={draftLogoPreview}
                      alt="logo preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No logo selected
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                    Upload Logo
                  </Button>

                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                      setDraftLogo(null);
                      setDraftLogoPreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Stack>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoFileChange}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Theme Color
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Hex Color"
                  value={draftColor}
                  onChange={(e) => setDraftColor(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="#006a67"
                />

                <Box
                  component="input"
                  type="color"
                  value={draftColor}
                  onChange={(e) => setDraftColor(e.target.value)}
                  sx={{
                    width: 56,
                    height: 40,
                    p: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preview
              </Typography>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    width: 140,
                    height: 50,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                  }}
                >
                  {draftLogoPreview ? (
                    <img
                      src={draftLogoPreview}
                      alt="preview logo"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No logo
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: draftColor || '#006a67',
                      color: '#fff',
                      px: 2,
                      py: 1,
                      fontWeight: 700,
                    }}
                  >
                    {`${documentLabel.toUpperCase()} HEADER`}
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      This is how your branding will look in the document
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleResetBranding} color="inherit">
            Reset
          </Button>
          <Button onClick={branding.onFalse} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleApplyBranding}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
