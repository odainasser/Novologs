import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Autocomplete from '@mui/material/Autocomplete';

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
  Typography,
  FormControl,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable, TableHeadCustom } from 'src/components/table';
import { MultiFilePreview } from 'src/components/upload/components/preview-multi-file';

import { AddUserFiles } from 'src/sections/user/add-user-files';

import {
  locations,
  lpo_terms,
  currencies,
  order_type,
  mock_vendors,
  invoice_type,
  mock_accounts,
  purchase_order,
  products_services,
  quantity_measurements,
} from './account-mock-data';
import { getSettings } from 'src/actions/settings/settingActions';
import { getVendors } from 'src/actions/vendor/vendorActions';
import {
  getPurchaseOrderType,
  getPurchaseTerms,
  getProducts,
  getProductUnits,
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrderById,
  createPurchaseInvoice,
  updatePurchaseInvoice,
  getPurchaseInvoiceById,
  createDebitNote,
  updateDebitNote,
  getDebitNoteById,
  createSalesInvoice,
  updateSalesInvoice,
  getSalesInvoiceById,
  getDebitNotePrefillByPurchaseInvoiceId,
} from 'src/actions/purchase/purchaseActions';
import { getAccounts } from 'src/actions/accounts/accountActions';
import { getDefaultAccounts } from 'src/actions/purchase/purchaseActions';
import { getCurrencies } from 'src/actions/settings/settingActions';
import { toast } from 'src/components/snackbar';
import dayjs from 'dayjs';
import { AccountTreeSelector } from './account-tree-option';
import { ConfirmDialog } from 'src/components/custom-dialog';

