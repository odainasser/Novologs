'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import {
  deleteDefaultAccount,
  addDefaultAccount,
  getDefaultAccounts,
} from 'src/actions/purchase/purchaseActions';
import { getAccounts } from 'src/actions/accounts/accountActions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import Autocomplete from '@mui/material/Autocomplete';
import { AccountTreeSelector } from '../account-tree-option-multi-selector';

import { Box, FormControl, Checkbox, Chip } from '@mui/material';

export function DefaultAccountView({ isDebit }) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

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
  const {
    defaultAccountList,
    defaultAccountListLoading,
    defaultAccountListError,
    defaultAccountListEmpty,
    mutate: defaultAccountMutate,
  } = getDefaultAccounts();
  console.log('this is the default account', defaultAccountList?.defaultAccounts);
  const [defaultAccounts, setDefaultAccounts] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [openItemConfirmDialog, setOpenItemConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState([]);

  useEffect(() => {
    const mappedAccounts = (defaultAccountList?.defaultAccounts || [])
      .filter((item) =>
        isDebit ? item.invoiceAccountRole === 'Debit' : item.invoiceAccountRole === 'Credit'
      )
      .map((item) => ({
        id: item.id,
        accountId: item.accountId,
        code: item.accountCode,
        name: item.accountName,
        fullPath: item.accountName,
      }));
    setDefaultAccounts(mappedAccounts.filter((item) => item.accountId));
  }, [defaultAccountList, isDebit]);

  const handleAddItem = async () => {
    if (!selectedAccount.length) {
      toast.error('Please select at least one account');
      return;
    }

    const selectedAccountObjects = (accountList?.accounts || []).filter((acc) =>
      selectedAccount.includes(acc.id)
    );

    if (!selectedAccountObjects.length) {
      toast.error('Selected account not found');
      return;
    }

    const payload = {
      invoiceCategory: isDebit ? 0 : 1,
      invoiceAccountRole: isDebit ? 0 : 1,
      accountId: selectedAccountObjects[0].id,
    };

    console.log('this is the payload', payload);

    try {
      const response = await addDefaultAccount(payload);
      console.log('this is the response', response);

      if (response.success) {
        await defaultAccountMutate();

        // setDefaultAccounts((prev) => {
        //   const existingIds = prev.map((item) => item.id);

        //   const newItems = selectedAccountObjects
        //     .filter((item) => !existingIds.includes(item.id))
        //     .map((item) => ({
        //       id: item.id,
        //       code: item.code,
        //       name: item.name,
        //       fullPath: item.fullPath,
        //       level: item.level,
        //     }));

        //   return [...prev, ...newItems];
        // });

        setSelectedAccount([]);
        toast.success('Account added successfully');
      } else {
        toast.error(response.error || 'Failed to add account');
      }
    } catch (error) {
      console.error('Add default account failed:', error);
      toast.error('Something went wrong');
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setSelectedAccount([item.id]);
  };

  const handleUpdateItem = () => {
    if (!editingItemId || !selectedAccount.length) return;

    const selected = (accountList?.accounts || []).find((acc) => acc.id === selectedAccount[0]);

    if (!selected) return;

    setDefaultAccounts((prev) =>
      prev.map((item) =>
        item.id === editingItemId
          ? {
              id: selected.id,
              code: selected.code,
              name: selected.name,
              fullPath: selected.fullPath,
              level: selected.level,
            }
          : item
      )
    );

    setEditingItemId(null);
    setSelectedAccount([]);
    toast.success('Account updated successfully');
  };

  const handleOpenItemDialog = (item) => {
    setItemToDelete(item);
    setOpenItemConfirmDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemConfirmDialog(false);
    setItemToDelete(null);
  };

  const handleRemoveItem = async () => {
    if (!itemToDelete?.id) return;

    if (itemToDelete?.id) {
      try {
        const response = await deleteDefaultAccount(itemToDelete.id);
        if (response.success) {
          await defaultAccountMutate();
          setDefaultAccounts((prev) => prev.filter((item) => item.id !== itemToDelete.id));
          setOpenItemConfirmDialog(false);
          setItemToDelete(null);

          if (editingItemId === itemToDelete.id) {
            setEditingItemId(null);
            setSelectedAccount([]);
          }

          toast.success('Account deleted successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };
  if (defaultAccountListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  if (defaultAccountListError) {
    return <ErrorView errorCode={defaultAccountListError} />;
  }

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {defaultAccounts.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.5}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {item.code}
                      </Box>{' '}
                      :{' '}
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {item.name}
                      </Box>
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.fullPath}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                    {/* <Tooltip title={t('tasks.category-toast.edit_category')}>
                      <IconButton onClick={() => handleEditItem(item)} size="small">
                        <Iconify icon="eva:edit-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip> */}

                    <Tooltip title={t('tasks.category-toast.delete_category')}>
                      <IconButton
                        onClick={() => handleOpenItemDialog(item)}
                        size="small"
                        color="error"
                      >
                        <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl fullWidth size="small">
            <AccountTreeSelector
              multiple
              showCheckbox
              value={selectedAccount || []}
              onChange={setSelectedAccount}
              label="Select Account"
              placeholder="Search here..."
            />
          </FormControl>

          <Button
            startIcon={
              <Iconify
                icon={editingItemId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            onClick={editingItemId ? handleUpdateItem : handleAddItem}
            variant="contained"
            sx={{ px: 4, bgcolor: '#006A67' }}
          >
            {editingItemId ? t('tasks.todo.update') : t('tasks.todo.add')}
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openItemConfirmDialog}
            onClose={handleCloseItemDialog}
            title={t('tasks.confirm.delete')}
            content="Are you sure you want to delete this account?"
            action={
              <Button variant="contained" color="error" onClick={handleRemoveItem}>
                {t('tasks.confirm.delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
