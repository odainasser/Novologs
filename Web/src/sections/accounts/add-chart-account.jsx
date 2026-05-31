/* eslint-disable import/no-duplicates */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
  Stack,
  Drawer,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';
import { getHierarchyChart, addAccount, updateAccount } from 'src/actions/accounts/accountActions';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'src/components/snackbar';

import { Iconify } from 'src/components/iconify';

// Hierarchical account types
const accountHierarchy = [
  {
    label: 'Assets',
    children: [
      {
        label: 'Current Assets',
        children: [
          { label: 'Cash on Hand' },
          {
            label: 'Bank Accounts',
            children: [
              { label: 'Bank ADCB' },
              { label: 'Emirates NBD Bank' },
              { label: 'Abu Dhabi Islamic Bank' },
            ],
          },
          { label: 'Petty Cash' },
          { label: 'Accounts Receivable', children: [{ label: 'Client' }] },
          { label: 'Inventory' },
          { label: 'Prepaid Expenses' },
          { label: 'Other Current Assets' },
        ],
      },
      {
        label: 'Fixed Assets',
        children: [
          { label: 'Land & Buildings' },
          { label: 'Office Equipment & Furniture' },
          { label: 'Computers & IT Equipment' },
          { label: 'Vehicles' },
          { label: 'Leasehold Improvements' },
          { label: 'Accumulated Depreciation (contra account)' },
        ],
      },
      {
        label: 'Intangible Assets',
        children: [
          { label: 'Patents, Licenses & Software' },
          { label: 'Goodwill' },
          { label: 'Intangibles' },
        ],
      },
    ],
  },
  {
    label: 'Liabilities',
    children: [
      {
        label: 'Current Liabilities',
        children: [
          { label: 'Accounts Payable', children: [{ label: 'Vendor' }] },
          { label: 'Accrued Expenses' },
          { label: 'Short-Term Loans / Credit Lines' },
          { label: 'Taxes Payable' },
          { label: 'Payroll Liabilities' },
          { label: 'Customer Advances (Unearned Revenue)' },
          { label: 'Other Current Liabilities' },
        ],
      },
      {
        label: 'Long-Term Liabilities',
        children: [
          { label: 'Long-Term Loans' },
          { label: 'Lease Obligations' },
          { label: 'Other Long-Term Liabilities' },
        ],
      },
    ],
  },
  {
    label: 'Equity',
    children: [
      { label: 'Owner’s Capital / Share Capital' },
      { label: 'Retained Earnings' },
      { label: 'Current Year Profit / Loss' },
      { label: 'Partner’s Equity (if applicable)' },
      { label: 'Drawings / Dividends' },
    ],
  },
  {
    label: 'Revenue',
    children: [
      {
        label: 'Sales / Service Revenue',
        children: [
          { label: 'Product Sales' },
          { label: 'Service Income' },
          { label: 'Other Income (e.g., rental, commissions)' },
          { label: 'Discounts & Returns (contra revenue)' },
        ],
      },
    ],
  },
  {
    label: 'Cost of Goods Sold (COGS)',
    children: [
      { label: 'Raw Materials / Purchases (Choose project)' },
      {
        label: 'Direct Project Execution cost',
        children: [
          { label: 'Project Direct Cost – A Project' },
          { label: 'Project Direct Cost – A Project' },
        ],
      },
      { label: 'Manufacturing / Production Costs' },
      { label: 'Freight & Shipping (Direct)' },
      { label: 'Other Direct Costs' },
    ],
  },
  {
    label: 'Operating Expenses',
    children: [
      {
        label: 'General & Administrative',
        children: [
          { label: 'Salaries & Wages' },
          { label: 'Employee Benefits' },
          { label: 'Rent & Utilities' },
          { label: 'Office Supplies' },
          { label: 'Electricity and Water' },
          { label: 'Professional Fees (Legal, Audit, Consultancy)' },
          { label: 'Insurance' },
          { label: 'Repairs & Maintenance' },
          { label: 'Depreciation & Amortization' },
        ],
      },
      {
        label: 'Selling & Marketing',
        children: [
          { label: 'Advertising & Promotions' },
          { label: 'Travel & Entertainment' },
          { label: 'Sales Commissions' },
          { label: 'Marketing Expenses' },
        ],
      },
      {
        label: 'Technology & Operations',
        children: [
          { label: 'IT & Software Subscriptions' },
          { label: 'Communication Expenses (Phone, Internet)' },
          { label: 'Training & Development' },
        ],
      },
    ],
  },
];

// Recursive function to get children by label

// const getChildren = (options, name) => {
//   // eslint-disable-next-line no-restricted-syntax
//   for (const option of options) {
//     if (option.name === name) {
//       return option.children || [];
//     }
//     if (option.children) {
//       const result = getChildren(option.children, name);
//       if (result.length) return result;
//     }
//   }
//   return [];
// };

