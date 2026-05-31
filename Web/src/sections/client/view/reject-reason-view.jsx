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
  getRejectionReasons,
  addRejectionReason,
  updateRejectionReason,
  deleteRejectionReason,
} from 'src/actions/client/clientActions';

export function RejectReasonView() {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const { reasonsList, reasonsListEmpty, mutate } = getRejectionReasons();

  const [newReason, setNewReason] = useState('');
  const [newReasonAr, setNewReasonAr] = useState('');
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [openReasonConfirmDialog, setOpenReasonConfirmDialog] = useState(false);
  const [reasonsToDelete, setReasonToDelete] = useState(null);

  const handleOpenReasonDialog = (reasons) => {
    setReasonToDelete(reasons);
    setOpenReasonConfirmDialog(true);
  };

  const handleCloseReasonDialog = () => {
    setOpenReasonConfirmDialog(false);
    setReasonToDelete(null);
  };

  const handleAddReason = async () => {
    if (newReason.trim()) {
      const payload = {
        name: {
          value: newReason,
          localizedStrings: newReasonAr
            ? [
                {
                  language: 'ar',
                  value: newReasonAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addRejectionReason(payload);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.reject_reason'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add reasons failed:', error);
      }

      setNewReason('');
      setNewReasonAr('');
    }
  };

  const handleRemoveReason = async (reasonsToRemove) => {
    if (reasonsToRemove?.id) {
      try {
        const response = await deleteRejectionReason(reasonsToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.reject_reason_delete'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditReason = (reasons) => {
    setEditingReasonId(reasons.id);
    setNewReason(reasons.name.value);
    setNewReasonAr(reasons?.name.localizedStrings[0]?.value);
  };

  const handleUpdateReason = async () => {
    if (!editingReasonId) return;
    const reasons = reasonsList.reasons.find((s) => s.id === editingReasonId);
    if (!reasons) return;
    if (newReason.trim() && editingReasonId) {
      const payload = {
        id: editingReasonId,
        name: {
          id: reasons.name.id,
          value: newReason,
          localizedStrings: newReasonAr
            ? [
                {
                  id: reasons?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newReasonAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateRejectionReason(payload);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.reject_reason_update'));
          setEditingReasonId(null);
          setNewReason('');
          setNewReasonAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update reasons failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {reasonsList.reasons.map((reasons) => (
            <Grid item key={reasons.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingReasonId === reasons.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateReason();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newReasonAr}
                        onChange={(e) => setNewReasonAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateReason();
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
                      {reasons.name.value}{' '}
                      {reasons?.name.localizedStrings[0]?.value
                        ? ` | ${reasons?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingReasonId === reasons.id ? (
                      <Tooltip title={t('clients.buttons.save')}>
                        <IconButton onClick={handleUpdateReason} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('clients.buttons.edit')}>
                        <IconButton onClick={() => handleEditReason(reasons)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t('clients.buttons.delete')}>
                    <IconButton
                      onClick={() => handleOpenReasonDialog(reasons)}
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
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder={t('leaddetails.common.placeholder_reject')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingReasonId ? handleUpdateReason() : handleAddReason();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newReasonAr}
              onChange={(e) => setNewReasonAr(e.target.value)}
              placeholder={t('clients.labels.reject_reason_arabic')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingReasonId ? handleUpdateReason() : handleAddReason();
                }
              }}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingReasonId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
                }}
              />
            }
            onClick={editingReasonId ? handleUpdateReason : handleAddReason}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingReasonId ? t('clients.buttons.save') : t('clients.buttons.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openReasonConfirmDialog}
            onClose={handleCloseReasonDialog}
            title={t('leaddetails.confirm.confirm_title')}
            content={t('leaddetails.confirm.confirm_reason')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveReason(reasonsToDelete);
                  handleCloseReasonDialog();
                }}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              >
                {t('leaddetails.confirm.confirm_title')}
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
