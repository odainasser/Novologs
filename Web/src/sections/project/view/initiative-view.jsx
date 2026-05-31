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
import { getInitiatives, addInitiative, updateInitiative, deleteInitiative } from 'src/actions/project/projectActions';

export function InitiativeView() {
  const { t ,i18n} = useTranslation('dashboard/projects');
  const { initiativeList, initiativeListEmpty, mutate } = getInitiatives();

  const [newInitiative, setNewInitiative] = useState('');
  const [newInitiativeAr, setNewInitiativeAr] = useState('');
  const [editingInitiativeId, setEditingInitiativeId] = useState(null);
  const [openInitiativeConfirmDialog, setOpenInitiativeConfirmDialog] = useState(false);
  const [initiativeToDelete, setInitiativeToDelete] = useState(null);

  const handleOpenInitiativeDialog = (initiative) => {
    setInitiativeToDelete(initiative);
    setOpenInitiativeConfirmDialog(true);
  };

  const handleCloseInitiativeDialog = () => {
    setOpenInitiativeConfirmDialog(false);
    setInitiativeToDelete(null);
  };

  const handleAddInitiative = async () => {
    if (newInitiative.trim()) {
      const payload = {
        name: {
          value: newInitiative,
          localizedStrings: newInitiativeAr
            ? [
                {
                  language: 'ar',
                  value: newInitiativeAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addInitiative(payload);
        if (response.success) {
          await mutate();
          toast.success(t('projects.project_settings.tabs.project_initiative_added'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add initiative failed:', error);
      }

      setNewInitiative('');
      setNewInitiativeAr('');
    }
  };

  const handleRemoveInitiative = async (initiativeToRemove) => {
    if (initiativeToRemove?.id) {
      try {
        const response = await deleteInitiative(initiativeToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('projects.project_settings.tabs.project_initiative_deleted'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditInitiative = (initiative) => {
    setEditingInitiativeId(initiative.id);
    setNewInitiative(initiative.name.value);
    setNewInitiativeAr(initiative?.name.localizedStrings[0]?.value);
  };

  const handleUpdateInitiative = async () => {
    if (!editingInitiativeId) return;
    const initiative = initiativeList.initiatives.find((s) => s.id === editingInitiativeId);
    if (!initiative) return;
    if (newInitiative.trim() && editingInitiativeId) {
      const payload = {
        id: editingInitiativeId,
        name: {
          id: initiative.name.id,
          value: newInitiative,
          localizedStrings: newInitiativeAr
            ? [
                {
                  id: initiative?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newInitiativeAr,
                },
              ]
            : [],
        },
      };


      try {
        const response = await updateInitiative(payload);
        if (response.success) {
          await mutate();
          toast.success(t('projects.project_settings.tabs.project_initiative_updated'));
          setEditingInitiativeId(null);
          setNewInitiative('');
          setNewInitiativeAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update initiative failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {initiativeList.initiatives.map((initiative) => (
            <Grid item key={initiative.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingInitiativeId === initiative.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newInitiative}
                        onChange={(e) => setNewInitiative(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateInitiative();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newInitiativeAr}
                        onChange={(e) => setNewInitiativeAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateInitiative();
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
                      {initiative.name.value}{' '}
                      {initiative?.name.localizedStrings[0]?.value
                        ? ` | ${initiative?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingInitiativeId === initiative.id ? (
                      <Tooltip title={t("projects.table.save")}>
                        <IconButton onClick={handleUpdateInitiative} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("projects.table.edit")}>
                        <IconButton onClick={() => handleEditInitiative(initiative)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t("projects.table.actions_delete")}>
                    <IconButton
                      onClick={() => handleOpenInitiativeDialog(initiative)}
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
              value={newInitiative}
              onChange={(e) => setNewInitiative(e.target.value)}
              placeholder={t("projects.table.actions_delete")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingInitiativeId ? handleUpdateInitiative() : handleAddInitiative();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newInitiativeAr}
              onChange={(e) => setNewInitiativeAr(e.target.value)}
              placeholder={t("projects.project_settings.tabs.project_initiative_arabic")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingInitiativeId ? handleUpdateInitiative() : handleAddInitiative();
                }
              }}
            />
          </>
          <Button
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={editingInitiativeId ? handleUpdateInitiative : handleAddInitiative}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingInitiativeId ? t('projects.table.save') : t('projects.table.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openInitiativeConfirmDialog}
            onClose={handleCloseInitiativeDialog}
            title={t('projects.table.actions_delete')}
            content={t('projects.project_settings.tabs.project_initiative_confirm')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveInitiative(initiativeToDelete);
                  handleCloseInitiativeDialog();
                }}
              >
              {t('projects.table.actions_delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
