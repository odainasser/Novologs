'use client';

import { useState } from 'react';
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
  getPurchaseOrderType,
  addPurchaseOderType,
  updatePurchaseOrderType,
  deletePurchaseOrderType,
} from 'src/actions/purchase/purchaseActions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';

export function PurchaseOrderTypeView() {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const { orderTypeList, orderTypeListLoading, orderTypeListError, orderTypeListEmpty, mutate } =
    getPurchaseOrderType();

  const [newItem, setNewItem] = useState('');
  const [newItemAr, setNewItemAr] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [openItemConfirmDialog, setOpenItemConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleOpenItemDialog = (item) => {
    setItemToDelete(item);
    setOpenItemConfirmDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemConfirmDialog(false);
    setItemToDelete(null);
  };

  const handleAddItem = async () => {
    if (newItem.trim()) {
      const payload = {
        name: {
          value: newItem,
          localizedStrings: newItemAr
            ? [
                {
                  language: 'ar',
                  value: newItemAr,
                },
              ]
            : undefined,
        },
      };
      console.log('this is the payload', payload);

      try {
        const response = await addPurchaseOderType(payload);
        console.log('this is the response', response);
        if (response.success) {
          await mutate();
          toast.success('Order Type added successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add order type failed:', error);
      }

      setNewItem('');
      setNewItemAr('');
    }
  };

  const handleRemoveItem = async (itemToRemove) => {
    if (itemToRemove?.id) {
      try {
        const response = await deletePurchaseOrderType(itemToRemove.id);
        if (response.success) {
          await mutate();
          toast.success('Order Type deleted successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setNewItem(item.name.value);
    setNewItemAr(item?.name.localizedStrings[0]?.value);
  };

  const handleUpdateItem = async () => {
    if (!editingItemId) return;
    const item = orderTypeList.orderType.find((c) => c.id === editingItemId);
    if (!item) return;
    if (newItem.trim() && editingItemId) {
      const payload = {
        id: editingItemId,
        name: {
          id: item.name.id,
          value: newItem,
          localizedStrings: newItemAr
            ? [
                {
                  id: item?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newItemAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updatePurchaseOrderType(payload);
        if (response.success) {
          await mutate();
          toast.success('Order Type updated successfully');
          setEditingItemId(null);
          setNewItem('');
          setNewItemAr('');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Update order type failed:', error);
      }
    }
  };
  if (orderTypeListLoading)
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
  if (orderTypeListError) {
    return <ErrorView errorCode={orderTypeListError} />;
  }

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {orderTypeList.orderType.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {editingItemId === item.id ? (
                      <Stack spacing={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <TextField
                            fullWidth
                            size="small"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateItem();
                              }
                            }}
                            autoFocus
                          />

                          <TextField
                            fullWidth
                            size="small"
                            value={newItemAr}
                            onChange={(e) => setNewItemAr(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateItem();
                              }
                            }}
                          />
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1} sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name.value}
                          {item?.name.localizedStrings[0]?.value
                            ? ` | ${item?.name.localizedStrings[0]?.value}`
                            : ''}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      flexShrink: 0,
                      alignSelf: editingItemId === item.id ? 'flex-start' : 'center',
                    }}
                  >
                    {editingItemId === item.id ? (
                      <Tooltip title={t('tasks.save')}>
                        <IconButton onClick={handleUpdateItem} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('tasks.category-toast.edit_category')}>
                        <IconButton onClick={() => handleEditItem(item)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {editingItemId !== item.id && (
                      <Tooltip title={t('tasks.category-toast.delete_category')}>
                        <IconButton
                          onClick={() => handleOpenItemDialog(item)}
                          size="small"
                          color="error"
                        >
                          <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2} alignItems="center">
          <>
            <TextField
              fullWidth
              size="small"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="New Order Type"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingItemId ? handleUpdateItem() : handleAddItem();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newItemAr}
              onChange={(e) => setNewItemAr(e.target.value)}
              placeholder="New Order Type in Arabic"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingItemId ? handleUpdateItem() : handleAddItem();
                }
              }}
            />
          </>
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
            content="Are you sure you want to delete this Order Type?"
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveItem(itemToDelete);
                  handleCloseItemDialog();
                }}
              >
                {t('tasks.confirm.delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
