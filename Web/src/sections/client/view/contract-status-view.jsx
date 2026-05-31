'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import {
  getContractStatus,
  addContractStatus,
  updateContractStatus,
  deleteContractStatus,
} from 'src/actions/vendor/vendorActions';

export function ContractStatusView() {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const { contractStatusList, contractStatusListEmpty, mutate } = getContractStatus();

  const [newStatus, setNewStatus] = useState('');
  const [newStatusAr, setNewStatusAr] = useState('');
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);

  const handleOpenStatusDialog = (status) => {
    setStatusToDelete(status);
    setOpenStatusConfirmDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusConfirmDialog(false);
    setStatusToDelete(null);
  };

  const handleAddStatus = async () => {
    if (newStatus.trim()) {
      const payload = {
        name: {
          value: newStatus,
          localizedStrings: newStatusAr
            ? [
                {
                  language: 'ar',
                  value: newStatusAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addContractStatus(payload);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.contract_added'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add status failed:', error);
      }

      setNewStatus('');
      setNewStatusAr('');
    }
  };

  const handleRemoveStatus = async (statusToRemove) => {
    if (statusToRemove?.id) {
      try {
        const response = await deleteContractStatus(statusToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.contract_delete'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditStatus = (status) => {
    setEditingStatusId(status.id);
    setNewStatus(status.name?.value);
    setNewStatusAr(status?.name?.localizedStrings[0]?.value);
  };

  const handleUpdateStatus = async () => {
    if (!editingStatusId) return;
    const status = contractStatusList.status.find((s) => s.id === editingStatusId);
    if (!status) return;
    if (newStatus.trim() && editingStatusId) {
      const payload = {
        id: editingStatusId,
        name: {
          id: status.name.id,
          value: newStatus,
          localizedStrings: newStatusAr
            ? [
                {
                  id: status?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newStatusAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateContractStatus(payload);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.contract_update'));
          setEditingStatusId(null);
          setNewStatus('');
          setNewStatusAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update status failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {contractStatusList.status.map((status) => (
            <Grid item key={status.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingStatusId === status.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateStatus();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newStatusAr}
                        onChange={(e) => setNewStatusAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateStatus();
                          }
                        }}
                        sx={{ ml: 1 }}
                        autoFocus
                      />
                    </>
                  ) : (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        flexGrow: 1,
                        mr: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {status.name.value}{' '}
                      {status?.name?.localizedStrings[0]?.value
                        ? ` | ${status?.name?.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingStatusId === status.id ? (
                      <Tooltip title={t('clients.buttons.save')}>
                        <IconButton onClick={handleUpdateStatus} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('clients.buttons.edit')}>
                        <IconButton onClick={() => handleEditStatus(status)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t('clients.buttons.delete')}>
                    <IconButton
                      onClick={() => handleOpenStatusDialog(status)}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2}>
          <>
            <TextField
              fullWidth
              size="small"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder={t('clients.labels.Contract_status')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingStatusId ? handleUpdateStatus() : handleAddStatus();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newStatusAr}
              onChange={(e) => setNewStatusAr(e.target.value)}
              placeholder={t('clients.labels.contract_status_arabic')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingStatusId ? handleUpdateStatus() : handleAddStatus();
                }
              }}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingStatusId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
                }}
              />
            }
            onClick={editingStatusId ? handleUpdateStatus : handleAddStatus}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingStatusId ? t('clients.buttons.save') : t('clients.buttons.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openStatusConfirmDialog}
            onClose={handleCloseStatusDialog}
            title={t('clients.buttons.delete')}
            content={t('leaddetails.toast.are_sure_delete_contract')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveStatus(statusToDelete);
                  handleCloseStatusDialog();
                }}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              >
                {t('clients.buttons.delete')}
              </Button>
            }
            sx={{
              direction: storedLang === 'ar' ? 'rtl' : 'ltr',
            }}
          />
        </Stack>
      </Stack>
    </>
  );
}
