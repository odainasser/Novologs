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
  getSources,
  addSource,
  updateSource,
  deleteSource,
} from 'src/actions/client/clientActions';

export function LeadSourceView() {
  const { t } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const { sourceList, sourceListEmpty, mutate } = getSources();

  const [newSource, setNewSource] = useState('');
  const [newSourceAr, setNewSourceAr] = useState('');
  const [editingSourceId, setEditingSourceId] = useState(null);
  const [openSourceConfirmDialog, setOpenSourceConfirmDialog] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);

  const handleOpenSourceDialog = (source) => {
    setSourceToDelete(source);
    setOpenSourceConfirmDialog(true);
  };

  const handleCloseSourceDialog = () => {
    setOpenSourceConfirmDialog(false);
    setSourceToDelete(null);
  };

  const handleAddSource = async () => {
    if (newSource.trim()) {
      const payload = {
        name: {
          value: newSource,
          localizedStrings: newSourceAr
            ? [
                {
                  language: 'ar',
                  value: newSourceAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addSource(payload);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.lead_source'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add source failed:', error);
      }

      setNewSource('');
      setNewSourceAr('');
    }
  };

  const handleRemoveSource = async (sourceToRemove) => {
    if (sourceToRemove?.id) {
      try {
        const response = await deleteSource(sourceToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.lead_source_delete'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditSource = (source) => {
    setEditingSourceId(source.id);
    setNewSource(source.name.value);
    setNewSourceAr(source?.name.localizedStrings[0]?.value);
  };

  const handleUpdateSource = async () => {
    if (!editingSourceId) return;
    const source = sourceList.sources.find((s) => s.id === editingSourceId);
    if (!source) return;
    if (newSource.trim() && editingSourceId) {
      const payload = {
        id: editingSourceId,
        name: {
          id: source.name.id,
          value: newSource,
          localizedStrings: newSourceAr
            ? [
                {
                  id: source?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newSourceAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateSource(payload);
        if (response.success) {
          await mutate();
          toast.success(t('leaddetails.toast.lead_source_update'));
          setEditingSourceId(null);
          setNewSource('');
          setNewSourceAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update source failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {sourceList.sources.map((source) => (
            <Grid item key={source.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingSourceId === source.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateSource();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newSourceAr}
                        onChange={(e) => setNewSourceAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateSource();
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
                      {source.name.value}{' '}
                      {source?.name.localizedStrings[0]?.value
                        ? ` | ${source?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingSourceId === source.id ? (
                      <Tooltip title={t('clients.buttons.save')}>
                        <IconButton onClick={handleUpdateSource} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('clients.buttons.edit')}>
                        <IconButton onClick={() => handleEditSource(source)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t('clients.buttons.delete')}>
                    <IconButton
                      onClick={() => handleOpenSourceDialog(source)}
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
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder={t('leaddetails.common.lead_source')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingSourceId ? handleUpdateSource() : handleAddSource();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newSourceAr}
              onChange={(e) => setNewSourceAr(e.target.value)}
              placeholder={t('leaddetails.common.lead_source_arabic')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingSourceId ? handleUpdateSource() : handleAddSource();
                }
              }}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingSourceId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
                }}
              />
            }
            onClick={editingSourceId ? handleUpdateSource : handleAddSource}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingSourceId ? t('clients.buttons.save') : t('clients.buttons.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openSourceConfirmDialog}
            onClose={handleCloseSourceDialog}
            title={t('clients.buttons.delete')}
            content={t('leaddetails.toast.lead_delete')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveSource(sourceToDelete);
                  handleCloseSourceDialog();
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
