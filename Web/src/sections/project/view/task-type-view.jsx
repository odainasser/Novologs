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
import { getTaskTypes, addTaskType, updateTaskType, deleteTaskType } from 'src/actions/project/projectActions';

export function TaskTypeView() {
  const {t,i18n}=useTranslation('dashboard/projects')
  const { taskTypeList, taskTypeListEmpty, mutate } = getTaskTypes();

  const [newTaskType, setNewTaskType] = useState('');
  const [newTaskTypeAr, setNewTaskTypeAr] = useState('');
  const [editingTaskTypeId, setEditingTaskTypeId] = useState(null);
  const [openTaskTypeConfirmDialog, setOpenTaskTypeConfirmDialog] = useState(false);
  const [taskTypeToDelete, setTaskTypeToDelete] = useState(null);

  const handleOpenTaskTypeDialog = (taskType) => {
    setTaskTypeToDelete(taskType);
    setOpenTaskTypeConfirmDialog(true);
  };

  const handleCloseTaskTypeDialog = () => {
    setOpenTaskTypeConfirmDialog(false);
    setTaskTypeToDelete(null);
  };

  const handleAddTaskType = async () => {
    if (newTaskType.trim()) {
      const payload = {
        name: {
          value: newTaskType,
          localizedStrings: newTaskTypeAr
            ? [
                {
                  language: 'ar',
                  value: newTaskTypeAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addTaskType(payload);
        if (response.success) {
          await mutate();
          toast.success(t('projects.toast.project_task_type_added'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add taskType failed:', error);
      }

      setNewTaskType('');
      setNewTaskTypeAr('');
    }
  };

  const handleRemoveTaskType = async (taskTypeToRemove) => {
    if (taskTypeToRemove?.id) {
      try {
        const response = await deleteTaskType(taskTypeToRemove.id);
        if (response.success) {
          await mutate();
             toast.success(t('projects.toast.project_task_type_delete'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditTaskType = (taskType) => {
    setEditingTaskTypeId(taskType.id);
    setNewTaskType(taskType.name.value);
    setNewTaskTypeAr(taskType?.name.localizedStrings[0]?.value);
  };

  const handleUpdateTaskType = async () => {
    if (!editingTaskTypeId) return;
    const taskType = taskTypeList.taskTypes.find((s) => s.id === editingTaskTypeId);
    if (!taskType) return;
    if (newTaskType.trim() && editingTaskTypeId) {
      const payload = {
        id: editingTaskTypeId,
        name: {
          id: taskType.name.id,
          value: newTaskType,
          localizedStrings: newTaskTypeAr
            ? [
                {
                  id: taskType?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newTaskTypeAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateTaskType(payload);
        if (response.success) {
          await mutate();
           toast.success(t('projects.toast.project_task_type_update'));
          setEditingTaskTypeId(null);
          setNewTaskType('');
          setNewTaskTypeAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update taskType failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {taskTypeList.taskTypes.map((taskType) => (
            <Grid item key={taskType.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingTaskTypeId === taskType.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newTaskType}
                        onChange={(e) => setNewTaskType(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateTaskType();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newTaskTypeAr}
                        onChange={(e) => setNewTaskTypeAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateTaskType();
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
                      {taskType.name.value}{' '}
                      {taskType?.name.localizedStrings[0]?.value
                        ? ` | ${taskType?.name.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingTaskTypeId === taskType.id ? (
                      <Tooltip title={t("projects.table.save")}>
                        <IconButton onClick={handleUpdateTaskType} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("projects.table.edit")}>
                        <IconButton onClick={() => handleEditTaskType(taskType)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t("projects.table.actions_delete")}>
                    <IconButton
                      onClick={() => handleOpenTaskTypeDialog(taskType)}
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
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value)}
              placeholder={t("projects.project_type")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingTaskTypeId ? handleUpdateTaskType() : handleAddTaskType();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newTaskTypeAr}
              onChange={(e) => setNewTaskTypeAr(e.target.value)}
              placeholder={t("projects.project_tasktype_arabic")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingTaskTypeId ? handleUpdateTaskType() : handleAddTaskType();
                }
              }}
            />
          </>
          <Button
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={editingTaskTypeId ? handleUpdateTaskType : handleAddTaskType}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingTaskTypeId ? t('projects.table.save') : t('projects.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openTaskTypeConfirmDialog}
            onClose={handleCloseTaskTypeDialog}
            title={t('projects.table.actions_delete')}
            content={t('projects.table.task_delete')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveTaskType(taskTypeToDelete);
                  handleCloseTaskTypeDialog();
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