export function AddChartAccount({
  openDetails,
  onCloseDetails,
  anchor = 'right',
  mutate,
  editData,
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, i18n } = useTranslation('dashboard/accounts');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { allCategories, mutate: mutateChartHierarchy } = getHierarchyChart();
  const [hierarchy, setHierarchy] = useState(allCategories?.categories);
  console.log('this is all categories', allCategories?.categories);
  const [openDialogLevel2, setOpenDialogLevel2] = useState(false);
  const [openDialogLevel3, setOpenDialogLevel3] = useState(false);
  const [openDialogLevel4, setOpenDialogLevel4] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getChildren = (options, name) => {
    for (const option of options || []) {
      if (option.name === name) {
        const children = option.children || [];

        if (editData?.id) {
          return children.filter((child) => child.children && child.children.length > 0);
        } else {
          return children.filter((child) => child.isSubcategory !== false);
        }
      }

      if (option.children) {
        const result = getChildren(option.children, name);
        if (result.length) return result;
      }
    }
    return [];
  };
  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      name: '',
      code: '',

      accountType: '',
      accountCategory: '',
      parentAccountId: '',
    },
  });
  useEffect(() => {
    if (editData && openDetails) {
      const parts = editData?.fullPath?.split('/')?.map((p) => p.trim()) || [];

      const level1 = parts[0] || '';
      const level2 = parts[1] || '';
      const level3 = parts[2] || '';
      const level4 = parts[3] || '';

      reset({
        name: editData?.name || '',
        level1,
        level2,
        level3,
        level4,
      });
    }
  }, [editData, openDetails, reset]);
  const watchLevel1 = watch('level1');
  const watchLevel2 = watch('level2');
  const watchLevel3 = watch('level3');
  const watchLevel4 = watch('level4');

  const level2Options = getChildren(allCategories?.categories, watchLevel1);
  const level3Options = getChildren(level2Options, watchLevel2);
  const level4Options = getChildren(level3Options, watchLevel3);
  const isLastLevelSelected =
    (watchLevel1 && level2Options.length === 0) ||
    (watchLevel2 && level3Options.length === 0) ||
    (watchLevel3 && level4Options.length === 0) ||
    (watchLevel4 && true);
  // eslint-disable-next-line no-shadow
  const addOption = (parentLabel, newLabel) => {
    setHierarchy((prev) => {
      const clone = [...prev];

      const findAndAdd = (nodes) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const node of nodes) {
          if (node.name === parentLabel) {
            if (!node.children) node.children = [];
            // Prevent duplicate
            if (!node.children.some((c) => c.name === newLabel)) {
              node.children.push({ name: newLabel });
            }
            return true;
          }
          if (node.children && findAndAdd(node.children)) return true;
        }
        return false;
      };

      findAndAdd(clone);
      return clone;
    });
  };
  const findNodeByName = (nodes, name) => {
    for (const node of nodes) {
      if (node.name === name) return node;
      if (node.children) {
        const found = findNodeByName(node.children, name);
        if (found) return found;
      }
    }
    return null;
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    let parentId;
    let accountType;
    let accountCategory;

    if (editData?.id) {
      parentId = editData.parentAccountId;
      accountType = editData.accountType;
      accountCategory = editData.accountCategory;
    } else {
      const lastSelected = watchLevel4 || watchLevel3 || watchLevel2 || watchLevel1;

      const selectedNode = findNodeByName(allCategories?.categories, lastSelected);

      parentId = selectedNode?.id;
      accountType = selectedNode?.accountType;
      accountCategory = selectedNode?.accountCategory;
    }

    const payload = {
      name: data?.name,
      accountType,
      accountCategory,
      parentAccountId: parentId,
    };
    try {
      let response;
      if (editData?.id) {
        response = await updateAccount(payload, editData.id);
      } else {
        response = await addAccount(payload);
      }
      if (response.success) {
        toast.success(
          editData?.id ? 'Account updated successfully' : 'Account created successfully'
        );
        await mutate();
        await mutateChartHierarchy();
        reset();
        onCloseDetails();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Account action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddSubCategory = async (parentName, levelField, closeDialog) => {
    if (!newLabel.trim()) return;

    const parentNode = findNodeByName(allCategories?.categories, parentName);

    const payload = {
      name: newLabel,
      accountType: parentNode?.accountType,
      accountCategory: parentNode?.accountCategory,
      parentAccountId: parentNode?.id,
      isSubcategory: true,
    };

    try {
      const response = await addAccount(payload);
      if (response.success) {
        toast.success('Subcategory created successfully');
        await mutateChartHierarchy();
        await mutate();
        addOption(parentName, newLabel);
        setValue(levelField, newLabel);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
    }

    setNewLabel('');
    closeDialog(false);
  };
  const handleClose = () => {
    reset();
    onCloseDetails();
  };

  return (
    <Drawer
      open={openDetails}
      onClose={handleClose}
      anchor={anchor}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480, md: '70%', lg: '70%', xl: '70%' },
          boxShadow: '-1px 0px 8px rgb(142 142 142 / 50%)',
          p: 3,
        },
      }}
    >
      <Typography variant="h6" mb={3}>
        {editData?.id ? t('accounts.edit_account') : t('accounts.create_a_new_account')}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Level 1 */}
          <FormControl fullWidth>
            <InputLabel>{t('accounts.main_category')}</InputLabel>
            <Controller
              name="level1"
              control={control}
              render={({ field }) => (
                <Select {...field} label={t('accounts.main_category')}>
                  {allCategories?.categories?.map((opt) => (
                    <MenuItem key={opt.name} value={opt.name}>
                      {opt.name} ({opt.code})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          {/* Level 2 */}
          {level2Options.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>{t('accounts.sub_category')}</InputLabel>
              <Controller
                name="level2"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('accounts.sub_category')}
                    value={field.value || ''} // ✅ ensure controlled value
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setOpenDialogLevel2(true);
                      } else {
                        field.onChange(e.target.value);
                      }
                    }}
                  >
                    <MenuItem value="__add_new__">
                      <Iconify
                        icon="mingcute:add-line"
                        width={13}
                        height={13}
                        sx={{ mr: 1 }}
                        color="#006A67"
                      />
                      {t('accounts.add_new')}
                    </MenuItem>
                    {level2Options.map((opt) => (
                      <MenuItem key={opt.name} value={opt.name}>
                        {opt.name} ({opt.code})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}

          <Dialog
            open={openDialogLevel2}
            onClose={() => setOpenDialogLevel2(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{t('accounts.add_new_sub')}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={t('accounts.sub_category_name')}
                type="text"
                fullWidth
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialogLevel2(false)} color="inherit">
                {t('accounts.cancel')}
              </Button>
              <Button
                onClick={() => handleAddSubCategory(watchLevel1, 'level2', setOpenDialogLevel2)}
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: '#006A67' }}
              >
                {t('accounts.save')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Level 3 */}
          {level3Options.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>{t('accounts.sub_category2')}</InputLabel>

              <Controller
                name="level3"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('accounts.sub_category2')}
                    value={field.value || ''}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setOpenDialogLevel3(true);
                      } else {
                        field.onChange(e.target.value);
                      }
                    }}
                  >
                    <MenuItem value="__add_new__">
                      <Iconify
                        icon="mingcute:add-line"
                        width={13}
                        height={13}
                        sx={{ mr: 1 }}
                        color="#006A67"
                      />
                      {t('accounts.add_new')}
                    </MenuItem>
                    {level3Options.map((opt) => (
                      <MenuItem key={opt.name} value={opt.name}>
                        {opt.name} ({opt.code})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}

          <Dialog
            open={openDialogLevel3}
            onClose={() => setOpenDialogLevel3(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Add New Subcategory 2</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Subcategory 2 Name"
                type="text"
                fullWidth
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialogLevel3(false)} color="inherit">
                {t('accounts.cancel')}
              </Button>
              <Button
                onClick={() => handleAddSubCategory(watchLevel2, 'level3', setOpenDialogLevel3)}
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: '#006A67' }}
              >
                {t('accounts.save')}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Level 4 */}
          {level4Options.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>{t('accounts.sub_category3')}</InputLabel>
              <Controller
                name="level4"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('accounts.sub_category3')}
                    value={field.value || ''}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setOpenDialogLevel4(true);
                      } else {
                        field.onChange(e.target.value);
                      }
                    }}
                  >
                    <MenuItem value="__add_new__">
                      <Iconify
                        icon="mingcute:add-line"
                        width={13}
                        height={13}
                        sx={{ mr: 1 }}
                        color="#006A67"
                      />
                      {t('accounts.add_new')}
                    </MenuItem>
                    {level4Options.map((opt) => (
                      <MenuItem key={opt.name} value={opt.name}>
                        {opt.name} ({opt.code})
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}
          <Dialog
            open={openDialogLevel4}
            onClose={() => setOpenDialogLevel4(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Add New Subcategory 3</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Subcategory 3 Name"
                type="text"
                fullWidth
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialogLevel4(false)} color="inherit">
                {t('accounts.cancel')}
              </Button>
              <Button
                onClick={() => handleAddSubCategory(watchLevel3, 'level4', setOpenDialogLevel4)}
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: '#006A67' }}
              >
                {t('accounts.save')}
              </Button>
            </DialogActions>
          </Dialog>
          {/* First Row: Account Name + Description */}
          {isLastLevelSelected && (
            <Stack direction="row" spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField label={t('accounts.accountname')} fullWidth {...field} />
                )}
              />
              {/* <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField label={t('accounts.description')} fullWidth {...field} />
                )}
              /> */}
            </Stack>
          )}

          {/* Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose}>
              {t('accounts.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                textTransform: 'none',
                padding: '6px 12px',
                bgcolor: isSubmitting ? 'grey.500' : '#006A67',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
              ) : (
                t('accounts.save')
              )}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Drawer>
  );
}
