'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { TASK_PRIORITIES } from 'src/sections/kanban/kanban-mock-data';
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
  getPriorities,
  addPriority,
  updatePriority,
  deletePriority,
} from 'src/actions/task/taskActions';

export function KanbanPrioritiesView() {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const { priorityList, priorityListEmpty, mutate } = getPriorities();

  const [newPriority, setNewPriority] = useState('');
  const [newPriorityAr, setNewPriorityAr] = useState('');
  const [editingPriorityId, setEditingPriorityId] = useState(null);
  const [openPriorityConfirmDialog, setOpenPriorityConfirmDialog] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState(null);

  const handleOpenPriorityDialog = (priority) => {
    setPriorityToDelete(priority);
    setOpenPriorityConfirmDialog(true);
  };

  const handleClosePriorityDialog = () => {
    setOpenPriorityConfirmDialog(false);
    setPriorityToDelete(null);
  };

  const handleAddPriority = async () => {
    if (newPriority.trim()) {
      const payload = {
        name: {
          value: newPriority,
          localizedStrings: newPriorityAr
            ? [
                {
                  language: 'ar',
                  value: newPriorityAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addPriority(payload);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.toast.task_priority_added'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add priority failed:', error);
        toast.error('An unexpected error occurred');
      }

      setNewPriority('');
      setNewPriorityAr('');
    }
  };

  const handleRemovePriority = async (priorityToRemove) => {
    if (priorityToRemove?.id) {
      try {
        const response = await deletePriority(priorityToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.toast.task_priority_deleted'));
        } else {
          toast.error(response.error || 'Failed to delete priority');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleEditPriority = (priority) => {
    setEditingPriorityId(priority.id);
    setNewPriority(priority.name.value);
    setNewPriorityAr(priority?.name.localizedStrings[0]?.value);
  };

  const handleUpdatePriority = async () => {
    if (!editingPriorityId) return;
    const priority = priorityList.priorities.find((p) => p.id === editingPriorityId);
    if (!priority) return;
    if (newPriority.trim() && editingPriorityId) {
      const payload = {
        id: editingPriorityId,
        name: {
          id: priority.name.id,
          value: newPriority,
          localizedStrings: newPriorityAr
            ? [
                {
                  id: priority?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newPriorityAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updatePriority(payload);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.toast.task_priority_updated'));

          setEditingPriorityId(null);
          setNewPriority('');
          setNewPriorityAr('');
        } else {
          toast.error(response.error || 'Failed to update priority');
        }
      } catch (error) {
        console.error('Update priority failed:', error);
        toast.error(t('tasks.errors.unexpected_error'));
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {priorityList.priorities.map((priority) => (
            <Grid item key={priority.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingPriorityId === priority.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdatePriority();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newPriorityAr}
                        onChange={(e) => setNewPriorityAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdatePriority();
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
                      {priority.name.value}{' '}
                      {priority?.name.localizedStrings[0]?.value
                        ? ` | ${priority?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}

                  {editingPriorityId === priority.id ? (
                    <Tooltip title={t('tasks.save')}>
                      <IconButton onClick={handleUpdatePriority} size="small" color="primary">
                        <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('tasks.edit_priority')}>
                      <IconButton onClick={() => handleEditPriority(priority)} size="small">
                        <Iconify icon="eva:edit-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title={t('tasks.delete_priority')}>
                    <IconButton
                      onClick={() => handleOpenPriorityDialog(priority)}
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
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              placeholder={t('tasks.new_priority')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingPriorityId ? handleUpdatePriority() : handleAddPriority();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newPriorityAr}
              onChange={(e) => setNewPriorityAr(e.target.value)}
              placeholder={t('tasks.arabic_priority')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingPriorityId ? handleUpdatePriority() : handleAddPriority();
                }
              }}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingPriorityId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            onClick={editingPriorityId ? handleUpdatePriority : handleAddPriority}
            variant="contained"
            sx={{ px: 4, bgcolor: '#006A67' }}
          >
            {editingPriorityId ? t('tasks.todo.update') : t('tasks.todo.add')}
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openPriorityConfirmDialog}
            onClose={handleClosePriorityDialog}
            title={t('tasks.delete')}
            content={t('tasks.priority_delete')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemovePriority(priorityToDelete);
                  handleClosePriorityDialog();
                }}
              >
                {t('tasks.delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