export function AddLocalPurchaseOrder({
  open: drawerOpen,
  row = null,
  mode,
  isInvoice,
  isClientView,
  isNote,
  listMutate,
  setSelectedButton,
  clientVendorList,
  clientVendorListEmpty,
  invoiceList,
}) {
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(10);
  const [selectedCurrency, setSelectedCurrency] = useState('AED');
  const [selectedInvoice, setSelectedInvoice] = useState(0);
  const [selectedPurchase, setSelectedPurchase] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [finalTaxPercent, setFinalTaxPercent] = useState('12');
  const [messageOnPurchase, setMessageOnPurchase] = useState('');
  const [files, setFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const shouldLoadPurchaseOrder = !isInvoice && !isClientView && !isNote;
  const shouldLoadPurchaseInvoice = isInvoice && !isClientView && !isNote;
  const shouldLoadSalesInvoice = isInvoice && isClientView && !isNote;
  const shouldLoadDebitNote = isInvoice && !isClientView && isNote;
  const shouldPrefillDebitNote = isNote && !isClientView && !!selectedPurchase;

  const {
    purchaseOrderDetails,
    purchaseOrderDetailsLoading,
    mutate: purchaseOrderDetailsMutate,
  } = getPurchaseOrderById(row?.id, !!drawerOpen && !!row?.id && shouldLoadPurchaseOrder);

  const {
    purchaseInvoiceDetails,
    purchaseInvoiceDetailsLoading,
    mutate: purchaseInvoiceDetailsMutate,
  } = getPurchaseInvoiceById(row?.id, !!drawerOpen && !!row?.id && shouldLoadPurchaseInvoice);

  const {
    salesInvoiceDetails,
    salesInvoiceDetailsLoading,
    mutate: salesInvoiceDetailsMutate,
  } = getSalesInvoiceById(row?.id, !!drawerOpen && !!row?.id && shouldLoadSalesInvoice);
  const {
    debitNoteDetails,
    debitNoteDetailsLoading,
    mutate: debitNoteDetailsMutate,
  } = getDebitNoteById(row?.id, !!drawerOpen && !!row?.id && shouldLoadDebitNote);
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
  const purchaseData =
    currentDetails?.purchaseOrderDetails ||
    currentDetails?.purchaseInvoiceDetails ||
    currentDetails?.salesInvoiceDetails ||
    currentDetails?.debitNoteDetails ||
    currentDetails;

  const { prefillInvoiceDetails, prefillInvoiceDetailsLoading } =
    getDebitNotePrefillByPurchaseInvoiceId(selectedPurchase, shouldPrefillDebitNote);
  const getAccountsParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },

    isActive: true,
  };
  const {
    accountList,
    accountListLoading,
    accountListError,
    accountListValidating,
    accountListEmpty,
  } = getAccounts(getAccountsParams);
  const { defaultAccountList, defaultAccountListEmpty } = getDefaultAccounts();
  const filteredInvoices = (invoiceList || []).filter((inv) => inv.status !== 'Posted');
  const filteredAccounts = (defaultAccountList?.defaultAccounts || []).filter((acc) =>
    isClientView ? acc.invoiceAccountRole === 'Credit' : acc.invoiceAccountRole === 'Debit'
  );
  const filteredAccountsNote = (defaultAccountList?.defaultAccounts || []).filter((acc) =>
    !isClientView ? acc.invoiceAccountRole === 'Credit' : acc.invoiceAccountRole === 'Debit'
  );
  const { t } = useTranslation('dashboard/accounts');
  const { zetaUser } = useAuthContext();
  const { orderTypeList, orderTypeListEmpty } = getPurchaseOrderType();
  const { termsList, termsListEmpty } = getPurchaseTerms();
  const { productList, productListEmpty } = getProducts();
  const { productUnitList, productUnitListEmpty } = getProductUnits();
  const { currencyList, currencyListEmpty } = getCurrencies();
  const storedLang = localStorage.getItem('selectedLang');

  const accounts = [
    { label: t('accounts.cash'), value: 'cash' },
    { label: t('accounts.bank'), value: 'bank' },
    { label: t('accounts.office_supplies_expense'), value: 'office_supplies' },
    { label: t('accounts.accounts_payable'), value: 'accounts_payable' },
  ];

  console.log('this is the row', row);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedOrderType, setSelectedOrderType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTerms, setSelectedTerms] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [ourRef, setOurRef] = useState('');
  const [yourRef, setYourRef] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonDesignation, setContactPersonDesignation] = useState('');
  const [contactPersonPhone, setContactPersonPhone] = useState('');
  const [contactPersonEmail, setContactPersonEmail] = useState('');
  const [rows, setRows] = useState([
    {
      account: '',
      debit: '',
      credit: '',
      rate: '',
      quantity: '',
      measurement: '',
      discountType: 'percent',
      discountValue: '',
      taxPercent: '',
      narration: '',
      unit: '',
    },
  ]);
  const createInvoice = useBoolean();

  useEffect(() => {
    if (!drawerOpen) return;

    // new mode
    if (!row?.id) {
      setSelectedVendor('');
      setSelectedOrderType('');
      setSelectedLocation('');
      setSelectedTerms('');
      setBillingAddress('');
      setOurRef('');
      setYourRef('');
      setPurchaseDate(null);
      setDueDate(null);
      setRows([
        {
          account: '',
          debit: '',
          credit: '',
          rate: '',
          quantity: '',
          measurement: '',
          discountType: 'percent',
          discountValue: '',
          taxPercent: '',
          narration: '',
          unit: '',
        },
      ]);
      setDiscountType('percent');
      setDiscountValue(10);
      setSelectedCurrency('AED');
      setMessageOnPurchase('');
      setFiles([]);
      setDeletedFileIds([]);
      return;
    }

    // edit mode
    if (!currentDetails) return;

    const purchaseData =
      currentDetails?.purchaseOrderDetails ||
      currentDetails?.purchaseInvoiceDetails ||
      currentDetails?.salesInvoiceDetails ||
      currentDetails?.debitNoteDetails ||
      currentDetails;

    console.log('this is the purchaseData', purchaseData);
    if (purchaseData.vendorId) {
      setSelectedVendor(purchaseData.vendorId || '');
    }
    if (purchaseData.clientId) {
      setSelectedVendor(purchaseData.clientId || '');
    }
    if (isInvoice && !isNote) {
      if (isClientView) {
        setSelectedAccount(purchaseData.creditAccountId || '');
      } else {
        setSelectedAccount(purchaseData.debitAccountId || '');
      }
    }
    if (isNote) {
      if (isClientView) {
        setSelectedAccount(purchaseData.debitAccountId || '');
      } else {
        setSelectedAccount(purchaseData.creditAccountId || '');
        setSelectedPurchase(purchaseData.purchaseInvoiceId);
      }
    }

    setSelectedOrderType(purchaseData.orderType || '');
    setSelectedLocation(purchaseData.location || '');
    setSelectedTerms(purchaseData.terms || '');
    setBillingAddress(purchaseData.billingAddress || '');
    setOurRef(purchaseData.ourRef || '');
    setYourRef(purchaseData.yourRef || '');
    if (purchaseData.purchaseDate) {
      setPurchaseDate(purchaseData.purchaseDate ? dayjs(purchaseData.purchaseDate) : null);
    }
    if (isNote ? purchaseData.noteDate : purchaseData.invoiceDate) {
      setPurchaseDate(isNote ? dayjs(purchaseData.noteDate) : dayjs(purchaseData.invoiceDate));
    }
    setDueDate(purchaseData.dueDate ? dayjs(purchaseData.dueDate) : null);

    setRows(
      purchaseData.items?.length
        ? purchaseData.items.map((item) => ({
            account: item.product?.id || '',
            debit: '',
            credit: item.unitPrice || '',
            rate: item.unitPrice || '',
            quantity: item.quantity || '',
            measurement: item.unit?.id || '',
            discountType: item.lineDiscountType === 'Percentage' ? 'percent' : 'amount',
            discountValue:
              item.lineDiscountType === 'Percentage'
                ? item.lineDiscountPercent
                : item.lineDiscountValue,

            taxPercent: item.taxPercent || '',
            narration: '',
            unit: item.unit?.value || '',
          }))
        : [
            {
              account: '',
              debit: '',
              credit: '',
              rate: '',
              quantity: '',
              measurement: '',
              discountType: 'percent',
              discountValue: '',
              taxPercent: '',
              narration: '',
              unit: '',
            },
          ]
    );

    setDiscountType(purchaseData.overallDiscountType === 'Amount' ? 'amount' : 'percent');
    // setDiscountValue(purchaseData.overallDiscountValue ?? 10);
    setSelectedCurrency(purchaseData.currency || 'AED');
    setMessageOnPurchase(purchaseData.messageOnPurchase || '');
    if (purchaseData.attachments?.length > 0) {
      const mappedFiles = purchaseData.attachments.map((file) => ({
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
    setDeletedFileIds([]);
  }, [drawerOpen, row?.id, currentDetails, isClientView, clientVendorList]);
  useEffect(() => {
    if (!isNote || isClientView || !prefillInvoiceDetails) return;
    if (row?.id) return;
    const data = prefillInvoiceDetails;
    setSelectedVendor(data.vendorId || '');
    setSelectedCurrency(data.currency || 'AED');
    setSelectedInvoice(invoiceTypeMap[data.invoiceType] ?? 0);
    setBillingAddress(data.billingAddress || '');
    setSelectedLocation(data.location || '');
    setSelectedTerms(data.terms || '');
    setOurRef(data.ourRef || '');
    setYourRef(data.yourRef || '');
    setPurchaseDate(data.noteDate ? dayjs(data.noteDate) : null);
    setDueDate(data.dueDate ? dayjs(data.dueDate) : null);
    setSelectedAccount(data.creditAccountId || '');
    setDiscountType(data.overallDiscountType === 'FixedAmount' ? 'amount' : 'percent');
    setDiscountValue(data.overallDiscountValue ?? 0);
    setMessageOnPurchase(data.messageOnNote || '');

    setRows(
      data.items?.length
        ? data.items.map((item) => ({
            account: item.product?.id || '',
            debit: '',
            credit: item.unitPrice || '',
            rate: item.unitPrice || '',
            quantity: item.quantity || '',
            measurement: item.unit?.id || '',
            discountType: item.lineDiscountType === 'Percentage' ? 'percent' : 'amount',
            discountValue:
              item.lineDiscountType === 'Percentage'
                ? item.lineDiscountPercent
                : item.lineDiscountValue,
            taxPercent: item.taxPercent || '',
            narration: '',
            unit: item.unit?.value || '',
          }))
        : [
            {
              account: '',
              debit: '',
              credit: '',
              rate: '',
              quantity: '',
              measurement: '',
              discountType: 'percent',
              discountValue: '',
              taxPercent: '',
              narration: '',
              unit: '',
            },
          ]
    );

    setFiles([]);
    setDeletedFileIds([]);
  }, [isNote, isClientView, prefillInvoiceDetails]);
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });

  const filePreview = useBoolean();

  const { settingsList } = getSettings();

  const defaultProvinceValue = settingsList?.settings?.find(
    (setting) => setting.key === 'defaultProvince'
  )?.value;

  const provinceSettings = settingsList?.settings?.filter(
    (setting) => setting.key === `province${defaultProvinceValue}`
  );

  const default_provinces = [
    'Abu Dhabi',
    'Ajman',
    'Dubai',
    'Fujairah',
    'Ras al Khaimah',
    'Sharjah',
    'Umm Al Quwain',
  ];
  const invoiceTypeMap = {
    'Tax Cash Invoice': 0,
    'Tax Credit Invoice': 1,
    'Cash Invoice': 2,
    'Credit Invoice': 3,
  };
  const [openFiles, setOpenFiles] = useState(false);

  const handleOpenFile = () => {
    setOpenFiles(true);
  };

  const handleFileDialogClose = () => {
    setTimeout(() => {
      setOpenFiles(false);
    }, 100);
  };

  console.log('this is the files', files);
  const handleRemoveFile = (inputFile) => {
    if (inputFile.isExisting) {
      setDeletedFileIds((prev) => [...prev, inputFile.id]);
    }

    const updated = files.filter((f) => f !== inputFile);
    setFiles(updated);
  };

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('accounts.serialno'), width: '6%', align: 'center' },
    {
      id: 'account',
      label: t('accounts.product/service'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'debit',
      label: t('accounts.unit'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'debit',
      label: t('accounts.quantity'),
      width: '8%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'credit',
      label: 'Rate',
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'amount',
      label: 'Amount',
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'discount',
      label: 'Discount',
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'totalAfterDiscount',
      label: 'Amount After Discount',
      width: '18%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'tax',
      label: 'Tax',
      width: '11%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'netTotal',
      label: 'Net Total',
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'action',
      label: t('accounts.action'),
      width: '8%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
  ];

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        account: '',
        debit: '',
        credit: '',
        discountType: 'percent',
        discountValue: '',
      },
    ]);
  };

  const getRowDiscountAmount = (row) => {
    const rowTotal = getRowTotal(row);
    const discountValue = parseFloat(row.discountValue) || 0;

    if (row.discountType === 'amount') {
      return Math.min(discountValue, rowTotal);
    }

    return Math.min((rowTotal * discountValue) / 100, rowTotal);
  };

  const getRowNetTotal = (row) => {
    const rowTotal = getRowTotal(row);
    const rowDiscount = getRowDiscountAmount(row);
    return rowTotal - rowDiscount;
  };

  const getRowTaxAmount = (row) => {
    const netTotal = getRowNetTotal(row);
    const taxPercent = parseFloat(row.taxPercent) || 0;
    return (netTotal * taxPercent) / 100;
  };

  const getRowGrandTotal = (row) => {
    return getRowNetTotal(row) + getRowTaxAmount(row);
  };

  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    // 👉 when product is selected
    if (field === 'account') {
      const selectedProduct = productList?.products?.find((p) => p.id === Number(value));

      if (selectedProduct) {
        newRows[index].taxPercent = selectedProduct.taxPercentage ?? '';

        // newRows[index].measurement = selectedProduct.unit || newRows[index].measurement;
      }
    }

    setRows(newRows);

    if (field === 'measurement') {
      setSelectedUnit(value);
    }
  };

  const totalQuantity = rows.reduce((acc, row) => acc + Number(row.quantity || 0), 0);

  const getRowTotal = (row) => {
    const quantity = parseFloat(row.quantity) || 0;
    const rate = parseFloat(String(row.rate || 0).replace(/,/g, '')) || 0;
    return quantity * rate;
  };

  const totalAmount = rows.reduce((acc, row) => acc + getRowTotal(row), 0);
  const totalRowDiscount = rows.reduce((acc, row) => acc + getRowDiscountAmount(row), 0);
  const totalAfterDiscount = rows.reduce((acc, row) => acc + getRowNetTotal(row), 0);
  const totalTax = rows.reduce((acc, row) => acc + getRowTaxAmount(row), 0);
  const grandTotal = rows.reduce((acc, row) => acc + getRowGrandTotal(row), 0);

  const subTotal = totalAfterDiscount + totalTax;
  const rawDiscountValue = parseFloat(discountValue) || 0;

  const discount =
    discountType === 'amount'
      ? Math.min(rawDiscountValue, subTotal)
      : Math.min((subTotal * rawDiscountValue) / 100, subTotal);

  const netTotal = subTotal - discount;
  const totalCredit = rows.reduce((acc, row) => acc + getRowGrandTotal(row), 0);

  const finalTax = (netTotal * (parseFloat(finalTaxPercent) || 0)) / 100;
  const finalGrandTotal = netTotal + finalTax;
  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const handleSaveClick = () => {
    if (isInvoice) {
      createInvoice.onTrue();
      return;
    }

    handleSubmitData();
  };

  const handleSubmitData = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const existingFiles = files.filter((f) => f.isExisting);
    const newFiles = files.filter((f) => !f.isExisting);
    const payload = {
      currency: selectedCurrency || '',
      billingAddress: billingAddress || '',

      location: selectedLocation || '',
      terms: selectedTerms || '',

      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      ourRef: ourRef || '',
      yourRef: yourRef || '',
      overallDiscountType: discountType === 'amount' ? 1 : 0,
      overallDiscountValue: 0,

      ...(!isInvoice &&
        !isNote && {
          orderType: selectedOrderType || '',
          purchaseDate: purchaseDate
            ? new Date(purchaseDate).toISOString()
            : new Date().toISOString(),
          messageOnPurchase: messageOnPurchase || '',
        }),

      ...(isInvoice &&
        !isNote && {
          invoiceType: selectedInvoice,
          invoiceDate: purchaseDate
            ? new Date(purchaseDate).toISOString()
            : new Date().toISOString(),
          messageOnInvoice: messageOnPurchase || '',
        }),

      ...(isInvoice &&
        isNote &&
        !isClientView && {
          invoiceType: selectedInvoice,
          noteDate: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
          messageOnNote: messageOnPurchase || '',
          purchaseInvoiceId: selectedPurchase,
          creditAccountId: selectedAccount,
          vendorId: selectedVendor || '',
        }),
      ...(isInvoice &&
        !isClientView &&
        !isNote &&
        selectedAccount && {
          debitAccountId: selectedAccount,
        }),

      ...(isInvoice &&
        isClientView &&
        !isNote &&
        selectedAccount && {
          creditAccountId: selectedAccount,
        }),

      ...(!isClientView &&
        !isNote && {
          vendorId: selectedVendor || '',
        }),

      ...(isClientView &&
        !isNote && {
          clientId: selectedVendor || '',
        }),

      items: rows.map((item) => ({
        productId: Number(item.account) || 0,
        unit: {
          value: item.measurement === 'Other' ? item.unit || '' : item.measurement || '',
        },
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(String(item.rate || 0).replace(/,/g, '')) || 0,
        lineDiscountType: item.discountType === 'amount' ? 1 : 0,

        lineDiscountValue: getRowDiscountAmount(item) || 0,
        lineDiscountPercent:
          item.discountType === 'percent' ? parseFloat(item.discountValue) || 0 : 0,
        taxPercent: parseFloat(item.taxPercent) || 0,
      })),
    };
    console.log('this is the payload with files', payload, files);
    try {
      let response;

      if (shouldLoadPurchaseOrder) {
        if (row?.id) {
          response = await updatePurchaseOrder(payload, row.id, newFiles, deletedFileIds);
        } else {
          response = await createPurchaseOrder(payload, newFiles);
        }
      } else if (shouldLoadPurchaseInvoice) {
        if (row?.id) {
          response = await updatePurchaseInvoice(payload, row.id, newFiles, deletedFileIds);
        } else {
          response = await createPurchaseInvoice(payload, newFiles);
        }
      } else if (shouldLoadSalesInvoice) {
        if (row?.id) {
          response = await updateSalesInvoice(payload, row.id, newFiles, deletedFileIds);
        } else {
          response = await createSalesInvoice(payload, newFiles);
        }
      } else if (shouldLoadDebitNote) {
        if (row?.id) {
          response = await updateDebitNote(payload, row.id, newFiles, deletedFileIds);
        } else {
          response = await createDebitNote(payload, newFiles);
        }
      } else {
        toast.error('No valid tab selected');
        return;
      }

      if (response?.success) {
        const successMessage = shouldLoadPurchaseOrder
          ? row?.id
            ? 'Purchase order updated successfully'
            : 'Purchase order created successfully'
          : shouldLoadPurchaseInvoice
            ? row?.id
              ? 'Purchase invoice updated successfully'
              : 'Purchase invoice created successfully'
            : shouldLoadSalesInvoice
              ? row?.id
                ? 'Sales invoice updated successfully'
                : 'Sales invoice created successfully'
              : shouldLoadDebitNote
                ? row?.id
                  ? 'Debit note updated successfully'
                  : 'Debit note created successfully'
                : row?.id
                  ? 'Record updated successfully'
                  : 'Record created successfully';

        toast.success(successMessage);
        setFiles([]);
        setDeletedFileIds([]);

        await listMutate?.();

        if (shouldLoadPurchaseOrder) {
          await purchaseOrderDetailsMutate?.();
        } else if (shouldLoadPurchaseInvoice) {
          await purchaseInvoiceDetailsMutate?.();
        } else if (shouldLoadSalesInvoice) {
          await salesInvoiceDetailsMutate?.();
        } else if (shouldLoadDebitNote) {
          await debitNoteDetailsMutate?.();
        }

        setSelectedButton('journal');
      } else {
        toast.error(response?.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Action failed:', error);

      const errorLabel = shouldLoadPurchaseOrder
        ? 'purchase order'
        : shouldLoadPurchaseInvoice
          ? 'purchase invoice'
          : shouldLoadSalesInvoice
            ? 'sales invoice'
            : shouldLoadDebitNote
              ? 'debit note'
              : 'record';

      toast.error(`An unexpected error occurred while saving the ${errorLabel}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvoiceDateChange = (newDate) => {
    console.log('this is the new date', newDate);
    setPurchaseDate(newDate);
  };

  const handleDueDateChange = (newDate) => {
    console.log('this is the new date', newDate);
    setDueDate(newDate);
  };

  const hasEntry = rows.some(
    (row) =>
      Number(row.quantity || 0) > 0 || Number(row.rate || 0) > 0 || Number(row.credit || 0) > 0
  );

  const isBalanced =
    rows.reduce((acc, row) => acc + Number(row.debit || 0), 0) ===
    rows.reduce((acc, row) => acc + Number(row.credit || 0), 0);

  return (
    <Paper>
      <Typography variant="h4" sx={{ mt: 1 }}>
        {!isNote && (
          <>
            {isInvoice
              ? isClientView
                ? 'Sales Invoice'
                : 'Purchase Invoice'
              : t('accounts.purchase_order')}
          </>
        )}
        {isNote && <>{isClientView ? 'Credit Note' : 'Debit Note'}</>}
      </Typography>

      <Grid container spacing={2}>
        {isNote && (isClientView || !isClientView) && (
          <Grid item xs={12} md={4}>
            <TextField
              select
              disabled={!!row?.id}
              fullWidth
              label={
                !isClientView && isNote
                  ? 'Select Purchase Invoice'
                  : isClientView && isNote
                    ? 'Select Sales Invoice'
                    : 'LPO'
              }
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
                mt: 1,
              }}
            >
              {(filteredInvoices || []).length === 0 ? (
                <MenuItem value="">No invoices available</MenuItem>
              ) : (
                (filteredInvoices || []).map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    {acc.invNumber}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
        )}

        {!isNote && <Grid item xs={12} md={4} />}

        <Grid item xs={12} md={4} />

        {isInvoice && !isNote && (
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              {/* <AccountTreeSelector
                value={selectedAccount || ''}
                onChange={(selectedId) => setSelectedAccount(selectedId || '')}
                placeholder={isClientView ? 'Select Credit Account' : 'Select Debit Account'}
              /> */}

              <TextField
                select
                fullWidth
                label={isClientView ? 'Select Credit Account' : 'Select Debit Account'}
                sx={{
                  '& .MuiInputBase-input': { padding: '9px 14px' },
                  '& .MuiInputLabel-root': { top: '-5px', fontSize: '10px' },
                  mt: 1,
                }}
                value={selectedAccount}
                onChange={(event) => setSelectedAccount(event.target.value || '')}
              >
                {filteredAccounts.length === 0 ? (
                  <MenuItem disabled>No default accounts available</MenuItem>
                ) : (
                  filteredAccounts.map((acc) => (
                    <MenuItem key={acc.id} value={acc.accountId}>
                      {`${acc.accountName} (Acc. No.: ${acc.accountCode || '-'})`}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </FormControl>
          </Grid>
        )}

        {isInvoice && isNote && (
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <TextField
                select
                fullWidth
                label={isClientView ? 'Select Debit Account' : 'Select Credit Account'}
                sx={{
                  '& .MuiInputBase-input': { padding: '9px 14px' },
                  '& .MuiInputLabel-root': { top: '-5px', fontSize: '10px' },
                  mt: 1,
                }}
                value={selectedAccount}
                onChange={(event) => setSelectedAccount(event.target.value || '')}
              >
                {filteredAccountsNote.length === 0 ? (
                  <MenuItem disabled>No default accounts available</MenuItem>
                ) : (
                  filteredAccountsNote.map((acc) => (
                    <MenuItem key={acc.id} value={acc.accountId}>
                      {`${acc.accountName} (Acc. No.: ${acc.accountCode || '-'})`}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </FormControl>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2} mt={0.1}>
        {row?.id && (
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
              value={isNote ? row?.noteNumber : row?.invNumber ? row?.invNumber : row?.poNumber}
            />
          </Grid>
        )}

        <Grid item xs={12} md={2}>
          {isInvoice ? (
            <TextField
              select
              fullWidth
              label={t('accounts.invoice_type')}
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(Number(e.target.value))}
              sx={{
                '& .MuiInputBase-input': { padding: '9px 14px' },
                '& .MuiInputLabel-root': { top: '-5px', fontSize: '10px' },
                mt: 1,
              }}
            >
              <MenuItem value={0}>Tax Cash Invoice</MenuItem>
              <MenuItem value={1}>Tax Credit Invoice</MenuItem>
              <MenuItem value={2}>Cash Invoice</MenuItem>
              <MenuItem value={3}>Credit Invoice</MenuItem>
            </TextField>
          ) : (
            <TextField
              select
              fullWidth
              label="Order Type"
              value={selectedOrderType}
              onChange={(e) => setSelectedOrderType(e.target.value)}
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
              {orderTypeList.orderType?.length > 0 ? (
                orderTypeList.orderType.map((item) => {
                  const arabicName = item?.name?.localizedStrings?.find(
                    (l) => l.language === 'ar'
                  )?.value;

                  return (
                    <MenuItem key={item.id} value={item.id}>
                      {storedLang === 'ar' && arabicName ? arabicName : item.name.value}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled value="">
                  No order type available
                </MenuItem>
              )}
            </TextField>
          )}
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label={isClientView ? t('accounts.client') : t('accounts.vendor')}
            value={selectedVendor || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedVendor(selectedId);

              const selectedParty = clientVendorList.find((item) => item.id === selectedId);
              setBillingAddress(selectedParty?.address || '');
            }}
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
            {clientVendorListEmpty ? (
              <>
                {' '}
                {isClientView ? (
                  <MenuItem value="">No clients available</MenuItem>
                ) : (
                  <MenuItem value="">No vendors available</MenuItem>
                )}
              </>
            ) : (
              clientVendorList.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label={t('accounts.currency')}
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
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
            {currencyList?.currency?.length > 0
              ? currencyList?.currency.map((currency) => (
                  <MenuItem key={currency.symbol} value={currency.symbol}>
                    {currency.symbol}
                  </MenuItem>
                ))
              : currencies.map((acc) => (
                  <MenuItem key={acc.code} value={acc.code}>
                    {acc.code} ({acc.name})
                  </MenuItem>
                ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Our Ref"
            value={ourRef}
            onChange={(e) => setOurRef(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Your Ref"
            value={yourRef}
            onChange={(e) => setYourRef(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.1}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Billing Address"
            multiline
            rows={2}
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label={t('accounts.location')}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
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
            {provinceSettings?.length > 0
              ? JSON.parse(provinceSettings[0].value).map((item) => (
                  <MenuItem key={item.symbol} value={item.name.value}>
                    {item.name.value}
                  </MenuItem>
                ))
              : default_provinces.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label="Terms"
            value={selectedTerms}
            onChange={(e) => setSelectedTerms(e.target.value)}
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
            {termsList.terms?.length > 0 ? (
              termsList.terms.map((item) => {
                const arabicName = item?.name?.localizedStrings?.find(
                  (l) => l.language === 'ar'
                )?.value;

                return (
                  <MenuItem key={item.id} value={item.id}>
                    {storedLang === 'ar' && arabicName ? arabicName : item.name.value}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem disabled value="">
                No terms available
              </MenuItem>
            )}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <DatePicker
            label={
              isNote
                ? 'Note Date'
                : isInvoice
                  ? t('accounts.invoice_date')
                  : t('accounts.purchase_date')
            }
            value={purchaseDate}
            onChange={handleInvoiceDateChange}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <DatePicker
            label={t('accounts.due_date')}
            value={dueDate}
            onChange={handleDueDateChange}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>
      </Grid>
      {isInvoice && (
        <Card
          sx={{
            my: 2,
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Contact Person
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Designation"
                value={contactPersonDesignation}
                onChange={(e) => setContactPersonDesignation(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={contactPersonPhone}
                onChange={(e) => setContactPersonPhone(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                value={contactPersonEmail}
                onChange={(e) => setContactPersonEmail(e.target.value)}
              />
            </Grid>
          </Grid>
        </Card>
      )}

      <Card
        sx={{
          borderRadius: 1,
          mt: isInvoice ? 0 : 2,
        }}
      >
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
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    {index + 1}
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack spacing={1}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.account}
                          onChange={(e) => handleChange(index, 'account', e.target.value)}
                        >
                          {productList.products?.length > 0 ? (
                            productList.products.map((item) => {
                              const arabicName = item?.name?.localizedStrings?.find(
                                (l) => l.language === 'ar'
                              )?.value;

                              return (
                                <MenuItem key={item.id} value={item.id}>
                                  {storedLang === 'ar' && arabicName ? arabicName : item.name.value}
                                </MenuItem>
                              );
                            })
                          ) : (
                            <MenuItem disabled value="">
                              No products available
                            </MenuItem>
                          )}

                          {/* <MenuItem value="Other">Other</MenuItem> */}
                        </Select>
                      </FormControl>

                      {row.account === 'Other' && (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={t('accounts.enter_description')}
                          value={row.narration || ''}
                          onChange={(e) => handleChange(index, 'narration', e.target.value)}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack spacing={1}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.measurement}
                          onChange={(e) => handleChange(index, 'measurement', e.target.value)}
                        >
                          {productUnitList.units?.length > 0 ? (
                            productUnitList.units.map((item) => {
                              const arabicName = item?.name?.localizedStrings?.find(
                                (l) => l.language === 'ar'
                              )?.value;

                              return (
                                <MenuItem key={item.id} value={item.id}>
                                  {storedLang === 'ar' && arabicName ? arabicName : item.name.value}
                                </MenuItem>
                              );
                            })
                          ) : (
                            <MenuItem disabled value="">
                              No units available
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      {selectedUnit === 'Other' && (
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={t('accounts.enter_unit')}
                          value={row.unit || ''}
                          onChange={(e) => handleChange(index, 'unit', e.target.value)}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      value={row.quantity || ''}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9.]/g, '');

                        handleChange(index, 'quantity', numericValue);
                      }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                    align="right"
                  >
                    <TextField
                      size="small"
                      value={row.rate || ''}
                      inputProps={{ style: { textAlign: 'right' } }}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        handleChange(index, 'credit', raw);
                        handleChange(index, 'rate', raw);
                      }}
                      onBlur={() => {
                        const raw = parseFloat(String(row.rate || 0).replace(/,/g, '')) || 0;
                        handleChange(index, 'rate', raw.toFixed(2));
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                    align="right"
                  >
                    <TextField
                      size="small"
                      value={(() => {
                        const quantity = parseFloat(row.quantity) || 0;
                        const rate = parseFloat(String(row.rate || 0).replace(/,/g, '')) || 0;

                        const total = quantity * rate;

                        return total ? formatCurrency(total) : '';
                      })()}
                      inputProps={{ style: { textAlign: 'right' } }}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: (theme) => theme.palette.text.disabled,
                        },
                        '& .MuiOutlinedInput-root': {
                          bgcolor: (theme) => theme.palette.action.disabledBackground,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5}>
                        <FormControl size="small" sx={{ minWidth: 74 }}>
                          <Select
                            value={row.discountType || 'percent'}
                            onChange={(e) => handleChange(index, 'discountType', e.target.value)}
                          >
                            <MenuItem value="percent">%</MenuItem>
                            <MenuItem value="amount">{selectedCurrency}</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          fullWidth
                          size="small"
                          placeholder={row.discountType === 'amount' ? t('accounts.amount') : '%'}
                          value={row.discountValue || ''}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                            handleChange(index, 'discountValue', numericValue);
                          }}
                          inputProps={{
                            inputMode: 'decimal',
                            pattern: '[0-9.]*',
                            style: {
                              textAlign: row.discountType === 'amount' ? 'right' : 'left',
                            },
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.5,
                          textAlign: 'right',
                          display: 'block',
                        }}
                      >
                        - {selectedCurrency} {formatCurrency(getRowDiscountAmount(row))}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <TextField
                        size="small"
                        value={getRowNetTotal(row) ? formatCurrency(getRowNetTotal(row)) : ''}
                        inputProps={{ style: { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: (theme) => theme.palette.text.disabled,
                          },
                          '& .MuiOutlinedInput-root': {
                            bgcolor: (theme) => theme.palette.action.disabledBackground,
                          },
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.5,
                          textAlign: 'right',
                          display: 'block',
                        }}
                      >
                        {selectedCurrency} {formatCurrency(getRowTotal(row))}
                        {''} before discount
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="%"
                        value={row.taxPercent || ''}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                          handleChange(index, 'taxPercent', numericValue);
                        }}
                        inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.5,
                          textAlign: 'right',
                          display: 'block',
                        }}
                      >
                        {selectedCurrency} {formatCurrency(getRowTaxAmount(row))}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <TextField
                        size="small"
                        value={getRowGrandTotal(row) ? formatCurrency(getRowGrandTotal(row)) : ''}
                        inputProps={{ style: { textAlign: 'right' } }}
                        InputProps={{ readOnly: true }}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: (theme) => theme.palette.text.disabled,
                          },
                          '& .MuiOutlinedInput-root': {
                            bgcolor: (theme) => theme.palette.action.disabledBackground,
                          },
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          px: 0.5,
                          textAlign: 'right',
                          display: 'block',
                        }}
                      >
                        {selectedCurrency} {formatCurrency(getRowNetTotal(row))} +{' '}
                        {selectedCurrency} {formatCurrency(getRowTaxAmount(row))} tax
                      </Typography>
                    </Stack>
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
                  colSpan={11}
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

              {/* <TableRow>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />

                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell colSpan={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">{t('accounts.discount')}</Typography>

                    <FormControl size="small" sx={{ minWidth: 90 }}>
                      <Select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <MenuItem value="percent">%</MenuItem>
                        <MenuItem value="amount">{selectedCurrency}</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      value={discountValue ?? ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setDiscountValue(value);
                      }}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                      sx={{ width: 90 }}
                    />

                    <Typography variant="caption">
                      - {selectedCurrency} {formatCurrency(discount)}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow> */}
              {/* <TableRow>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />

                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell colSpan={3}>
                  <Typography variant="subtitle2">
                    {' '}
                    Net Total: {selectedCurrency} {formatCurrency(netTotal)}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow> */}
              {/* {(!isInvoice || (isInvoice && selectedInvoice !== t('accounts.non_tax_inovice'))) && (
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />

                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell colSpan={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">VAT</Typography>
                      <TextField
                        size="small"
                        value={finalTaxPercent}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setFinalTaxPercent(value);
                        }}
                        inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                        sx={{ width: 70 }}
                      />
                      <Typography variant="body2">%</Typography>
                      <Typography variant="caption">
                        : {selectedCurrency} {formatCurrency(finalTax)}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )} */}

              {/* <TableRow>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />

                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell colSpan={3}>
                  <strong>
                    {t('accounts.grand_total')}: {selectedCurrency}{' '}
                    {formatCurrency(finalGrandTotal)}
                  </strong>
                </TableCell>
              </TableRow> */}
            </TableBody>
          </Table>
        </Scrollbar>
        <Box
          sx={{
            px: 2,
            py: 2,
            borderTop: '1px dashed rgba(145, 158, 171, 0.2)',
            backgroundColor: '#fafafa',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              {/* <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total Qty
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(totalQuantity)}
                </Typography>
              </Paper> */}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(totalAmount)} {selectedCurrency}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Discount
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(totalRowDiscount)} {selectedCurrency}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  After Discount
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(totalAfterDiscount)} {selectedCurrency}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(totalTax)} {selectedCurrency}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: '#006A67',
                  color: '#fff',
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Grand Total
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatCurrency(grandTotal)} {selectedCurrency}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Card>
      <Grid container spacing={2} mt={0.1}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder={
              isNote
                ? 'Message on Note'
                : isInvoice
                  ? t('accounts.message_on_invoice')
                  : t('accounts.message_on_purchase')
            }
            multiline
            rows={2}
            value={messageOnPurchase}
            onChange={(e) => setMessageOnPurchase(e.target.value)}
          />
        </Grid>
      </Grid>
      {!isClientView && (
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
      )}

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
          onClick={handleSaveClick}
          sx={{ bgcolor: '#006A67' }}
          disabled={!hasEntry || isSubmitting}
        >
          {t('accounts.save')}
        </Button>
      </Stack>
      <ConfirmDialog
        open={createInvoice.value}
        onClose={createInvoice.onFalse}
        title={isNote ? 'Save Note' : 'Save Invoice'}
        content={
          isNote
            ? 'Are you sure you want to save this note?'
            : 'Are you sure you want to save this invoice?'
        }
        action={
          <Button
            variant="contained"
            onClick={() => {
              createInvoice.onFalse();
              handleSubmitData();
            }}
            disabled={isSubmitting}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Save
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </Paper>
  );
}
